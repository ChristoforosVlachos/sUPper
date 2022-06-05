let formProgress = 33;

function loadPreviousForm() {
    
    switch (formProgress) {
        case 33:
            break;
        case 67:
            formProgress = 33;
            break;
        case 100:
            formProgress = 67;
            break;
    }

    const progressBar = document.querySelector(".progress-bar");
    const previousButton = document.querySelector(".previous-form");
    const nextButton = document.querySelector(".next-form");

    updateProgressBar(progressBar, previousButton, nextButton, formProgress);

    const page1 = document.querySelector(".page-1");
    const page2 = document.querySelector(".page-2");
    const page3 = document.querySelector(".page-3");

    updateForm(page1, page2, page3, formProgress);

}

function loadNextForm() {
    
    switch (formProgress) {
        case 33:
            formProgress = 67;
            break;
        case 67:
            formProgress = 100;
            break;
        case 100:
            break;
    }

    const progressBar = document.querySelector(".progress-bar");
    const previousButton = document.querySelector(".previous-form");
    const nextButton = document.querySelector(".next-form");

    updateProgressBar(progressBar, previousButton, nextButton, formProgress);

    const page1 = document.querySelector(".page-1");
    const page2 = document.querySelector(".page-2");
    const page3 = document.querySelector(".page-3");

    updateForm(page1, page2, page3, formProgress);

}

function updateProgressBar(bar, prev, next, progress) {
    bar.style.width = progress + "%";
    bar.aria_valuenow = progress;

    if (progress === 33) {
        prev.disabled = true;
        prev.classList.remove("btn-outline-primary");
        prev.classList.add("btn-outline-secondary");
    }
    else {
        prev.disabled = false;
        prev.classList.remove("btn-outline-secondary");
        prev.classList.add("btn-outline-primary");
    }
    if (progress === 100) {
        next.disabled = true;
        next.classList.remove("btn-outline-primary");
        next.classList.add("btn-outline-secondary");
    }
    else {
        next.disabled = false;
        next.classList.remove("btn-outline-secondary");
        next.classList.add("btn-outline-primary");
    }
}

function updateForm(page1, page2, page3, progress) {
    switch (progress) {
        case 33:
            page1.style.display = "block";
            page2.style.display = "none";
            page3.style.display = "none";
            break;
        case 67:
            page1.style.display = "none";
            page2.style.display = "block";
            page3.style.display = "none";
            break;
        case 100:
            page1.style.display = "none";
            page2.style.display = "none";
            page3.style.display = "block";
            break;
    }
}