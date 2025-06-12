import Game from "./Game";
import { getPath } from "./services/PathService";



export function setupSearchField() {
    if (document.getElementById("roomOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "roomOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "none";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 1000;
    overlay.style.fontFamily = 'Arial, sans-serif';

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "30px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 0 20px rgba(0,0,0,0.4)";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.alignItems = "center";
    box.style.minWidth = "380px";
    box.style.maxWidth = "90%";

    box.innerHTML = `
        <h2 style="margin-bottom: 20px; font-size: 24px;">Raumfinder</h2>

        <label style="margin-bottom: 15px; font-size: 14px;">
            <input type="checkbox" id="manualToggle" checked />
            Manuelle Eingabe aktivieren
        </label>

        <div style="display: flex; gap: 10px; margin-bottom: 20px; width: 100%; justify-content: space-between;">
            <div style="flex: 1;">
                <label style="font-weight: bold;">Startraum:</label><br/>
                <input type="text" id="startRoomInput" placeholder="z. B. 012" class="input" />
                <select id="startRoomDropdown" class="input" style="display: none;"></select>
            </div>
            <div style="flex: 1;">
                <label style="font-weight: bold;">Zielraum:</label><br/>
                <input type="text" id="zielRoomInput" placeholder="z. B. 045"  class="input"/>
                <select id="zielRoomDropdown" class="input" style="display: none;"></select>
            </div>
        </div>

        <!--<div style="display: flex; gap: 10px; margin-bottom: 30px;">
            <button id="routeButton" class="btn btn-primary">Route anzeigen</button>
        </div>-->

        <!--<div style="width: 100%;">
            <label style="font-weight: bold;">Direkte Raumsuche:</label><br/>
            <input type="text" id="roomInput" class="input" placeholder="z. B. 100" />
            <select id="roomDropdown" class="input" style="display: none; margin-top: 8px;"></select>
        </div>-->

        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <!--<button id="searchButton" class="btn btn-secondary">Suchen</button>-->
            <button class="btn" id="cancelButton">Schließen</button>
            <button id="routeButton" class="btn btn-primary">Route anzeigen</button>
        </div>
    `;

    // Style-Klassen
    const style = document.createElement("style");
    style.innerHTML = `
        .input {
            padding: 8px;
            width: 100%;
            font-size: 14px;
            margin-top: 5px;
            box-sizing: border-box;
        }

        .btn {
            padding: 10px 20px;
            font-size: 14px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .btn-primary {
            background-color: #007bff;
            color: white;
        }

        .btn-primary:hover {
            background-color: #0056b3;
        }

        .btn-secondary {
            background-color: #28a745;
            color: white;
        }

        .btn-secondary:hover {
            background-color: #1e7e34;
        }

        .btn:disabled {
            background-color: #aaa;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const manualToggle = document.getElementById("manualToggle");

    const startInput = document.getElementById("startRoomInput");
    const targetInput = document.getElementById("zielRoomInput");
    const startDropdown = document.getElementById("startRoomDropdown");
    const targetDropwdown = document.getElementById("zielRoomDropdown");

    const roomInput = document.getElementById("roomInput");
    const roomDropdown = document.getElementById("roomDropdown");

    const routeButton = document.getElementById("routeButton");
    //const searchButton = document.getElementById("searchButton");
    const cancelButton = document.getElementById("cancelButton");

    manualToggle.addEventListener("change", () => {
        const manual = manualToggle.checked;

        startInput.style.display = manual ? "block" : "none";
        targetInput.style.display = manual ? "block" : "none";
        startDropdown.style.display = manual ? "none" : "block";
        targetDropwdown.style.display = manual ? "none" : "block";

        roomInput.style.display = manual ? "block" : "none";
        roomDropdown.style.display = manual ? "none" : "block";
    });

    document.addEventListener("keydown", (event) => {
        if ((event.key === "r" || event.key === "R") && document.activeElement.tagName !== "INPUT") {
            event.preventDefault();
            event.stopPropagation();
            overlay.style.display = "flex";
            (manualToggle.checked ? roomInput : roomDropdown).focus();
        } else if (event.key === "Escape") {
            overlay.style.display = "none";
        }
    });

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            overlay.style.display = "none";
        }
    });
    routeButton.addEventListener("click", async () => {
        let start = manualToggle.checked ? startInput.value.trim() : startDropdown.value;
        let target = manualToggle.checked ? targetInput.value.trim() : targetDropwdown.value;
        if (start && target) {

            switch (start) {
                case "005":
                    start = "005|006";
                    break;
                case "006":
                    start = "005|006";
                    break;
                case "009":
                    start = "009|010";
                    break;
                case "010":
                    start = "009|010";
                    break;
                case "042":
                    start = "042|044";
                    break;
                case "044":
                    start = "042|044";
                    break;
                case "046":
                    start = "046|049";
                    break;
                case "049":
                    start = "046|049";
                    break;
            }

            switch (target) {
                case "005":
                    target = "005|006";
                    break;
                case "006":
                    target = "005|006";
                    break;
                case "009":
                    target = "009|010";
                    break;
                case "010":
                    target = "009|010";
                    break;
                case "042":
                    target = "042|044";
                    break;
                case "044":
                    target = "042|044";
                    break;
                case "046":
                    target = "046|049";
                    break;
                case "049":
                    target = "046|049";
                    break;
            }

            try {
                overlay.style.display = "none";
                const path = await getPath({ startPoint: start, targetPoint: target });
                //console.log("Pfad erhalten:", path);

                window.showPath(path);
            } catch (err) {
                console.error("Fehler beim Abrufen des Pfades:", err);
                alert("Die Route konnte nicht geladen werden.");
            }
        } else {
            alert("Bitte Start- und Zielraum angeben!");
        }

        startInput.value = "", startDropdown.value = "", targetInput.value = "", targetDropwdown.value = "";
    });


    /*searchButton.addEventListener("click", () => {
        const val = manualToggle.checked ? roomInput.value.trim() : roomDropdown.value;
        if (val) {
            overlay.style.display = "none";
            callback(val, null, null);
        } else {
            alert("Bitte einen Raum angeben!");
        }
    });*/

    cancelButton.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    /*roomInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") searchButton.click();
    });*/

    function generateOptions() {

        let options = '<option value="">Bitte wählen</option>' +
            '<option value="001">001</option>' +
            '<option value="002">002</option>' +
            '<option value="002B">002B</option>' +
            '<option value="003">003</option>' +
            '<option value="004">004</option>' +
            '<option value="005|006">005</option>' +
            '<option value="005|006">006</option>' +
            '<option value="007">007</option>' +
            '<option value="008">008</option>' +
            '<option value="009|010">009</option>' +
            '<option value="009|010">010</option>' +
            '<option value="035">035</option>' +
            '<option value="038">038</option>' +
            '<option value="041">041</option>' +
            '<option value="042|044">042</option>' +
            '<option value="042|044">044</option>' +
            '<option value="045">045</option>' +
            '<option value="046|049">046</option>' +
            '<option value="046|049">049</option>' +
            '<option value="060">060</option>';

        return options;
    }

    startDropdown.innerHTML = generateOptions();
    targetDropwdown.innerHTML = generateOptions();
    //roomDropdown.innerHTML = generateOptions(1, 10);

}
