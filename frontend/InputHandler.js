export function setupSearchField() {
    console.log("setupSearchField wird ausgeführt!");

    const searchBox = document.createElement("div");
    searchBox.style.position = "absolute";
    searchBox.style.top = "50%";
    searchBox.style.left = "50%";
    searchBox.style.transform = "translate(-50%, -50%)";
    searchBox.style.padding = "10px";
    searchBox.style.background = "rgba(255, 255, 255, 0.9)";
    searchBox.style.border = "1px solid black";
    searchBox.style.display = "none";
    searchBox.innerHTML = `<input type="text" id="roomInput" placeholder="Raumnummer eingeben">`;
    document.body.appendChild(searchBox);

    const roomInput = document.getElementById("roomInput");

    document.addEventListener("keydown", (event) => {
        console.log(`Taste gedrückt: ${event.key}`);

        if (event.key === "r" || event.key === "R") {
            console.log("R-Taste erkannt, Suchfeld wird angezeigt!");
            searchBox.style.display = "block";
            roomInput.focus();
        }
    });

    roomInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            console.log("Raumnummer eingegeben:", roomInput.value);
            searchBox.style.display = "none";
            roomInput.value = "";
        } else if (event.key === "Escape") {
            console.log("Suchfeld wird geschlossen!");
            searchBox.style.display = "none";
            roomInput.value = "";
        }
    });
}
