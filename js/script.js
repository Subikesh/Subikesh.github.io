// All click events
document.addEventListener("click", function(event) {
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // info button functionality
    var cards = ["resume", "about", "project", "contact"]
    var info = document.getElementById("info-card");

    // Trigger a hover event for cards[i]
    var hoverIt = function(i) {
        if(i < cards.length)
            var elem = document.getElementById(cards[i]+"-card");
        if (info.contains(event.target)) {
            if(i < cards.length)
                elem.classList.add("hovered");
            if(i > 0) 
                document.getElementById(cards[i-1]+"-card").classList.remove("hovered");
        }
    };

    // Asynchronously iterate through the center-cards and trigger hover event on each
    for (let c = 0; c <= cards.length; c++) {
        sleep(c*900).then(() => { hoverIt(c) });
    }

    
    // Function to pull up and push back the card for resume
    for (let i = 0; i < cards.length; i++) {
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
