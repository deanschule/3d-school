export function setupSearchField(callback = (searchedRoom, startRoom, zielRoom) => {}) {
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
                <input type="text" id="zielRoomInput" placeholder="z. B. 045" class="input" />
                <select id="zielRoomDropdown" class="input" style="display: none;"></select>
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 30px;">
            <button id="routeButton" class="btn btn-primary">Route anzeigen</button>
        </div>

        <div style="width: 100%;">
            <label style="font-weight: bold;">Direkte Raumsuche:</label><br/>
            <input type="text" id="roomInput" class="input" placeholder="z. B. 100" />
            <select id="roomDropdown" class="input" style="display: none; margin-top: 8px;"></select>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="searchButton" class="btn btn-secondary">Suchen</button>
            <button class="btn" id="cancelButton">Schließen</button>
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
    const zielInput = document.getElementById("zielRoomInput");
    const startDropdown = document.getElementById("startRoomDropdown");
    const zielDropdown = document.getElementById("zielRoomDropdown");

    const roomInput = document.getElementById("roomInput");
    const roomDropdown = document.getElementById("roomDropdown");

    const routeButton = document.getElementById("routeButton");
    const searchButton = document.getElementById("searchButton");
    const cancelButton = document.getElementById("cancelButton");

    manualToggle.addEventListener("change", () => {
        const manual = manualToggle.checked;

        startInput.style.display = manual ? "block" : "none";
        zielInput.style.display = manual ? "block" : "none";
        startDropdown.style.display = manual ? "none" : "block";
        zielDropdown.style.display = manual ? "none" : "block";

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

    routeButton.addEventListener("click", () => {
        const start = manualToggle.checked ? startInput.value.trim() : startDropdown.value;
        const ziel = manualToggle.checked ? zielInput.value.trim() : zielDropdown.value;

        if (start && ziel) {
            overlay.style.display = "none";
            callback(null, start, ziel);
        } else {
            alert("Bitte Start- und Zielraum angeben!");
        }
    });

    searchButton.addEventListener("click", () => {
        const val = manualToggle.checked ? roomInput.value.trim() : roomDropdown.value;
        if (val) {
            overlay.style.display = "none";
            callback(val, null, null);
        } else {
            alert("Bitte einen Raum angeben!");
        }
    });

    cancelButton.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    roomInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") searchButton.click();
    });

    function generateOptions(min, max) {
        let options = '<option value="">Bitte wählen</option>';
        for (let i = min; i <= max; i++) {
            const val = String(i).padStart(3, "0");
            options += `<option value="${val}">${val}</option>`;
        }
        return options;
    }

    startDropdown.innerHTML = generateOptions(4, 119);
    zielDropdown.innerHTML = generateOptions(4, 119);
    roomDropdown.innerHTML = generateOptions(4, 119);
}
