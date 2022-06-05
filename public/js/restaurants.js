const searchBar = document.querySelector("input.search");
const sortName = document.querySelector("a#sort-name");
const sortDeliveryTime = document.querySelector("a#sort-delivery-time");
const sortMinimumOrder = document.querySelector("a#sort-minimum-order");
const sortRating = document.querySelector("a#sort-rating");

const filterCheckboxes = document.querySelectorAll("input[id^='cat-']");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

searchBar.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        urlParams.set("query", searchBar.value);
        window.location = "/restaurants?" + urlParams.toString();
    }
});

sortName.addEventListener("click", () => {
    urlParams.set("sort", "name");
    window.location = "/restaurants?" + urlParams.toString();
});

sortDeliveryTime.addEventListener("click", () => {
    urlParams.set("sort", "deliverytime");
    window.location = "/restaurants?" + urlParams.toString();
});

sortMinimumOrder.addEventListener("click", () => {
    urlParams.set("sort", "minimumorder");
    window.location = "/restaurants?" + urlParams.toString();
});

sortRating.addEventListener("click", () => {
    urlParams.set("sort", "rating");
    window.location = "/restaurants?" + urlParams.toString();
});

for (let checkbox of filterCheckboxes) {
    checkbox.addEventListener("change", () => {
        urlParams.delete("filter");
        for (let cb of filterCheckboxes) {
            if (cb.checked) {
                urlParams.append("filter", parseInt(cb.id.substring(4)));
            }
        }
        window.location = "/restaurants?" + urlParams.toString();
    });
}

const query = urlParams.get("query");
if (query) {
    searchBar.value = query;
}
const filters = urlParams.getAll("filter");
for (let filter of filters) {
    const check = document.querySelector("input#cat-" + filter);
    check.checked = true;
}