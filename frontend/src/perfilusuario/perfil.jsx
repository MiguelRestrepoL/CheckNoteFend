import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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

      console.log("Cargando datos del usuario...");
      
      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          
          setError("Tu sesión ha expirado. Redirigiendo al login...");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log("User data response:", responseText);

      let userData = {};
      try {
        const responseData = responseText ? JSON.parse(responseText) : {};
        userData = responseData.user || responseData.data || responseData;
      } catch (parseError) {
        console.error("Error parseando JSON:", parseError);
        throw new Error("Error procesando datos del servidor");
      }

      // Formatear fecha de nacimiento si existe
      let fechaNacimiento = "";
      if (userData.fechaNacimiento) {
        try {
          fechaNacimiento = new Date(userData.fechaNacimiento).toISOString().split('T')[0];
        } catch (e) {
          console.log("Error formateando fecha de nacimiento:", e);
        }
      }

      // Formatear fecha de creación
      let fechaCreacion = "";
      if (userData.createdAt) {
        try {
          fechaCreacion = new Date(userData.createdAt).toISOString().split('T')[0];
        } catch (e) {
          fechaCreacion = new Date().toISOString().split('T')[0];
        }
      } else {
        fechaCreacion = new Date().toISOString().split('T')[0];
      }

      setPersonalData({
        nombres: userData.nombres || "",
        apellidos: userData.apellidos || "",
        fechaNacimiento: fechaNacimiento
      });

      setCuentaData({
        email: userData.correo || userData.email || "",
        fechaCreacion: fechaCreacion
      });

      // Actualizar localStorage con los datos más recientes
      localStorage.setItem('userName', userData.nombres || "");
      localStorage.setItem('user', JSON.stringify(userData));

      console.log("Datos de usuario cargados correctamente");

    } catch (err) {
      console.error("Error cargando datos del usuario:", err);
      setError("Error al cargar los datos del usuario: " + err.message);
      
      // Si falla, intentar cargar de localStorage como fallback
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
          console.error('Error parsing stored user data:', parseError);
        }
      }
    } finally {
      setLoadingData(false);
    }
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    cargarDatosUsuario();
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

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No se encontró token de autenticación");
      setLoading(false);
      navigate('/login');
      return;
    }

    // Preparar datos para enviar
    const updateData = {
      nombres: personalData.nombres.trim(),
      apellidos: personalData.apellidos.trim()
    };

    // Agregar fecha de nacimiento solo si se proporcionó
    if (personalData.fechaNacimiento) {
      updateData.fechaNacimiento = personalData.fechaNacimiento;
    }

    try {
      console.log("Actualizando información personal:", updateData);

      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log("Update personal response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          
          setError("Tu sesión ha expirado. Redirigiendo al login...");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        const errorText = await response.text();
        console.error("Update error response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const updateResult = await response.json();
      console.log("Información personal actualizada:", updateResult);
      
      // Actualizar localStorage
      localStorage.setItem('userName', personalData.nombres);
      
      // Recargar datos del usuario para asegurar sincronización
      await cargarDatosUsuario();
      
      setSuccess("Información personal actualizada correctamente");
      
    } catch (err) {
      console.error("Error actualizando información personal:", err);
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

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No se encontró token de autenticación");
      setLoading(false);
      navigate('/login');
      return;
    }

    // Preparar datos para enviar
    const updateData = {
      correo: cuentaData.email.trim().toLowerCase()
    };

    try {
      console.log("Actualizando información de cuenta:", updateData);

      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log("Update account response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          
          setError("Tu sesión ha expirado. Redirigiendo al login...");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        const errorText = await response.text();
        console.error("Update error response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const updateResult = await response.json();
      console.log("Información de cuenta actualizada:", updateResult);
      
      // Recargar datos del usuario para asegurar sincronización
      await cargarDatosUsuario();
      
      setSuccess("Información de cuenta actualizada correctamente");
      
    } catch (err) {
      console.error("Error actualizando información de cuenta:", err);
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

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No se encontró token de autenticación");
      setLoading(false);
      navigate('/login');
      return;
    }

    // Preparar datos para cambio de contraseña
    const updateData = {
      currentPassword: manejoData.currentPassword,
      newPassword: manejoData.password
    };

    try {
      console.log("Cambiando contraseña...");

      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log("Change password response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message && errorData.message.includes("actual")) {
              setError("La contraseña actual es incorrecta");
            } else {
              setError("Tu sesión ha expirado. Redirigiendo al login...");
              setTimeout(() => {
                navigate('/login');
              }, 2000);
            }
          } catch (parseError) {
            setError("Error de autenticación");
          }
          setLoading(false);
          return;
        }

        const errorText = await response.text();
        console.error("Change password error response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const updateResult = await response.json();
      console.log("Contraseña cambiada correctamente:", updateResult);
      
      setSuccess("Contraseña cambiada correctamente");
      setManejoData({ currentPassword: "", password: "", confirmPassword: "" });
      
    } catch (err) {
      console.error("Error cambiando contraseña:", err);
      setError("Error al cambiar la contraseña: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // Solo redirigir a la página de eliminar cuenta
    navigate('/eliminar-cuenta');
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
          {/* Loading inicial */}
          {loadingData && (
            <div className="task-card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>Cargando tu perfil...</h3>
              <div style={{ marginTop: '20px', fontSize: '24px' }}>⏳</div>
            </div>
          )}

          {!loadingData && (
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
                            placeholder="Tu nombre"
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
                            placeholder="Tus apellidos"
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
                          placeholder="tu@email.com"
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
                          CREADO EL
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
                      {/* Contraseña actual */}
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
                          CONTRASEÑA ACTUAL
                        </div>
                        <input
                          type="password"
                          name="currentPassword"
                          value={manejoData.currentPassword}
                          onChange={handleManejoChange}
                          placeholder="Tu contraseña actual"
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
                          NUEVA CONTRASEÑA
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

                      {/* Confirmar contraseña */}
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
                      <h3 style={{ 
                        color: '#ef4444', 
                        marginBottom: 'var(--spacing-md)',
                        fontSize: '16px'
                      }}>
                        Zona Peligrosa
                      </h3>
                      <p style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '14px',
                        marginBottom: 'var(--spacing-lg)'
                      }}>
                        Esta acción eliminará permanentemente tu cuenta y todos tus datos
                      </p>
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