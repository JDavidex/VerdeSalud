import React from 'react';
import { Activity, ShieldCheck, UserCheck, CloudLightning, Stethoscope } from 'lucide-react';

export default function Navbar({ pacienteActual, setPacienteActual, listaPacientes }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-logo-icon">
            <Activity size={24} />
          </div>
          <div>
            <div className="brand-title">
              VerdeSalud <span style={{ color: 'var(--primary-600)', fontSize: '1rem' }}>✦</span>
            </div>
          </div>
        </div>

        {/* Status y Selector de Usuario para la Demo */}
        <div className="nav-actions">
          {/* Selector de Paciente */}
          <div className="user-selector-card">
            <div className="user-avatar">
              <UserCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--neutral-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                Paciente Demo
              </div>
              <select
                id="select-paciente-demo"
                className="user-select"
                value={pacienteActual.cedula}
                onChange={(e) => {
                  const seleccionado = listaPacientes.find(p => p.cedula === e.target.value);
                  if (seleccionado) setPacienteActual(seleccionado);
                }}
              >
                {listaPacientes.map((p) => (
                  <option key={p.cedula} value={p.cedula}>
                    {p.nombre} (C.C. {p.cedula})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
