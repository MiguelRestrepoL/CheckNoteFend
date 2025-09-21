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

  // Estado para manejar las tareas (puedes conectar esto con tu backend más tarde)
  const [tareas] = useState({
    pendientes: [
      { id: 1, titulo: "Sacar al perro", prioridad: "ALTA" },
      { id: 2, titulo: "Comprar víveres", prioridad: "MEDIA" }
    ],
    proceso: [
      { id: 3, titulo: "Hacer trabajo DS2", prioridad: "BAJA" },
      { id: 4, titulo: "Estudiar React", prioridad: "ALTA" }
    ],
    completadas: [
      { id: 5, titulo: "P.Integrador", prioridad: "MEDIA" },
      { id: 6, titulo: "Ejercicio matutino", prioridad: "BAJA" }
    ]
  });

  // Calcular progreso basado en tareas completadas
  const totalTareas = tareas.pendientes.length + tareas.proceso.length + tareas.completadas.length;
  const tareasCompletadas = tareas.completadas.length;
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
    if (listaTareas.length === 0) {
      return (
        <div className="kanban-task" style={{ opacity: 0.5, fontStyle: 'italic' }}>
          <div className="kanban-task-title">No hay tareas</div>
        </div>
      );
    }

    return listaTareas.map(tarea => (
      <div key={tarea.id} className="kanban-task">
        <div className="kanban-task-title">{tarea.titulo}</div>
        <span className={`kanban-task-priority ${getPriorityClass(tarea.prioridad)}`}>
          {tarea.prioridad}
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
            <h3 className="task-title">Panel de Tareas</h3>
            <p className="task-sub">Progreso general de tus tareas</p>

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
                <h4 className="kanban-title">Pendientes ({tareas.pendientes.length})</h4>
              </div>
              <div className="kanban-tasks">
                {renderTareas(tareas.pendientes)}
              </div>
            </div>

            {/* Columna En Proceso */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-icon">⚡</span>
                <h4 className="kanban-title">En Proceso ({tareas.proceso.length})</h4>
              </div>
              <div className="kanban-tasks">
                {renderTareas(tareas.proceso)}
              </div>
            </div>

            {/* Columna Completadas */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-icon">✅</span>
                <h4 className="kanban-title">Completadas ({tareas.completadas.length})</h4>
              </div>
              <div className="kanban-tasks">
                {renderTareas(tareas.completadas)}
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