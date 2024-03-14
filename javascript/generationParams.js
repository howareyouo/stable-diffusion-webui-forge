// attaches listeners to the txt2img and img2img galleries to update displayed generation param text when the image changes

let txt2img_gallery, img2img_gallery, modal = undefined;
onAfterUiUpdate(function() {
    if (!txt2img_gallery) {
        txt2img_gallery = attachGalleryListeners("txt2img");
    }
    if (!img2img_gallery) {
        img2img_gallery = attachGalleryListeners("img2img");
    }
    if (!modal) {
        modal = _('lightbox');
        modalObserver.observe(modal, {attributes: true, attributeFilter: ['style']});
    }
});

let modalObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutationRecord) {
        let selectedTab = $('#tabs div button.selected')?.innerText;
        if (mutationRecord.target.style.display === 'none' && (selectedTab === 'txt2img' || selectedTab === 'img2img')) {
            _(selectedTab + "_generation_info_button")?.click();
        }
    });
});

function attachGalleryListeners(tab_name) {
    var gallery = $('#' + tab_name + '_gallery');
    gallery?.addEventListener('click', () => _(tab_name + "_generation_info_button").click());
    gallery?.addEventListener('keydown', (e) => {
        if (e.keyCode == 37 || e.keyCode == 39) { // left or right arrow
            _(tab_name + "_generation_info_button").click();
        }
    });
    return gallery;
}
