import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "../services/api";

// Cambia a false para mostrar el aviso solo en los días finales del mes según el rol del usuario
// Si se deja en true, el aviso se mostrará siempre, sin importar la fecha ni el rol del usuario
const MODO_PRUEBA = true;

export default function AlertaCorteYAccion() {
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [esRH, setEsRH] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem(
      "sesion_incidencias"
    );
    
    if (!sesionGuardada) {
      setMensajeEstado(
        "No se encontró una sesión activa."
      );
      return;
    }

    try {
      const usuarioLogueado = JSON.parse(
        sesionGuardada
      );

      const rolActual =
        usuarioLogueado.rol ||
        usuarioLogueado.tipo_acceso ||
        usuarioLogueado.tipoAcceso ||
        "Empleado";

      const usuarioEsRH =
        rolActual === "RH" ||
        rolActual === "Administrador" ||
        rolActual === "Admin";

      setEsRH(usuarioEsRH);

      const hoy = new Date();
      const diaActual = hoy.getDate();

      const ultimoDiaDelMes = new Date(
        hoy.getFullYear(),
        hoy.getMonth() + 1,
        0
      ).getDate();

      const diasRestantes =
        ultimoDiaDelMes - diaActual;

      if (
        MODO_PRUEBA ||
        (usuarioEsRH && diasRestantes === 0) ||
        (!usuarioEsRH && diasRestantes === 1)
      ) {
        setMostrarAviso(true);
      }
    } catch (error) {
      console.error(
        "Error al inicializar la sesión:",
        error
      );

      setMensajeEstado(
        "No se pudo inicializar la sesión."
      );
    }
  }, []);

  const obtenerSesion = () => {
    const sesionGuardada = localStorage.getItem(
      "sesion_incidencias"
    );

    if (!sesionGuardada) {
      throw new Error(
        "No existe una sesión activa."
      );
    }

    const usuarioLogueado = JSON.parse(
      sesionGuardada
    );

    const rolActual =
      usuarioLogueado.rol ||
      usuarioLogueado.tipo_acceso ||
      usuarioLogueado.tipoAcceso ||
      "Empleado";

    const idEmpleadoActual =
      usuarioLogueado.id_empleado ||
      usuarioLogueado.id ||
      null;

    return {
      rol: rolActual,
      id_empleado: idEmpleadoActual,
    };
  };

  const obtenerMesActual = () => {
    const hoy = new Date();

    const año = hoy.getFullYear();
    const mes = String(
      hoy.getMonth() + 1
    ).padStart(2, "0");

    return `${año}-${mes}`;
  };

  const descargarCorteMensual = async () => {
    if (procesando) {
      return;
    }

    const confirmar = window.confirm(
      "¿Deseas descargar el corte?"
    );
 
    if (!confirmar) {
      return;
    }

    setProcesando(true);
    setMensajeEstado("");

    try {
      const sesion = obtenerSesion();
      const mes = obtenerMesActual();

      const usuarioEsRH =
        sesion.rol === "RH" ||
        sesion.rol === "Administrador" ||
        sesion.rol === "Admin";

      const rol = usuarioEsRH ? "RH" : "Empleado";

      if (rol === "Empleado" && !sesion.id_empleado) {
        throw new Error(
          "No se encontró el ID del empleado."
        );
      }

      await api.descargarCorteIncidencias({
        mes,
        rol,
        id_empleado: sesion.id_empleado,
      });

      const nombreArchivo = rol === "RH"
        ? `corte_general_${mes}.zip`
        : `mis_incidencias_${mes}.zip`;

      setMensajeEstado(
        `Se descargó correctamente ${nombreArchivo}.`
      );
    } catch (error) {
      console.error("Error al descargar el corte:", error);

      setMensajeEstado(
        error.message ||
          "Error al comunicarse con el servidor."
      );
    } finally {
      setProcesando(false);
    }
  };

  const eliminarCorteMensual = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar las incidencias del mes actual? Advertencia: Una vez eliminadas, no será posible recuperarlas."
    );

    if (!confirmar) {
      return;
    }

    setProcesando(true);
    setMensajeEstado("");

    try {
      const sesion = obtenerSesion();
      const mes = obtenerMesActual();

      const usuarioEsRH =
        sesion.rol === "RH" ||
        sesion.rol === "Administrador" ||
        sesion.rol === "Admin";

      if (!usuarioEsRH) {
        throw new Error(
          "Solo el Administrador puede eliminar incidencias."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/corte/eliminar_corte.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rol: sesion.rol,
            mes: mes,
            confirmar: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error ||
            data.mensaje ||
            "No se pudieron eliminar las incidencias."
        );
      }

      setMensajeEstado(
        data.mensaje ||
          "Incidencias del mes eliminadas correctamente."
      );
    } catch (error) {
      console.error(
        "Error al eliminar incidencias:",
        error
      );

      setMensajeEstado(
        error.message ||
          "Error al eliminar las incidencias."
      );
    } finally {
      setProcesando(false);
    }
  };

  if (!mostrarAviso) {
    return null;
  }

  return (
    <div
      style={{
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff3cd",
          color: "#856404",
          padding: "1rem",
          border: "1px solid #ffeeba",
          borderRadius: "6px",
        }}
      >
        <strong
          style={{
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          ¡Realiza el corte mensual!
        </strong>

        <p style={{ margin: "0 0 1rem" }}>
          Importante: Antes de eliminar las incidencias, verifica que la descarga se haya generado 
          correctamente durante el corte mensual, ya que, una vez eliminadas, no será posible recuperarlas.
        </p>
 
        <div className="corte-acciones">
          <button
            type="button"
            onClick={descargarCorteMensual}
            disabled={procesando}
            className="btn-corte btn-corte-descargar"
          >
            {procesando
              ? "Procesando..."
              : esRH
              ? "Descargar corte mensual"
              : "Descargar mis incidencias"}
          </button>

          {esRH && (
            <button
              type="button"
              onClick={eliminarCorteMensual}
              disabled={procesando}
              className="btn-corte btn-corte-eliminar"
            >
              Eliminar incidencias del mes
            </button>
          )}
        </div>
      </div>

      {mensajeEstado && (
        <p
          style={{
            color: mensajeEstado
              .toLowerCase()
              .includes("error")
              ? "#b02a37"
              : "green",
            fontSize: "0.9rem",
            marginTop: "0.75rem",
          }}
        >
          {mensajeEstado}
        </p>
      )}
    </div>
  );
}