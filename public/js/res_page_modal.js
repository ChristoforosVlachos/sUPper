const items = document.querySelectorAll("button.item");

for (let i of items) {
    changeModal(i);
}

function changeModal(itemBtn) {
    const modal = document.querySelector('#myModal');
    const clbtn = document.querySelector('#closebt');
    const foodName = document.querySelector(".foodName");
    const foodIngr = document.querySelector(".foodIngr");
    const foodPrice = document.querySelector(".foodPrice");
    const foodLong = document.querySelector(".modal-body>p");
    const itemCounter = document.querySelector(".counter");

    const itemname = itemBtn.querySelector(".itemname");
    const itemdescr = itemBtn.querySelector(".itemdescr");
    const itemprice = itemBtn.querySelector(".itemprice");
    const itemlong = itemBtn.querySelector(".itemlong");

    const foodMid = document.querySelector("#mid");
    const foodPid = document.querySelector("#pid");

    const itemmid = itemBtn.querySelector(".itemmid");
    const itempid = itemBtn.querySelector(".itempid");


    itemBtn.onclick = function(){
        itemCounter.innerHTML = 1;
        counterFunction(itemCounter);
        foodName.innerHTML = itemname.innerText;
        foodIngr.innerHTML = itemdescr.innerText;
        foodPrice.innerHTML = itemprice.innerText;
        foodLong.innerHTML = itemlong.innerText;
        foodMid.innerHTML = itemmid.innerText;
        foodPid.innerHTML = itempid.innerText;
        modal.style.display = "block";
    }
    clbtn.onclick = function(){
        modal.style.display = "none";
    }
    window.onclick = function(event){
        if(event.target == modal){
            modal.style.display = "none";
        }
    }

    
}