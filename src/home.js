import axios from "axios";

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const transactionModal = document.querySelector("#transactionModal");
const confirmYes = document.getElementById("confirmYes");
const addTransactionBtn = document.querySelector("#addTransaction");
const confirmNo = document.getElementById("confirmNo");
const transactionForm = document.querySelector("#transactionForm");




const TX_API = "http://localhost:8080/transactions";
const API = "http://localhost:8080/wallets";

const userEmail = localStorage.getItem("userEmail");
const userName = localStorage.getItem("userName") || (userEmail ? userEmail.split("@")[0] : "");
const transactionsTable = document.querySelector("#transactionsTable");

if (!userEmail) {
  window.location.href = "./login.html";
}

const userEmailEl = document.querySelector(".user-email");
const usernameEl = document.querySelector("#username");
const userlinkEl = document.querySelector("#userlink");
const walletsGrid = document.querySelector("#walletsGrid");
const addWalletBtn = document.querySelector("#addWallet");
const walletModal = document.querySelector("#walletModal");
const walletForm = document.querySelector("#walletForm");
const exitBtn = document.querySelector(".exit");

const gradients = [
  "linear-gradient(84.37deg, #D7816A 2.27%, #BD4F6C 92.26%)",
  "linear-gradient(84.37deg, #5F0A87 2.27%, #A4508B 92.26%)",
  "linear-gradient(84.37deg, #380036 2.27%, #0CBABA 92.26%)",
  "linear-gradient(84.37deg, #20BF55 2.27%, #01BAEF 92.26%)",
  "linear-gradient(90deg,rgba(0, 183, 255, 1) 0%, rgba(87, 199, 133, 1) 100%);",
   "linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(0, 212, 255, 1) 100%);"
];
let walletCount = 0;

if (usernameEl) usernameEl.textContent = userName;
if (userlinkEl) userlinkEl.textContent = userEmail;
if (userEmailEl) userEmailEl.textContent = userEmail;

function renderWallet(walletData) {
  walletCount++;
  const wallet = document.createElement("div");
  wallet.classList.add("wallet");
  const gradient = gradients[(walletCount - 1) % gradients.length];
  wallet.style.background = gradient;

  wallet.innerHTML = `<p>${walletData.name}</p><span>${walletData.currency}</span>`;

  wallet.addEventListener("dblclick", () => {
    openConfirmModal("Удалить этот кошелёк?", async () => {
      try {
        await axios.delete(`${API}/${walletData.id}`);
        wallet.remove();
      } catch (err) {
        console.error("Ошибка при удалении кошелька:", err);
      }
    });
  });

  walletsGrid.append(wallet);
}

async function loadWall() {
  try {
    const res = await axios.get(`${API}?ownerEmail=${userEmail}&_limit=4`);
    walletsGrid.innerHTML = "";
    walletCount = 0;
    res.data.forEach(renderWallet);
  } catch (err) {
    console.error("Ошибка загрузки кошельков:", err);
  }
}

walletForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = walletForm.name.value.trim();
  const currency = walletForm.currency.value;
  if (!name || !currency) return;
  try {
    const res = await axios.post(API, {
      name,
      currency,
      ownerEmail: userEmail
    });
    renderWallet(res.data);
    walletForm.reset();
    walletModal.style.display = "none";
  } catch (err) {
    console.error("Ошибка при добавлении:", err);
  }
});

addWalletBtn.addEventListener("click", () => {
  walletModal.style.display = "flex";
});

walletModal.addEventListener("click", (e) => {
  if (e.target === walletModal) {
    walletModal.style.display = "none";
  }
});

exitBtn.addEventListener("click", () => {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "./login.html";
});

loadWall();

function renderTransaction(tx) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${tx.id}</td>
    <td>${tx.wallet}</td>
    <td>${tx.category}</td>
    <td>${tx.amount}</td>
    <td>${new Date(tx.date).toLocaleDateString()}</td>
  `;

  tr.addEventListener("dblclick", () => {
    openConfirmModal("Удалить эту транзакцию?", async () => {
      try {
        await axios.delete(`${TX_API}/${tx.id}`);
        tr.remove();
      } catch (err) {
        console.error("Ошибка при удалении транзакции:", err);
      }
    });
  });

  transactionsTable.append(tr);
}

async function loadTransactions() {
  try {
    const res = await axios.get(TX_API);
    transactionsTable.innerHTML = "";
    const userTx = res.data.filter(tx => tx.ownerEmail === userEmail);
    userTx.forEach(renderTransaction);
  } catch (err) {
    console.error("Ошибка загрузки транзакций:", err);
  }
}

addTransactionBtn.addEventListener("click", async () => {
  transactionModal.style.display = "flex";
  const walletSelect = transactionForm.wallet;
  walletSelect.innerHTML = `<option value="" disabled selected>Выберите кошелек</option>`;
  try {
    const res = await axios.get(`${API}?ownerEmail=${userEmail}`);
    res.data.forEach(w => {
      const option = document.createElement("option");
      option.value = w.name;
      option.textContent = `${w.name} (${w.currency})`;
      walletSelect.append(option);
    });
  } catch (err) {
    console.error("Ошибка загрузки кошельков:", err);
  }
});

transactionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const wallet = transactionForm.wallet.value;
  const category = transactionForm.category.value.trim();
  const amount = transactionForm.amount.value.trim();
  if (!wallet || !category || !amount) return;
  try {
    const res = await axios.post(TX_API, {
      wallet,
      category,
      amount,
      ownerEmail: userEmail,
      date: new Date().toISOString()
    });
    renderTransaction(res.data);
    transactionForm.reset();
    transactionModal.style.display = "none";
  } catch (err) {
    console.error("Ошибка при добавлении транзакции:", err);
  }
});

transactionModal.addEventListener("click", (e) => {
  if (e.target === transactionModal) {
    transactionModal.style.display = "none";
  }
});

loadTransactions();


let confirmAction = null;

function openConfirmModal(message, onConfirm) {
  confirmText.textContent = message;
  confirmModal.style.display = "flex";
  confirmAction = onConfirm;
}

confirmYes.addEventListener("click", () => {
  if (confirmAction) confirmAction();
  confirmModal.style.display = "none";
});

confirmNo.addEventListener("click", () => {
  confirmModal.style.display = "none";
});