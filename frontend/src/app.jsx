import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InicioSesion from "./inicioSesion/login.jsx";
import Registro from "./registrarse/registro.jsx";
import OlvidarPw1 from "./olvidarpw/olvidarpw1.jsx";
import "./GlobalCSS1.css";


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<InicioSesion />} />
         <Route path="/registro" element={<Registro />} />
         <Route path="/olvidar-password" element={<OlvidarPw1 />} />
      </Routes>
    </div>
  );
}

export default App;