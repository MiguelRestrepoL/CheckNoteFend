
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// NO importar olvidarpw1.css - usar solo el global.css

export default function OlvidarPw1() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Redirigir a la siguiente pantalla
        navigate("/olvidar-password2");
      } else {
        setError(data.message || "Error al procesar la solicitud");
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
        <h2 className="title-secondary">Ingrese el correo con el que creó la cuenta</h2>

        {/* Formulario */}
        <form className="form compact" onSubmit={handleSubmit}>
          <div className="field-group">
            <img src="/correo.png" alt="Email" className="field-icon" />
            <div className="field-input">
              <label>Email</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-error">{error}</p>}

          {/* Botón */}
          <button type="submit" className="btn btn-primary btn-rounded" disabled={loading}>
            {loading ? "Procesando..." : "Confirmar correo"}
          </button>
        </form>

        {/* Link de registro */}
        <div className="links-section">
          ¿No tiene cuenta? <Link to="/registro" className="link">Registrarse</Link>
        </div>
      </div>
    </div>
  );
}