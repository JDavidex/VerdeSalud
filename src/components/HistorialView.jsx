import React from 'react';
import { FileText, Activity, Pill, FlaskConical, Stethoscope, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function HistorialView({ historial, pacienteActual }) {
  const { diagnosticos = [], formulas = [], examenes = [] } = historial || {};

  return (
    <div className="historial-container">
      {/* Tarjeta de Seguridad y Aviso de Privacidad */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <ShieldCheck size={26} color="var(--primary-600)" />
        <div style={{ fontSize: '0.84rem', color: 'var(--primary-900)' }}>
          <strong>Acceso Seguro a Datos de Salud:</strong> Información clínica confidencial amparada bajo la Ley 1581 de 2012 y normatividad de historias clínicas de Colombia. Solo visible para el paciente autenticado: <strong>{pacienteActual.nombre}</strong> (C.C. {pacienteActual.cedula}).
        </div>
      </div>

      {/* 1. DIAGNÓSTICOS CLÍNICOS */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Stethoscope size={20} color="var(--primary-600)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
            Diagnósticos y Evolución Médica
          </h3>
        </div>

        {diagnosticos.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>No hay diagnósticos registrados para este paciente.</p>
        ) : (
          <div>
            {diagnosticos.map((dx) => (
              <div key={dx.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-header">
                  <div className="timeline-title">{dx.diagnostico}</div>
                  <span className="timeline-date">{dx.fecha}</span>
                </div>
                <div className="timeline-meta">
                  Código CIE-10: <strong>{dx.codigoCIE10}</strong> • Atendido por: {dx.medico} ({dx.especialidad})
                </div>
                <div className="timeline-desc">
                  {dx.observaciones}
                  <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    Estado actual: <span style={{ color: dx.estado === 'Resuelto' ? 'var(--primary-600)' : '#d97706' }}>{dx.estado}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. FÓRMULAS MÉDICAS */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Pill size={20} color="var(--primary-600)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
            Fórmulas y Medicamentos Prescritos
          </h3>
        </div>

        {formulas.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>No hay recetas o fórmulas activas registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Medicamento</th>
                  <th>Dosis / Posología</th>
                  <th>Médico Prescriptor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {formulas.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{f.fecha}</td>
                    <td style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{f.medicamento}</td>
                    <td>{f.posologia}</td>
                    <td style={{ color: 'var(--primary-700)' }}>{f.medico}</td>
                    <td>
                      <span className={`badge-tag ${f.estado === 'Vigente' ? 'badge-green' : 'badge-amber'}`}>
                        {f.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. EXÁMENES Y RESULTADOS DE LABORATORIO */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <FlaskConical size={20} color="var(--primary-600)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
            Resultados de Laboratorio Clínico
          </h3>
        </div>

        {examenes.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>No hay exámenes de laboratorio en el registro de este paciente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {examenes.map((ex) => (
              <div key={ex.id} style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--neutral-900)' }}>
                    {ex.tipo}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neutral-500)' }}>
                    📅 {ex.fecha} • {ex.laboratorio}
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="data-table" style={{ background: 'var(--neutral-50)', borderRadius: 'var(--radius-sm)' }}>
                    <thead>
                      <tr>
                        <th>Parámetro Analizado</th>
                        <th>Resultado Obtenido</th>
                        <th>Rango de Referencia</th>
                        <th>Evaluación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.resultados.map((r, i) => (
                        <tr key={i}>
                          <td>{r.parametro}</td>
                          <td style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{r.valor}</td>
                          <td style={{ color: 'var(--neutral-500)' }}>{r.referencia}</td>
                          <td>
                            <span className="badge-tag badge-green">
                              {r.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--neutral-600)', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid var(--primary-500)' }}>
                  <strong>Interpretación Clínica:</strong> {ex.interpretacion}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
