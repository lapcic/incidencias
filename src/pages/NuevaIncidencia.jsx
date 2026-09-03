import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import FirmaCard from '../components/FirmaCard';
import { Check, X } from 'lucide-react';

const TIPOS_INCIDENCIA = [
  'Vacaciones',
  'Permiso',
  'Salida/Entrada',
  'Cambio de horario',
  'Dia de cumpleaños',
  'Consulta medica IMSS',
  'Otro'
];

export default function NuevaIncidencia() {
  const [sesion, setSesion] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [folio, setFolio] = useState(`No. 0${Date.now().toString().slice(-3)}`);
  const [fechaCreacion, setFechaCreacion] = useState(new Date().toISOString().split('T')[0]);
  
  const [idEmpleado, setIdEmpleado] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const [tipoIncidencia, setTipoIncidencia] = useState('');
  const [otroDescripcion, setOtroDescripcion] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [fechaIncidencia, setFechaIncidencia] = useState('');
  const [horarioIncidencia, setHorarioIncidencia] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Opciones de cambio 1 y 2
  const [opcion1, setOpcion1] = useState({ numero_opcion: 1, nombre: '', puesto: '', sucursal: '', horario: '' });
  const [opcion2, setOpcion2] = useState({ numero_opcion: 2, nombre: '', puesto: '', sucursal: '', horario: '' });

  // Validación de incidencia
  const [validacion, setValidacion] = useState({
    opcion_1: false,
    opcion_2: false,
    otro: false,
    autoriza_si: false,
    autoriza_no: false,
    motivo_rechazo: ''
  });

  // Firmas: Empleado solo puede firmar "Solicita"
  const [firmas, setFirmas] = useState([
    { tipo_firma: 'Valida', nombre_firmante: '', firma: '' },
    { tipo_firma: 'Autoriza RH', nombre_firmante: '', firma: '' },
    { tipo_firma: 'Solicita', nombre_firmante: '', firma: '' }
  ]);

  useEffect(() => {
    const sesionGuardada = JSON.parse(localStorage.getItem('sesion_incidencias'));
    setSesion(sesionGuardada);

    api.getSucursales().then(data => setSucursales(Array.isArray(data) ? data : []));
    api.getEmpleados().then(data => {
      const lista = Array.isArray(data) ? data : [];
      setEmpleados(lista);

      // Si es un empleado logueado, seleccionarlo automáticamente y bloquear selección
      if (sesionGuardada && sesionGuardada.rol === 'Empleado') {
        const empEncontrado = lista.find(e => e.id_empleado.toString() === sesionGuardada.id_empleado.toString());
        if (empEncontrado) {
          setIdEmpleado(empEncontrado.id_empleado);
          setEmpleadoSeleccionado(empEncontrado);
          setFirmas(prev => prev.map(f => f.tipo_firma === 'Solicita' ? { ...f, nombre_firmante: empEncontrado.nombre } : f));
        }
      }
    });
  }, []);

  const handleEmpleadoChange = (e) => {
    const id = e.target.value;
    setIdEmpleado(id);
    const emp = empleados.find(item => item.id_empleado.toString() === id);
    setEmpleadoSeleccionado(emp || null);
    if (emp) {
      setFirmas(prev => prev.map(f => f.tipo_firma === 'Solicita' ? { ...f, nombre_firmante: emp.nombre } : f));
    }
  };

  const handleFirmaChange = (index, nuevaFirma) => {
    setFirmas(prev => {
      const updated = [...prev];
      updated[index] = nuevaFirma;
      return updated;
    });
  };

  const handleLimpiar = () => {
    if (sesion?.rol !== 'Empleado') {
      setIdEmpleado('');
      setEmpleadoSeleccionado(null);
    }
    setTipoIncidencia('');
    setOtroDescripcion('');
    setJustificacion('');
    setFechaIncidencia('');
    setHorarioIncidencia('');
    setObservaciones('');
    setOpcion1({ numero_opcion: 1, nombre: '', puesto: '', sucursal: '', horario: '' });
    setOpcion2({ numero_opcion: 2, nombre: '', puesto: '', sucursal: '', horario: '' });
    setValidacion({ opcion_1: false, opcion_2: false, otro: false, autoriza_si: false, autoriza_no: false, motivo_rechazo: '' });
    setFolio(`No. 0${Date.now().toString().slice(-3)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idEmpleado) {
      alert('Por favor selecciona un colaborador.');
      return;
    }
    if (!tipoIncidencia) {
      alert('Por favor selecciona un tipo de incidencia.');
      return;
    }

    const opciones = [];
    if (opcion1.nombre) opciones.push(opcion1);
    if (opcion2.nombre) opciones.push(opcion2);

    const payload = {
      folio,
      id_empleado: parseInt(idEmpleado, 10),
      tipo_incidencia: tipoIncidencia,
      otro_descripcion: tipoIncidencia === 'Otro' ? otroDescripcion : null,
      justificacion,
      fecha_incidencia: fechaIncidencia,
      horario_incidencia: horarioIncidencia,
      observaciones,
      estado: validacion.autoriza_si ? 'Autorizada' : validacion.autoriza_no ? 'Rechazada' : 'Pendiente',
      opciones_cambio: opciones,
      validacion: {
        autoriza: validacion.autoriza_si ? 'Si' : validacion.autoriza_no ? 'No' : null,
        opcion_1: validacion.opcion_1 ? 'Si' : 'No',
        opcion_2: validacion.opcion_2 ? 'Si' : 'No',
        otro: validacion.otro ? 'Si' : 'No',
        motivo_rechazo: validacion.motivo_rechazo
      },
      firmas
    };

    try {
      const res = await api.createIncidencia(payload);
      if (res.id_incidencia) {
        alert(`¡Incidencia registrada con éxito! Folio: ${folio}`);
        handleLimpiar();
      } else {
        alert(res.error || 'Error al guardar incidencia.');
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    }
  };

  const esAdmin = sesion?.rol === 'RH';
  const esRH = esAdmin;

  return (
    <form onSubmit={handleSubmit} className="formato-lapcic-container">
      {/* 1. ENCABEZADO LAPCIC */}
      <div className="lapcic-header">
        <div className="lapcic-logo-title">
          <div>
            <div className="lapcic-logo-text">LAPCIC</div>
            <div className="lapcic-logo-sub">Análisis Clínicos</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a' }}>Laboratorio de Patología, Citología y Análisis Clínicos</div>
            <div className="lapcic-main-title">Formato de Solicitud de Incidencia</div>
          </div>
        </div>

        <div className="lapcic-folio-date">
          <div className="lapcic-no-box"><span>{folio}</span></div>
          <div className="lapcic-fecha-badge">Fecha: {fechaCreacion}</div>
        </div>
      </div>

      {/* 2. DATOS DEL EMPLEADO */}
      <div className="lapcic-empleado-table">
        <div className="lapcic-bar-title">Datos del Empleado</div>
        {/*esRH && (
         <div style={{ padding: '0.5rem 1rem', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
            <div className="lapcic-field-row">
              <label>Seleccionar:</label>
             <select value={idEmpleado} onChange={handleEmpleadoChange} required>
                <option value="">-- Seleccione Colaborador --</option>
                {empleados.map(emp => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre} ({emp.puesto})</option>
                ))}
              </select>
            </div>
          </div>
        )*/}
        <div className="lapcic-empleado-grid">
          <div className="lapcic-field-row">
            <label>Nombre:</label>
            {esAdmin ? (
              <select
                className="form-select"
                value={idEmpleado}
                onChange={handleEmpleadoChange}
                required
              >
                <option value="">-- Seleccione un empleado --</option>
                {empleados.map(emp => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={empleadoSeleccionado?.nombre || ''} readOnly />
            )}
          </div>

          <div className="lapcic-field-row">
            <label>Puesto:</label>
            <input
              type="text"
              value={empleadoSeleccionado?.puesto || ''}
              readOnly={!esAdmin}
              onChange={(e) => setEmpleadoSeleccionado({ ...empleadoSeleccionado, puesto: e.target.value })}
            />
          </div>

          <div className="lapcic-field-row">
            <label>Sucursal:</label>
            {esAdmin ? (
              <select
                className="form-select"
                value={empleadoSeleccionado?.sucursal || ''}
                onChange={(e) => setEmpleadoSeleccionado({ ...empleadoSeleccionado, sucursal: e.target.value })}
                required
              >
                <option value="">-- Seleccione Sucursal --</option>
                {sucursales.map(s => (
                  <option key={s.id_sucursal} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={empleadoSeleccionado?.sucursal || ''} readOnly />
            )}
          </div>

          <div className="lapcic-field-row">
            <label>Horario:</label>
            <input
              type="text"
              value={empleadoSeleccionado?.horario || ''}
              readOnly={!esAdmin}
              onChange={(e) => setEmpleadoSeleccionado({ ...empleadoSeleccionado, horario: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 3. DATOS DE INCIDENCIA */}
      <div className="lapcic-incidencia-table">
        <div className="lapcic-bar-title">Datos de incidencia</div>
        <div className="lapcic-tipos-grid">
          {TIPOS_INCIDENCIA.map((t) => (
            <div 
              key={t} 
              className={`lapcic-tipo-card ${tipoIncidencia === t ? 'selected' : ''}`}
              onClick={() => setTipoIncidencia(t)}
            >
              <span>{t}</span>
              <input type="checkbox" checked={tipoIncidencia === t} onChange={() => setTipoIncidencia(t)} />
            </div>
          ))}
        </div>

        {tipoIncidencia === 'Otro' && (
          <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
            <div className="lapcic-field-row">
              <label>Otro:</label>
              <input type="text" value={otroDescripcion} onChange={(e) => setOtroDescripcion(e.target.value)} required placeholder="Especificar..." />
            </div>
          </div>
        )}

        <div className="lapcic-justificacion-box">
          <span className="lapcic-justificacion-label">Justificación:</span>
          <textarea rows={3} value={justificacion} onChange={(e) => setJustificacion(e.target.value)} placeholder="Solicito permiso para ausentarme el día..." required />
        </div>
      </div>

      {/* 4. FECHA Y HORARIO DE INCIDENCIA */}
      <div className="lapcic-fecha-horario-grid">
        <div className="lapcic-green-box">
          <div className="lapcic-green-header">Fecha de incidencia</div>
          <div className="lapcic-green-body"><input type="date" value={fechaIncidencia} onChange={(e) => setFechaIncidencia(e.target.value)} required /></div>
        </div>
        <div className="lapcic-green-box">
          <div className="lapcic-green-header">Horario de incidencia</div>
          <div className="lapcic-green-body"><input type="text" value={horarioIncidencia} onChange={(e) => setHorarioIncidencia(e.target.value)} placeholder="Ej. 7:30 A.M - 3:00 P.M" required /></div>
        </div>
      </div>

      {/* 5. OPCIÓN DE CAMBIO 1 Y 2 */}
      <div className="opciones-cambio-container">
        <div className="opcion-cambio-box">
          <div className="opcion-cambio-title">Opción de cambio 1</div>
          <div className="opcion-cambio-body">
            <div className="opcion-row"><label>Nombre:</label><input type="text" value={opcion1.nombre} onChange={(e) => setOpcion1({ ...opcion1, nombre: e.target.value })} /></div>
            <div className="opcion-row"><label>Puesto:</label><input type="text" value={opcion1.puesto} onChange={(e) => setOpcion1({ ...opcion1, puesto: e.target.value })} /></div>
            <div className="opcion-row"><label>Sucursal:</label><input type="text" value={opcion1.sucursal} onChange={(e) => setOpcion1({ ...opcion1, sucursal: e.target.value })} /></div>
            <div className="opcion-row"><label>Horario:</label><input type="text" value={opcion1.horario} onChange={(e) => setOpcion1({ ...opcion1, horario: e.target.value })} /></div>
          </div>
        </div>

        <div className="opcion-cambio-box">
          <div className="opcion-cambio-title">Opción de cambio 2</div>
          <div className="opcion-cambio-body">
            <div className="opcion-row"><label>Nombre:</label><input type="text" value={opcion2.nombre} onChange={(e) => setOpcion2({ ...opcion2, nombre: e.target.value })} /></div>
            <div className="opcion-row"><label>Puesto:</label><input type="text" value={opcion2.puesto} onChange={(e) => setOpcion2({ ...opcion2, puesto: e.target.value })} /></div>
            <div className="opcion-row"><label>Sucursal:</label><input type="text" value={opcion2.sucursal} onChange={(e) => setOpcion2({ ...opcion2, sucursal: e.target.value })} /></div>
            <div className="opcion-row"><label>Horario:</label><input type="text" value={opcion2.horario} onChange={(e) => setOpcion2({ ...opcion2, horario: e.target.value })} /></div>
          </div>
        </div>
      </div>

      {/* 6. VALIDACIÓN DE INCIDENCIA (Solo editable por RH, bloqueado para empleado) */}
      <div className="validacion-section" style={{ opacity: esRH ? 1 : 0.85 }}>
        <div className="validacion-bar-title">Validación de incidencia {!esRH && '(Reservado para RH)'}</div>
        <div className="validacion-controls">
          <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Autoriza:</span>
          <label className="val-check-item"><span>Sí. Opc. 1</span><input type="checkbox" disabled={!esRH} checked={validacion.opcion_1} onChange={(e) => setValidacion({ ...validacion, opcion_1: e.target.checked })} /></label>
          <label className="val-check-item"><span>Sí. Opc. 2</span><input type="checkbox" disabled={!esRH} checked={validacion.opcion_2} onChange={(e) => setValidacion({ ...validacion, opcion_2: e.target.checked })} /></label>
          <label className="val-check-item"><span>Sí. Otro</span><input type="checkbox" disabled={!esRH} checked={validacion.otro} onChange={(e) => setValidacion({ ...validacion, otro: e.target.checked })} /></label>
          <label className="val-check-item" style={{ marginLeft: 'auto' }}><span>SÍ</span><input type="checkbox" disabled={!esRH} checked={validacion.autoriza_si} onChange={(e) => setValidacion({ ...validacion, autoriza_si: e.target.checked, autoriza_no: false })} /></label>
          <label className="val-check-item"><span>NO</span><input type="checkbox" disabled={!esRH} checked={validacion.autoriza_no} onChange={(e) => setValidacion({ ...validacion, autoriza_no: e.target.checked, autoriza_si: false })} /></label>
        </div>
        <div className="validacion-motivo-box">
          <span className="validacion-motivo-label">Motivo de rechazo:</span>
          <textarea rows={2} disabled={!esRH} value={validacion.motivo_rechazo} onChange={(e) => setValidacion({ ...validacion, motivo_rechazo: e.target.value })} placeholder="Especificar en caso de no autorizar..." />
        </div>
      </div>

      {/* 7. OBSERVACIONES */}
      <div className="lapcic-observaciones-section">
        <div className="lapcic-obs-header">Observaciones:</div>
        <div className="lapcic-obs-body">
          <input type="text" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Ej. Sin goce de sueldo" />
        </div>
      </div>

      {/* 8. FIRMAS (Empleado solo interactúa con "Solicita") */}
      <div>
        <div className="firmas-section-title">FIRMAS</div>
        <div className="firmas-grid">
          {firmas.map((f, idx) => {
            const esSolicita = f.tipo_firma === 'Solicita';
            return (
              <div key={f.tipo_firma} style={{ opacity: esRH || esSolicita ? 1 : 0.6, pointerEvents: esRH || esSolicita ? 'auto' : 'none' }}>
                <FirmaCard
                  tipoFirma={f.tipo_firma}
                  data={f}
                  onChange={(nuevaFirma) => handleFirmaChange(idx, nuevaFirma)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones */}
      <div className="form-actions-bar">
        <button type="submit" className="btn-guardar-incidencia">
          <Check size={18} /> Guardar incidencia
        </button>
        <button type="button" className="btn-limpiar" onClick={handleLimpiar}>
          <X size={18} /> Limpiar
        </button>
      </div>
    </form>
  );
}