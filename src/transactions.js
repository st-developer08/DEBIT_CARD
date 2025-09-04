import axios from "axios";

const TX_API = "http://localhost:8080/transactions";
const WALLETS_API = "http://localhost:8080/wallets";

const userEmail = localStorage.getItem("userEmail");
if (!userEmail) window.location.href = "./login.html";

const userEmailEl = document.querySelector(".user-email");
const usernameLink = document.querySelector(".transactions a");
const exitBtn = document.querySelector(".exit");
const transactionsTable = document.querySelector("tbody");

const addTransactionBtn = document.querySelector("#addTransaction");
const transactionModal = document.querySelector("#transactionModal");
const transactionForm = document.querySelector("#transactionForm");
const walletSelect = transactionForm.wallet;

if (userEmailEl) userEmailEl.textContent = userEmail;
if (usernameLink) usernameLink.textContent = userEmail;

exitBtn.addEventListener("click", () => {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "./login.html";
});

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

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
    openConfirmModal(`Удалить транзакцию #${tx.id}?`, async () => {
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
    const userTx = res.data.filter((tx) => tx.ownerEmail === userEmail);
    userTx.forEach(renderTransaction);
  } catch (err) {
    console.error("Ошибка загрузки транзакций:", err);
  }
}

async function loadWallets() {
  try {
    const res = await axios.get(`${WALLETS_API}?ownerEmail=${userEmail}`);
    walletSelect.innerHTML = `<option value="">Выберите кошелёк</option>`;
    res.data.forEach((w) => {
      const option = document.createElement("option");
      option.value = w.name;
      option.textContent = `${w.name} (${w.currency})`;
      walletSelect.append(option);
    });
  } catch (err) {
    console.error("Ошибка загрузки кошельков:", err);
  }
}

addTransactionBtn.addEventListener("click", async () => {
  await loadWallets();
  transactionModal.style.display = "flex";
});

transactionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const wallet = walletSelect.value;
  const category = transactionForm.category.value.trim();
  const amount = transactionForm.amount.value.trim();

  if (!wallet || !category || !amount) return;

  try {
    const res = await axios.post(TX_API, {
      wallet,
      category,
      amount,
      ownerEmail: userEmail,
      date: new Date().toISOString(),
    });

    renderTransaction(res.data);

    transactionForm.reset();
    transactionModal.style.display = "none";
  } catch (err) {
    console.error("Ошибка при добавлении:", err);
  }
});

transactionModal.addEventListener("click", (e) => {
  if (e.target === transactionModal) {
    transactionModal.style.display = "none";
  }
});

loadTransactions();
