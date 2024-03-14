// A full size 'lightbox' preview modal shown when left clicking on gallery previews
function closeModal() {
    _("lightbox").hidden = 1
}

function toggleModal() {
    if (_("lightbox").hidden)
        showModal(0, $('.gradio-gallery img')?.src)
    else
        closeModal()
}

function showModal(evt, src) {
    if (evt) {
        evt.stopPropagation();
        src = (evt.target || evt.srcElement).src
    }
    const modalImage = _("modalImage");
    const lb = _("lightbox");
    modalImage.src = src
    modalZoomSet(modalImage, opts.js_modal_lightbox_initially_zoomed)
    if (modalImage.hidden) {
        lb.style.setProperty('background-image', 'url(' + source.src + ')');
    }
    lb.hidden = 0
    lb.focus();

    /* show the save button in modal only on txt2img or img2img tabs
    const tabTxt2Img = _("tab_txt2img");
    const tabImg2Img = _("tab_img2img");
    _("modal_save").style.display = (tabTxt2Img.style.display != "none" || tabImg2Img.style.display != "none") ? "inline" : "none"
    */
}

function negmod(n, m) {
    return ((n % m) + m) % m;
}

function updateOnBackgroundChange() {
    const modalImage = _("modalImage");
    if (modalImage && modalImage.offsetParent) {
        let currentButton = selected_gallery_button();
        let preview = $$('.livePreview > img');
        if (opts.js_live_preview_in_modal_lightbox && preview.length > 0) {
            // show preview image if available
            modalImage.src = preview[preview.length - 1].src;
        } else if (currentButton?.children?.length > 0 && modalImage.src != currentButton.children[0].src) {
            modalImage.src = currentButton.children[0].src;
            if (modalImage.hidden) {
                const modal = _("lightbox");
                modal.style.setProperty('background-image', `url(${modalImage.src})`);
            }
        }
    }
}

function modalImageSwitch(offset) {
    var galleryButtons = all_gallery_buttons();

    if (galleryButtons.length > 1) {
        var currentButton = selected_gallery_button();

        var result = -1;
        galleryButtons.forEach(function(v, i) {
            if (v == currentButton) {
                result = i;
            }
        });

        if (result != -1) {
            var nextButton = galleryButtons[negmod((result + offset), galleryButtons.length)];
            nextButton.click();
            const modalImage = _("modalImage");
            const modal = _("lightbox");
            modalImage.src = nextButton.children[0].src;
            if (modalImage.hidden) {
                modal.style.setProperty('background-image', `url(${modalImage.src})`);
            }
            setTimeout(function() {
                modal.focus();
            }, 10);
        }
    }
}

function saveImage() {
    const tabTxt2Img = _("tab_txt2img");
    const tabImg2Img = _("tab_img2img");
    if (tabTxt2Img.style.display != "none") {
        _("save_txt2img").click();
    } else if (tabImg2Img.style.display != "none") {
        _("save_img2img").click();
    } else {
        console.error("missing implementation for saving modal of this type");
    }
}

function modalSaveImage(event) {
    saveImage();
    event.stopPropagation();
}

function modalNextImage(event) {
    modalImageSwitch(1);
    event.stopPropagation();
}

function modalPrevImage(event) {
    modalImageSwitch(-1);
    event.stopPropagation();
}

function modalKeyHandler(event) {
    switch (event.key) {
    case "s":
        saveImage();
        break;
    case "ArrowLeft":
        modalPrevImage(event);
        break;
    case "ArrowRight":
        modalNextImage(event);
        break;
    case "Escape":
        closeModal();
        break;
    }
}

function setupImageForLightbox(e) {
    if (e.dataset.modded) {
        return;
    }

    e.dataset.modded = true;
    e.style.cursor = 'pointer';
    e.style.userSelect = 'none';

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

    // For Firefox, listening on click first switched to next image then shows the lightbox.
    // If you know how to fix this without switching to mousedown event, please.
    // For other browsers the event is click to make it possiblr to drag picture.
    var event = isFirefox ? 'mousedown' : 'click';

    e.addEventListener(event, function(evt) {
        if (evt.button == 1) {
            open(evt.target.src);
            evt.preventDefault();
            return;
        }
        if (!opts.js_modal_lightbox || evt.button != 0) return;

        modalZoomSet(_('modalImage'), opts.js_modal_lightbox_initially_zoomed)
        evt.preventDefault()
        showModal(evt)
    }, true)
}

function modalZoomSet(modalImage, enable) {
    modalImage.classList.toggle('modalImageFullscreen', !!enable);
}

function modalZoomToggle(event) {
    var modalImage = _("modalImage");
    modalZoomSet(modalImage, !modalImage.classList.contains('modalImageFullscreen'));
    event.stopPropagation();
}

function modalTileImageToggle(event) {
    const modalImage = _("modalImage");
    const modal = _("lightbox");
    modalImage.hidden = !modalImage.hidden
    // hidden means tiling
    modal.style.setProperty('background-image', modalImage.hidden ? 'none' : `url(${modalImage.src})`)
    event.stopPropagation()
}

function onProgress(percent, progressText, previewImg) {
    modalProgress.hidden = 0
    modalProgressBar.style.width = percent + '%'
    modalProgressBar.innerText = progressText
    if (percent == 100 && progressText == doneText) {
        let images = $$('.gradio-gallery img');
        if (images.length) {
            images.forEach(setupImageForLightbox)
            modalImage.src = images[0].src
            // updateOnBackgroundChange()
        }
        setTimeout(() => {
            modalProgress.hidden = 1
        }, 777)
    } else if (previewImg) {
        modalImage.src = previewImg
    }    
}

let modalProgress, modalProgressBar
document.addEventListener("DOMContentLoaded", function() {
    let modal = createElement('div', 'lightbox', {id: 'lightbox', tabIndex: 0, onclick: closeModal, hidden: 1}, document.body)
    modal.on('keydown', modalKeyHandler, true)
    /*
    let modalControls = createElement('div', 'modalControls gradio-container', modal)
    createElement('span', 'modalZoom', {innerHTML: '🔍', title: "Toggle zoomed view"}, modalControls)
        .on('click', modalZoomToggle, true)
    createElement('span', 'modalTileImage', {innerHTML: '🏁', title: "Preview tiling"}, modalControls)
        .on('click', modalTileImageToggle, true);
    createElement("span", "modalSave", {id: "modal_save", innerHTML: "💾", title: "Save Image(s)"}, modalControls)
        .on("click", modalSaveImage, true)
    createElement('span', 'modalClose', {innerHTML: '✖', title: "Close Modal", onclick: closeModal}, modalControls)
    createElement('a', 'modalPrev', {innerHTML: '◀', tabIndex: 0}, modal)
        .on('click', modalPrevImage, true)
    createElement('a', 'modalNext', {innerHTML: '▶', tabIndex: 0}, modal)
        .on('click', modalNextImage, true);
    */
    createElement('img', '', {id: 'modalImage'}, modal)

    modalProgress = createElement('div', 'modal-progress', modal)
    modalProgressBar = createElement('div', 'progress-bar', modalProgress)
})

onUiLoaded(function() {
    registerProgressLiseners(onProgress)
})
