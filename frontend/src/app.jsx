import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InicioSesion from "./inicioSesion/login.jsx";
import "./GlobalCSS1.css";


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