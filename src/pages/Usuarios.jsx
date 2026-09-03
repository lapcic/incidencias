import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, UserPlus, CheckCircle, XCircle, Pencil, Key, Search, Lock } from 'lucide-react';

export default function Usuarios() {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Modales
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);

  // Formulario Crear
  const [formCrear, setFormCrear] = useState({
    nombre: '',
    usuario: '',
    password: '',
    puesto: '',
    id_sucursal: '', // Usar id_sucursal
    horario: '',
    fecha_nacimiento: '',
    activo: 1
  });

  // Formulario Editar
  const [formEditar, setFormEditar] = useState({
    id_empleado: '',
    nombre: '',
    usuario: '',
    password: '',
    puesto: '',
    id_sucursal: '', // Usar id_sucursal
    horario: '',
    fecha_nacimiento: '',
    activo: 1
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

  // Crear Empleado
  const handleCrearSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createEmpleado(formCrear);
      if (res.id_empleado || res.mensaje) {
        setShowModalCrear(false);
        setFormCrear({
          nombre: '',
          usuario: '',
          password: '',
          puesto: '',
          id_sucursal: '',
          horario: '',
          fecha_nacimiento: '',
          activo: 1
        });
        cargarEmpleados();
      } else {
        alert(res.error || 'Error al registrar.');
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
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
      id_sucursal: emp.id_sucursal || '', // Carga correctamente el ID numérico al abrir el modal
      horario: emp.horario,
      fecha_nacimiento: emp.fecha_nacimiento,
      activo: parseInt(emp.activo, 10)
    });
    setShowModalEditar(true);
  };

  // Guardar Edición
  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateEmpleado(formEditar);
      if (res.mensaje) {
        setShowModalEditar(false);
        cargarEmpleados();
        alert('Actualizado correctamente');
      } else {
        alert(res.error || 'Error al actualizar.');
      }
    } catch (error) {
      alert('Error de conexión.');
    }
  };

  // Cambio rápido de Estado (Activo / Inactivo) con un clic
  const handleToggleEstado = async (emp) => {
    const nuevoEstado = emp.activo == 1 ? 0 : 1;
    try {
      const res = await api.updateEmpleado({
        id_empleado: emp.id_empleado,
        nombre: emp.nombre,
        usuario: emp.usuario,
        puesto: emp.puesto,
        id_sucursal: emp.id_sucursal,
        horario: emp.horario,
        fecha_nacimiento: emp.fecha_nacimiento,
        activo: nuevoEstado
      });
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
        <table className="custom-table">
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
                  <td style={{ fontWeight: 700 }}>#{emp.id_empleado}</td>
                  <td><strong>{emp.nombre}</strong></td>
                  <td style={{ color: 'var(--color-azul-principal)', fontWeight: 600 }}>
                    {emp.usuario || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin usuario</span>}
                  </td>
                  <td>{emp.puesto}</td>
                  <td>{emp.sucursal}</td>
                  <td>{emp.horario}</td>
                  <td>{emp.fecha_nacimiento}</td>
                  <td style={{ textAlign: 'center' }}>
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
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-btn-group">
                      <button
                        type="button"
                        className="icon-btn icon-btn-edit"
                        title="Editar Datos / Contraseña"
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

      {/* REGISTRAR NUEVO EMPLEADO */}
      {showModalCrear && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--color-azul-principal)' }}>Registrar Nuevo Empleado</strong>
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

              <div className="form-group">
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-limpiar" onClick={() => setShowModalCrear(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EMPLEADO */}
      {showModalEditar && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--color-azul-principal)' }}>Editar Empleado (#{formEditar.id_empleado})</strong>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-limpiar" onClick={() => setShowModalEditar(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}