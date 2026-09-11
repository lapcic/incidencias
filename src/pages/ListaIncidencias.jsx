import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import FirmaCard from '../components/FirmaCard';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Printer, 
  Check, 
  X, 
  Calendar, 
  Clock,
  Eye,
  Pencil,
  Save
} from 'lucide-react';

const TIPOS_INCIDENCIA = [
  'Vacaciones',
  'Permiso',
  'Salida/Entrada',
  'Cambio de horario',
  'Dia de cumpleaños',
  'Consulta medica IMSS',
  'Otro'
];

export default function ListaIncidencias() {
  const [sesion, setSesion] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  // Estados de modales
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [formEdicion, setFormEdicion] = useState(null);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    const sesionActual = JSON.parse(localStorage.getItem('sesion_incidencias'));
    setSesion(sesionActual);

    try {
      const [resInc, resSuc] = await Promise.all([
        api.getIncidencias(),
        api.getSucursales()
      ]);

      let lista = Array.isArray(resInc) ? resInc : [];
      if (sesionActual && sesionActual.rol === 'Empleado') {
        lista = lista.filter(i => i.id_empleado.toString() === sesionActual.id_empleado.toString());
      }
      setIncidencias(lista);
      setSucursales(Array.isArray(resSuc) ? resSuc : []);
    } catch (err) {
      console.error(err);
      setIncidencias([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const getBadge = (estado) => {
    if (estado === 'Autorizada') return <span className="badge badge-autorizada"><CheckCircle2 size={12} /> Autorizada</span>;
    if (estado === 'Rechazada') return <span className="badge badge-rechazada"><XCircle size={12} /> Rechazada</span>;
    return <span className="badge badge-pendiente"><Clock3 size={12} /> Pendiente</span>;
  };

  // Abrir Modal de Edición
  const handleAbrirEdicion = (inc) => {
    const ops = inc.opciones_cambio || [];
    const op1 = ops.find(o => o.numero_opcion == 1) || { numero_opcion: 1, nombre: '', puesto: '', sucursal: '', horario: '' };
    const op2 = ops.find(o => o.numero_opcion == 2) || { numero_opcion: 2, nombre: '', puesto: '', sucursal: '', horario: '' };
    const val = inc.validacion || {};

    const firmasObj = ['Valida', 'Autoriza RH', 'Solicita'].map(tipo => {
      const f = (inc.firmas || []).find(item => item.tipo_firma && item.tipo_firma.trim() === tipo);
      return {
        tipo_firma: tipo,
        nombre_firmante: f?.nombre_firmante || (tipo === 'Solicita' ? inc.nombre : ''),
        firma: f?.firma || ''
      };
    });

    setFormEdicion({
      id_incidencia: inc.id_incidencia,
      folio: inc.folio,
      nombre: inc.nombre,
      puesto: inc.puesto,
      sucursal: inc.sucursal,
      horario: inc.horario,
      tipo_incidencia: inc.tipo_incidencia,
      otro_descripcion: inc.otro_descripcion || '',
      justificacion: inc.justificacion,
      fecha_incidencia: inc.fecha_incidencia,
      horario_incidencia: inc.horario_incidencia,
      observaciones: inc.observaciones || '',
      estado: inc.estado,
      opcion1: { ...op1 },
      opcion2: { ...op2 },
      validacion: {
        opcion_1: val.opcion_1 === 'Si',
        opcion_2: val.opcion_2 === 'Si',
        otro: val.otro === 'Si',
        autoriza_si: val.autoriza === 'Si' || inc.estado === 'Autorizada',
        autoriza_no: val.autoriza === 'No' || inc.estado === 'Rechazada',
        motivo_rechazo: val.motivo_rechazo || ''
      },
      firmas: firmasObj
    });
    setModalEdicion(true);
  };

  // Guardar Cambios de Edición
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!formEdicion) return;

    const opciones = [];
    if (formEdicion.opcion1.nombre) opciones.push(formEdicion.opcion1);
    if (formEdicion.opcion2.nombre) opciones.push(formEdicion.opcion2);

    const payload = {
      id_incidencia: formEdicion.id_incidencia,
      tipo_incidencia: formEdicion.tipo_incidencia,
      otro_descripcion: formEdicion.tipo_incidencia === 'Otro' ? formEdicion.otro_descripcion : null,
      justificacion: formEdicion.justificacion,
      fecha_incidencia: formEdicion.fecha_incidencia,
      horario_incidencia: formEdicion.horario_incidencia,
      observaciones: formEdicion.observaciones,
      estado: formEdicion.validacion.autoriza_si ? 'Autorizada' : formEdicion.validacion.autoriza_no ? 'Rechazada' : 'Pendiente',
      opciones_cambio: opciones,
      validacion: {
        autoriza: formEdicion.validacion.autoriza_si ? 'Si' : formEdicion.validacion.autoriza_no ? 'No' : null,
        opcion_1: formEdicion.validacion.opcion_1 ? 'Si' : 'No',
        opcion_2: formEdicion.validacion.opcion_2 ? 'Si' : 'No',
        otro: formEdicion.validacion.otro ? 'Si' : 'No',
        motivo_rechazo: formEdicion.validacion.motivo_rechazo
      },
      firmas: formEdicion.firmas
    };

    try {
      const res = await api.updateIncidencia(payload);
      if (res && res.mensaje) {
        alert('¡Incidencia modificada exitosamente!');
        setModalEdicion(false);
        setFormEdicion(null);
        cargarDatosIniciales();
      } else {
        alert(res?.error || 'Error al actualizar incidencia.');
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    }
  };

  const handleCambiarEstado = async (incidencia, nuevoEstado, motivo = '') => {
    try {
      const res = await api.updateEstadoIncidencia({
        id_incidencia: incidencia.id_incidencia,
        estado: nuevoEstado,
        motivo_rechazo: motivo,
        usuario: 'Recursos Humanos'
      });

      if (res && res.mensaje) {
        setModalRechazo(false);
        setMotivoRechazo('');
        cargarDatosIniciales();
      } else {
        alert(res?.error || 'No se pudo actualizar.');
      }
    } catch (err) {
      alert('Error de conexión.');
    }
  };

  const handleGenerarPDF = (inc) => {
    const listaFirmas = Array.isArray(inc.firmas) ? inc.firmas : [];
    const firmaValida = listaFirmas.find(f => f.tipo_firma && f.tipo_firma.trim() === 'Valida');
    const firmaAutoriza = listaFirmas.find(f => f.tipo_firma && f.tipo_firma.trim() === 'Autoriza RH');
    const firmaSolicita = listaFirmas.find(f => f.tipo_firma && f.tipo_firma.trim() === 'Solicita');

    const listaOpciones = Array.isArray(inc.opciones_cambio) ? inc.opciones_cambio : [];
    const op1 = listaOpciones.find(o => o.numero_opcion == 1);
    const op2 = listaOpciones.find(o => o.numero_opcion == 2);
    const val = inc.validacion || {};

    const renderFirmaImpresion = (firmaObj, tituloDefault) => {
      const tieneImagen = firmaObj?.firma && String(firmaObj.firma).startsWith('data:image');
      return `
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; text-align: center; height: 115px; display: flex; flex-direction: column; justify-content: space-between; background: #fff;">
          <div style="font-size: 10px; font-weight: bold; color: #1e3a8a;">${firmaObj?.tipo_firma || tituloDefault}</div>
          <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
            ${tieneImagen ? `<img src="${firmaObj.firma}" style="max-height: 55px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">Sin firma</span>`}
          </div>
          <div style="border-top: 1px dashed #94a3b8; padding-top: 3px; font-size: 9px; font-weight: bold;">${firmaObj?.nombre_firmante || 'Nombre y Firma'}</div>
        </div>
      `;
    };

    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Formato de Incidencia - ${inc.folio}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px 30px; color: #0f172a; line-height: 1.3; font-size: 11px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
            .bar { background: #1e3a8a; color: #fff; text-align: center; font-weight: bold; font-size: 10px; padding: 3px; border-radius: 3px 3px 0 0; }
            .box { border: 1.5px solid #1e3a8a; border-radius: 3px; margin-bottom: 10px; overflow: hidden; }
            .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 6px 10px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
            .green-box { background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 3px; padding: 4px 8px; }
            .val-box { border: 1.5px solid #1e3a8a; border-radius: 3px; margin-bottom: 10px; }
            .val-checks { background: #d1fae5; padding: 4px 8px; display: flex; justify-content: space-between; font-weight: bold; color: #1e3a8a; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="font-size: 18px; font-weight: 900; color: #0d9488;">LAPCIC</div>
              <div style="font-size: 9px; font-weight: bold; color: #1e3a8a;">Análisis Clínicos</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 10px; font-weight: bold; color: #1e3a8a;">Laboratorio de Patología, Citología y Análisis Clínicos</div>
              <div style="font-size: 12px; font-weight: bold; color: #1e3a8a;">Formato de Solicitud de Incidencia</div>
            </div>
            <div style="text-align: right;">
              <div style="color: #dc2626; font-weight: bold; font-size: 13px;">${inc.folio}</div>
              <div style="background: #d1fae5; padding: 2px 6px; border-radius: 3px; font-weight: bold;">Fecha: ${inc.fecha_creacion?.split(' ')[0] || ''}</div>
            </div>
          </div>

          <div class="box">
            <div class="bar">Datos del Empleado</div>
            <div class="grid-4">
              <div><strong>Nombre:</strong> ${inc.nombre}</div>
              <div><strong>Puesto:</strong> ${inc.puesto}</div>
              <div><strong>Sucursal:</strong> ${inc.sucursal}</div>
              <div><strong>Horario:</strong> ${inc.horario}</div>
            </div>
          </div>

          <div class="box">
            <div class="bar">Datos de incidencia</div>
            <div style="background: #d1fae5; padding: 4px 8px; display: flex; gap: 15px; font-weight: bold; border-bottom: 1px solid #6ee7b7;">
              <span>Tipo: [ ${inc.tipo_incidencia} ${inc.otro_descripcion ? '(' + inc.otro_descripcion + ')' : ''} ]</span>
            </div>
            <div style="padding: 6px 10px;">
              <strong>Justificación:</strong> ${inc.justificacion}
            </div>
          </div>

          <div class="grid-2">
            <div class="green-box"><strong>Fecha de incidencia:</strong> ${inc.fecha_incidencia}</div>
            <div class="green-box"><strong>Horario de incidencia:</strong> ${inc.horario_incidencia}</div>
          </div>

          <div class="grid-2">
            <div class="green-box">
              <div style="text-align: center; font-weight: bold; border-bottom: 1px solid #a7f3d0; margin-bottom: 4px;">Opción de cambio 1</div>
              <div><strong>Nombre:</strong> ${op1?.nombre || '---'}</div>
              <div><strong>Puesto:</strong> ${op1?.puesto || '---'}</div>
              <div><strong>Sucursal:</strong> ${op1?.sucursal || '---'}</div>
              <div><strong>Horario:</strong> ${op1?.horario || '---'}</div>
            </div>
            <div class="green-box">
              <div style="text-align: center; font-weight: bold; border-bottom: 1px solid #a7f3d0; margin-bottom: 4px;">Opción de cambio 2</div>
              <div><strong>Nombre:</strong> ${op2?.nombre || '---'}</div>
              <div><strong>Puesto:</strong> ${op2?.puesto || '---'}</div>
              <div><strong>Sucursal:</strong> ${op2?.sucursal || '---'}</div>
              <div><strong>Horario:</strong> ${op2?.horario || '---'}</div>
            </div>
          </div>

          <div class="val-box">
            <div class="bar">Validación de incidencia</div>
            <div class="val-checks">
              <span>Autoriza:</span>
              <span>[ ${val.opcion_1 === 'Si' ? 'X' : ' '} ] Sí. Opc. 1</span>
              <span>[ ${val.opcion_2 === 'Si' ? 'X' : ' '} ] Sí. Opc. 2</span>
              <span>[ ${val.otro === 'Si' ? 'X' : ' '} ] Sí. Otro</span>
              <span>[ ${val.autoriza === 'Si' || inc.estado === 'Autorizada' ? 'X' : ' '} ] SÍ</span>
              <span>[ ${val.autoriza === 'No' || inc.estado === 'Rechazada' ? 'X' : ' '} ] NO</span>
            </div>
            <div style="padding: 4px 8px;"><strong>Motivo de rechazo:</strong> ${val.motivo_rechazo || 'N/A'}</div>
          </div>

          <div class="box" style="margin-bottom: 15px;">
            <div style="background: #d1fae5; padding: 3px 8px; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #6ee7b7;">Observaciones:</div>
            <div style="padding: 4px 8px;">${inc.observaciones || 'Sin observaciones'}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            ${renderFirmaImpresion(firmaValida, 'Valida')}
            ${renderFirmaImpresion(firmaAutoriza, 'Autoriza RH')}
            ${renderFirmaImpresion(firmaSolicita, 'Solicita')}
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  const incidenciasFiltradas = incidencias.filter(inc => {
    const texto = busqueda.toLowerCase();
    const coincideTexto = 
      (inc.folio && inc.folio.toLowerCase().includes(texto)) ||
      (inc.nombre && inc.nombre.toLowerCase().includes(texto)) ||
      (inc.tipo_incidencia && inc.tipo_incidencia.toLowerCase().includes(texto));

    const coincideEstado = filtroEstado === 'Todos' || inc.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const esRH = sesion?.rol === 'RH';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={22} style={{ color: 'var(--primary)' }} />
            {esRH ? 'Historial de Incidencias' : 'Mis Incidencias'}
          </h2>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar incidencias..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Autorizada">Autorizadas</option>
          <option value="Rechazada">Rechazadas</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="custom-table incidencias-table">
          <thead>
            <tr>
              <th>Folio</th>
              {esRH && <th>Empleado</th>}
              <th>Tipo</th>
              <th>Fecha y Horario</th>
              <th>Justificación</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={esRH ? 7 : 6} style={{ textAlign: 'center', padding: '2rem' }}>Cargando incidencias...</td></tr>
            ) : incidenciasFiltradas.length === 0 ? (
              <tr><td colSpan={esRH ? 7 : 6} style={{ textAlign: 'center', padding: '2rem' }}>No hay incidencias registradas.</td></tr>
            ) : (
              incidenciasFiltradas.map((inc) => (
                <tr key={inc.id_incidencia}>
                  <td data-label="Folio" style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{inc.folio}</td>
                  {esRH && (
                    <td data-label="Empleado">
                      <strong>{inc.nombre}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{inc.puesto} - {inc.sucursal}</div>
                    </td>
                  )}
                  <td data-label="Tipo">
                    {inc.tipo_incidencia}
                    {inc.otro_descripcion && <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>({inc.otro_descripcion})</div>}
                  </td>
                  <td data-label="Fecha y horario">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} color="var(--text-sub)" /> {inc.fecha_incidencia}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                      <Clock size={12} /> {inc.horario_incidencia}
                    </div>
                  </td>
                  <td data-label="Justificación" style={{ maxWidth: '200px', fontSize: '0.8rem' }} title={inc.justificacion}>{inc.justificacion}</td>
                  <td data-label="Estado" style={{ textAlign: 'center' }}>{getBadge(inc.estado)}</td>
                  <td data-label="Acciones" style={{ textAlign: 'center' }}>
                    <div className="action-btn-group">
                      <button type="button" className="icon-btn icon-btn-view" title="Ver Formato LAPCIC" onClick={() => { setIncidenciaSeleccionada(inc); setModalVistaPrevia(true); }}>
                        <Eye size={15} />
                      </button>
                      <button type="button" className="icon-btn icon-btn-pdf" title="Imprimir / PDF" onClick={() => handleGenerarPDF(inc)}>
                        <Printer size={15} />
                      </button>

                      {/* Botones exclusivos para RH */}
                      {esRH && (
                        <>
                          <button type="button" className="icon-btn icon-btn-edit" title="Editar Incidencia" onClick={() => handleAbrirEdicion(inc)}>
                            <Pencil size={15} />
                          </button>
                          {inc.estado !== 'Autorizada' && (
                            <button type="button" className="icon-btn icon-btn-success" title="Autorizar" onClick={() => handleCambiarEstado(inc, 'Autorizada')}>
                              <Check size={15} />
                            </button>
                          )}
                          {inc.estado !== 'Rechazada' && (
                            <button type="button" className="icon-btn icon-btn-danger" title="Rechazar" onClick={() => { setIncidenciaSeleccionada(inc); setModalRechazo(true); }}>
                              <X size={15} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 
          MODAL DE EDICIÓN
          */}
      {modalEdicion && formEdicion && (
        <div className="modal-backdrop">
          <div className="modal-preview-card" style={{ maxWidth: '980px' }}>
            <div className="modal-preview-header">
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#1e3a8a' }}>EDITAR SOLICITUD DE INCIDENCIA ({formEdicion.folio})</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modifica los datos, opciones de cambio y validaciones</div>
              </div>
              <span style={{ cursor: 'pointer', fontSize: '1.35rem', fontWeight: 'bold' }} onClick={() => setModalEdicion(false)}>&times;</span>
            </div>

            <form onSubmit={handleGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-preview-body" style={{ background: '#f8fafc' }}>
                <div className="formato-lapcic-container" style={{ padding: '1rem', border: 'none', boxShadow: 'none' }}>
                  
                  <div className="lapcic-empleado-table">
                    <div className="lapcic-bar-title">Datos del Empleado</div>
                    <div className="lapcic-empleado-grid">
                      <div className="lapcic-field-row"><label>Nombre:</label> <input type="text" value={formEdicion.nombre} readOnly /></div>
                      <div className="lapcic-field-row"><label>Puesto:</label> <input type="text" value={formEdicion.puesto} readOnly /></div>
                      <div className="lapcic-field-row"><label>Horario:</label> <input type="text" value={formEdicion.horario} readOnly /></div>
                    </div>
                  </div>

                  <div className="lapcic-incidencia-table">
                    <div className="lapcic-bar-title">Datos de incidencia</div>
                    <div className="lapcic-tipos-grid">
                      {TIPOS_INCIDENCIA.map((t) => (
                        <div 
                          key={t} 
                          className={`lapcic-tipo-card ${formEdicion.tipo_incidencia === t ? 'selected' : ''}`}
                          onClick={() => setFormEdicion({ ...formEdicion, tipo_incidencia: t })}
                        >
                          <span>{t}</span>
                          <input type="checkbox" checked={formEdicion.tipo_incidencia === t} onChange={() => setFormEdicion({ ...formEdicion, tipo_incidencia: t })} />
                        </div>
                      ))}
                    </div>

                    {formEdicion.tipo_incidencia === 'Otro' && (
                      <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <div className="lapcic-field-row">
                          <label>Otro:</label>
                          <input type="text" value={formEdicion.otro_descripcion} onChange={(e) => setFormEdicion({ ...formEdicion, otro_descripcion: e.target.value })} required />
                        </div>
                      </div>
                    )}

                    <div className="lapcic-justificacion-box">
                      <span className="lapcic-justificacion-label">Justificación:</span>
                      <textarea rows={3} value={formEdicion.justificacion} onChange={(e) => setFormEdicion({ ...formEdicion, justificacion: e.target.value })} required />
                    </div>
                  </div>

                  <div className="lapcic-fecha-horario-grid">
                    <div className="lapcic-green-box">
                      <div className="lapcic-green-header">Fecha de incidencia</div>
                      <div className="lapcic-green-body">
                        <input type="date" value={formEdicion.fecha_incidencia} onChange={(e) => setFormEdicion({ ...formEdicion, fecha_incidencia: e.target.value })} required />
                      </div>
                    </div>
                    <div className="lapcic-green-box">
                      <div className="lapcic-green-header">Horario de incidencia</div>
                      <div className="lapcic-green-body">
                        <input type="text" value={formEdicion.horario_incidencia} onChange={(e) => setFormEdicion({ ...formEdicion, horario_incidencia: e.target.value })} required />
                      </div>
                    </div>
                  </div>

                  <div className="opciones-cambio-container">
                    <div className="opcion-cambio-box">
                      <div className="opcion-cambio-title">Opción de cambio 1</div>
                      <div className="opcion-cambio-body">
                        <div className="opcion-row"><label>Nombre:</label><input type="text" value={formEdicion.opcion1.nombre} onChange={(e) => setFormEdicion({ ...formEdicion, opcion1: { ...formEdicion.opcion1, nombre: e.target.value } })} /></div>
                        <div className="opcion-row"><label>Puesto:</label><input type="text" value={formEdicion.opcion1.puesto} onChange={(e) => setFormEdicion({ ...formEdicion, opcion1: { ...formEdicion.opcion1, puesto: e.target.value } })} /></div>
                        <div className="opcion-row">
                          <label>Sucursal:</label>
                          <select
                            className="form-input"
                            value={formEdicion.opcion1.sucursal}
                            onChange={(e) => setFormEdicion({ ...formEdicion, opcion1: { ...formEdicion.opcion1, sucursal: e.target.value } })}
                          >
                            <option value="">Seleccione...</option>
                            {sucursales.map(s => <option key={s.id_sucursal} value={s.nombre}>{s.nombre}</option>)}
                          </select>
                        </div>
                        <div className="opcion-row"><label>Horario:</label><input type="text" value={formEdicion.opcion1.horario} onChange={(e) => setFormEdicion({ ...formEdicion, opcion1: { ...formEdicion.opcion1, horario: e.target.value } })} /></div>
                      </div>
                    </div>

                    <div className="opcion-cambio-box">
                      <div className="opcion-cambio-title">Opción de cambio 2</div>
                      <div className="opcion-cambio-body">
                        <div className="opcion-row"><label>Nombre:</label><input type="text" value={formEdicion.opcion2.nombre} onChange={(e) => setFormEdicion({ ...formEdicion, opcion2: { ...formEdicion.opcion2, nombre: e.target.value } })} /></div>
                        <div className="opcion-row"><label>Puesto:</label><input type="text" value={formEdicion.opcion2.puesto} onChange={(e) => setFormEdicion({ ...formEdicion, opcion2: { ...formEdicion.opcion2, puesto: e.target.value } })} /></div>
                        <div className="opcion-row">
                          <label>Sucursal:</label>
                          <select
                            className="form-input"
                            value={formEdicion.opcion2.sucursal}
                            onChange={(e) => setFormEdicion({ ...formEdicion, opcion2: { ...formEdicion.opcion2, sucursal: e.target.value } })}
                          >
                            <option value="">Seleccione...</option>
                            {sucursales.map(s => <option key={s.id_sucursal} value={s.nombre}>{s.nombre}</option>)}
                          </select>
                        </div>
                        <div className="opcion-row"><label>Horario:</label><input type="text" value={formEdicion.opcion2.horario} onChange={(e) => setFormEdicion({ ...formEdicion, opcion2: { ...formEdicion.opcion2, horario: e.target.value } })} /></div>
                      </div>
                    </div>
                  </div>

                  <div className="validacion-section">
                    <div className="validacion-bar-title">Validación de incidencia</div>
                    <div className="validacion-controls">
                      <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Autoriza:</span>
                      <label className="val-check-item"><span>Sí. Opc. 1</span><input type="checkbox" checked={formEdicion.validacion.opcion_1} onChange={(e) => setFormEdicion({ ...formEdicion, validacion: { ...formEdicion.validacion, opcion_1: e.target.checked } })} /></label>
                      <label className="val-check-item"><span>Sí. Opc. 2</span><input type="checkbox" checked={formEdicion.validacion.opcion_2} onChange={(e) => setFormEdicion({ ...formEdicion, validacion: { ...formEdicion.validacion, opcion_2: e.target.checked } })} /></label>
                      <label className="val-check-item"><span>Sí. Otro</span><input type="checkbox" checked={formEdicion.validacion.otro} onChange={(e) => setFormEdicion({ ...formEdicion, validacion: { ...formEdicion.validacion, otro: e.target.checked } })} /></label>
                      <label className="val-check-item" style={{ marginLeft: 'auto' }}><span>SÍ</span><input type="checkbox" checked={formEdicion.validacion.autoriza_si} onChange={(e) => setFormEdicion({ ...formEdicion, validacion: { ...formEdicion.validacion, autoriza_si: e.target.checked, autoriza_no: false } })} /></label>
                      <label className="val-check-item"><span>NO</span><input type="checkbox" checked={formEdicion.validacion.autoriza_no} onChange={(e) => setFormEdicion({ ...formEdicion, validacion: { ...formEdicion.validacion, autoriza_no: e.target.checked, autoriza_si: false } })} /></label>
                    </div>
                    <div className="validacion-motivo-box">
                      <span className="validacion-motivo-label">Motivo de rechazo:</span>
                      <textarea rows={2} value={formEdicion.validacion.motivo_rechazo} onChange={(e) => setFormEdicion({ ...formEdicion, validacion: { ...formEdicion.validacion, motivo_rechazo: e.target.value } })} />
                    </div>
                  </div>

                  <div className="lapcic-observaciones-section">
                    <div className="lapcic-obs-header">Observaciones:</div>
                    <div className="lapcic-obs-body">
                      <input type="text" value={formEdicion.observaciones} onChange={(e) => setFormEdicion({ ...formEdicion, observaciones: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <div className="firmas-section-title">FIRMAS</div>
                    <div className="firmas-grid">
                      {formEdicion.firmas.map((f, idx) => (
                        <FirmaCard
                          key={f.tipo_firma}
                          tipoFirma={f.tipo_firma}
                          data={f}
                          onChange={(nuevaFirma) => {
                            const updated = [...formEdicion.firmas];
                            updated[idx] = nuevaFirma;
                            setFormEdicion({ ...formEdicion, firmas: updated });
                          }}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <div className="modal-preview-footer">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Guardar Cambios
                </button>
                <button type="button" className="btn" style={{ background: '#e2e8f0', color: '#334155' }} onClick={() => setModalEdicion(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
          MODAL VISTA PREVIA
         */}
      {modalVistaPrevia && incidenciaSeleccionada && (
        <div className="modal-backdrop">
          <div className="modal-preview-card" style={{ maxWidth: '950px' }}>
            <div className="modal-preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0d9488' }}>LAPCIC</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e3a8a' }}>Formato de Solicitud de Incidencia</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#dc2626', fontWeight: 800, fontFamily: 'monospace' }}>{incidenciaSeleccionada.folio}</span>
                {getBadge(incidenciaSeleccionada.estado)}
                <span style={{ cursor: 'pointer', fontSize: '1.35rem', fontWeight: 'bold' }} onClick={() => setModalVistaPrevia(false)}>&times;</span>
              </div>
            </div>

            <div className="modal-preview-body" style={{ background: '#ffffff' }}>
              <div className="formato-lapcic-container" style={{ padding: '1rem', border: 'none', boxShadow: 'none' }}>
                
                <div className="lapcic-header" style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '0.75rem' }}>
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
                    <div className="lapcic-no-box"><span>{incidenciaSeleccionada.folio}</span></div>
                    <div className="lapcic-fecha-badge">Fecha: {incidenciaSeleccionada.fecha_creacion?.split(' ')[0] || ''}</div>
                  </div>
                </div>

                <div className="lapcic-empleado-table">
                  <div className="lapcic-bar-title">Datos del Empleado</div>
                  <div className="lapcic-empleado-grid">
                    <div className="lapcic-field-row"><label>Nombre:</label> <input type="text" value={incidenciaSeleccionada.nombre || ''} readOnly /></div>
                    <div className="lapcic-field-row"><label>Puesto:</label> <input type="text" value={incidenciaSeleccionada.puesto || ''} readOnly /></div>
                    <div className="lapcic-field-row"><label>Sucursal:</label> <input type="text" value={incidenciaSeleccionada.sucursal || ''} readOnly /></div>
                    <div className="lapcic-field-row"><label>Horario:</label> <input type="text" value={incidenciaSeleccionada.horario || ''} readOnly /></div>
                  </div>
                </div>

                <div className="lapcic-incidencia-table">
                  <div className="lapcic-bar-title">Datos de incidencia</div>
                  <div className="lapcic-tipos-grid">
                    {TIPOS_INCIDENCIA.map((t) => (
                      <div key={t} className={`lapcic-tipo-card ${incidenciaSeleccionada.tipo_incidencia === t ? 'selected' : ''}`} style={{ cursor: 'default' }}>
                        <span>{t}</span>
                        <input type="checkbox" checked={incidenciaSeleccionada.tipo_incidencia === t} readOnly />
                      </div>
                    ))}
                  </div>
                  {incidenciaSeleccionada.tipo_incidencia === 'Otro' && (
                    <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      <div className="lapcic-field-row"><label>Otro:</label><input type="text" value={incidenciaSeleccionada.otro_descripcion || ''} readOnly /></div>
                    </div>
                  )}
                  <div className="lapcic-justificacion-box">
                    <span className="lapcic-justificacion-label">Justificación:</span>
                    <textarea rows={3} value={incidenciaSeleccionada.justificacion || ''} readOnly />
                  </div>
                </div>

                <div className="lapcic-fecha-horario-grid">
                  <div className="lapcic-green-box">
                    <div className="lapcic-green-header">Fecha de incidencia</div>
                    <div className="lapcic-green-body"><input type="text" value={incidenciaSeleccionada.fecha_incidencia || ''} readOnly style={{ textAlign: 'center', fontWeight: 700 }} /></div>
                  </div>
                  <div className="lapcic-green-box">
                    <div className="lapcic-green-header">Horario de incidencia</div>
                    <div className="lapcic-green-body"><input type="text" value={incidenciaSeleccionada.horario_incidencia || ''} readOnly style={{ textAlign: 'center', fontWeight: 700 }} /></div>
                  </div>
                </div>

                <div className="opciones-cambio-container">
                  {(() => {
                    const ops = incidenciaSeleccionada.opciones_cambio || [];
                    const op1 = ops.find(o => o.numero_opcion == 1);
                    const op2 = ops.find(o => o.numero_opcion == 2);
                    return (
                      <>
                        <div className="opcion-cambio-box">
                          <div className="opcion-cambio-title">Opción de cambio 1</div>
                          <div className="opcion-cambio-body">
                            <div className="opcion-row"><label>Nombre:</label><input type="text" value={op1?.nombre || ''} readOnly /></div>
                            <div className="opcion-row"><label>Puesto:</label><input type="text" value={op1?.puesto || ''} readOnly /></div>
                            <div className="opcion-row"><label>Sucursal:</label><input type="text" value={op1?.sucursal || ''} readOnly /></div>
                            <div className="opcion-row"><label>Horario:</label><input type="text" value={op1?.horario || ''} readOnly /></div>
                          </div>
                        </div>
                        <div className="opcion-cambio-box">
                          <div className="opcion-cambio-title">Opción de cambio 2</div>
                          <div className="opcion-cambio-body">
                            <div className="opcion-row"><label>Nombre:</label><input type="text" value={op2?.nombre || ''} readOnly /></div>
                            <div className="opcion-row"><label>Puesto:</label><input type="text" value={op2?.puesto || ''} readOnly /></div>
                            <div className="opcion-row"><label>Sucursal:</label><input type="text" value={op2?.sucursal || ''} readOnly /></div>
                            <div className="opcion-row"><label>Horario:</label><input type="text" value={op2?.horario || ''} readOnly /></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {(() => {
                  const val = incidenciaSeleccionada.validacion || {};
                  return (
                    <div className="validacion-section">
                      <div className="validacion-bar-title">Validación de incidencia</div>
                      <div className="validacion-controls">
                        <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Autoriza:</span>
                        <label className="val-check-item"><span>Sí. Opc. 1</span><input type="checkbox" checked={val.opcion_1 === 'Si'} readOnly /></label>
                        <label className="val-check-item"><span>Sí. Opc. 2</span><input type="checkbox" checked={val.opcion_2 === 'Si'} readOnly /></label>
                        <label className="val-check-item"><span>Sí. Otro</span><input type="checkbox" checked={val.otro === 'Si'} readOnly /></label>
                        <label className="val-check-item" style={{ marginLeft: 'auto' }}><span>SÍ</span><input type="checkbox" checked={val.autoriza === 'Si' || incidenciaSeleccionada.estado === 'Autorizada'} readOnly /></label>
                        <label className="val-check-item"><span>NO</span><input type="checkbox" checked={val.autoriza === 'No' || incidenciaSeleccionada.estado === 'Rechazada'} readOnly /></label>
                      </div>
                      <div className="validacion-motivo-box">
                        <span className="validacion-motivo-label">Motivo de rechazo:</span>
                        <textarea rows={2} value={val.motivo_rechazo || ''} readOnly placeholder="N/A" />
                      </div>
                    </div>
                  );
                })()}

                <div className="lapcic-observaciones-section">
                  <div className="lapcic-obs-header">Observaciones:</div>
                  <div className="lapcic-obs-body"><input type="text" value={incidenciaSeleccionada.observaciones || ''} readOnly placeholder="Sin observaciones" /></div>
                </div>

                <div>
                  <div className="firmas-section-title" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>FIRMAS</div>
                  <div className="firmas-grid">
                    {['Valida', 'Autoriza RH', 'Solicita'].map((tipo) => {
                      const lista = Array.isArray(incidenciaSeleccionada.firmas) ? incidenciaSeleccionada.firmas : [];
                      const f = lista.find(item => item.tipo_firma && item.tipo_firma.trim() === tipo);
                      const tieneImg = f?.firma && String(f.firma).startsWith('data:image');
                      return (
                        <div key={tipo} className="firma-card" style={{ minHeight: '180px', justifyContent: 'space-between' }}>
                          <div className="firma-card-label" style={{ color: '#1e3a8a' }}>{tipo}</div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}>
                            {tieneImg ? (
                              <img src={f.firma} alt={tipo} style={{ maxHeight: '75px', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>{f?.firma || 'Sin firma registrada'}</span>
                            )}
                          </div>
                          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>
                            {f?.nombre_firmante || (tipo === 'Solicita' ? incidenciaSeleccionada.nombre : 'Nombre y Cargo')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            <div className="modal-preview-footer">
              <button type="button" className="btn btn-primary" onClick={() => handleGenerarPDF(incidenciaSeleccionada)}>
                <Printer size={16} /> Imprimir / Guardar PDF
              </button>
              <button type="button" className="btn" style={{ background: '#e2e8f0', color: '#334155' }} onClick={() => setModalVistaPrevia(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazo */}
      {modalRechazo && incidenciaSeleccionada && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Rechazar Incidencia ({incidenciaSeleccionada.folio})</strong>
              <span style={{ cursor: 'pointer' }} onClick={() => setModalRechazo(false)}>&times;</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Motivo del Rechazo</label>
                <textarea rows={3} className="form-textarea" placeholder="Escribe el motivo..." value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn" style={{ background: 'var(--surface-alt)' }} onClick={() => setModalRechazo(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={() => handleCambiarEstado(incidenciaSeleccionada, 'Rechazada', motivoRechazo)}>Confirmar Rechazo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}