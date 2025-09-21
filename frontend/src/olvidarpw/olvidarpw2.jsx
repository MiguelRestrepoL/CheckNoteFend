
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// NO importar olvidarpw2.css - usar solo el global.css

export default function OlvidarPw2() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password /* , token u otro identificador */ }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Redirigir a la página de inicio de sesión o confirmación
        navigate("/login");
      } else {
        setError(data.message || "Error al restablecer la contraseña");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container gradient-bg">
      <div className="card forgot-style with-shadow">
        {/* Logo */}
        <div className="logo size-md">
          <img src="/logo.png" alt="Checknote" />
          <h1>Checknote</h1>
        </div>

        {/* Título */}
        <h2 className="title-secondary">Ingrese una nueva contraseña para su cuenta</h2>

        {/* Formulario */}
        <form className="form compact" onSubmit={handleSubmit}>
          {/* Nueva Contraseña */}
          <div className="field-group">
            <img src="/pw.png" alt="Contraseña" className="field-icon" />
            <div className="field-input">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="field-group">
            <img src="/pw.png" alt="Confirmar" className="field-icon" />
            <div className="field-input">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Confirmar Nueva Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-error">{error}</p>}

          {/* Botón */}
          <button type="submit" className="btn btn-primary btn-rounded" disabled={loading}>
            {loading ? "Procesando..." : "Restablecer Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}