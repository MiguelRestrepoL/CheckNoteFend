import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

export default function OlvidarPw2() {
  const { token } = useParams(); // Obtener token de la URL
  const location = useLocation(); // Para obtener query params si es necesario
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  // Obtener token al montar el componente
  useEffect(() => {
    let currentToken = token;
    
    // Si no hay token en params, intentar obtenerlo de query params
    if (!currentToken) {
      const urlParams = new URLSearchParams(location.search);
      currentToken = urlParams.get('token');
    }
    
    console.log("=== OBTENIENDO TOKEN ===");
    console.log("Token desde params:", token);
    console.log("Token desde query:", new URLSearchParams(location.search).get('token'));
    console.log("Token final:", currentToken);

    if (!currentToken) {
      setError("Token no válido - acceso denegado. Debe acceder desde el enlace del email.");
      return;
    }

    // Guardar el token para usarlo después
    setResetToken(currentToken);
  }, [token, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que tenemos token
    if (!resetToken) {
      setError("Token no válido. Debe acceder desde el enlace del email.");
      return;
    }

    // Validaciones de contraseña
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    // Validaciones adicionales basadas en el PasswordResetService
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError("La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial");
      return;
    }

    setLoading(true);
    setError("");

    console.log("=== RESTABLECIENDO CONTRASEÑA ===");
    console.log("Token a usar:", resetToken.substring(0, 20) + "...");

    try {
      const payload = { 
        token: resetToken,
        nuevaContrasena: password 
      };

      console.log("Payload enviado:", { token: resetToken.substring(0, 20) + "...", nuevaContrasena: "***" });

      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/auth/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Status reset:", response.status);

      let data;
      try {
        const responseText = await response.text();
        console.log("Respuesta raw:", responseText);
        
        if (responseText) {
          data = JSON.parse(responseText);
          console.log("Respuesta parseada:", data);
        } else {
          data = {};
        }
      } catch (parseError) {
        console.error("Error parseando respuesta:", parseError);
        throw new Error("Respuesta del servidor no es válida");
      }

      if (response.ok) {
        console.log("✅ Contraseña restablecida exitosamente");
        // Redirigir al login con mensaje de éxito
        navigate("/login", { 
          state: { 
            message: "Contraseña restablecida exitosamente. Puedes iniciar sesión con tu nueva contraseña.",
            type: "success"
          }
        });
      } else {
        console.log("❌ Error:", data.message);
        
        let errorMessage;
        if (response.status === 400) {
          errorMessage = data.message || "Token inválido o datos incorrectos";
        } else if (response.status === 401) {
          errorMessage = "Token expirado o inválido. Solicita un nuevo enlace de recuperación.";
        } else if (response.status === 404) {
          errorMessage = "Token no encontrado. Solicita un nuevo enlace de recuperación.";
        } else {
          errorMessage = data.message || "Error al restablecer la contraseña";
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Error de conexión. Verifica tu internet y el estado del servidor.");
      } else if (err.message.includes('JSON')) {
        setError("Error procesando respuesta del servidor.");
      } else {
        setError("Error de conexión: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Si no hay token, mostrar error
  if (!resetToken && !loading) {
    return (
      <div className="main-container gradient-bg">
        <div className="card forgot-style with-shadow">
          <div className="logo size-md">
            <img src="/logo.png" alt="Checknote" />
            <h1>Checknote</h1>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2 className="title-secondary" style={{ color: '#dc3545' }}>Acceso denegado</h2>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>
              Debe acceder desde el enlace enviado a su correo electrónico
            </p>
            <Link to="/olvidar-password" className="btn btn-primary btn-rounded">
              Solicitar enlace de recuperación
            </Link>
          </div>

          <div className="links-section">
            <Link to="/login" className="link">Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="main-container gradient-bg">
      <div className="card forgot-style with-shadow">
        {/* Logo */}
        <div className="logo size-md">
          <img src="/logo.png" alt="Checknote" />
          <h1>Checknote</h1>
        </div>

        {/* Título */}
        <h2 className="title-secondary">Nueva Contraseña</h2>
        <p className="subtitle">Ingrese una contraseña segura para su cuenta</p>

        {/* Info de debugging */}
        {process.env.NODE_ENV === 'development' && resetToken && (
          <div style={{ 
            background: '#2d3748', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            fontSize: '12px',
            color: '#a0aec0'
          }}>
            <strong>DEBUG INFO:</strong><br />
            Token disponible: {resetToken.substring(0, 20)}...<br />
            Token length: {resetToken.length}<br />
            URL reset: /api/v1/auth/reset-password
          </div>
        )}

        {/* Formulario */}
        <form className="form compact" onSubmit={handleSubmit}>
          {/* Nueva Contraseña */}
          <div className="field-group">
            <img src="/pw.png" alt="Contraseña" className="field-icon" />
            <div className="field-input">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres con mayús, minus, número y símbolo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
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
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Requisitos de contraseña */}
          <div style={{ 
            fontSize: '12px', 
            color: '#6c757d', 
            marginBottom: '15px',
            textAlign: 'left',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '5px',
            color: '#495057'
          }}>
            <strong>Requisitos de contraseña:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '15px' }}>
              <li>Mínimo 8 caracteres</li>
              <li>Al menos 1 letra mayúscula</li>
              <li>Al menos 1 letra minúscula</li>
              <li>Al menos 1 número</li>
              <li>Al menos 1 carácter especial (!@#$%^&*...)</li>
            </ul>
          </div>

          {/* Error */}
          {error && <p className="text-error">{error}</p>}

          {/* Botón */}
          <button 
            type="submit" 
            className="btn btn-primary btn-rounded" 
            disabled={loading || !password.trim() || !confirmPassword.trim()}
          >
            {loading ? "Restableciendo..." : "Establecer Nueva Contraseña"}
          </button>
        </form>

        {/* Links adicionales */}
        <div className="links-section">
          <Link to="/olvidar-password" className="link small">Solicitar nuevo enlace</Link> | 
          <Link to="/login" className="link small"> Volver al login</Link>
        </div>
      </div>
    </div>
  );
}