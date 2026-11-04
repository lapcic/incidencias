import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { Users, UserPlus, CheckCircle, XCircle, Pencil, Search } from 'lucide-react';

export default function Usuarios() {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Modales
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);

  // Formulario Crear (Incluyendo todos los documentos)
  const [formCrear, setFormCrear] = useState({
    nombre: '',
    usuario: '',
    password: '',
    puesto: '',
    id_sucursal: '',
    horario: '',
    fecha_nacimiento: '',
    activo: 1,
    ine: null,
    curp: null,
    rfc: null,
    acta_nacimiento: null,
    comprobante_domicilio: null,
    nss: null,
    estudios: null,
    cedula_profesional: null,
    solicitud_trabajo: null,
    cartas_recomendacion: null,
    cv: null,
    carta_antecedentes: null,
    fotografia: null
  });

  // Formulario Editar
  const [formEditar, setFormEditar] = useState({
    id_empleado: '',
    nombre: '',
    usuario: '',
    password: '',
    puesto: '',
    id_sucursal: '',
    horario: '',
    fecha_nacimiento: '',
    activo: 1,
    ine: null,
    curp: null,
    rfc: null,
    acta_nacimiento: null,
    comprobante_domicilio: null,
    nss: null,
    estudios: null,
    cedula_profesional: null,
    solicitud_trabajo: null,
    cartas_recomendacion: null,
    cv: null,
    carta_antecedentes: null,
    fotografia: null
  });

  const cargarEmpleados = async () => {
    try {
      setCargando(true);
      const data = await api.getEmpleados();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Tamaño máximo por archivo (debe ser menor que upload_max_filesize de PHP)
  const MAX_MB = 5;

  const seleccionarArchivo = (e, campo, formState, setFormState) => {
    const archivo = e.target.files[0] || null;
    if (archivo && archivo.size > MAX_MB * 1024 * 1024) {
      alert(`El archivo "${archivo.name}" pesa más de ${MAX_MB} MB.`);
      e.target.value = '';
      setFormState({ ...formState, [campo]: null });
      return;
    }
    setFormState({ ...formState, [campo]: archivo });
  };

  // Mensaje final según el resultado de Drive que devuelve la API
  const mensajeDrive = (res, textoOk) => {
    const errores = res.drive_errores ? Object.entries(res.drive_errores) : [];
    if (res.advertencia_drive) {
      return `Los datos se guardaron, pero NO se pudo subir el expediente a Google Drive:\n${res.advertencia_drive}`;
    }
    if (errores.length > 0) {
      return `Los datos se guardaron, pero algunos documentos fallaron:\n` +
        errores.map(([campo, msg]) => `• ${campo}: ${msg}`).join('\n');
    }
    return textoOk;
  };

  // Función auxiliar robusta para adjuntar todos los campos a un FormData
  const appendFormData = (formObj) => {
    const formData = new FormData();
    
    // Forzar explícitamente el id_empleado si existe
    if (formObj.id_empleado) {
      formData.append('id_empleado', formObj.id_empleado);
    }

    Object.keys(formObj).forEach(key => {
      if (key !== 'id_empleado' && formObj[key] !== null && formObj[key] !== undefined && formObj[key] !== '') {
        formData.append(key, formObj[key]);
      }
    });

    return formData;
  };

  // Crear Empleado utilizando el servicio api.js
  const handleCrearSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = appendFormData(formCrear);
      const res = await api.createEmpleado(formData);

      if (res.id_empleado || res.mensaje) {
        setShowModalCrear(false);
        setFormCrear({
          nombre: '', usuario: '', password: '', puesto: '', id_sucursal: '',
          horario: '', fecha_nacimiento: '', activo: 1,
          ine: null, curp: null, rfc: null, acta_nacimiento: null,
          comprobante_domicilio: null, nss: null, estudios: null,
          cedula_profesional: null, solicitud_trabajo: null,
          cartas_recomendacion: null, cv: null, carta_antecedentes: null, fotografia: null
        });
        cargarEmpleados();
        alert(mensajeDrive(res, '¡Empleado registrado y expediente subido a Google Drive exitosamente!'));
      } else {
        alert(`${res.detalle ? `${res.error}\n${res.detalle}` : (res.error || 'Error al registrar.')}\n\n(Servidor usado: ${API_BASE_URL})`);
      }
    } catch (error) {
      console.error(error);
      alert(`Error de conexión con el servidor: ${error.message}`);
    }
  };

  // Abrir Modal de Edición
  const handleAbrirEditar = (emp) => {
    setFormEditar({
      id_empleado: emp.id_empleado,
      nombre: emp.nombre,
      usuario: emp.usuario || '',
      password: '',
      puesto: emp.puesto,
      id_sucursal: emp.id_sucursal || '',
      horario: emp.horario,
      fecha_nacimiento: emp.fecha_nacimiento,
      activo: parseInt(emp.activo, 10),
      ine: null, curp: null, rfc: null, acta_nacimiento: null,
      comprobante_domicilio: null, nss: null, estudios: null,
      cedula_profesional: null, solicitud_trabajo: null,
      cartas_recomendacion: null, cv: null, carta_antecedentes: null, fotografia: null
    });
    setShowModalEditar(true);
  };

  // Guardar Edición utilizando el servicio api.js
  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = appendFormData(formEditar);
      const res = await api.updateEmpleado(formData);

      if (res.mensaje) {
        setShowModalEditar(false);
        cargarEmpleados();
        alert(mensajeDrive(res, 'Actualizado y expediente sincronizado correctamente en Google Drive'));
      } else {
        alert(`${res.error || 'Error al actualizar.'}\n\n(Servidor usado: ${API_BASE_URL})` + (res.debug ? `\n\nDEBUG:\n${JSON.stringify(res.debug, null, 2)}` : ''));
      }
    } catch (error) {
      console.error(error);
      alert(`Error de conexión con el servidor: ${error.message}`);
    }
  };

  // Cambio rápido de Estado (Activo / Inactivo)
  const handleToggleEstado = async (emp) => {
    const nuevoEstado = emp.activo == 1 ? 0 : 1;
    try {
      const formData = new FormData();
      formData.append('id_empleado', emp.id_empleado);
      formData.append('nombre', emp.nombre);
      formData.append('usuario', emp.usuario || '');
      formData.append('puesto', emp.puesto);
      formData.append('id_sucursal', emp.id_sucursal);
      formData.append('horario', emp.horario);
      formData.append('fecha_nacimiento', emp.fecha_nacimiento);
      formData.append('activo', nuevoEstado);

      const res = await api.updateEmpleado(formData);
      if (res.mensaje) {
        cargarEmpleados();
      }
    } catch (error) {
      alert('Error al cambiar el estado.');
    }
  };

  const empleadosFiltrados = empleados.filter(emp =>
    (emp.nombre && emp.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (emp.usuario && emp.usuario.toLowerCase().includes(busqueda.toLowerCase())) ||
    (emp.puesto && emp.puesto.toLowerCase().includes(busqueda.toLowerCase())) ||
    (emp.sucursal && emp.sucursal.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Campos de documentos
  const renderCamposDocumentos = (formState, setFormState) => (
    <div style={{ marginTop: '1.5rem', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
      <p style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--color-azul-principal)', fontSize: '1rem' }}>
        📁 Expediente Completo
      </p>

      <div className="form-grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">INE / Identificación</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'ine', formState, setFormState)} />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">CURP</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'curp', formState, setFormState)} />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">RFC</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'rfc', formState, setFormState)} />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Acta de Nacimiento</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'acta_nacimiento', formState, setFormState)} />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Comprobante de Domicilio</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'comprobante_domicilio', formState, setFormState)} />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Número de Seguro Social (NSS)</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'nss', formState, setFormState)} />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Título o Certificado de Estudios</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'estudios', formState, setFormState)} />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Cédula Profesional (Opcional)</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'cedula_profesional', formState, setFormState)} />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Solicitud de Trabajo</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'solicitud_trabajo', formState, setFormState)} />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">2 Cartas de Recomendación</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'cartas_recomendacion', formState, setFormState)} />
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'cartas_recomendacion', formState, setFormState)} />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">CV (Currículum)</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'cv', formState, setFormState)} />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Carta de Antecedentes</label>
          <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'carta_antecedentes', formState, setFormState)} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label">Fotografía</label>
        <input type="file" className="form-input" onChange={(e) => seleccionarArchivo(e, 'fotografia', formState, setFormState)} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <Users size={22} style={{ color: 'var(--color-azul-principal)' }} />
            Personal Registrado
          </h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModalCrear(true)}>
          <UserPlus size={16} /> Nuevo Empleado
        </button>
      </div>

      {/* Buscador */}
      <div style={{ display: 'flex', gap: '1rem', maxWidth: '400px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por nombre, usuario, puesto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de Empleados */}
      <div className="table-container">
        <table className="custom-table usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Puesto</th>
              <th>Sucursal</th>
              <th>Horario</th>
              <th>Fecha de Nacimiento</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Cargando empleados...</td></tr>
            ) : empleadosFiltrados.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No hay registros disponibles.</td></tr>
            ) : (
              empleadosFiltrados.map((emp) => (
                <tr key={emp.id_empleado}>
                  <td data-label="ID" style={{ fontWeight: 700 }}>#{emp.id_empleado}</td>
                  <td data-label="Nombre"><strong>{emp.nombre}</strong></td>
                  <td data-label="Usuario" style={{ color: 'var(--color-azul-principal)', fontWeight: 600 }}>
                    {emp.usuario || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin usuario</span>}
                  </td>
                  <td data-label="Puesto">{emp.puesto}</td>
                  <td data-label="Sucursal">{emp.sucursal}</td>
                  <td data-label="Horario">{emp.horario}</td>
                  <td data-label="Fecha de nacimiento">{emp.fecha_nacimiento}</td>
                  <td data-label="Estado" style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(emp)}
                      title="Haz clic para alternar Activo/Inactivo"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      {emp.activo == 1 ? (
                        <span className="badge badge-autorizada"><CheckCircle size={12} /> Activo</span>
                      ) : (
                        <span className="badge badge-rechazada"><XCircle size={12} /> Inactivo</span>
                      )}
                    </button>
                  </td>
                  <td data-label="Acciones" style={{ textAlign: 'center' }}>
                    <div className="action-btn-group">
                      <button
                        type="button"
                        className="icon-btn icon-btn-edit"
                        title="Editar Datos / Contraseña / Expediente"
                        onClick={() => handleAbrirEditar(emp)}
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL REGISTRAR NUEVO EMPLEADO */}
      {showModalCrear && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--color-azul-principal)' }}>Registrar Nuevo Empleado y Expediente</strong>
              <span style={{ cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }} onClick={() => setShowModalCrear(false)}>&times;</span>
            </div>
            <form onSubmit={handleCrearSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  className="form-input"
                  type="text"
                  value={formCrear.nombre}
                  onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Usuario</label>
                  <input
                    className="form-input"
                    type="text"
                    autoComplete="username"
                    value={formCrear.usuario}
                    onChange={(e) => setFormCrear({ ...formCrear, usuario: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Contraseña inicial"
                    autoComplete="new-password"
                    value={formCrear.password}
                    onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Puesto</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formCrear.puesto}
                    onChange={(e) => setFormCrear({ ...formCrear, puesto: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sucursal</label>
                  <select
                    className="form-select"
                    value={formCrear.id_sucursal}
                    onChange={(e) => setFormCrear({ ...formCrear, id_sucursal: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccione Sucursal --</option>
                    <option value="1">Matriz</option>
                    <option value="2">Galereña</option>
                    <option value="3">Centro medico la presa</option>
                    <option value="4">Cantador</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Horario Base</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Ej. 7:30 - 3:00"
                    value={formCrear.horario}
                    onChange={(e) => setFormCrear({ ...formCrear, horario: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input
                    className="form-input"
                    type="date"
                    value={formCrear.fecha_nacimiento}
                    onChange={(e) => setFormCrear({ ...formCrear, fecha_nacimiento: e.target.value })}
                    required
                  />
                </div>
              </div>

              {renderCamposDocumentos(formCrear, setFormCrear)}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Estado Inicial</label>
                <select
                  className="form-select"
                  value={formCrear.activo}
                  onChange={(e) => setFormCrear({ ...formCrear, activo: parseInt(e.target.value, 10) })}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-limpiar" onClick={() => setShowModalCrear(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar y Subir a Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EMPLEADO */}
      {showModalEditar && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--color-azul-principal)' }}>Editar Empleado (#{formEditar.id_empleado}) y Actualizar Expediente</strong>
              <span style={{ cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }} onClick={() => setShowModalEditar(false)}>&times;</span>
            </div>
            <form onSubmit={handleEditarSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  className="form-input"
                  type="text"
                  value={formEditar.nombre}
                  onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Usuario</label>
                  <input
                    className="form-input"
                    type="text"
                    autoComplete="username"
                    value={formEditar.usuario}
                    onChange={(e) => setFormEditar({ ...formEditar, usuario: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña (Opcional)</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Dejar vacío para no cambiar"
                    autoComplete="new-password"
                    value={formEditar.password}
                    onChange={(e) => setFormEditar({ ...formEditar, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Puesto</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formEditar.puesto}
                    onChange={(e) => setFormEditar({ ...formEditar, puesto: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sucursal</label>
                  <select
                    className="form-select"
                    value={formEditar.id_sucursal}
                    onChange={(e) => setFormEditar({ ...formEditar, id_sucursal: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccione Sucursal --</option>
                    <option value="1">Matriz</option>
                    <option value="2">Galereña</option>
                    <option value="3">Centro medico la presa</option>
                    <option value="4">Cantador</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Horario</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formEditar.horario}
                    onChange={(e) => setFormEditar({ ...formEditar, horario: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input
                    className="form-input"
                    type="date"
                    value={formEditar.fecha_nacimiento}
                    onChange={(e) => setFormEditar({ ...formEditar, fecha_nacimiento: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={formEditar.activo}
                  onChange={(e) => setFormEditar({ ...formEditar, activo: parseInt(e.target.value, 10) })}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>

              {renderCamposDocumentos(formEditar, setFormEditar)}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-limpiar" onClick={() => setShowModalEditar(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios y Actualizar Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}