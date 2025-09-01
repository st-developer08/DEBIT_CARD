import axios from "axios";
import { showModal } from "./utils.js";

const API = "http://localhost:8080/users";

const form = document.forms.logIn;
const usernameInput = form.querySelector('input[name="username"]');
const emailInput = form.querySelector('input[type="email"]');
const passwordInput = form.querySelector('input[type="password"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  [usernameInput, emailInput, passwordInput].forEach((input) => {
    input.style.border = "1px solid #ccc";
    const err = input.nextElementSibling;
    if (err && err.classList.contains("error-msg")) {
      err.remove();
    }
  });

  let hasError = false;

  if (!username) {
    showError(usernameInput, "Введите логин");
    hasError = true;
  }
  if (!email) {
    showError(emailInput, "Введите email");
    hasError = true;
  }
  if (!password) {
    showError(passwordInput, "Введите пароль");
    hasError = true;
  }

  if (hasError) return;

  try {
    const res = await axios.get(API, { params: { email } });

    if (res.data.length === 0) {
      showError(emailInput, "Пользователь не найден");
      return;
    }

    const user = res.data[0];

    if (user.password !== password) {
      showError(passwordInput, "Неверный пароль");
      return;
    }

    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userName", user.name || username);

    window.location.href = "./home.html";

  } catch (err) {
    console.error("Ошибка при входе:", err);
    showModal("Ошибка при входе. Попробуйте позже.");
  }
});

function showError(input, message) {
  input.style.border = "2px solid red";

  const oldError = input.parentNode.querySelector(".error-msg");
  if (oldError) oldError.remove();

  const span = document.createElement("span");
  span.textContent = message;
  span.className = "error-msg";

  span.style.color = "red";
  span.style.fontSize = "12px";
  span.style.display = "block";
  span.style.marginTop = "4px";
  span.style.textAlign = "left";
  span.style.width = "100%";

  input.insertAdjacentElement("afterend", span);
}
