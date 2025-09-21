
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
// NO importar inicio.css - usar solo globalcss2.css

export default function Inicio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tareas, setTareas] = useState({
    pendiente: [],
    en_progreso: [],
    terminada: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.success;

  // Recupera los datos del usuario del localStorage, si están disponibles
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { nombres: 'Usuario' };

  // Cargar tareas del usuario al montar el componente
  useEffect(() => {
    const cargarTareas = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("No hay sesión activa. Redirigiendo al login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("https://checknote-27fe.onrender.com/api/v1/tasks", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

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

        const tareasData = await response.json();
        
        // Organizar tareas por estado para el tablero Kanban
        const tareasOrganizadas = {
          pendiente: tareasData.filter(tarea => tarea.estado === 'pendiente'),
          en_progreso: tareasData.filter(tarea => tarea.estado === 'en_progreso'),
          terminada: tareasData.filter(tarea => tarea.estado === 'terminada')
        };

        setTareas(tareasOrganizadas);

      } catch (err) {
        console.error("Error al cargar las tareas:", err);
        setError("Error al cargar las tareas: " + err.message);
      } finally {
        setLoading(false);
      }
    };

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
    switch(prioridad.toLowerCase()) {
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
        <div className="kanban-task-title">{tarea.titulo}</div>
        <span className={`kanban-task-priority ${getPriorityClass(tarea.prioridad)}`}>
          {tarea.prioridad.toUpperCase()}
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

          {/* Tarjeta de progreso */}
          <section className="task-card">
            <h3 className="task-title">Panel de Tareas</h3>
            <p className="task-sub">
              {loading ? "Cargando tus tareas..." : "Progreso general de tus tareas"}
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

          {/* Botón flotante expandible */}
          <div className="add-wrap">
            <div className="floating-menu">
              <div className={`floating-options ${menuOpen ? 'active' : ''}`}>
                <Link to="/crear-tarea" className="floating-option create" title="Crear tarea">
                  📝
                </Link>
                <Link to="/editar-tarea" className="floating-option edit" title="Editar tarea">
                  ✏️
                </Link>
                <Link to="/eliminar-tarea" className="floating-option delete" title="Eliminar tarea">
                  🗑️
                </Link>
              </div>
              <button 
                className={`add-btn ${menuOpen ? 'active' : ''}`}
                onClick={toggleMenu}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
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