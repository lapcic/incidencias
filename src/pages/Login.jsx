import React, { useState } from 'react';
import { api } from '../services/api';
import { LogIn } from 'lucide-react';
import logoLapcic from '../assets/logo-lapcic.png'; 

export default function Login({ onLoginSuccess }) {
  const [tipoAcceso, setTipoAcceso] = useState('RH'); // 'RH' | 'Empleado'
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await api.login({
        usuario,
        password,
        tipo_acceso: tipoAcceso
      });

      if (res.usuario) {
        localStorage.setItem('sesion_incidencias', JSON.stringify(res.usuario));
        onLoginSuccess(res.usuario);
      } else {
        setError(res.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError('Error al comunicarse con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-verde-claro)', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '2px solid var(--color-azul-principal)' }}>
        
        {/* Cabecera con Logotipo Oficial */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-block', width: '160px', marginBottom: '0.5rem' }}>
            <img 
              src={logoLapcic} 
              alt="LAPCIC Logo" 
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
            />
          </div>
         
        </div>

        {/* Selector de Rol */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: tipoAcceso === 'RH' ? 'var(--color-azul-principal)' : 'transparent',
              color: tipoAcceso === 'RH' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
            onClick={() => { setTipoAcceso('RH'); setError(''); }}
          >
            Recursos Humanos (RH)
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: tipoAcceso === 'Empleado' ? 'var(--color-azul-principal)' : 'transparent',
              color: tipoAcceso === 'Empleado' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
            onClick={() => { setTipoAcceso('Empleado'); setError(''); }}
          >
            Empleado
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Usuario</label>
            <input
              className="form-input"
              type="text"
              placeholder={tipoAcceso === 'RH' ? 'Ingresa tu usuario' : 'Ingresa tu usuario'}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={cargando}
            style={{ marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            <LogIn size={18} /> {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}