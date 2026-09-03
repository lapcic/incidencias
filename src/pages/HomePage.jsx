import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import AlertaCorteYAccion from '../components/AlertaCorteYAccion';
import { 
  Users, 
  FileText, 
  Clock3, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function HomePage() {
  const [sesion, setSesion] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesionActual = JSON.parse(localStorage.getItem('sesion_incidencias'));
    setSesion(sesionActual);

    const cargarDatos = async () => {
      try {
        const [resInc, resEmp] = await Promise.all([
          api.getIncidencias(),
          api.getEmpleados()
        ]);
        
        let listaInc = Array.isArray(resInc) ? resInc : [];
        
        // Si es empleado, filtrar solo sus incidencias personales
        if (sesionActual && sesionActual.rol === 'Empleado') {
          listaInc = listaInc.filter(i => i.id_empleado.toString() === sesionActual.id_empleado.toString());
        }

        setIncidencias(listaInc);
        setEmpleados(Array.isArray(resEmp) ? resEmp : []);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const totalIncidencias = incidencias.length;
  const pendientes = incidencias.filter(i => i.estado === 'Pendiente').length;
  const autorizadas = incidencias.filter(i => i.estado === 'Autorizada').length;
  const rechazadas = incidencias.filter(i => i.estado === 'Rechazada').length;
  const totalEmpleados = empleados.length;
  const sucursalesUnicas = new Set(empleados.map(e => e.sucursal)).size;

  const getBadge = (estado) => {
    if (estado === 'Autorizada') return <span className="badge badge-autorizada"><CheckCircle2 size={12}/> Autorizada</span>;
    if (estado === 'Rechazada') return <span className="badge badge-rechazada"><XCircle size={12}/> Rechazada</span>;
    return <span className="badge badge-pendiente"><Clock3 size={12}/> Pendiente</span>;
  };

  const esRH = sesion?.rol === 'RH';

  return (
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <AlertaCorteYAccion />
     
      {/* 1. El Banner superior solo aparece si es Administrador RH */}
      {/*esRH && (
        <div className="banner-dashboard">
          <div>
            <h2>Formato de Solicitud de Incidencias</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/nueva-incidencia" className="btn btn-white">
              <PlusCircle size={16} /> Solicitar Incidencia
            </Link>
            <Link to="/usuarios" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              <Users size={16} /> Empleados
            </Link>
          </div>
        </div>
      )*/}

      {/* 2. Las 5 Tarjetas de Métricas solo aparecen si es Administrador RH */}
      {esRH && (
        <div className="grid-metrics-5">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="metric-title">Empleados</div>
              <div className="metric-value">{cargando ? '...' : totalEmpleados}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{sucursalesUnicas} sucursales</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Clock3 size={22} />
            </div>
            <div>
              <div className="metric-title">Pendientes</div>
              <div className="metric-value" style={{ color: '#d97706' }}>{cargando ? '...' : pendientes}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Por validar o autorizar</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="metric-title">Autorizadas</div>
              <div className="metric-value" style={{ color: '#059669' }}>{cargando ? '...' : autorizadas}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Aprobadas por RH</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#fff1f2', color: '#be123c' }}>
              <XCircle size={22} />
            </div>
            <div>
              <div className="metric-title">Rechazadas</div>
              <div className="metric-value" style={{ color: '#be123c' }}>{cargando ? '...' : rechazadas}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>No procedentes</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#fdf4ff', color: '#7c3aed' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="metric-title">Total de Folios</div>
              <div className="metric-value" style={{ color: '#7c3aed' }}>{cargando ? '...' : totalIncidencias}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Registros globales</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tabla de Solicitudes Recientes (Visible para RH y Empleados) */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-texto-principal)' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            Solicitudes Recientes
          </h3>
          <Link to="/historial" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>EMPLEADO</th>
                <th>INCIDENCIA</th>
                <th>FECHA</th>
                <th style={{ textAlign: 'center' }}>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Cargando registros...</td></tr>
              ) : incidencias.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)' }}>No hay solicitudes registradas.</td></tr>
              ) : (
                incidencias.slice(0, 5).map((inc) => (
                  <tr key={inc.id_incidencia}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{inc.folio}</td>
                    <td>
                      <strong>{inc.nombre}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{inc.sucursal}</div>
                    </td>
                    <td>{inc.tipo_incidencia}</td>
                    <td>{inc.fecha_incidencia}</td>
                    <td style={{ textAlign: 'center' }}>{getBadge(inc.estado)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}