import axios from "axios";
import { showModal } from "./utils.js";

const API = "http://localhost:8080/users";

const form = document.forms.signUp; 
const usernameInput = form.querySelector('input[name="username"]');
const emailInput = form.querySelector('input[name="email"]');
const passwordInput = form.querySelector('input[name="password"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !email || !password) {
    if (!username) showError(usernameInput, "Введите имя");
    if (!email) showError(emailInput, "Введите email");
    if (!password) showError(passwordInput, "Введите пароль");
    return;
  }

  try {
    const existingUser = await axios.get(API, { params: { email } });
    if (existingUser.data.length > 0) {
      showError(emailInput, "Этот email уже зарегистрирован");
      return;
    }

    const newUser = { name: username, email, password };
    await axios.post(API, newUser);

    localStorage.setItem("userEmail", newUser.email);
    localStorage.setItem("userName", newUser.name);

    window.location.href = "./home.html";

  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    showModal("Ошибка при регистрации. Попробуйте позже.");
  }
});

function showError(input, message) {
  input.style.border = "1px solid red";

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
