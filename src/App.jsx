//Importaciones de React y React Router
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, FilePlus, ClipboardList, ShieldCheck, LogOut, User } from 'lucide-react';
import HomePage from './pages/HomePage';
import Usuarios from './pages/Usuarios';
import NuevaIncidencia from './pages/NuevaIncidencia';
import ListaIncidencias from './pages/ListaIncidencias';
import Login from './pages/Login';

//Componente principal de la pagina, que maneja la autenticación del usuario 
// y la navegación entre las diferentes páginas de la aplicación.
export default function App() {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const sesion = localStorage.getItem('sesion_incidencias');
    if (sesion) {
      setUsuarioAutenticado(JSON.parse(sesion));
    }
    setCargandoSesion(false);
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('sesion_incidencias');
    setUsuarioAutenticado(null);
  };

  if (cargandoSesion) return null;

  if (!usuarioAutenticado) {
    return <Login onLoginSuccess={(u) => setUsuarioAutenticado(u)} />;
  }

  const esRH = usuarioAutenticado.rol === 'RH';
// Renderizado de la aplicación con rutas y navegación
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navbar */}
        <header className="navbar">
          <div className="navbar-content">
            <div className="brand-logo">
             <div className="brand-logo-nav" title="LAPCIC Análisis Clínicos"></div>
              <span><span style={{ color: 'var(--color-azul-principal)' }}></span></span>
            </div>

            <nav className="nav-links">
              <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Inicio</span>
              </NavLink>

              {esRH && (
                <NavLink to="/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Users size={18} />
                  <span>Usuarios</span>
                </NavLink>
              )}

              <NavLink to="/nueva-incidencia" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FilePlus size={18} />
                <span>Nueva Incidencia</span>
              </NavLink>

              <NavLink to="/historial" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ClipboardList size={18} />
                <span>Historial</span>
              </NavLink>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-azul-principal)' }}>
                  {usuarioAutenticado.nombre} ({usuarioAutenticado.rol})
                </span>
                <button
                  type="button"
                  onClick={handleCerrarSesion}
                  className="icon-btn icon-btn-danger"
                  title="Cerrar Sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </nav>
          </div>
        </header>
        {/* Rutas */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nueva-incidencia" element={<NuevaIncidencia />} />
            <Route path="/historial" element={<ListaIncidencias />} />
            <Route path="/usuarios" element={esRH ? <Usuarios /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    //Carpeteo de estilos y scripts de la pagina
  );
}