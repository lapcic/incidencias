import React, { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  FilePlus,
  ClipboardList,
  LogOut,
} from "lucide-react";

import HomePage from "./pages/HomePage";
import Usuarios from "./pages/Usuarios";
import NuevaIncidencia from "./pages/NuevaIncidencia";
import ListaIncidencias from "./pages/ListaIncidencias";
import Login from "./pages/Login";

export default function App() {

  const [usuarioAutenticado, setUsuarioAutenticado] =
    useState(null);

  const [cargandoSesion, setCargandoSesion] =
    useState(true);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem(
      "sesion_incidencias"
    );

    if (!sesionGuardada) {
      setCargandoSesion(false);
      return;
    }

    try {
      const sesion = JSON.parse(sesionGuardada);

      if (sesion && typeof sesion === "object") {
        setUsuarioAutenticado(sesion);
      } else {
        localStorage.removeItem("sesion_incidencias");
      }
    } catch (error) {
      console.error(
        "La sesión guardada no es válida:",
        error
      );

      localStorage.removeItem("sesion_incidencias");
    } finally {
      setCargandoSesion(false);
    }
  }, []);

  const handleLoginSuccess = (usuario) => {
    if (!usuario || typeof usuario !== "object") {
      console.error(
        "Los datos recibidos del inicio de sesión no son válidos."
      );

      return;
    }

    /*
    | Guardamos la sesión con el mismo nombre que utiliza
    | AlertaCorteYAccion.jsx.
    */
    localStorage.setItem(
      "sesion_incidencias",
      JSON.stringify(usuario)
    );

    setUsuarioAutenticado(usuario);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("sesion_incidencias");
    setUsuarioAutenticado(null);
  };

  if (cargandoSesion) {
    return (
      <div className="loading-screen">
        Cargando sesión...
      </div>
    );
  }

  if (!usuarioAutenticado) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const rolActual =
    usuarioAutenticado.rol ||
    usuarioAutenticado.tipo_acceso ||
    usuarioAutenticado.tipoAcceso ||
    "Empleado";

  const esRH =
    rolActual === "RH" ||
    rolActual === "Administrador" ||
    rolActual === "Admin";

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="navbar">
          <div className="navbar-content">
            <div className="brand-logo">
              <div
                className="brand-logo-nav"
                title="LAPCIC Análisis Clínicos"
              ></div>

              <span>
                <span
                  style={{
                    color:
                      "var(--color-azul-principal)",
                  }}
                ></span>
              </span>
            </div>

            <nav className="nav-links">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <LayoutDashboard size={18} />
                <span>Inicio</span>
              </NavLink>

              {esRH && (
                <NavLink
                  to="/usuarios"
                  className={({ isActive }) =>
                    `nav-item ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <Users size={18} />
                  <span>Usuarios</span>
                </NavLink>
              )}

              <NavLink
                to="/nueva-incidencia"
                className={({ isActive }) =>
                  `nav-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <FilePlus size={18} />
                <span>Nueva Incidencia</span>
              </NavLink>

              <NavLink
                to="/historial"
                className={({ isActive }) =>
                  `nav-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <ClipboardList size={18} />
                <span>Historial</span>
              </NavLink>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginLeft: "1rem",
                  borderLeft:
                    "1px solid var(--border)",
                  paddingLeft: "1rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color:
                      "var(--color-azul-principal)",
                  }}
                >
                  {usuarioAutenticado.nombre ||
                    usuarioAutenticado.usuario ||
                    "Usuario"}{" "}
                  ({rolActual})
                </span>

                <button
                  type="button"
                  onClick={handleCerrarSesion}
                  className="icon-btn icon-btn-danger"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </nav>
          </div>
        </header>

        <main className="main-content">
          {/* Aviso y botones del corte mensual */}

          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/nueva-incidencia"
              element={<NuevaIncidencia />}
            />

            <Route
              path="/historial"
              element={<ListaIncidencias />}
            />

            <Route
              path="/usuarios"
              element={
                esRH ? (
                  <Usuarios />
                ) : (
                  <Navigate
                    to="/"
                    replace
                  />
                )
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
