counterFunction = function(counterBoard){
    const incrementButton = document.querySelector("#incrbtn");
    const decrementButton = document.querySelector("#decrbtn");

    let counterValue = 1;

    const increaseCounter = () =>{
        counterBoard.innerHTML = ++counterValue;
    }

    const decreaseCounter = () =>{
        counterBoard.innerHTML = --counterValue;
        if(counterBoard.innerHTML<=0){
            counterBoard.innerHTML = 1;
            counterValue = 1;
        } 
    }

    incrementButton.addEventListener('click', increaseCounter);
    decrementButton.addEventListener('click', decreaseCounter);
}

