let settingsExcludeTabsFromShowAll = {
    settings_tab_defaults: 1,
    settings_tab_sysinfo: 1,
    settings_tab_actions: 1,
    settings_tab_licenses: 1,
};

function settingsShowAllTabs() {
    $$('#settings > div').forEach(function(elem) {
        if (settingsExcludeTabsFromShowAll[elem.id]) return
        elem.style.display = "block"
    });
}

function settingsShowOneTab() {
    $('#settings_show_one_page').click()
}

onUiLoaded(function() {
    var edit = $('#settings_search');
    var editTextarea = $('#settings_search > label > input');
    var buttonShowAllPages = _('settings_show_all_pages');
    var settings_tabs = $('#settings div');

    onEdit('settingsSearch', editTextarea, 250, function() {
        var searchText = (editTextarea.value || "").trim().toLowerCase();

        $$('#settings > div[id^=settings_] div[id^=column_settings_] > *').forEach(function(elem) {
            var visible = elem.textContent.trim().toLowerCase().indexOf(searchText) != -1;
            elem.style.display = visible ? "" : "none";
        });

        if (searchText != "") {
            settingsShowAllTabs();
        } else {
            settingsShowOneTab();
        }
    });

    settings_tabs.prepend(edit)
    settings_tabs.append(buttonShowAllPages)
    buttonShowAllPages.addEventListener("click", settingsShowAllTabs);
});


onOptionsChanged(function() {
    if ($('#settings .settings-category')) return;

    var sectionMap = {};
    $$('#settings > div > button').forEach(function(x) {
        sectionMap[x.textContent.trim()] = x;
    });

    opts._categories.forEach(function(x) {
        var section = localization[x[0]] ?? x[0];
        var category = localization[x[1]] ?? x[1];

        var sectionElem = sectionMap[section];
        if (!sectionElem) return;

        var span = createElement('SPAN', 'settings-category', {textContent: category})
        sectionElem.insertAdjacentElement('beforebegin', span)
    })
})
