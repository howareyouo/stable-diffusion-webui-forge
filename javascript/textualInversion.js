
function start_training_textual_inversion() {
    $('#ti_error').innerHTML = '';

    var id = randomId();
    requestProgress(id, _('ti_output'), _('ti_gallery'), function() {}, function(progress) {
        _('ti_progress').innerHTML = progress.textinfo;
    });

    var res = Array.from(arguments);

    res[0] = id;

    return res;
}
