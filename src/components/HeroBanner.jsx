import React from 'react';
import { Calendar, FileText, Bot, Shield, Sparkles } from 'lucide-react';

export default function HeroBanner({ totalCitas, onOpenChat, onOpenAgendarManual }) {
  return (
    <div className="hero-banner">
      <h1 className="hero-title">
        Bienvenido a <span>VerdeSalud</span> Digital
      </h1>

      <p className="hero-subtitle">
        Portal hospitalario con <strong>Asistente Conversacional</strong> y <strong>Agente Autónomo de IA</strong> para
        agendamiento de citas y acceso a tu historial clínico sobre arquitectura serverless en la nube.
      </p>

      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
        <button
          id="btn-hero-copilot"
          className="btn-primary"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.95rem' }}
          onClick={() => onOpenChat()}
        >
          <Bot size={18} />
          <span>Hablar con Copiloto IA (Asistente & Agente)</span>
        </button>

        <button
          id="btn-hero-manual"
          className="btn-secondary"
          style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          onClick={() => onOpenAgendarManual()}
        >
          <Calendar size={18} />
          <span>Agendar Cita Manualmente</span>
        </button>
      </div>

      <div className="hero-stats-grid">
        <div className="hero-stat-card">
          <div className="hero-stat-icon">
            <Calendar size={20} />
          </div>
          <div>
            <div className="hero-stat-val">{totalCitas} Activa(s)</div>
            <div className="hero-stat-lbl">Tus Citas Médicas</div>
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="hero-stat-icon">
            <Bot size={20} />
          </div>
          <div>
            <div className="hero-stat-val">Tool Calling</div>
            <div className="hero-stat-lbl">Agente Autónomo</div>
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="hero-stat-icon">
            <FileText size={20} />
          </div>
          <div>
            <div className="hero-stat-val">100% Digital</div>
            <div className="hero-stat-lbl">Historial Clínico</div>
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="hero-stat-icon">
            <Shield size={20} />
          </div>
          <div>
            <div className="hero-stat-val">Ley 1581 (2012)</div>
            <div className="hero-stat-lbl">Protección de Datos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
