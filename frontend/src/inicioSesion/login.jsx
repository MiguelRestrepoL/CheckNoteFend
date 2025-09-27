/*
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function InicioSesion() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // DEBUGGING: Mostrar datos que se envían
    console.log("Datos de login:", { 
      correo: correo.trim().toLowerCase(), 
      contrasena: contrasena.length + " caracteres" 
    });

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

      // Redirigir
      navigate("/home", { state: { success: "¡Inicio de sesión exitoso!" } });

    } catch (err) {
      console.error("Error completo:", err);
      setError(err.message);
      
      // Limpiar localStorage en caso de error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container solid-bg">
      <div className="card login-style with-shadow">
        <div className="logo size-lg">
          <img src="/logo.png" alt="Checknote logo" />
        </div>

        <h2 className="title-secondary">¡Bienvenido nuevamente!</h2>
        <p className="subtitle">Ingrese su correo y contraseña para acceder</p>
        
        <form className="form spaced" onSubmit={handleSubmit}>
          <div className="field-group">
            <img src="/correo.png" alt="Email" className="field-icon" />
            <div className="field-input">
              <label>E-mail</label>
              <input
                type="email"
                className="login-input"
                placeholder="Ingrese su correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="field-group">
            <img src="/clave.png" alt="Contraseña" className="field-icon" />
            <div className="field-input">
              <label>Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Ingrese su contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          
          <div className="btn-container">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>

        {error && <p className="text-error">{error}</p>}
        
        <Link to="/olvidar-password" className="link small">
          ¿Olvidó su contraseña?
        </Link>
        
        <div className="links-section">
          ¿No tiene cuenta? <Link to="/registro" className="link">Registrarse</Link>
        </div>
      </div>
    </div>
  );
}
  */