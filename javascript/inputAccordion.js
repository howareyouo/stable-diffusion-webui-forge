function inputAccordionChecked(id, checked) {
    var accordion = _(id);
    accordion.visibleCheckbox.checked = checked;
    accordion.onVisibleCheckboxChange();
}

function setupAccordion(accordion) {
    var labelWrap = accordion.querySelector('.label-wrap');
    var gradioCheckbox = $('#' + accordion.id + "-checkbox input");
    var extra = $('#' + accordion.id + "-extra");
    var span = labelWrap.querySelector('span');
    var linked = true;

    var isOpen = function() {
        return labelWrap.classList.contains('open');
    };

    var observerAccordionOpen = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            accordion.classList.toggle('input-accordion-open', isOpen());

            if (linked) {
                accordion.visibleCheckbox.checked = isOpen();
                accordion.onVisibleCheckboxChange();
            }
        });
    });
    observerAccordionOpen.observe(labelWrap, {attributes: true, attributeFilter: ['class']});

    if (extra) {
        labelWrap.lastElementChild.before(extra)
    }

    accordion.onChecked = function(checked) {
        if (isOpen() != checked) {
            labelWrap.click();
        }
    };

    var visibleCheckbox = createElement('INPUT', gradioCheckbox.className + " input-accordion-checkbox", {
        type: 'checkbox',
        checked: isOpen(),
        id: accordion.id + "-visible-checkbox"
    });
    span.prepend(visibleCheckbox)

    accordion.visibleCheckbox = visibleCheckbox;
    accordion.onVisibleCheckboxChange = function() {
        if (linked && isOpen() != visibleCheckbox.checked) {
            labelWrap.click();
        }

        gradioCheckbox.checked = visibleCheckbox.checked;
        updateInput(gradioCheckbox);
    };

    visibleCheckbox.on('click', function(event) {
        linked = false;
        event.stopPropagation();
    });
    visibleCheckbox.on('input', accordion.onVisibleCheckboxChange);
}

onUiLoaded(function() {
    for (var accordion of $$('.input-accordion')) {
        setupAccordion(accordion);
    }
});
