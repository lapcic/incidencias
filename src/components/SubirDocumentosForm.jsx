import React, { useState } from 'react';

const SubirDocumentosForm = () => {
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [documentos, setDocumentos] = useState({
    ine: null,
    curp: null,
    rfc: null
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Manejar selección de archivos
  const handleFileChange = (e) => {
    setDocumentos({
      ...documentos,
      [e.target.name]: e.target.files[0]
    });
  };

  // Enviar formulario al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const formData = new FormData();
    formData.append('nombre_empleado', nombreEmpleado);
    
    if (documentos.ine) formData.append('ine', documentos.ine);
    if (documentos.curp) formData.append('curp', documentos.curp);
    if (documentos.rfc) formData.append('rfc', documentos.rfc);

    try {
      const response = await fetch('https://localhost/incidencias-api/subir_documentos.php', {
        method: 'POST',
        // credentials: 'include', // Descomenta si usas cookies/sesiones PHP con credenciales cruzadas
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensaje({ tipo: 'success', texto: '¡Documentos subidos correctamente a Google Drive!' });
        setNombreEmpleado('');
        setDocumentos({ ine: null, curp: null, rfc: null });
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Ocurrió un error al subir los archivos.' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de red al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Panel de Admin: Subir Expediente de Empleado</h2>
      
      {mensaje && (
        <div className={`p-3 mb-4 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre Completo del Empleado:</label>
          <input 
            type="text" 
            value={nombreEmpleado} 
            onChange={(e) => setNombreEmpleado(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Ej. Juan Pérez López"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">INE / Identificación:</label>
          <input 
            type="file" 
            name="ine" 
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CURP:</label>
          <input 
            type="file" 
            name="curp" 
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">RFC:</label>
          <input 
            type="file" 
            name="rcf" 
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 font-medium"
        >
          {loading ? 'Subiendo a Google Drive...' : 'Crear Carpeta y Subir Documentos'}
        </button>
      </form>
    </div>
  );
};

export default SubirDocumentosForm;