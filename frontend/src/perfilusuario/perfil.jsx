import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Perfil() {
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Estados
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

  // ---------- CARGAR DATOS ----------
  const cargarDatosUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoadingData(true);
      setError("");

      const response = await fetch(
        "https://checknote-27fe.onrender.com/api/v1/users/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          setError("Tu sesión ha expirado. Redirigiendo al login...");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      const userData = responseData.user || responseData.data || responseData;

      // Fechas
      let fechaNacimiento = "";
      if (userData.fechaNacimiento) {
        try {
          fechaNacimiento = new Date(userData.fechaNacimiento)
            .toISOString()
            .split("T")[0];
        } catch {}
      }

      let fechaCreacion = "";
      if (userData.createdAt) {
        fechaCreacion = new Date(userData.createdAt)
          .toISOString()
          .split("T")[0];
      } else {
        fechaCreacion = new Date().toISOString().split("T")[0];
      }

      setPersonalData({
        nombres: userData.nombres || "",
        apellidos: userData.apellidos || "",
        fechaNacimiento
      });

      setCuentaData({
        email: userData.correo || userData.email || "",
        fechaCreacion
      });

      localStorage.setItem("userName", userData.nombres || "");
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      setError("Error al cargar los datos: " + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    cargarDatosUsuario();
  }, [navigate]);

  // ---------- HANDLERS ----------
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuentaChange = (e) => {
    const { name, value } = e.target;
    setCuentaData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManejoChange = (e) => {
    const { name, value } = e.target;
    setManejoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const updateData = {
      nombres: personalData.nombres.trim(),
      apellidos: personalData.apellidos.trim(),
      fechaNacimiento: personalData.fechaNacimiento
    };

    try {
      const response = await fetch(
        "https://checknote-27fe.onrender.com/api/v1/users/me",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) throw new Error("Error actualizando");

      await response.json();
      await cargarDatosUsuario();
      setSuccess("Información personal actualizada correctamente");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCuenta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://checknote-27fe.onrender.com/api/v1/users/me",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ correo: cuentaData.email.trim().toLowerCase() })
        }
      );

      if (!response.ok) throw new Error("Error actualizando");

      await response.json();
      await cargarDatosUsuario();
      setSuccess("Correo actualizado correctamente");
    } catch (err) {
      setError(err.message);
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

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://checknote-27fe.onrender.com/api/v1/users/me",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            currentPassword: manejoData.currentPassword,
            newPassword: manejoData.password
          })
        }
      );

      if (!response.ok) throw new Error("Error cambiando contraseña");

      await response.json();
      setSuccess("Contraseña cambiada correctamente");
      setManejoData({ currentPassword: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    navigate("/eliminar-cuenta");
  };

  // ---------- ESTILOS ----------
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    transition: "all var(--transition)",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "12px 24px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all var(--transition)",
    boxSizing: "border-box"
  };

  // ---------- RENDER ----------
  return (
    <div className="page-root">
      <header className="topbar">
        <div className="topbar-left">
          <img src="/usuario.png" alt="usuario" className="icon user-icon" />
          <span className="username">{personalData.nombres || "Usuario"}</span>
        </div>
        <div className="topbar-center">
          <div className="search-wrap">
            <img src="/search.png" alt="buscar" className="search-icon" />
            <input className="search-input" placeholder="Buscar..." />
          </div>
        </div>
        <div className="topbar-right">
          <Link to="/home">
            <img src="/home.png" alt="inicio" className="icon" />
          </Link>
        </div>
      </header>

      <main className="main">
        <div className="center-column" style={{ maxWidth: "1000px" }}>
          {loadingData ? (
            <div className="task-card" style={{ textAlign: "center", padding: 40 }}>
              <h3>Cargando tu perfil...</h3>
              <div style={{ marginTop: 20, fontSize: 24 }}>⏳</div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "280px 1fr",
                gap: "var(--spacing-xl)"
              }}
            >
              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--primary)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold"
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: 20, fontWeight: "bold", color: "var(--primary)" }}>
                    Checknote
                  </span>
                </div>

                <button
                  onClick={() => setActiveSection("personal")}
                  className={activeSection === "personal" ? "filter active" : "filter"}
                  style={buttonStyle}
                >
                  INFO. PERSONAL
                </button>
                <button
                  onClick={() => setActiveSection("cuenta")}
                  className={activeSection === "cuenta" ? "filter active" : "filter"}
                  style={buttonStyle}
                >
                  INFO. CUENTA
                </button>
                <button
                  onClick={() => setActiveSection("manejo")}
                  className={activeSection === "manejo" ? "filter active" : "filter"}
                  style={buttonStyle}
                >
                  MANEJO
                </button>

                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                  style={{
                    ...buttonStyle,
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white"
                  }}
                >
                  CERRAR SESIÓN
                </button>
              </div>

              {/* Contenido */}
              <div className="task-card" style={{ minHeight: 500 }}>
                {error && <div style={{ color: "red" }}>{error}</div>}
                {success && <div style={{ color: "green" }}>{success}</div>}

                {activeSection === "personal" && (
                  <form onSubmit={handleUpdatePersonal}>
                    <h2>INFO. PERSONAL</h2>
                    <input
                      type="text"
                      name="nombres"
                      value={personalData.nombres}
                      onChange={handlePersonalChange}
                      placeholder="Tu nombre"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      name="apellidos"
                      value={personalData.apellidos}
                      onChange={handlePersonalChange}
                      placeholder="Tus apellidos"
                      style={inputStyle}
                    />
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={personalData.fechaNacimiento}
                      onChange={handlePersonalChange}
                      style={inputStyle}
                    />
                    <button type="submit" style={buttonStyle}>
                      Guardar Cambios
                    </button>
                  </form>
                )}

                {activeSection === "cuenta" && (
                  <form onSubmit={handleUpdateCuenta}>
                    <h2>INFO. CUENTA</h2>
                    <input
                      type="email"
                      name="email"
                      value={cuentaData.email}
                      onChange={handleCuentaChange}
                      style={inputStyle}
                    />
                    <input
                      type="date"
                      value={cuentaData.fechaCreacion}
                      disabled
                      style={inputStyle}
                    />
                    <button type="submit" style={buttonStyle}>
                      Actualizar Email
                    </button>
                  </form>
                )}

                {activeSection === "manejo" && (
                  <form onSubmit={handleChangePassword}>
                    <h2>MANEJO</h2>
                    <input
                      type="password"
                      name="currentPassword"
                      value={manejoData.currentPassword}
                      onChange={handleManejoChange}
                      placeholder="Contraseña actual"
                      style={inputStyle}
                    />
                    <input
                      type="password"
                      name="password"
                      value={manejoData.password}
                      onChange={handleManejoChange}
                      placeholder="Nueva contraseña"
                      style={inputStyle}
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={manejoData.confirmPassword}
                      onChange={handleManejoChange}
                      placeholder="Confirmar contraseña"
                      style={inputStyle}
                    />
                    <button type="submit" style={buttonStyle}>
                      Cambiar Contraseña
                    </button>
                  </form>
                )}

                <button
                  onClick={handleDeleteAccount}
                  style={{
                    ...buttonStyle,
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white",
                    marginTop: 20
                  }}
                >
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <Link to="/home" className="footer-link">
          <img src="/home.png" alt="inicio" className="icon" />
          <span className="footer-text">Inicio</span>
        </Link>
      </footer>
    </div>
  );
}