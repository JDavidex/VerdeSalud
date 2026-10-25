import React, { useState } from 'react';
import { Stethoscope, MapPin, Calendar, Clock, Search, ArrowRight } from 'lucide-react';

export default function MedicosDirectory({ medicos, onSelectMedicoParaCita }) {
  const [filtro, setFiltro] = useState('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('Todas');

  const especialidades = ['Todas', ...Array.from(new Set(medicos.map(m => m.especialidad)))];

  const medicosFiltrados = medicos.filter(m => {
    const coincideTexto = m.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                          m.especialidad.toLowerCase().includes(filtro.toLowerCase()) ||
                          m.sede.toLowerCase().includes(filtro.toLowerCase());
    const coincideEsp = especialidadSeleccionada === 'Todas' || m.especialidad === especialidadSeleccionada;
    return coincideTexto && coincideEsp;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Stethoscope size={22} color="var(--primary-600)" />
            <span>Directorio Médico y Especialidades</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
            Consulta los profesionales de la salud adscritos a VerdeSalud y sus horarios disponibles
          </p>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--neutral-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Buscar por médico, especialidad o sede..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {especialidades.map(esp => (
            <button
              key={esp}
              className={`chip-btn ${especialidadSeleccionada === esp ? 'active' : ''}`}
              style={{
                background: especialidadSeleccionada === esp ? 'var(--primary-600)' : 'white',
                color: especialidadSeleccionada === esp ? 'white' : 'var(--neutral-700)',
                borderColor: especialidadSeleccionada === esp ? 'var(--primary-600)' : 'var(--neutral-300)'
              }}
              onClick={() => setEspecialidadSeleccionada(esp)}
            >
              {esp}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Médicos */}
      <div className="medicos-grid">
        {medicosFiltrados.map((m) => (
          <div key={m.id} className="medico-card">
            <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div className="medico-avatar-wrap">
                <img src={m.foto} alt={m.nombre} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>{m.nombre}</h4>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-700)' }}>{m.especialidad}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>{m.registroMedico}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="var(--primary-600)" />
                <span>{m.sede}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} color="var(--primary-600)" />
                <span>Atención: {m.diasAtencion.join(', ')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Clock size={14} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontWeight: 600 }}>Horarios:</span>
                  <div className="horarios-pill-wrap">
                    {m.horariosDisponibles.map((h, i) => (
                      <span key={i} className="horario-pill">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', fontSize: '0.82rem', padding: '0.5rem' }}
              onClick={() => onSelectMedicoParaCita(m)}
            >
              <span>Agendar con este médico</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
