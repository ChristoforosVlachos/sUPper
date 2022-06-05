const acceptOrderBtn = document.querySelector("button#acceptOrder");
const orderIdP = document.querySelector("p#orderId");

if (acceptOrderBtn) {
    acceptOrderBtn.addEventListener("click", () => {
        fetch('/acceptorder', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"order_id": orderIdP.innerText}),
        }).then((response) => window.location = response.url);
    });
}