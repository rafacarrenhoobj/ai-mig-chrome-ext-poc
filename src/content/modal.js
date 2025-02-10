const createModal = function(root) {

    const style = root.createElement("style");
    style.textContent = `
        /* The overlay (prevents interaction with the site) */
        #liferayAiModalOverlay {
            display: none; /* Hidden by default */
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
            z-index: 1000; /* Ensures it's on top */
        }

        /* The modal content */
        #liferayAiModalOverlay .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            text-align: center;
            border-radius: 5px;
        }

        /* Close button */
        #liferayAiModalOverlay .close-btn {
            margin-top: 10px;
            cursor: pointer;
            background: red;
            color: white;
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
        }
    `;
    root.head.appendChild(style);

    // Create modal overlay
    const modalOverlay = root.createElement("div");
    modalOverlay.id = "liferayAiModalOverlay";

    // Create modal container
    const modal = root.createElement("div");
    modal.className = "modal";

    // Create modal text
    const modalText = root.createElement("p");
    modalText.textContent = "This is a modal. You cannot interact with the background.";

    // Create close button
    const closeButton = root.createElement("button");
    closeButton.className = "close-btn";
    closeButton.textContent = "Close";
    closeButton.onclick = closeModal; // Assign close function

    // Append elements together
    modal.appendChild(modalText);
    modal.appendChild(closeButton);
    modalOverlay.appendChild(modal);
    root.body.appendChild(modalOverlay);
}

function showModal(root, text) {
    root.querySelector("#liferayAiModalOverlay p").textContent = text;
    root.getElementById("liferayAiModalOverlay").style.display = "block";
}

function closeModal(root) {
    root.getElementById("liferayAiModalOverlay").style.display = "none";
}

export {createModal, showModal, closeModal};