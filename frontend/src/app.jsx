import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./GlobalCSS1.css"; 
import InicioSesion from "./inicioSesion/login.jsx";
import Registro from "./registrarse/registro.jsx";
import Inicio from "./home/inicio.jsx";
import CrearTarea from "./creartarea/creartarea.jsx";
import OlvidarPw1 from "./olvidarpw/olvidarpw1.jsx";
import OlvidarPw2 from "./olvidarpw/olvidarpw2.jsx";
import Tasks from "./tareas/Tasks.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<InicioSesion />} />
      </Routes>
    </div>
  );
}

export default App;