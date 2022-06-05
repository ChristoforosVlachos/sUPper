const  btnAddtoCart = document.querySelector(".addtocart");
const numofItem = document.querySelector(".counter");
const foodname = document.querySelector(".foodName");
const ingredients = document.querySelector(".foodIngr");
const price = document.querySelector(".foodPrice");
const cart = document.querySelector(".cart");
const contbtn = document.querySelector(".continue");
const emptyCart = document.querySelector("#emptyCart");
const modal = document.querySelector("#myModal");
let order = new Array();


contbtn.addEventListener("click", () => {
    console.log(order);
    fetch('/placeorder', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"order": order}),
    }).then((response) => window.location = response.url);
});


btnAddtoCart.addEventListener("click", function(){


    // ΔΗΜΙΟΥΡΓΙΑ ΤΟΥ ITEM ΣΤΟ ΚΑΛΑΘΙ
    const newItem = document.createElement("div");
    newItem.classList.add("cartitem","row");

    cart.insertBefore(newItem,contbtn);
    emptyCart.style.display = "none";
    contbtn.style.display = "block";

    // ΠΡΟΣΘΗΚΗ ΤΩΝ ΠΛΗΡΟΦΟΡΙΩΝ ΣΤΟ DIV
    const newItemInfo = document.createElement("div");
    newItemInfo.classList.add("col-9","d-flex","flex-column","justify-content-between");
    newItem.appendChild(newItemInfo);
    const newItemName = document.createElement("p");
    newItemName.classList.add("cartitemname");
    newItemName.innerHTML = foodname.innerHTML;
    newItemInfo.appendChild(newItemName);
    const newItemPrice = document.createElement("p");
    newItemPrice.classList.add("cartitemprice","mb-1");

    
    // ΠΡΟΣΘΗΚΗ ΚΟΥΜΠΙΩΝ
    const newItemBtns = document.createElement("div");
    newItemBtns.classList.add("col-3","d-flex","flex-column","align-items-center");
    newItem.appendChild(newItemBtns);
    const deletebtn = document.createElement("button");
    deletebtn.classList.add("deleteitembtn","bi","bi-trash");
    newItemBtns.appendChild(deletebtn);

    const newItemBtnsCounter = document.createElement("div");
    newItemBtnsCounter.classList.add("d-flex","justify-content-center","align-items-center");
    newItemBtns.appendChild(newItemBtnsCounter);
    const decreaseBtn = document.createElement("span");
    decreaseBtn.innerHTML = "-";
    decreaseBtn.classList.add("counterbtns","ms-2","me-2","disable-select");
    newItemBtnsCounter.appendChild(decreaseBtn);
    const numItem = document.createElement("span");
    numItem.classList.add("numitem");
    numItem.innerHTML = numofItem.innerHTML;
    newItemBtnsCounter.appendChild(numItem);
    const increaseBtn = document.createElement("span");
    increaseBtn.innerHTML = "+";
    increaseBtn.classList.add("counterbtns","ms-2","me-2","disable-select");
    newItemBtnsCounter.appendChild(increaseBtn);

    // ΠΡΟΣΘΗΚΗ ΤΗΣ ΣΥΝΟΛΙΚΗΣ ΤΙΜΗΣ
    newItemPrice.innerHTML = calcTotalPrice(price.innerHTML, numofItem.innerHTML);
    indivPrice = price.innerHTML;
    newItemInfo.appendChild(newItemPrice);

    // ΑΠΟΘΗΚΕΥΟΥΜΕ ΤΑ COMMENTS
    const comments = document.querySelector("#comments");
    let newItemComment;
    newItemComment = comments.value;
    comments.value = "";

    const mid = document.querySelector("#mid");
    let newMid;
    newMid = mid.innerText;
    mid.innerText = "";

    const pid = document.querySelector("#pid");
    let newPid;
    newPid = pid.innerText;
    pid.innerText = "";
    
    // ΠΡΟΣΘΗΚΗ ΤΟΥ ΑΝΤΙΚΕΙΜΕΝΟΥ ΣΕ ΛΙΣΤΑ
    let orderAddition = [newItemName.innerHTML, newItemPrice.innerHTML, numItem.innerHTML, indivPrice, newItemComment, newMid, newPid];
    addtoCartArr(orderAddition,newItem);  
    increaseItem(increaseBtn);
    decreaseItem(decreaseBtn); 
    deleteItem(deletebtn);

    modal.style.display = "none";

})

calcTotalPrice = function(price,num){
    const temp = (price.split("€"))[0] * Number(num) + "€";
    return temp;
}

deleteItem = function(delbtn){
    delbtn.addEventListener("click",function(){
        delbtn.closest(".cart").removeChild(delbtn.closest(".cartitem"));
        for(i in order){
            if(delbtn.closest(".cartitem").children[0].children[0].innerHTML == order[i][0]){
                order.splice(i,1);
            }
        }
        if(order.length==0){
            emptyCart.style.display = "flex";
            contbtn.style.display = "none";
        }
        
        // console.log(order);
    })
}

addtoCartArr = function(itemToAdd,newItem){

    if(order.length==0){
        order.push(itemToAdd);
        // console.log(order);
    }

    else{
        let counter = 0;
        for(i of order){
            if(i[0]==itemToAdd[0] && i[4]==itemToAdd[4]){
                i[2] = (Number(i[2]) + Number(itemToAdd[2])).toString();
                i[1] = calcTotalPrice(i[3],i[2]);
                console.log(order);
                counter = 1;
                changeCart(newItem,i);
            }
        }
        if(counter==0){
            order.push(itemToAdd);
            // console.log(order);
        }
    }
}

changeCart = function(newItem,itemInArr){
    cart.removeChild(newItem);
    const allDivs = document.querySelectorAll(".cartitem");
    for(i of allDivs){
        if(i.children[0].children[0].innerHTML == itemInArr[0]){
            i.children[0].children[1].innerHTML = itemInArr[1];
            i.children[1].children[1].children[1].innerHTML = itemInArr[2];
        }
    }
}

increaseItem = function(incrbtn){
    incrbtn.addEventListener("click",function(){
        for(i in order){
            if(incrbtn.closest(".cartitem").children[0].children[0].innerHTML == order[i][0]){
                order[i][2] = (Number(order[i][2]) + 1).toString();
                incrbtn.closest(".cartitem").children[1].children[1].children[1].innerHTML = order[i][2];
                let newPrice = calcTotalPrice(order[i][3],order[i][2]);
                order[i][1] = newPrice;
                incrbtn.closest(".cartitem").children[0].children[1].innerHTML = order[i][1];
                // console.log(order);
            }
        }
    })
}

decreaseItem = function(decrbtn){
    decrbtn.addEventListener("click",function(){
        for(i in order){
            if(decrbtn.closest(".cartitem").children[0].children[0].innerHTML == order[i][0]){
                order[i][2] = (Number(order[i][2]) - 1).toString();
                if(Number(order[i][2])<1){
                    order[i][2] = "1";
                }
                decrbtn.closest(".cartitem").children[1].children[1].children[1].innerHTML = order[i][2];
                let newPrice = calcTotalPrice(order[i][3],order[i][2]);
                order[i][1] = newPrice;
                decrbtn.closest(".cartitem").children[0].children[1].innerHTML = order[i][1];
                // console.log(order);
            }
        }
    })
}