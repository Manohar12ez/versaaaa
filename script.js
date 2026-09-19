function requestSkill(skill) {
    alert("Skill request sent for " + skill);
}

function joinSession() {
    alert("Joining Java session...");
}

function acceptSession() {
    alert("Session accepted!");
}

function viewSession() {
    window.location.href = "sessions.html";
}

function searchSkills() {

    let input = document.getElementById("searchInput");
    let filter = input.value.toLowerCase();

    let cards = document.querySelectorAll(".skill-card");

    cards.forEach(function(card) {

        let skillName = card.querySelector("h3").textContent.toLowerCase();

        if (skillName.includes(filter)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });
}