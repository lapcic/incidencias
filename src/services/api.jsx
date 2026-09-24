const API_BASE_URL_CONFIGURADA = import.meta.env.VITE_API_URL;
const API_URL = (
  API_BASE_URL_CONFIGURADA ||
  "https://api-incidencias-b1jk.onrender.com"
).replace(/\/$/, "");

export const API_BASE_URL = API_URL;

const parseJsonResponse = async (response) => {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('El servidor no devolvió un JSON válido:', text);
    throw new Error('Respuesta inválida del servidor');
  }
}; 

export async function descargarCorte(mes, rol, idEmpleado = null) {
  let url =
    `${API_URL}/corte/descargar_corte.php` +
    `?mes=${encodeURIComponent(mes)}` +
    `&rol=${encodeURIComponent(rol)}`;

  if (rol === "Empleado" && idEmpleado) {
    url += `&id_empleado=${encodeURIComponent(idEmpleado)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const texto = await response.text();

    let error;

    try {
      error = JSON.parse(texto);
    } catch {
      error = {
        error: texto || "No se pudo generar el corte.",
      };
    }

    throw new Error(
      error.detalle ||
        error.error ||
        "No se pudo generar el corte."
    );
  }

  const blob = await response.blob();
  const enlace = document.createElement("a");
  const urlBlob = window.URL.createObjectURL(blob);

  enlace.href = urlBlob;
  enlace.download =
    rol === "RH"
      ? `Corte_Incidencias_${mes}.zip`
      : `Mis_Incidencias_${mes}.zip`;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(urlBlob);
}

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
    await descargarCorte(mes, rol, id_empleado);
    return true;
  },

};