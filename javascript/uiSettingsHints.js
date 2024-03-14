// various hints and extra info for the settings tab

var settingsHintsSetup = false;

onOptionsChanged(function() {
    if (settingsHintsSetup) return;
    settingsHintsSetup = true;

    $$('#settings [id^=setting_]').forEach(function(div) {
        var name = div.id.substr(8);
        var commentBefore = opts._comments_before[name];
        var commentAfter = opts._comments_after[name];

        if (!commentBefore && !commentAfter) return;

        var span = null;
        if (div.classList.contains('gradio-checkbox')) span = div.one('label span');
        else if (div.classList.contains('gradio-checkboxgroup')) span = div.one('span').firstChild;
        else if (div.classList.contains('gradio-radio')) span = div.one('span').firstChild;
        else span = div.one('label span').firstChild;

        if (!span) return;

        if (commentBefore) {
            var comment = createElement('DIV', 'settings-comment', {innerHTML: commentBefore})
            span.before(document.createTextNode('\xa0'))
            span.before(comment)
            span.before(document.createTextNode('\xa0'))
        }
        if (commentAfter) {
            var comment = createElement('DIV', 'settings-comment', {innerHTML: commentAfter})
            span.after(comment)
            span.after(document.createTextNode('\xa0'))
        }
    });
});

function settingsHintsShowQuicksettings() {
    requestGet("./internal/quicksettings-hint", {}, function(data) {
        var table = createElement('table', 'popup-table')

        data.forEach(function(obj) {
            var tr = createElement('tr', '', table)
            createElement('td', '', {textContent: obj.name}, tr)
            createElement('td', '', {textContent: obj.label}, tr)
        });

        popup(table)
    })
}
