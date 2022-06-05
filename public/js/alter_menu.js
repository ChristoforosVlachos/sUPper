const saveBtn = document.querySelector("#savebtn");
const deleteBtn = document.querySelector("#deletebtn");
const addBtn = document.querySelector("#addItembtn");

const foodName = document.querySelector(".foodName");
const foodIngr = document.querySelector(".foodIngr");
const foodPrice = document.querySelector(".foodPrice");
const foodLong = document.querySelector(".modal-body>p");
const foodMid = document.querySelector("#mid");
const foodPid = document.querySelector("#pid");

const addName = document.querySelector("#addName");
const addIngr = document.querySelector("#addIngredients");
const addPrice = document.querySelector("#addPrice");
const addLong = document.querySelector("#addDescription");
const addMid = document.querySelector("#menuId");

saveBtn.addEventListener("click", () => {
    fetch('/edit-info/update', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "menu_id": foodMid.innerText,
            "product_id": foodPid.innerText,
            "name": foodName.innerText,
            "ingredients": foodIngr.innerText,
            "price": foodPrice.innerText,
            "description": foodLong.innerText
        }),
    }).then((response) => window.location = response.url);
});

deleteBtn.addEventListener("click", () => {
    fetch('/edit-info/remove', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "menu_id": foodMid.innerText,
            "product_id": foodPid.innerText
        }),
    }).then((response) => window.location = response.url);
});

addBtn.addEventListener("click", () => {
    fetch('/edit-info/add', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "menu_id": addMid.innerText,
            "name": addName.value,
            "ingredients": addIngr.value,
            "price": addPrice.value,
            "description": addLong.value
        }),
    }).then((response) => window.location = response.url);
});


const openOnP = document.querySelector("#openOn");

openOnP.addEventListener("focusout", () => {
    fetch('/edit-info/openon', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "open_on": openOnP.innerText
        }),
    }).then((response) => window.location = response.url);
});


const categoryOptions = document.querySelectorAll(".dropdown-item");

for (let option of categoryOptions) {
    option.addEventListener("click", () => {
        fetch('/edit-info/category', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "category_id": option.id.substring(4)
            }),
        }).then((response) => window.location = response.url);
    });
}