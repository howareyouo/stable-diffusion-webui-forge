/* alt+left/right moves text in prompt */

function editOrder(e) {
    if (!opts.keyedit_move || !e.altKey) return

    let el = e.target
    let move
    if (e.key == "ArrowLeft") move = -1
    if (e.key == "ArrowRight") move = 1
    if (!move) return
    e.preventDefault()

    let text = el.value
    let parts = text.split(/, (?![^()]*\))/)
    let start = el.selectionStart - 1, end = el.selectionEnd
    let blockStart, blockEnd
    while (start > 0 && !')]>'.includes(text[start])) {
        if ('([<'.includes(text[start])) {
            blockStart = start
            break
        }
        if (!blockStart && text[start] == ',') blockStart = start + 1
        start--
    }
    while (end < text.length && !'([<'.includes(text[end])) {
        if (')]>'.includes(text[end])) {
            blockEnd = end + 1
            break
        }
        if (!blockEnd && text[end] == ',') blockEnd = end
        end++
    }
    let block = text.substring(blockStart, blockEnd).trim()
    let blockIdx = parts.indexOf(block)
    let targetIdx = blockIdx + move
    if (targetIdx >= 0 && targetIdx < parts.length) {
        let tmp = parts[blockIdx]
         parts[blockIdx] = parts[targetIdx]
        parts[targetIdx] = tmp
        let newVal = parts.join(', ')
        let selStart = newVal.indexOf(block)
        let selEnd = selStart + block.length
        updateInput(el, newVal)
        if ('([<'.includes(newVal[selStart])) {
            selStart++
            selEnd--
        }
        el.setSelectionRange(selStart, selEnd)
    }
}

function editAttention(e) {
    let modKey = e.ctrlKey || e.altKey, wheel = e.type == 'wheel'
    if (!modKey && !wheel) return

    let plus
    if (wheel) {
        plus = e.deltaY < 0
    } else {
        if (e.key == 'ArrowUp') plus = 1
        else if (e.key == 'ArrowDown') plus = 0
        else return editOrder(e)
    }
    e.preventDefault()

    let el = e.target
    let text = el.value
    let start = el.selectionStart
    let end = el.selectionEnd

    function findCurrentBlock(OPEN, CLOSE) {
        if (start !== end) return false

        // Find opening parenthesis around current cursor
        let textBefore = text.substring(0, start)
        let beforeOpen = textBefore.lastIndexOf(OPEN)
        if (beforeOpen == -1) return false
        let beforeClose = textBefore.lastIndexOf(CLOSE)
        while (beforeClose >= 0 && beforeClose > beforeOpen) {
            beforeOpen = textBefore.lastIndexOf(OPEN, beforeOpen - 1)
            beforeClose = textBefore.lastIndexOf(CLOSE, beforeClose - 1)
        }

        // Find closing parenthesis around current cursor
        let textAfter = text.substring(start)
        let afterClose = textAfter.indexOf(CLOSE)
        if (afterClose == -1) return false
        let afterOpen = textAfter.indexOf(OPEN)
        while (afterOpen >= 0 && afterClose > afterOpen) {
            afterClose = textAfter.indexOf(CLOSE, afterClose + 1)
            afterOpen = textAfter.indexOf(OPEN, afterOpen + 1)
        }
        if (beforeOpen == -1 || afterClose == -1) return false
        
        start = beforeOpen + 1
        end += afterClose
        return true
    }

    function findCurrentWord() {
        if (start !== end) return false
        
        let delimiters = opts.keyedit_delimiters + "\r\n\t"

        // seek backward until to find beggining
        while (!delimiters.includes(text[start - 1]) && start > 0) start--
        
        // seek forward to find end
        while (!delimiters.includes(text[end]) && end < text.length) end++
        
        // do not include spaces at start
        while (end > start && text[start] == ' ') start++
        
        // do not include spaces at end
        while (end > start && text[end - 1] == ' ') end--
        
        if (text.substring(start).startsWith('BREAK ')) start += 6
        
        if (text.substring(0, end).endsWith(' BREAK')) end -= 6
        
        return true
    }

    // select current parenthesis block or words
    if (!findCurrentBlock('<', '>') && !findCurrentBlock('(', ')')) {
        findCurrentWord()
    }
    if (start == end) return

    let delta = opts.keyedit_precision_attention
    let bracket = {'<': '>', '(': ')'}[text[start - 1]]
    if (bracket) {
        end = text.indexOf(bracket, start)
        if (bracket == '<') delta = opts.keyedit_precision_extra
    }
    if (e.altKey) delta = .01

    let replacement = text.substring(start, end)
    let parts = replacement.split(':')
    let weight = 1, last = Math.max(parts.length - 1, 1)
    if (parts.length >= 2) {
        weight = parseFloat(parts[last])
    } else if (bracket == ')') {
        weight = 1.1
    }
    weight += plus ? delta : -delta
    weight = Number(weight.toPrecision(3))
    if (weight > 1 && weight < 1.1) {
        weight = plus ? 1.1 : 1
    }
    let wordStart = start
    let wordEnd = start + parts[0].length
    parts[last] = String(weight).replace('0.', '.')

    if (bracket) {
        if (bracket == ')') {
            if (weight == 1.1) {
                parts.length = 1
            } else if (weight == 1) {
                parts.length = 1
                start--
                end++
                wordStart--
                wordEnd--
            }
        } else {
            // wordStart = start + 1
            // wordEnd = wordStart + parts[1].length
        }
        replacement = parts.join(':')
    } else {
        if (weight != '1.1') {
            replacement = parts.join(':')
        }
        replacement = '(' + replacement + ')'
        wordStart++
        wordEnd++
    }
    
    el.setRangeText(replacement, start, end)
    el.setSelectionRange(wordStart, wordEnd)
    updateInput(el)
}

onUiLoaded(function () {
    $$('.prompt textarea').forEach(el =>{
        el.on('keydown', editAttention)
        el.on('wheel', editAttention)
    })
})