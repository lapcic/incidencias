import React, { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

export default function FirmaCard({ tipoFirma, obligatoria = true, data, onChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tab, setTab] = useState('dibujar'); // 'dibujar' | 'subir'

  // Configurar resolución del canvas
  useEffect(() => {
    if (tab === 'dibujar' && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [tab]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      onChange({ ...data, firma: canvas.toDataURL('image/png') });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, firma: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const borrarFirma = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange({ ...data, firma: '' });
  };

  return (
    <div className="firma-card">
      <div className="firma-card-label">
        {tipoFirma} {obligatoria && <span>*</span>}
      </div>

      <input
        type="text"
        className="form-input"
        placeholder="Nombre y cargo"
        value={data.nombre_firmante || ''}
        onChange={(e) => onChange({ ...data, nombre_firmante: e.target.value })}
      />

      <div className="firma-toggle-tabs">
        <button
          type="button"
          className={`firma-tab-btn ${tab === 'dibujar' ? 'active' : ''}`}
          onClick={() => setTab('dibujar')}
        >
          Dibujar
        </button>
        <button
          type="button"
          className={`firma-tab-btn ${tab === 'subir' ? 'active' : ''}`}
          onClick={() => setTab('subir')}
        >
          Subir
        </button>
      </div>

      <div className="firma-canvas-container">
        {tab === 'dibujar' ? (
          <canvas
            ref={canvasRef}
            className="firma-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        ) : (
          <label className="firma-upload-box">
            {data.firma && data.firma.startsWith('data:image') ? (
              <img src={data.firma} alt="Firma subida" className="firma-preview-img" />
            ) : (
              <>
                <Upload size={24} />
                <span>Haz clic para seleccionar imagen de firma</span>
              </>
            )}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        )}
      </div>

      <button type="button" className="btn-borrar-firma" onClick={borrarFirma}>
        Borrar firma
      </button>
    </div>
  );
}