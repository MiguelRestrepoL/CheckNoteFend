import React from "react";
import { useLocation, Link } from "react-router-dom";
// NO importar inicio.css - usar solo globalcss2.css

export default function Inicio() {
  const location = useLocation();
  const successMessage = location.state?.success;

  // Recupera los datos del usuario del localStorage, si están disponibles
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { nombres: 'Usuario' };

  return (
    <div className="page-root">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
          <img src="/user-icon.png" alt="usuario" className="icon user-icon" />
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
            <h3 className="task-title">Ejemplo de Tarea Importante</h3>
            <p className="task-sub">Progreso de la tarea</p>

            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress" style={{ width: "48%" }} />
              </div>
            </div>

            <div className="progress-info">
              <span>48% completado</span>
              <span>Prioridad: Media</span>
            </div>
          </section>

          {/* Filtros */}
          <div className="filters">
            <Link to="/tareas" className="filter">📋 Todas</Link>
            <button className="filter">📅 Calendario</button>
            <button className="filter">⭐ Prioridad</button>
          </div>

          {/* Lista de tareas */}
          <div className="task-list">
            <div className="task-row">
              <div className="task-left">
                <span className="task-ico">📄</span>
                <span className="task-label">Tareas totales</span>
              </div>
              <div className="task-right">
                <span className="task-number">20</span>
                <span className="task-arrow">›</span>
              </div>
            </div>

            <div className="task-row highlighted">
              <div className="task-left">
                <span className="task-ico">✅</span>
                <span className="task-label">Tareas completadas</span>
              </div>
              <div className="task-right">
                <span className="task-number done">15</span>
                <span className="task-arrow">›</span>
              </div>
            </div>

            <div className="task-row">
              <div className="task-left">
                <span className="task-ico">📂</span>
                <span className="task-label">Tareas pendientes</span>
              </div>
              <div className="task-right">
                <span className="task-number pending">5</span>
                <span className="task-arrow">›</span>
              </div>
            </div>
          </div>

          {/* Botón agregar */}
          <div className="add-wrap">
            <Link to="/crear-tarea" className="add-btn">+</Link>
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