import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./InicioSesion.css"; // Solo importa el CSS específico (25 líneas)

export default function InicioSesion() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginRes = await fetch("https://checknote-27fe.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!loginRes.ok) {
        const errorData = await loginRes.json();
        throw new Error(errorData.message || "Credenciales incorrectas. Inténtalo de nuevo.");
      }

      const loginData = await loginRes.json();
      const token = loginData.token;
      const user = loginData.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user._id); 
      localStorage.setItem('userName', user.nombres); 

      const verifyRes = await fetch("https://checknote-27fe.onrender.com/api/v1/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!verifyRes.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        throw new Error("La sesión no es válida. Por favor, inicia sesión de nuevo.");
      }

      navigate("/home", { state: { success: "¡Inicio de sesión exitoso!" } });

    } catch (err) {
      setError(err.message);
      if (err.message !== "La sesión no es válida. Por favor, inicia sesión de nuevo.") {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
      }
    } finally {
      setLoading(false);
    }
  };

return (
  // ⬇️ ESTAS CLASES VIENEN DEL GlobalCSS1.css
  <div className="main-container solid-bg">
    <div className="card login-style with-shadow">
      
      {/* Logo - usa .logo .size-lg del global */}
      <div className="logo size-lg">
        <img src="/logo.png" alt="Checknote logo" />
      </div>

      {/* Títulos - usan .title-secondary y .subtitle del global */}
      <h2 className="title-secondary">¡Bienvenido nuevamente!</h2>
      <p className="subtitle">Ingrese su correo y contraseña para acceder</p>
      
      {/* Formulario - usa .form .spaced del global */}
      <form className="form spaced" onSubmit={handleSubmit}>
        
        {/* Campo email - usa .field-group, .field-icon, .field-input del global */}
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
        
        {/* Campo contraseña */}
        <div className="field-group">
          <img src="/clave.png" alt="Contraseña" className="field-icon" />
          <div className="field-input">
            <label>Contraseña</label>
            <input
              type="password"
              className="login-input"
              placeholder="Ingrese su contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
        </div>
        
        {/* Botón submit - usa .btn-container, .btn, .btn-primary, .btn-rounded del global */}
        <div className="btn-container">
          <button type="submit" className="btn btn-primary btn-rounded" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
        </div>
      </form>

      {/* Error - usa .text-error del global */}
      {error && <p className="text-error">{error}</p>}
      
      {/* Link olvidar contraseña - usa .link .small del global */}
      <Link to="/olvidar-password" className="link small">
        ¿Olvidó su contraseña?
      </Link>
      
      {/* Botón Google - usa .login-google del login.css específico */}
      <button className="login-google">
        <img src="/google.png" alt="Google" />
        Continuar con Google
      </button>
      
      {/* Enlaces finales - usa .links-section y .link del global */}
      <div className="links-section">
        ¿No tiene cuenta? <Link to="/registro" className="link">Registrarse</Link>
      </div>
    </div>
  </div>
);
}