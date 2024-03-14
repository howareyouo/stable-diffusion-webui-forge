
function extensions_apply(_disabled_list, _update_list, disable_all) {
    var disable = [];
    var update = [];
    const extensions_input = $$('#extensions input[type="checkbox"]');
    if (extensions_input.length == 0) {
        throw Error("Extensions page not yet loaded.");
    }
    extensions_input.forEach(function(x) {
        if (x.name.startsWith("enable_") && !x.checked) {
            disable.push(x.name.substring(7));
        }

        if (x.name.startsWith("update_") && x.checked) {
            update.push(x.name.substring(7));
        }
    });

    restart_reload();

    return [JSON.stringify(disable), JSON.stringify(update), disable_all];
}

function extensions_check() {
    var disable = [];

    $$('#extensions input[type="checkbox"]').forEach(function(x) {
        if (x.name.startsWith("enable_") && !x.checked) {
            disable.push(x.name.substring(7));
        }
    });

    $$('#extensions .extension_status').forEach(function(x) {
        x.innerHTML = "Loading...";
    });


    var id = randomId();
    requestProgress(id, _('extensions_installed_html'), null, function() {

    });

    return [id, JSON.stringify(disable)];
}

function install_extension_from_index(button, url) {
    button.disabled = "disabled";
    button.value = "Installing...";

    var textarea = $('#extension_to_install textarea');
    textarea.value = url;
    updateInput(textarea);

    $('#install_extension_button').click();
}

function config_state_confirm_restore(_, config_state_name, config_restore_type) {
    if (config_state_name == "Current") {
        return [false, config_state_name, config_restore_type];
    }
    let restored = "";
    if (config_restore_type == "extensions") {
        restored = "all saved extension versions";
    } else if (config_restore_type == "webui") {
        restored = "the webui version";
    } else {
        restored = "the webui version and all saved extension versions";
    }
    let confirmed = confirm("Are you sure you want to restore from this state?\nThis will reset " + restored + ".");
    if (confirmed) {
        restart_reload();
        $$('#extensions .extension_status').forEach(function(x) {
            x.innerHTML = "Loading...";
        });
    }
    return [confirmed, config_state_name, config_restore_type];
}

function toggle_all_extensions(event) {
    $$('#extensions .extension_toggle').forEach(function(checkbox_el) {
        checkbox_el.checked = event.target.checked;
    });
}

function toggle_extension() {
    let all_extensions_toggled = true;
    for (const checkbox_el of $$('#extensions .extension_toggle')) {
        if (!checkbox_el.checked) {
            all_extensions_toggled = false;
            break;
        }
    }

    $('#extensions .all_extensions_toggle').checked = all_extensions_toggled;
}
