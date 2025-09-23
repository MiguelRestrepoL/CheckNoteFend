const form = document.getElementById("login-form");
const correoInput = document.getElementById("correo");
const contrasenaInput = document.getElementById("contrasena");
const togglePasswordBtn = document.getElementById("toggle-password");
const loginBtn = document.getElementById("login-btn");
const errorMsg = document.getElementById("error-msg");

let showPassword = false;

togglePasswordBtn.addEventListener("click", () => {
  showPassword = !showPassword;
  contrasenaInput.type = showPassword ? "text" : "password";
  togglePasswordBtn.textContent = showPassword ? "👁️" : "👁️‍🗨️";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";
  loginBtn.disabled = true;
  loginBtn.textContent = "Iniciando...";

  const correo = correoInput.value.trim().toLowerCase();
  const contrasena = contrasenaInput.value;

  console.log("Datos de login:", { correo, contrasena: contrasena.length + " caracteres" });

  try {
    const loginRes = await fetch("https://checknote-27fe.onrender.com/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    if (!loginRes.ok) {
      let errorData;
      try {
        errorData = await loginRes.json();
      } catch {
        errorData = { message: "Error desconocido del servidor" };
      }

      if (loginRes.status === 401) {
        throw new Error(errorData.message || "Email o contraseña incorrectos");
      } else if (loginRes.status === 423) {
        throw new Error("Cuenta bloqueada por seguridad. Intenta en unos minutos.");
      } else if (loginRes.status === 429) {
        throw new Error("Demasiados intentos. Espera un momento antes de intentar nuevamente.");
      } else {
        throw new Error(errorData.message || "Error en el servidor");
      }
    }

    const loginData = await loginRes.json();
    const token = loginData.data?.token || loginData.token;
    const user = loginData.data?.usuario || loginData.data?.user || loginData.user;

    if (!token || !user) {
      throw new Error("Respuesta del servidor incompleta");
    }

    // Guardar datos
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userId", user._id || user.id);
    localStorage.setItem("userName", user.nombres);

    alert("¡Inicio de sesión exitoso!");
    window.location.href = "home.html"; // redirigir
  } catch (err) {
    console.error("Error completo:", err);
    errorMsg.textContent = err.message;
    localStorage.clear();
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Iniciar sesión";
  }
});

