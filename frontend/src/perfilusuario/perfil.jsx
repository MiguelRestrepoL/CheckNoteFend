import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// Usar solo globalcss2.css

export default function Perfil() {
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(false);
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
    password: "",
    confirmPassword: ""
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Cargar datos reales del localStorage
    const storedUser = localStorage.getItem('user');
    let userData = {};
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userData = {
          nombres: parsedUser.nombres || localStorage.getItem('userName') || "",
          apellidos: parsedUser.apellidos || "",
          fechaNacimiento: parsedUser.fechaNacimiento || "",
          email: parsedUser.correo || parsedUser.email || "",
          fechaCreacion: parsedUser.createdAt ? 
            new Date(parsedUser.createdAt).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0]
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
        userData = {
          nombres: localStorage.getItem('userName') || "",
          apellidos: "",
          fechaNacimiento: "",
          email: "",
          fechaCreacion: new Date().toISOString().split('T')[0]
        };
      }
    } else {
      // Si no hay datos de usuario guardados, usar valores por defecto
      userData = {
        nombres: localStorage.getItem('userName') || "",
        apellidos: "",
        fechaNacimiento: "",
        email: "",
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
    }

    setPersonalData({
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      fechaNacimiento: userData.fechaNacimiento
    });

    setCuentaData({
      email: userData.email,
      fechaCreacion: userData.fechaCreacion
    });
  }, [navigate]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCuentaChange = (e) => {
    const { name, value } = e.target;
    setCuentaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManejoChange = (e) => {
    const { name, value } = e.target;
    setManejoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implementar API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar localStorage
      localStorage.setItem('userName', personalData.nombres);
      
      setSuccess("Información personal actualizada correctamente");
    } catch (err) {
      setError("Error al actualizar la información personal");
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
      // TODO: Implementar API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess("Información de cuenta actualizada correctamente");
    } catch (err) {
      setError("Error al actualizar la información de cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (manejoData.password !== manejoData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (manejoData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      // TODO: Implementar API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess("Contraseña cambiada correctamente");
      setManejoData({ password: "", confirmPassword: "" });
    } catch (err) {
      setError("Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    
    if (!confirmacion) return;

    setLoading(true);
    setError("");

    try {
      // TODO: Implementar API call para eliminar cuenta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Limpiar localStorage y redirigir
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      setError("Error al eliminar la cuenta");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all var(--transition)',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    boxSizing: 'border-box'
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '280px 1fr', 
            gap: 'var(--spacing-xl)', 
            width: '100%',
            alignItems: 'start'
          }}>
            
            {/* SIDEBAR IZQUIERDO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              {/* Logo Checknote */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: 'var(--primary)' 
                }}>
                  Checknote
                </span>
              </div>

              {/* Botones de navegación */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={() => setActiveSection("personal")}
                  className={activeSection === "personal" ? "filter active" : "filter"}
                  style={{ 
                    ...buttonStyle,
                    justifyContent: 'flex-start',
                    textAlign: 'left'
                  }}
                >
                  INFO. PERSONAL
                </button>
                
                <button
                  onClick={() => setActiveSection("cuenta")}
                  className={activeSection === "cuenta" ? "filter active" : "filter"}
                  style={{ 
                    ...buttonStyle,
                    justifyContent: 'flex-start',
                    textAlign: 'left'
                  }}
                >
                  INFO. CUENTA
                </button>
                
                <button
                  onClick={() => setActiveSection("manejo")}
                  className={activeSection === "manejo" ? "filter active" : "filter"}
                  style={{ 
                    ...buttonStyle,
                    justifyContent: 'flex-start',
                    textAlign: 'left'
                  }}
                >
                  MANEJO
                </button>

                {/* Botón cerrar sesión */}
                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    marginTop: 'var(--spacing-lg)',
                    textAlign: 'center'
                  }}
                >
                  CERRAR SESIÓN
                </button>
              </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="task-card" style={{ 
              maxWidth: 'none', 
              textAlign: 'left',
              minHeight: '500px'
            }}>
              
              {/* Mensajes de estado */}
              {error && (
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontSize: '14px',
                  textAlign: 'center',
                  fontWeight: '500',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message" style={{ marginBottom: 'var(--spacing-lg)' }}>
                  {success}
                </div>
              )}

              {/* INFO. PERSONAL */}
              {activeSection === "personal" && (
                <div>
                  <h2 className="task-title" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    INFO. PERSONAL
                  </h2>
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '14px',
                    marginBottom: 'var(--spacing-xl)'
                  }}>
                    Aquí puedes actualizar tu información personal básica
                  </p>

                  <form onSubmit={handleUpdatePersonal} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--spacing-lg)' 
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                      <div>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.9)',
                          color: 'var(--text-dark)',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: 'var(--spacing-sm)',
                          textAlign: 'center',
                          textTransform: 'uppercase'
                        }}>
                          NOMBRE ✏️
                        </div>
                        <input
                          type="text"
                          name="nombres"
                          value={personalData.nombres}
                          onChange={handlePersonalChange}
                          placeholder={personalData.nombres || "Tu nombre"}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.9)',
                          color: 'var(--text-dark)',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: 'var(--spacing-sm)',
                          textAlign: 'center',
                          textTransform: 'uppercase'
                        }}>
                          APELLIDO ✏️
                        </div>
                        <input
                          type="text"
                          name="apellidos"
                          value={personalData.apellidos}
                          onChange={handlePersonalChange}
                          placeholder={personalData.apellidos || "Tus apellidos"}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.9)',
                        color: 'var(--text-dark)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: 'var(--spacing-sm)',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        maxWidth: '300px'
                      }}>
                        FECHA NACIMIENTO ✏️
                      </div>
                      <input
                        type="date"
                        name="fechaNacimiento"
                        value={personalData.fechaNacimiento}
                        onChange={handlePersonalChange}
                        style={{ ...inputStyle, maxWidth: '300px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        ...buttonStyle,
                        background: loading 
                          ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                          : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        color: 'white',
                        alignSelf: 'flex-start',
                        minWidth: '160px'
                      }}
                    >
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </form>
                </div>
              )}

              {/* INFO. CUENTA */}
              {activeSection === "cuenta" && (
                <div>
                  <h2 className="task-title" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    INFO. CUENTA
                  </h2>
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '14px',
                    marginBottom: 'var(--spacing-xl)'
                  }}>
                    Información importante de tu cuenta y configuración
                  </p>

                  <form onSubmit={handleUpdateCuenta} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--spacing-lg)' 
                  }}>
                    <div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.9)',
                        color: 'var(--text-dark)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: 'var(--spacing-sm)',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        maxWidth: '400px'
                      }}>
                        CORREO ✏️
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={cuentaData.email}
                        onChange={handleCuentaChange}
                        placeholder={cuentaData.email || "tu@email.com"}
                        style={{ ...inputStyle, maxWidth: '400px' }}
                      />
                    </div>

                    <div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.9)',
                        color: 'var(--text-dark)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: 'var(--spacing-sm)',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        maxWidth: '300px'
                      }}>
                        CREADO EL ✏️
                      </div>
                      <input
                        type="date"
                        value={cuentaData.fechaCreacion}
                        disabled
                        style={{ 
                          ...inputStyle, 
                          maxWidth: '300px',
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        ...buttonStyle,
                        background: loading 
                          ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                          : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        color: 'white',
                        alignSelf: 'flex-start',
                        minWidth: '160px'
                      }}
                    >
                      {loading ? "Guardando..." : "Actualizar Email"}
                    </button>
                  </form>
                </div>
              )}

              {/* MANEJO */}
              {activeSection === "manejo" && (
                <div>
                  <h2 className="task-title" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    MANEJO
                  </h2>
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '14px',
                    marginBottom: 'var(--spacing-xl)'
                  }}>
                    Configuraciones sensibles de seguridad y cuenta
                  </p>

                  {/* Cambiar contraseña */}
                  <form onSubmit={handleChangePassword} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-3xl)'
                  }}>
                    <div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.9)',
                        color: 'var(--text-dark)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: 'var(--spacing-sm)',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        maxWidth: '300px'
                      }}>
                        CONTRASEÑA
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={manejoData.password}
                        onChange={handleManejoChange}
                        placeholder="Nueva contraseña"
                        style={{ ...inputStyle, maxWidth: '300px' }}
                      />
                    </div>

                    <div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.9)',
                        color: 'var(--text-dark)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: 'var(--spacing-sm)',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        maxWidth: '300px'
                      }}>
                        CONFIRMAR CONTRASEÑA
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={manejoData.confirmPassword}
                        onChange={handleManejoChange}
                        placeholder="Confirmar nueva contraseña"
                        style={{ ...inputStyle, maxWidth: '300px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        ...buttonStyle,
                        background: loading 
                          ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                          : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        alignSelf: 'flex-start',
                        minWidth: '200px'
                      }}
                    >
                      {loading ? "Cambiando..." : "CAMBIAR CONTRASEÑA"}
                    </button>
                  </form>

                  {/* Eliminar cuenta */}
                  <div style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 'var(--spacing-xl)'
                  }}>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      style={{
                        ...buttonStyle,
                        background: loading 
                          ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                          : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        minWidth: '200px'
                      }}
                    >
                      {loading ? "Eliminando..." : "ELIMINAR CUENTA"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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