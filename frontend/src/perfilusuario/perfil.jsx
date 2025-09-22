import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../GlobalCSS3.css";

export default function Perfil() {
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Estados para los formularios
  const [personalData, setPersonalData] = useState({
    nombres: "",
    apellidos: "",
    fechaNacimiento: ""
  });

  const [cuentaData, setCuentaData] = useState({
    email: "",
    fechaCreacion: ""
  });

  const [manejoData, setManejoData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: ""
  });

  // Función para cargar datos del usuario desde la API
  const cargarDatosUsuario = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoadingData(true);
      setError("");

      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          setError("Tu sesión ha expirado. Redirigiendo al login...");
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      let userData = {};
      
      try {
        const responseData = responseText ? JSON.parse(responseText) : {};
        userData = responseData.user || responseData.data || responseData;
      } catch (parseError) {
        throw new Error("Error procesando datos del servidor");
      }

      // Formatear fechas
      const fechaNacimiento = userData.fechaNacimiento ? 
        new Date(userData.fechaNacimiento).toISOString().split('T')[0] : "";
      const fechaCreacion = userData.createdAt ? 
        new Date(userData.createdAt).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];

      setPersonalData({
        nombres: userData.nombres || "",
        apellidos: userData.apellidos || "",
        fechaNacimiento
      });

      setCuentaData({
        email: userData.correo || userData.email || "",
        fechaCreacion
      });

      // Actualizar localStorage
      localStorage.setItem('userName', userData.nombres || "");
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos: " + err.message);
      
      // Fallback a localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setPersonalData({
            nombres: parsedUser.nombres || localStorage.getItem('userName') || "",
            apellidos: parsedUser.apellidos || "",
            fechaNacimiento: parsedUser.fechaNacimiento ? 
              new Date(parsedUser.fechaNacimiento).toISOString().split('T')[0] : ""
          });
          setCuentaData({
            email: parsedUser.correo || parsedUser.email || "",
            fechaCreacion: parsedUser.createdAt ? 
              new Date(parsedUser.createdAt).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0]
          });
        } catch (parseError) {
          console.error('Error parsing stored data:', parseError);
        }
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    cargarDatosUsuario();
  }, [navigate]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({ ...prev, [name]: value }));
  };

  const handleCuentaChange = (e) => {
    const { name, value } = e.target;
    setCuentaData(prev => ({ ...prev, [name]: value }));
  };

  const handleManejoChange = (e) => {
    const { name, value } = e.target;
    setManejoData(prev => ({ ...prev, [name]: value }));
  };

  const makeRequest = async (endpoint, data) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No se encontró token de autenticación");
      navigate('/login');
      return null;
    }

    const response = await fetch(`https://checknote-27fe.onrender.com/api/v1${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message && errorData.message.includes("actual")) {
            throw new Error("La contraseña actual es incorrecta");
          }
        } catch {}
        localStorage.clear();
        setError("Tu sesión ha expirado. Redirigiendo al login...");
        setTimeout(() => navigate('/login'), 2000);
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    return await response.json();
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        nombres: personalData.nombres.trim(),
        apellidos: personalData.apellidos.trim(),
        ...(personalData.fechaNacimiento && { fechaNacimiento: personalData.fechaNacimiento })
      };

      await makeRequest('/users/me', updateData);
      localStorage.setItem('userName', personalData.nombres);
      await cargarDatosUsuario();
      setSuccess("Información personal actualizada correctamente");
    } catch (err) {
      setError("Error al actualizar la información personal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCuenta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = { correo: cuentaData.email.trim().toLowerCase() };
      await makeRequest('/users/me', updateData);
      await cargarDatosUsuario();
      setSuccess("Información de cuenta actualizada correctamente");
    } catch (err) {
      setError("Error al actualizar la información de cuenta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validaciones
    if (!manejoData.currentPassword) {
      setError("Debes ingresar tu contraseña actual");
      setLoading(false);
      return;
    }
    if (!manejoData.password) {
      setError("Debes ingresar una nueva contraseña");
      setLoading(false);
      return;
    }
    if (manejoData.password !== manejoData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    if (manejoData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }
    if (manejoData.currentPassword === manejoData.password) {
      setError("La nueva contraseña debe ser diferente a la actual");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        currentPassword: manejoData.currentPassword,
        newPassword: manejoData.password
      };

      await makeRequest('/users/me', updateData);
      setSuccess("Contraseña cambiada correctamente");
      setManejoData({ currentPassword: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError("Error al cambiar la contraseña: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
          <img src="/usuario.png" alt="usuario" className="icon user-icon" />
          <span className="username">{personalData.nombres || 'Usuario'}</span>
        </div>
        <div className="topbar-center">
          <div className="search-wrap">
            <img src="/search.png" alt="buscar" className="search-icon" />
            <input className="search-input" placeholder="Buscar en configuración..." />
          </div>
        </div>
        <div className="topbar-right">
          <Link to="/home">
            <img src="/home.png" alt="inicio" className="icon" />
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        <div className="center-column" style={{ maxWidth: '1000px', gap: '0' }}>
          {loadingData && (
            <div className="loading-container">
              <h3>Cargando tu perfil...</h3>
              <div className="loading-icon">⏳</div>
            </div>
          )}

          {!loadingData && (
            <div className="profile-container">
              {/* SIDEBAR */}
              <div className="profile-sidebar">
                <div className="brand-logo">
                  <div className="brand-icon">✓</div>
                  <span className="brand-text">Checknote</span>
                </div>

                <nav className="sidebar-nav">
                  <button
                    onClick={() => setActiveSection("personal")}
                    className={`nav-button ${activeSection === "personal" ? "active" : ""}`}
                  >
                    INFO. PERSONAL
                  </button>
                  <button
                    onClick={() => setActiveSection("cuenta")}
                    className={`nav-button ${activeSection === "cuenta" ? "active" : ""}`}
                  >
                    INFO. CUENTA
                  </button>
                  <button
                    onClick={() => setActiveSection("manejo")}
                    className={`nav-button ${activeSection === "manejo" ? "active" : ""}`}
                  >
                    MANEJO
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate('/login');
                    }}
                    className="nav-button danger"
                  >
                    CERRAR SESIÓN
                  </button>
                </nav>
              </div>

              {/* CONTENIDO */}
              <div className="task-card profile-content">
                {error && <div className="status-message error">{error}</div>}
                {success && <div className="status-message success">{success}</div>}

                {/* INFO. PERSONAL */}
                {activeSection === "personal" && (
                  <div className="fade-in">
                    <h2 className="task-title section-header">INFO. PERSONAL</h2>
                    <p className="section-description">
                      Aquí puedes actualizar tu información personal básica
                    </p>

                    <form onSubmit={handleUpdatePersonal} className="form-container">
                      <div className="form-grid-2">
                        <div className="form-field">
                          <div className="form-label">NOMBRE ✏️</div>
                          <input
                            type="text"
                            name="nombres"
                            value={personalData.nombres}
                            onChange={handlePersonalChange}
                            placeholder="Tu nombre"
                            className="form-input"
                          />
                        </div>
                        <div className="form-field">
                          <div className="form-label">APELLIDO ✏️</div>
                          <input
                            type="text"
                            name="apellidos"
                            value={personalData.apellidos}
                            onChange={handlePersonalChange}
                            placeholder="Tus apellidos"
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="form-label">FECHA NACIMIENTO ✏️</div>
                        <input
                          type="date"
                          name="fechaNacimiento"
                          value={personalData.fechaNacimiento}
                          onChange={handlePersonalChange}
                          className="form-input width-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`action-button primary ${loading ? 'loading' : ''}`}
                      >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </form>
                  </div>
                )}

                {/* INFO. CUENTA */}
                {activeSection === "cuenta" && (
                  <div className="fade-in">
                    <h2 className="task-title section-header">INFO. CUENTA</h2>
                    <p className="section-description">
                      Información importante de tu cuenta y configuración
                    </p>

                    <form onSubmit={handleUpdateCuenta} className="form-container">
                      <div className="form-field">
                        <div className="form-label">CORREO ✏️</div>
                        <input
                          type="email"
                          name="email"
                          value={cuentaData.email}
                          onChange={handleCuentaChange}
                          placeholder="tu@email.com"
                          className="form-input width-md"
                        />
                      </div>

                      <div className="form-field">
                        <div className="form-label">CREADO EL</div>
                        <input
                          type="date"
                          value={cuentaData.fechaCreacion}
                          disabled
                          className="form-input width-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`action-button primary ${loading ? 'loading' : ''}`}
                      >
                        {loading ? "Guardando..." : "Actualizar Email"}
                      </button>
                    </form>
                  </div>
                )}

                {/* MANEJO */}
                {activeSection === "manejo" && (
                  <div className="fade-in">
                    <h2 className="task-title section-header">MANEJO</h2>
                    <p className="section-description">
                      Configuraciones sensibles de seguridad y cuenta
                    </p>

                    <form onSubmit={handleChangePassword} className="form-container mb-xl">
                      <div className="form-field">
                        <div className="form-label">CONTRASEÑA ACTUAL</div>
                        <input
                          type="password"
                          name="currentPassword"
                          value={manejoData.currentPassword}
                          onChange={handleManejoChange}
                          placeholder="Tu contraseña actual"
                          className="form-input width-sm"
                        />
                      </div>

                      <div className="form-field">
                        <div className="form-label">NUEVA CONTRASEÑA</div>
                        <input
                          type="password"
                          name="password"
                          value={manejoData.password}
                          onChange={handleManejoChange}
                          placeholder="Nueva contraseña"
                          className="form-input width-sm"
                        />
                      </div>

                      <div className="form-field">
                        <div className="form-label">CONFIRMAR CONTRASEÑA</div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={manejoData.confirmPassword}
                          onChange={handleManejoChange}
                          placeholder="Confirmar nueva contraseña"
                          className="form-input width-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`action-button info ${loading ? 'loading' : ''}`}
                      >
                        {loading ? "Cambiando..." : "CAMBIAR CONTRASEÑA"}
                      </button>
                    </form>

                    <div className="danger-zone">
                      <h3 className="danger-zone-title">Zona Peligrosa</h3>
                      <p className="danger-zone-description">
                        Esta acción eliminará permanentemente tu cuenta y todos tus datos
                      </p>
                      <button
                        onClick={() => navigate('/eliminar-cuenta')}
                        className="action-button danger"
                      >
                        ELIMINAR CUENTA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <Link to="/home" className="footer-link">
          <img src="/home.png" alt="inicio" className="icon" />
          <span className="footer-text">Inicio</span>
        </Link>
      </footer>
    </div>
  );
}