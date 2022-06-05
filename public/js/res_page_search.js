const searchBar = document.querySelector("input#searchbar");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

searchBar.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        urlParams.set("query", searchBar.value);
        window.location = "/restaurant?" + urlParams.toString();
    }
});


const query = urlParams.get("query");
if (query) {
    searchBar.value = query;
}