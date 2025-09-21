import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

export default function OlvidarPw2() {
  const { token } = useParams(); // Obtener token de la URL
  const location = useLocation(); // Para obtener query params si es necesario
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(null); // null = verificando, true = válido, false = inválido
  const [validToken, setValidToken] = useState(""); // Para guardar el token válido
  const navigate = useNavigate();

  // Verificar token al montar el componente
  useEffect(() => {
    const verifyToken = async () => {
      // Intentar obtener token de diferentes fuentes
      let currentToken = token;
      
      // Si no hay token en params, intentar obtenerlo de query params
      if (!currentToken) {
        const urlParams = new URLSearchParams(location.search);
        currentToken = urlParams.get('token');
      }
      
      // Si aún no hay token, intentar obtenerlo de localStorage (si el backend lo guarda ahí)
      if (!currentToken) {
        currentToken = localStorage.getItem('resetToken');
      }

      console.log("=== VERIFICANDO TOKEN ===");
      console.log("Token desde params:", token);
      console.log("Token desde query:", new URLSearchParams(location.search).get('token'));
      console.log("Token final:", currentToken);

      if (!currentToken) {
        setTokenValid(false);
        setError("Token no válido - acceso denegado. Debe acceder desde el enlace del email.");
        return;
      }

      try {
        // Verificar el token usando el endpoint correcto
        const res = await fetch(`https://checknote-27fe.onrender.com/api/v1/auth/verify`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ token: currentToken })
        });

        console.log("Status verificación:", res.status);
        console.log("Endpoint usado:", "/api/v1/auth/verify");

        if (res.ok) {
          console.log("✅ Token válido");
          setTokenValid(true);
          // Guardar el token válido en el estado para usarlo después
          setValidToken(currentToken);
        } else {
          console.log("❌ Token inválido");
          const data = await res.json().catch(() => ({}));
          setTokenValid(false);
          setError(data.message || "Token no válido o expirado");
        }
      } catch (err) {
        console.error("Error verificando token:", err);
        setTokenValid(false);
        setError("Error al verificar el token. Intenta solicitar un nuevo enlace.");
      }
    };

    verifyToken();
  }, [token, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    console.log("=== RESTABLECIENDO CONTRASEÑA ===");
    console.log("Token a usar:", validToken);
    console.log("Password length:", password.length);

    try {
      const payload = { 
        token: validToken, // Usar el token validado
        nuevaContrasena: password 
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/auth/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
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
          errorMessage = data.message || "Datos inválidos";
        } else if (response.status === 401) {
          errorMessage = "Token expirado o inválido";
        } else if (response.status === 404) {
          errorMessage = "Token no encontrado";
        } else {
          errorMessage = data.message || "Error al restablecer la contraseña";
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Error de conexión. Verifica tu internet.");
      } else if (err.message.includes('JSON')) {
        setError("Error procesando respuesta del servidor.");
      } else {
        setError("Error de conexión con el servidor: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Si aún está verificando el token
  if (tokenValid === null) {
    return (
      <div className="main-container gradient-bg">
        <div className="card forgot-style with-shadow">
          <div className="logo size-md">
            <img src="/logo.png" alt="Checknote" />
            <h1>Checknote</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 className="title-secondary">Verificando acceso...</h2>
            <p style={{ color: '#6c757d' }}>Validando enlace de recuperación</p>
          </div>
        </div>
      </div>
    );
  }

  // Si el token no es válido
  if (tokenValid === false) {
    return (
      <div className="main-container gradient-bg">
        <div className="card forgot-style with-shadow">
          <div className="logo size-md">
            <img src="/logo.png" alt="Checknote" />
            <h1>Checknote</h1>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2 className="title-secondary" style={{ color: '#dc3545' }}>Enlace no válido</h2>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>
              {error || "El enlace ha expirado o no es válido"}
            </p>
            <Link to="/olvidar-password" className="btn btn-primary btn-rounded">
              Solicitar nuevo enlace
            </Link>
          </div>

          <div className="links-section">
            <Link to="/login" className="link">Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal (token válido)
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
            Token params: {token?.substring(0, 20)}...<br />
            Token query: {new URLSearchParams(location.search).get('token')?.substring(0, 20)}...<br />
            Token válido: {validToken?.substring(0, 20)}...<br />
            Estado: {tokenValid ? 'Válido' : 'Inválido'}<br />
            URL verificación: /api/v1/auth/verify<br />
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
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

          {/* Error */}
          {error && <p className="text-error">{error}</p>}

          {/* Botón */}
          <button 
            type="submit" 
            className="btn btn-primary btn-rounded" 
            disabled={loading || !password.trim() || !confirmPassword.trim()}
          >
            {loading ? "Restableciendo..." : "Restablecer Contraseña"}
          </button>
        </form>

        {/* Link adicional */}
        <div className="links-section">
          <Link to="/login" className="link">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}