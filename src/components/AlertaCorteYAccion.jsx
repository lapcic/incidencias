import React, { useEffect, useState } from 'react';

export default function AlertaCorteYAccion() {
  const [esDiaDeCorte, setEsDiaDeCorte] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');

  useEffect(() => {
    const hoy = new Date();
    const diaActual = hoy.getDate();

    if (diaActual >= 30) {
      setEsDiaDeCorte(true);
    }
  }, []);

  const ejecutarCorteManual = async () => {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario')) || {};

    const rolActual = usuarioLogueado.rol || 'Empleado';
    const idEmpleadoActual = usuarioLogueado.id_empleado || usuarioLogueado.id || '';

    const mensajeConfirmacion = rolActual === 'RH'
      ? "¿Estás seguro de ejecutar el corte mensual global? Esto respaldará todas las incidencias y LIMPIARÁ la base de datos."
      : "¿Deseas descargar/respaldar tus formatos de incidencias en PDF?";

    if (!window.confirm(mensajeConfirmacion)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('rol', rolActual);
      formData.append('id_empleado', idEmpleadoActual);

      // NOTA: No incluyas la propiedad 'headers' para evitar que se dispare el bloqueo CORS por preflight
      const response = await fetch('http://localhost/incidencias-api/corte/corte_mensual.php', {
        method: 'POST',
        body: formData
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Respuesta del servidor:", textResponse);
        alert("Error en el servidor PHP. Revisa la consola.");
        return;
      }

      if (response.ok && !data.error) {
        setMensajeEstado(data.mensaje);
        alert(data.mensaje);
      } else {
        alert(data.error || 'Error al ejecutar el proceso.');
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert('Error de conexión con el servidor local.');
    }
  };

  return (
    <div style={{ padding: '1rem', marginBottom: '1rem' }}>
      {esDiaDeCorte && (
        <div
          style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '1rem',
            border: '1px solid #ffeeba',
            borderRadius: '6px',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong>¡Aviso Importante!</strong> Hoy es día de corte (30 de mes). Recuerda realizar el respaldo y limpieza de incidencias para mantener el espacio optimizado.
          </div>
          <button
            type="button"
            onClick={ejecutarCorteManual}
            style={{
              backgroundColor: '#856404',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Ejecutar Corte Ahora
          </button>
        </div>
      )}

      {mensajeEstado && <p style={{ color: 'green', fontSize: '0.9rem' }}>{mensajeEstado}</p>}
    </div>
  );
}
