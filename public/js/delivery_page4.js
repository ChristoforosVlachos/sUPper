const doneBtn = document.querySelector("button#doneBtn");
const orderIdP = document.querySelector("p#orderId");

if (doneBtn) {
    doneBtn.addEventListener("click", () => {
        fetch('/finishorder', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"order_id": orderIdP.innerText}),
        }).then((response) => window.location = response.url);
    });
}