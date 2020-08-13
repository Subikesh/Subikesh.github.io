// Function to pull up and push back the card for resume
document.addEventListener("click", function(event) {
    var card = document.getElementById("resume-card");
    var title = document.querySelector(".card-title");
    if (card.contains(event.target)) {
        card.classList.add("active");
        title.classList.add("display-3");
    }
    else {
        card.classList.remove("active");
        title.classList.remove("display-3");
    }
});