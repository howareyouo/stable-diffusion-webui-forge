// code related to showing and updating progressbar shown as the image is being made

function request(url, data, handler, errorHandler) {
    var xhr = new XMLHttpRequest()
    xhr.open("POST", url, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var js = JSON.parse(xhr.responseText)
                    handler(js)
                } catch (error) {
                    console.error(error)
                    errorHandler()
                }
            } else {
                errorHandler()
            }
        }
    }
    xhr.send(JSON.stringify(data))
}

function pad2(x) {
    return x < 10 ? '0' + x : x;
}

function formatTime(secs) {
    if (secs > 3600) {
        return pad2(Math.floor(secs / 60 / 60)) + ":" + pad2(Math.floor(secs / 60) % 60) + ":" + pad2(Math.floor(secs) % 60);
    } else if (secs > 60) {
        return pad2(Math.floor(secs / 60)) + ":" + pad2(Math.floor(secs) % 60);
    } else {
        return Math.floor(secs) + "s";
    }
}


var originalAppTitle = undefined

onUiLoaded(function() {
    originalAppTitle = document.title
})

function setTitle(progress) {
    var title = originalAppTitle

    if (opts.show_progress_in_title && progress) {
        title = '[' + progress.trim() + '] ' + title
    }

    if (document.title != title) {
        document.title = title
    }
}


function randomId() {
    let r = () => Math.random().toString(36).slice(2, 7)
    return "task(" + r() + r() + r() + ")"
}

const progressListeners = []
const doneText = 'Complete...'

function registerProgressLiseners(cb) {
    progressListeners.push(cb)
}

function notifyPregressChange(percent, progressText, previewImg) {
    progressListeners.forEach(cb => cb(percent, progressText, previewImg))
}

// starts sending progress requests to "/internal/progress" uri, creating progressbar above progressbarContainer element and
// preview inside gallery element. Cleans up all created stuff when the task is over and calls atEnd.
// calls onProgress every time there is a progress update
// sending progress requests to "/internal/progress" uri, creating progressbar inside progressbarContainer element
// and preview inside gallery element. Cleans up all created stuff when the task is over and calls atEnd.
// calls onProgress every time there is a progress update
function requestProgress(id_task, progressContainer, gallery, atEnd, onProgress, inactivityTimeout = 40) {
    let wasEverActive = false
    let timeStart = Date.now()
    let livePreview

    let progress = createElement('div', 'progress', {style: {display: opts.show_progressbar ? 'flex' : 'none'}}, progressContainer)
    let bar = createElement('div', 'progress-bar', progress)

    if (gallery) {
        livePreview = createElement('div', 'live-preview', gallery)
    }

    function removeProgressBar(completed) {
        setTitle('', completed)
        progressContainer.removeChild(progress)
        gallery && gallery.removeChild(livePreview)
        atEnd()
    }

    let tick = opts.live_preview_refresh_period || 999, i = 0
    let func = function (id_task, id_live_preview) {
        request('./internal/progress', {id_task, id_live_preview}, function (res) {
            if (res.completed) {
                bar.style.width = '100%'
                bar.innerText = doneText
                setTimeout(removeProgressBar, 777, 1)
                notifyPregressChange(100, doneText)
                return
            }
            let progressText = ''
            let percent = res.progress * 100
            
            if (res.progress > 0) {
                progressText = percent.toFixed(0) + '%'
            }
            if (res.eta) {
                progressText += ' ETA: ' + formatTime(res.eta)
            }
            setTitle(progressText)
            if (res.textinfo) {
                progressText = res.textinfo + ' ' + progressText
            }
            bar.style.width = percent + '%'
            bar.innerText = progressText
            notifyPregressChange(percent, progressText, res.live_preview)

            let elapsedTime = (Date.now() - timeStart) / 1000
            if (res.active) {
                wasEverActive = true
            }
            if (!res.active && wasEverActive) {
                return removeProgressBar()
            }
            if (elapsedTime > inactivityTimeout && !res.queued && !res.active) {
                return removeProgressBar()
            }
            if (res.live_preview && gallery) {
                let img = new Image()
                img.onload = () => livePreview.replaceChildren(img)
                img.src = res.live_preview
            }
            if (onProgress) {
                onProgress(res)
            }

            setTimeout(func, tick, id_task, res.id_live_preview)
            
            if (++i >= 3 || res.queued)
                tick = Math.min(3333, elapsedTime / i * 2222)
            else
                tick = Math.max(333, tick * (1 - res.progress))
            
        }, removeProgressBar)
    }

    func(id_task, 0)
}