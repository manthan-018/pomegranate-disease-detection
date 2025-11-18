const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");
const registerForm = document.getElementById("register-form");
const registerStatus = document.getElementById("register-status");
const adminForm = document.getElementById("admin-form");
const adminJson = document.getElementById("admin-json");
const nextParam = new URLSearchParams(window.location.search).get("next") || "/";

document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const wrapper = button.closest(".password-wrapper");
    const input = wrapper ? wrapper.querySelector("input") : button.previousElementSibling;
    if (!input) return;
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "🙈" : "👁";
  });
});

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    const button = loginForm.querySelector("button");
    button.disabled = true;
    setStatus(loginStatus, "Authenticating…", "pending");
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Login failed");
      setStatus(loginStatus, `✅ ${payload.message}`, "success");
      setTimeout(() => {
        window.location.href = nextParam || "/";
      }, 600);
    } catch (error) {
      setStatus(loginStatus, `⚠️ ${error.message}`, "error");
    } finally {
      button.disabled = false;
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(registerForm).entries());
    const button = registerForm.querySelector("button");
    button.disabled = true;
    setStatus(registerStatus, "Registering user…", "pending");
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Registration failed");
      setStatus(registerStatus, `✅ ${payload.message}\nRedirecting…`, "success");
      setTimeout(() => {
        window.location.href = nextParam || "/";
      }, 700);
    } catch (error) {
      setStatus(registerStatus, `⚠️ ${error.message}`, "error");
    } finally {
      button.disabled = false;
    }
  });
}

if (adminForm && adminJson) {
  adminForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = adminForm.token.value.trim();
    if (!token) return;
    adminJson.textContent = "// fetching credentials…";
    const copyBtn = document.getElementById("copy-json");
    if (copyBtn) copyBtn.hidden = true;
    try {
      const response = await fetch(`/admin/users?token=${encodeURIComponent(token)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to fetch users");
      adminJson.textContent = JSON.stringify(payload, null, 2);
      if (copyBtn) copyBtn.hidden = false;
    } catch (error) {
      adminJson.textContent = JSON.stringify({ error: error.message }, null, 2);
      if (copyBtn) copyBtn.hidden = true;
    }
  });
}

const copyBtn = document.getElementById("copy-json");
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    const jsonText = document.getElementById("admin-json")?.textContent;
    if (jsonText && jsonText !== "{}") {
      navigator.clipboard.writeText(jsonText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✓ Copied!";
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      });
    }
  });
}

function setStatus(element, message, state) {
  if (!element) return;
  element.hidden = false;
  element.textContent = message;
  element.className = `status-message ${state || ""}`;
}

