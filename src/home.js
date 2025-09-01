import axios from "axios";

const userEmailEl = document.querySelector(".user-email");
const usernameEl = document.querySelector("#username");
const userlinkEl = document.querySelector("#userlink");
const walletsGrid = document.querySelector("#walletsGrid");
const addWalletBtn = document.querySelector("#addWallet");

const walletModal = document.querySelector("#walletModal");
const walletForm = document.querySelector("#walletForm");

const API = "http://localhost:8080/wallets";
const gradients = [
  "linear-gradient(84.37deg, #D7816A 2.27%, #BD4F6C 92.26%)",
  "linear-gradient(84.37deg, #5F0A87 2.27%, #A4508B 92.26%)",
  "linear-gradient(84.37deg, #380036 2.27%, #0CBABA 92.26%)",
  "linear-gradient(84.37deg, #20BF55 2.27%, #01BAEF 92.26%)"
];
let walletCount = 0;

const userEmail = localStorage.getItem("userEmail") || "user@email.com";
const userName = localStorage.getItem("userName") || userEmail.split("@")[0];

document.querySelector("#username").textContent = userName;
document.querySelector("#userlink").textContent = userEmail;
document.querySelector(".user-email").textContent = userEmail;


function renderWallet(walletData) {
  walletCount++;
  const wallet = document.createElement("div");
  wallet.classList.add("wallet");

  const gradient = gradients[(walletCount - 1) % gradients.length];
  wallet.style.background = gradient;

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
    res.data.forEach(renderWallet);
  } catch (err) {
    console.error("Ошибка загрузки кошельков:", err);
  }
}

addWalletBtn.addEventListener("click", () => {
  walletModal.style.display = "flex";
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

walletModal.addEventListener("click", (e) => {
  if (e.target === walletModal) {
    walletModal.style.display = "none";
  }
});

loadWallets();


const exit = document.querySelector('.exit');

exit.addEventListener('click', () => {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');

  window.location.href = "./login.html";
});

