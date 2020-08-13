// Function to pull up and push back the card for resume
document.addEventListener("click", function(event) {
    var cards = ["resume", "about", "project", "contact"]
    for (let i = 0; i < cards.length; i++) {
        console.log(cards[i]+"-card")
        var card = document.getElementById(cards[i]+"-card");
        var title = document.querySelector("#"+cards[i]+"-card .card-title");
        if (card.contains(event.target)) {
            card.classList.add("active");
            title.classList.add("display-3");
        }
        else {
            card.classList.remove("active");
            title.classList.remove("display-3");
        }
        
    }
});