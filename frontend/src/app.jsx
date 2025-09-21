import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InicioSesion from "./inicioSesion/login.jsx";
import Registro from "./registrarse/registro.jsx";
import Home from "./home/inicio.jsx";
import OlvidarPw1 from "./olvidarpw/olvidarpw1.jsx";
import OlvidarPw2 from "./olvidarpw/olvidarpw2.jsx";
import "./GlobalCSS1.css";
import "./GlobalCSS2.css";


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<InicioSesion />} />
         <Route path="/registro" element={<Registro />} />
         <Route path="/olvidar-password" element={<OlvidarPw1 />} />
         <Route path="/olvidar-password2" element={<OlvidarPw2 />} />
         <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;