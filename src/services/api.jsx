const API_BASE_URL = "https://api-incidencias-b1jk.onrender.com";

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
    return res.json();
  },

  // --- EMPLEADOS (USUARIOS) ---
  getEmpleados: async () => {
    const res = await fetch(`${API_BASE_URL}/empleados/listar.php`);
    if (!res.ok) throw new Error('Error al obtener los empleados');
    return res.json();
  },

  createEmpleado: async (data) => {
    const res = await fetch(`${API_BASE_URL}/empleados/crear.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateEmpleado: async (data) => {
    const res = await fetch(`${API_BASE_URL}/empleados/editar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // --- INCIDENCIAS ---
  getIncidencias: async () => {
    const res = await fetch(`${API_BASE_URL}/incidencias/listar.php`);
    if (!res.ok) throw new Error('Error al obtener incidencias');
    return res.json();
  },

  createIncidencia: async (incidenciaData) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/crear.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidenciaData),
    });
    return res.json();
  },
  updateIncidencia: async (incidenciaData) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/editar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidenciaData),
    });
    return res.json();
  },
  updateEstadoIncidencia: async (data) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/actualizar_estado.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getSucursales: async () => {
    const res = await fetch(`${API_BASE_URL}/sucursales/listar.php`);
    if (!res.ok) throw new Error('Error al obtener las sucursales');
    return parseJsonResponse(res);
  },
  
  
};