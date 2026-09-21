const API_BASE_URL_CONFIGURADA = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (
  API_BASE_URL_CONFIGURADA ||
  "https://api-incidencias-b1jk.onrender.com"
).replace(/\/$/, "");

const parseJsonResponse = async (response) => {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('El servidor no devolvió un JSON válido:', text);
    throw new Error('Respuesta inválida del servidor');
  }
}; 

export const api = {
  
  // Autenticación
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return parseJsonResponse(res);
  },

  // --- EMPLEADOS (USUARIOS) ---
  getEmpleados: async () => {
    const res = await fetch(`${API_BASE_URL}/empleados/listar.php`);
    if (!res.ok) throw new Error('Error al obtener los empleados');
    return parseJsonResponse(res);
  },

  createEmpleado: async (data) => {
    const res = await fetch(`${API_BASE_URL}/empleados/crear.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  updateEmpleado: async (data) => {
    const res = await fetch(`${API_BASE_URL}/empleados/editar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  // --- INCIDENCIAS ---
  getIncidencias: async () => {
    const res = await fetch(`${API_BASE_URL}/incidencias/listar.php`);
    if (!res.ok) throw new Error('Error al obtener incidencias');
    return parseJsonResponse(res);
  },

  createIncidencia: async (incidenciaData) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/crear.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidenciaData),
    });
    return parseJsonResponse(res);
  },

  updateIncidencia: async (incidenciaData) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/editar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidenciaData),
    });
    return parseJsonResponse(res);
  },

  updateEstadoIncidencia: async (data) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/actualizar_estado.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  getSucursales: async () => {
    const res = await fetch(`${API_BASE_URL}/sucursales/listar.php`);
    if (!res.ok) throw new Error('Error al obtener las sucursales');
    return parseJsonResponse(res);
  },

  
  // --- DESCARGA DE CORTE DE INCIDENCIAS (ZIP) ---
  descargarCorteIncidencias: async ({
    mes,
    rol,
    id_empleado = null,
  }) => {
    const parametros = new URLSearchParams({
      mes,
      rol,
    });

    if (rol === "Empleado" && id_empleado) {
      parametros.set("id_empleado", String(id_empleado));
    }

    const res = await fetch(
      `${API_BASE_URL}/corte/descargar_corte.php?${parametros.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/zip, application/json",
        },
      }
    );

    const tipoContenido =
      res.headers.get("content-type") || "";

    if (!res.ok) {
      let mensaje = "Error al generar el archivo ZIP.";

      if (tipoContenido.includes("application/json")) {
        const errorData = await res.json();
        mensaje =
          errorData.error ||
          errorData.mensaje ||
          mensaje;
      }

      throw new Error(mensaje);
    }

    const blob = await res.blob();

    if (blob.size === 0) {
      throw new Error("El archivo ZIP está vacío.");
    }

    const nombreArchivo =
      rol === "RH"
        ? `corte_general_${mes}.zip`
        : `mis_incidencias_${mes}.zip`;

    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    return true;
  },

};