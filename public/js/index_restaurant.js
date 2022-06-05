const incomingCol = document.querySelector("#incoming");
const outgoingCol = document.querySelector("#outgoing");
const readyCol = document.querySelector("#ready");

const incomingHeadSpan = document.querySelector("#incoming-count");
const outgoingHeadSpan = document.querySelector("#outgoing-count");
const readyHeadSpan = document.querySelector("#ready-count");

const statusSwitch = document.querySelector("#restaurant-status");
const statusSwitchSpan = document.querySelector("#restaurant-status span");

let restaurantStatus = 1;

statusSwitch.addEventListener("click", () => {
    if (restaurantStatus === 1) {
        restaurantStatus = 0;
        statusSwitchSpan.classList.remove("open");
        statusSwitchSpan.classList.add("closed");
        statusSwitch.lastChild.data = "Εστιατόριο κλειστό";
    }
    else if (restaurantStatus === 0) {
        restaurantStatus = 1;
        statusSwitchSpan.classList.remove("closed");
        statusSwitchSpan.classList.add("open");
        statusSwitch.lastChild.data = "Εστιατόριο ανοιχτό";
    }
});

updateCount();

function updateCount() {
    incomingHeadSpan.innerHTML = incomingCol.childElementCount;
    outgoingHeadSpan.innerHTML = outgoingCol.childElementCount;
    readyHeadSpan.innerHTML = readyCol.childElementCount;
}

function allowDrop(ev) {
    ev.preventDefault();
}
  
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    // console.log(ev);
}
  
function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const target = findRightTarget(ev.target);
    if (typeof target !== "undefined") {
        const move = document.getElementById(data);
        // target.appendChild(move);

        fetch('/switchorderstatus', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"order_id": move.id.substring(4), "new_status": target.id}),
        }).then((response) => window.location = response.url);
    }
    updateCount()
}

function findRightTarget(target) {
    if (typeof target === "undefined" || target.id === "incoming" || target.id === "outgoing" || target.id === "ready") {
        return target;
    }
    else {
        return findRightTarget(target.parentElement);
    }
}