import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
// NO importar inicio.css - usar solo globalcss2.css

export default function Inicio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const successMessage = location.state?.success;

  // Recupera los datos del usuario del localStorage, si están disponibles
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { nombres: 'Usuario' };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="page-root">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
          <img src="/usuario.png" alt="usuario" className="icon" />
          <span className="username">{user.nombres || 'Invitado'}</span>
        </div>

        <div className="topbar-center">
          <div className="search-wrap">
            <img src="/search.png" alt="buscar" className="search-icon" />
            <input className="search-input" placeholder="Buscar tareas..." />
          </div>
        </div>

        <div className="topbar-right">
          <Link to="/settings">
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

          {/* Tarjeta de progreso */}
          <section className="task-card">
            <h3 className="task-title">{nombre_tarea}</h3>
            <p className="task-sub">Progreso de la tarea</p>

            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress" style={{ width: "48%" }} />
              </div>
            </div>

            <div className="progress-info">
              <span>48% completado</span>
              <span>Prioridad ✏️</span>
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
                <h4 className="kanban-title">Tareas pendientes</h4>
              </div>
              <div className="kanban-tasks">
                <div className="kanban-task">
                  <div className="kanban-task-title">Sacar al perro</div>
                  <span className="kanban-task-priority priority-alta">ALTA</span>
                </div>
              </div>
            </div>

            {/* Columna En Proceso */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-icon">⚡</span>
                <h4 className="kanban-title">Tareas en proceso</h4>
              </div>
              <div className="kanban-tasks">
                <div className="kanban-task">
                  <div className="kanban-task-title">Hacer trabajo DS2</div>
                  <span className="kanban-task-priority priority-baja">BAJA</span>
                </div>
              </div>
            </div>

            {/* Columna Completadas */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-icon">✅</span>
                <h4 className="kanban-title">Tareas completadas</h4>
              </div>
              <div className="kanban-tasks">
                <div className="kanban-task">
                  <div className="kanban-task-title">P.Integrador</div>
                  <span className="kanban-task-priority priority-media">MEDIA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón flotante expandible */}
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