const ratingStars = document.querySelectorAll(".rating_star");
// let rating = 0;

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);

function initRating(stars) {
    const currentRatingP = document.querySelector("#myrating");
    if (!currentRatingP) return;

    let currentRating = parseInt(currentRatingP.innerHTML);
    if (!currentRating) return;

    if(stars[currentRating - 1].classList.contains("notClicked")){
        for(let j=0; j<currentRating; j++){
            stars[j].classList.remove("notClicked");
            stars[j].classList.add("clicked");
        }
    }
    else{
        for(let j=currentRating; j<5; j++){
            stars[j].classList.remove("clicked");
            stars[j].classList.add("notClicked");
        }
    }
}

function executeRating(stars){
    for(let i of stars){
        i.addEventListener("click", function(event){
            newRating = event.target.id.split("star")[1];
            console.log(newRating);

            fetch('/rate', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"restaurant_id": urlParams.get("id"), "rating": newRating}),
            }).then((response) => window.location = response.url);

            if(event.target.classList.contains("notClicked")){
                for(let j=0; j<newRating; j++){
                    stars[j].classList.remove("notClicked");
                    stars[j].classList.add("clicked");
                }
            }
            else{
                for(let j=newRating; j<5; j++){
                    stars[j].classList.remove("clicked");
                    stars[j].classList.add("notClicked");
                }
            }
        });
    }
}
initRating(ratingStars);
executeRating(ratingStars);