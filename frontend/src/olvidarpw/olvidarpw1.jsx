import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function OlvidarPw1() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // DEBUGGING: Mostrar datos que se van a enviar
    console.log("=== DEBUGGING FORGOT PASSWORD ===");
    console.log("1. Email ingresado:", email);
    console.log("2. Email procesado:", email.trim().toLowerCase());
    console.log("3. URL completa:", "https://checknote-27fe.onrender.com/api/v1/auth/request-password-reset");

    try {
      const payload = { correo: email.trim().toLowerCase() };
      console.log("4. Payload a enviar:", JSON.stringify(payload, null, 2));

      const res = await fetch("https://checknote-27fe.onrender.com/api/v1/auth/request-password-reset", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      // DEBUGGING: Información de la respuesta
      console.log("5. Status de respuesta:", res.status);
      console.log("6. Status text:", res.statusText);
      console.log("7. Headers de respuesta:", Object.fromEntries(res.headers.entries()));

      // Intentar leer la respuesta
      let data;
      try {
        const responseText = await res.text();
        console.log("8. Respuesta raw:", responseText);
        
        if (responseText) {
          data = JSON.parse(responseText);
          console.log("9. Respuesta parseada:", data);
        } else {
          console.log("9. Respuesta vacía");
          data = {};
        }
      } catch (parseError) {
        console.error("9. Error parseando respuesta:", parseError);
        console.log("   Respuesta no es JSON válido");
        throw new Error("Respuesta del servidor no es válida");
      }

      if (res.ok) {
        console.log("10. ✅ Éxito - Redirigiendo a olvidar-password2");
        navigate("/olvidar-password2");
      } else {
        console.log("10. ❌ Error del servidor");
        console.log("    Status:", res.status);
        console.log("    Message:", data.message);
        console.log("    Details:", data.details);
        
        // Mensajes específicos según el error
        let errorMessage;
        if (res.status === 400) {
          errorMessage = data.message || "Error en los datos enviados";
        } else if (res.status === 404) {
          errorMessage = "Servicio no encontrado. Verifica la configuración del servidor.";
        } else if (res.status === 429) {
          errorMessage = "Demasiadas solicitudes. Espera un momento e intenta nuevamente.";
        } else if (res.status === 500) {
          errorMessage = "Error interno del servidor. Intenta más tarde.";
        } else {
          errorMessage = data.message || `Error ${res.status}: ${res.statusText}`;
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error("11. ❌ Error en la petición:", err);
      console.error("    Stack:", err.stack);
      
      // Diferentes tipos de errores de red
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Error de conexión. Verifica tu internet y que el servidor esté funcionando.");
      } else if (err.message.includes('JSON')) {
        setError("Error procesando respuesta del servidor.");
      } else {
        setError("Error de conexión con el servidor: " + err.message);
      }
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

        {/* Info de debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            background: '#2d3748', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            fontSize: '12px',
            color: '#a0aec0'
          }}>
            <strong>DEBUG INFO:</strong><br />
            Email: {email}<br />
            URL: /api/v1/auth/request-password-reset<br />
            Payload: {JSON.stringify({ correo: email.trim().toLowerCase() })}
          </div>
        )}

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
                disabled={loading}
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-error">{error}</p>}

          {/* Botón */}
          <button type="submit" className="btn btn-primary" disabled={loading || !email.trim()}>
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