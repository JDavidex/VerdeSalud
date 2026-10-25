import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle, PlusCircle, Trash2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CitasList({
  citas,
  onCancelarCita,
  onCrearCitaManual,
  medicos,
  isModalOpen,
  setIsModalOpen,
  pacienteActual
}) {
  // Formulario manual
  const [formData, setFormData] = useState({
    medicoId: medicos[0]?.id || '',
    especialidad: medicos[0]?.especialidad || 'Medicina General',
    fecha: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    hora: '09:00 AM',
    motivo: 'Consulta médica general'
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const medicoSeleccionado = medicos.find(m => m.id === formData.medicoId) || medicos[0];
    onCrearCitaManual({
      ...formData,
      pacienteCedula: pacienteActual.cedula,
      pacienteNombre: pacienteActual.nombre,
      medicoNombre: medicoSeleccionado.nombre,
      especialidad: medicoSeleccionado.especialidad,
      sede: medicoSeleccionado.sede
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignorar si no está disponible
    }

    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Calendar size={22} color="var(--primary-600)" />
            <span>Mis Citas Médicas Programadas</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
            Citas activas asociadas a {pacienteActual.nombre} (C.C. {pacienteActual.cedula})
          </p>
        </div>

        <button
          id="btn-agendar-manual-trigger"
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span>Nueva Cita (Manual)</span>
        </button>
      </div>

      {citas.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Calendar size={48} color="var(--neutral-300)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--neutral-700)', marginBottom: '0.5rem' }}>
            No tienes citas activas programadas
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
            Puedes pedirle a nuestro <strong>Agente de IA</strong> en el chat que te programe una cita al instante o usar el botón manual.
          </p>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={16} /> Agendar Cita Manualmente
          </button>
        </div>
      ) : (
        <div className="citas-grid">
          {citas.map((cita) => (
            <div key={cita.id} className="cita-card">
              <div className="cita-card-header">
                <span className="cita-badge-id">{cita.id}</span>
                <span className={`status-badge ${cita.estado.toLowerCase()}`}>
                  <CheckCircle2 size={13} />
                  {cita.estado}
                </span>
              </div>

              <div className="cita-especialidad">{cita.especialidad}</div>
              <div className="cita-medico">
                <User size={15} />
                <span>{cita.medicoNombre}</span>
              </div>

              <div className="cita-details-list">
                <div className="cita-detail-row">
                  <Calendar size={15} color="var(--primary-600)" />
                  <span><strong>Fecha:</strong> {cita.fecha}</span>
                </div>
                <div className="cita-detail-row">
                  <Clock size={15} color="var(--primary-600)" />
                  <span><strong>Hora:</strong> {cita.hora}</span>
                </div>
                <div className="cita-detail-row">
                  <MapPin size={15} color="var(--primary-600)" />
                  <span><strong>Lugar:</strong> {cita.sede}</span>
                </div>
                <div className="cita-detail-row" style={{ marginTop: '0.35rem' }}>
                  <AlertCircle size={15} color="var(--neutral-400)" />
                  <span><em>{cita.motivo}</em></span>
                </div>
              </div>

              <div className="cita-card-actions">
                <div className="source-tag">
                  Agendado vía: <strong>{cita.agendadoPor || 'Agente IA'}</strong>
                </div>

                {confirmDeleteId === cita.id ? (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn-outline-danger"
                      style={{ background: '#dc2626', color: 'white', borderColor: '#dc2626' }}
                      onClick={() => {
                        onCancelarCita(cita.id);
                        setConfirmDeleteId(null);
                      }}
                    >
                      Sí, Cancelar
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Volver
                    </button>
                  </div>
                ) : (
                  <button
                    id={`btn-cancelar-${cita.id}`}
                    className="btn-outline-danger"
                    onClick={() => setConfirmDeleteId(cita.id)}
                  >
                    <Trash2 size={14} />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA AGENDAR MANUALMENTE (RNF3 - ALTA DISPONIBILIDAD) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Calendar size={20} color="var(--primary-600)" />
                <span>Agendar Cita Médica (Formulario Manual)</span>
              </div>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Paciente Titular</label>
                <input
                  type="text"
                  className="form-input"
                  value={`${pacienteActual.nombre} (C.C. ${pacienteActual.cedula})`}
                  disabled
                  style={{ background: 'var(--neutral-100)', color: 'var(--neutral-600)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Especialista y Consultorio</label>
                <select
                  className="form-select"
                  value={formData.medicoId}
                  onChange={(e) => {
                    const sel = medicos.find(m => m.id === e.target.value);
                    setFormData({
                      ...formData,
                      medicoId: e.target.value,
                      especialidad: sel ? sel.especialidad : formData.especialidad
                    });
                  }}
                  required
                >
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} — {m.especialidad} ({m.sede.split('-')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Fecha de Cita</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <select
                    className="form-select"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    required
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo de la Consulta</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ej. Chequeo de rutina, dolor lumbar, revisión de resultados..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirmar-agendamiento-manual"
                  type="submit"
                  className="btn-primary"
                >
                  <CheckCircle2 size={16} /> Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
