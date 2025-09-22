import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function Inicio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tareas, setTareas] = useState({
    pendiente: [],
    en_progreso: [],
    terminada: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("checking");
  
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.success;

  // Recupera los datos del usuario del localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { nombres: 'Usuario' };

  // NUEVA FUNCIÓN: Verificar token antes de usar
  const verificarToken = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("❌ No hay token en localStorage");
      return false;
    }

    try {
      console.log("🔐 Verificando token antes de cargar tareas...");
      
      const verifyRes = await fetch("https://checknote-27fe.onrender.com/api/v1/auth/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Verify response status:", verifyRes.status);

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        console.log("✅ Token válido:", verifyData);
        return true;
      } else {
        const errorData = await verifyRes.json();
        console.log("❌ Token inválido:", errorData);
        
        // Limpiar localStorage si el token es inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        return false;
      }
    } catch (error) {
      console.error("❌ Error verificando token:", error);
      
      // Limpiar localStorage en caso de error de red
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      
      return false;
    }
  };

  // Verificar estado del servidor
  const checkServerStatus = async () => {
    try {
      console.log("🔍 Verificando estado del servidor...");
      
      const response = await fetch("https://checknote-27fe.onrender.com/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        console.log("✅ Servidor en línea");
        setServerStatus("online");
        return true;
      } else {
        console.log("⚠️ Servidor responde pero con error:", response.status);
        setServerStatus("offline");
        return false;
      }
    } catch (err) {
      console.log("❌ Servidor fuera de línea:", err.message);
      setServerStatus("offline");
      return false;
    }
  };

  // Cargar tareas del usuario - CORREGIDO
  const cargarTareas = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("=== CARGANDO TAREAS ===");

      // PASO 1: Verificar que el token sea válido
      const tokenValido = await verificarToken();
      
      if (!tokenValido) {
        setError("Tu sesión ha expirado. Redirigiendo al login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      // PASO 2: Obtener token ya validado
      const token = localStorage.getItem('token');
      
      console.log("1. Token validado exitosamente ✅");
      console.log("2. URL:", "https://checknote-27fe.onrender.com/api/v1/tasks");

      // PASO 3: Cargar tareas con token válido
      const response = await fetch("https://checknote-27fe.onrender.com/api/v1/tasks", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      console.log("3. Status respuesta tasks:", response.status);
      console.log("4. Status text:", response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("❌ Token expirado durante la petición de tareas");
          // Limpiar y redirigir
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          
          setError("Tu sesión ha expirado. Redirigiendo al login...");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        } else if (response.status === 403) {
          setError("No tienes permisos para acceder a las tareas.");
          return;
        } else if (response.status === 404) {
          setError("Endpoint de tareas no encontrado.");
          return;
        } else if (response.status === 500) {
          setError("Error interno del servidor.");
          return;
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log("5. Respuesta raw:", responseText);

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log("6. Respuesta parseada:", responseData);
      } catch (parseError) {
        console.error("Error parseando JSON:", parseError);
        throw new Error("Respuesta del servidor no válida");
      }

      // CORREGIDO: Extraer tareas de la respuesta correcta
      const tareasData = responseData.tasks || responseData.data || responseData || [];
      
      console.log("7. Tareas extraídas:", tareasData);
      console.log("8. Es array?", Array.isArray(tareasData));

      if (!Array.isArray(tareasData)) {
        console.error("Las tareas no son un array:", typeof tareasData);
        console.log("Estructura de respuesta:", responseData);
        setError("Formato de respuesta inesperado del servidor.");
        return;
      }
      
      // Organizar tareas por estado para el tablero Kanban
      const tareasOrganizadas = {
        pendiente: tareasData.filter(tarea => tarea.estado === 'pendiente'),
        en_progreso: tareasData.filter(tarea => tarea.estado === 'en_progreso'),
        terminada: tareasData.filter(tarea => tarea.estado === 'terminada')
      };

      console.log("9. Tareas organizadas:", {
        pendiente: tareasOrganizadas.pendiente.length,
        en_progreso: tareasOrganizadas.en_progreso.length,
        terminada: tareasOrganizadas.terminada.length
      });

      setTareas(tareasOrganizadas);
      setServerStatus("online");

    } catch (err) {
      console.error("❌ Error completo:", err);
      console.error("Stack:", err.stack);
      
      // Manejo específico de errores
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Error de conexión. Verifica tu internet.");
        setServerStatus("offline");
      } else if (err.message.includes('JSON')) {
        setError("Error procesando respuesta del servidor.");
      } else {
        setError("Error cargando tareas: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, [navigate]);

  // Calcular progreso basado en tareas completadas
  const totalTareas = tareas.pendiente.length + tareas.en_progreso.length + tareas.terminada.length;
  const tareasCompletadas = tareas.terminada.length;
  const porcentajeProgreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const getPriorityClass = (prioridad) => {
    switch(prioridad?.toLowerCase()) {
      case 'alta': return 'priority-alta';
      case 'media': return 'priority-media';
      case 'baja': return 'priority-baja';
      default: return 'priority-media';
    }
  };

  const renderTareas = (listaTareas) => {
    if (loading) {
      return (
        <div className="kanban-task" style={{ opacity: 0.7, textAlign: 'center' }}>
          <div className="kanban-task-title">⏳ Cargando...</div>
        </div>
      );
    }

    if (listaTareas.length === 0) {
      return (
        <div className="kanban-task" style={{ opacity: 0.5, fontStyle: 'italic' }}>
          <div className="kanban-task-title">No hay tareas</div>
        </div>
      );
    }

    return listaTareas.map(tarea => (
      <div key={tarea.id || tarea._id} className="kanban-task">
        <div className="kanban-task-title">{tarea.titulo || 'Sin título'}</div>
        <span className={`kanban-task-priority ${getPriorityClass(tarea.prioridad)}`}>
          {(tarea.prioridad || 'media').toUpperCase()}
        </span>
      </div>
    ));
  };

  return (
    <div className="page-root">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
          <img src="/usuario.png" alt="usuario" className="icon user-icon" />
          <span className="username">{user.nombres || 'Invitado'}</span>
          
          {/* Indicador de estado del servidor */}
          <span 
            className="server-status"
            style={{
              marginLeft: '10px',
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: serverStatus === 'online' ? '#22c55e' : 
                              serverStatus === 'offline' ? '#ef4444' : '#f59e0b',
              color: 'white'
            }}
          >
            {serverStatus === 'online' ? '🟢 Online' : 
             serverStatus === 'offline' ? '🔴 Offline' : '🟡 Checking'}
          </span>
        </div>

        <div className="topbar-center">
          <div className="search-wrap">
            <img src="/search.png" alt="buscar" className="search-icon" />
            <input className="search-input" placeholder="Buscar tareas..." />
          </div>
        </div>

        <div className="topbar-right">
          <Link to="/perfil">
            <img src="/settings.png" alt="configuración" className="icon" />
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        <div className="center-column">
          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                ⚠️ Error de Conexión
              </div>
              <div>{error}</div>
              
              <button
                onClick={cargarTareas}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🔄 Reintentar
              </button>
            </div>
          )}

          {/* Debug info */}
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
              Token: {localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente'}<br />
              Servidor: {serverStatus}<br />
              Total tareas: {totalTareas}
            </div>
          )}

          {/* Tarjeta de progreso */}
          <section className="task-card">
            <h3 className="task-title">Panel de Tareas</h3>
            <p className="task-sub">
              {loading ? "Cargando tus tareas..." : 
               error ? "Error cargando tareas" :
               "Progreso general de tus tareas"}
            </p>

            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${porcentajeProgreso}%` }} />
              </div>
            </div>

            <div className="progress-info">
              <span>{porcentajeProgreso}% completado</span>
              <span>{tareasCompletadas} de {totalTareas} tareas ✅</span>
            </div>
          </section>

          {/* Filtros */}
          <div className="filters">
            <Link to="/tareas" className="filter">📋 Todas</Link>
            <button className="filter">📅 Calendario</button>
            <button className="filter">⭐ Prioridad</button>
          </div>

          {/* Layout Kanban */}
          <div className="kanban-container">
            {/* Columna Pendientes */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-icon">⏰</span>
                <h4 className="kanban-title">Pendientes ({tareas.pendiente.length})</h4>
              </div>
              <div className="kanban-tasks">
                {renderTareas(tareas.pendiente)}
              </div>
            </div>

            {/* Columna En Proceso */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-icon">⚡</span>
                <h4 className="kanban-title">En Proceso ({tareas.en_progreso.length})</h4>
              </div>
              <div className="kanban-tasks">
                {renderTareas(tareas.en_progreso)}
              </div>
            </div>

            {/* Columna Completadas */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-icon">✅</span>
                <h4 className="kanban-title">Completadas ({tareas.terminada.length})</h4>
              </div>
              <div className="kanban-tasks">
                {renderTareas(tareas.terminada)}
              </div>
            </div>
          </div>

          {/* Botón flotante */}
          <div className="add-wrap">
            <div className="floating-menu">
              <div className={`floating-options ${menuOpen ? 'active' : ''}`}>
                <Link to="/crear-tarea" className="floating-option create">📝</Link>
                <Link to="/editar-tarea" className="floating-option edit">✏️</Link>
                <Link to="/eliminar-tarea" className="floating-option delete">🗑️</Link>
              </div>
              <button 
                className={`add-btn ${menuOpen ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                +
              </button>
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