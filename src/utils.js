export function showModal(message) {
  const modal = document.getElementById("modal");
  const msg = document.getElementById("modal-message");
  const closeBtn = document.getElementById("modal-close");

  msg.textContent = message;
  modal.style.display = "flex";

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}
