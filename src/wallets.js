import axios from "axios";

const API = "http://localhost:8080/wallets"; 
const gradients = [
  "linear-gradient(84.37deg, #D7816A 2.27%, #BD4F6C 92.26%)",
  "linear-gradient(84.37deg, #5F0A87 2.27%, #A4508B 92.26%)",
  "linear-gradient(84.37deg, #380036 2.27%, #0CBABA 92.26%)",
  "linear-gradient(84.37deg, #20BF55 2.27%, #01BAEF 92.26%)"
];

const walletsGrid = document.getElementById("walletsGrid");
const addWalletBtn = document.getElementById("addWallet");
const walletModal = document.getElementById("walletModal");
const walletForm = document.getElementById("walletForm");
const exit = document.querySelector(".exit");

const userEmail = localStorage.getItem("userEmail");
const userName = localStorage.getItem("userName");

if (!userEmail || !userName) {
  window.location.href = "./login.html";
}

document.querySelector(".user-email").textContent = userEmail;

exit.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "./login.html";
});

let walletCount = 0;

function renderWallet(walletData) {
  walletCount++;
  const wallet = document.createElement("div");
  wallet.classList.add("wallet");
  wallet.style.background = gradients[(walletCount - 1) % gradients.length];

  wallet.innerHTML = `
    <p>${walletData.name}</p>
    <span>${walletData.currency}</span>
  `;

  walletsGrid.append(wallet);
}

async function loadWallets() {
  try {
    const res = await axios.get(API);
    walletsGrid.innerHTML = "";
    walletCount = 0;

    if (res.data.length === 0) {
      walletsGrid.innerHTML = `<p>У вас пока нет кошельков.</p>`;
      return;
    }

    res.data.forEach(renderWallet);
  } catch (err) {
    console.error("Ошибка загрузки кошельков:", err);
  }
}

addWalletBtn.addEventListener("click", () => {
  walletModal.style.display = "flex";
});

walletModal.addEventListener("click", (e) => {
  if (e.target === walletModal) {
    walletModal.style.display = "none";
  }
});

walletForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = walletForm.name.value.trim();
  const currency = walletForm.currency.value;
  if (!name || !currency) return;

  try {
    const res = await axios.post(API, { name, currency });
    renderWallet(res.data);

    walletForm.reset();
    walletModal.style.display = "none";
  } catch (err) {
    console.error("Ошибка при добавлении:", err);
  }
});

loadWallets();
