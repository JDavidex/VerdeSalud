import React from 'react';
import { Layers, Database, Cpu, ShieldCheck, Zap, Server, Bot, RefreshCw } from 'lucide-react';

export default function ArquitecturaView() {
  const patrones = [
    {
      patron: "Arquitectura en Capas (MVC)",
      icon: <Layers size={22} color="var(--primary-600)" />,
      donde: "Presentación (React), Lógica de Negocio (Serverless Functions), Datos (Repositories)",
      justificacion: "Separa responsabilidades y favorece la modularidad y el bajo acoplamiento del portal hospitalario."
    },
    {
      patron: "API Gateway / Fachada Serverless",
      icon: <Server size={22} color="var(--primary-600)" />,
      donde: "Punto de entrada /api/* en Vercel",
      justificacion: "Centraliza validación, CORS, parseo de peticiones y enrutamiento hacia los servicios del hospital sin gestionar servidores."
    },
    {
      patron: "Patrón Repository",
      icon: <Database size={22} color="var(--primary-600)" />,
      donde: "CitaRepository, HistorialRepository, MedicoRepository",
      justificacion: "Oculta los detalles del almacenamiento en memoria o base de datos. Si la BD cambia a PostgreSQL/MongoDB, solo se modifica el repositorio sin tocar los componentes de React."
    },
    {
      patron: "Tool Calling / Agente Orquestador",
      icon: <Bot size={22} color="var(--primary-600)" />,
      donde: "Agente IA (consultar_disponibilidad, agendar_cita, cancelar_cita, consultar_historial)",
      justificacion: "El modelo de lenguaje no modifica la BD arbitrariamente: solo puede invocar funciones controladas con validación previa de parámetros y seguridad clínica."
    },
    {
      patron: "Circuit Breaker & Fallback con Degradación",
      icon: <Zap size={22} color="var(--primary-600)" />,
      donde: "AgentService y motor de NLP local",
      justificacion: "Si el proveedor externo de IA presenta fallas o latencia alta, el portal continúa agendando mediante el motor local o el formulario manual (cumple RNF3)."
    },
    {
      patron: "Serverless Computing",
      icon: <RefreshCw size={22} color="var(--primary-600)" />,
      donde: "Vercel Functions (Node.js sin estado)",
      justificacion: "Escalado elástico automático con cobro por uso efectivo y cero administración de infraestructura (cumple RNF2)."
    }
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Layers size={22} color="var(--primary-600)" />
            <span>Arquitectura y Patrones del Sistema VerdeSalud</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
            Mapeo de principios arquitectónicos aplicados en el prototipo según el informe técnico de la actividad
          </p>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #e8f5e9)',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '0.4rem' }}>
          Distinción Arquitectónica: Asistente vs Agente de IA
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.65rem' }}>
          <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
            <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              💬 Asistente de IA (Informativo / Read-Only)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
              Responde dudas frecuentes en lenguaje natural: horarios del hospital, ubicación de sedes, canales de atención y preparación para exámenes clínicos. No altera el estado del sistema.
            </p>
          </div>

          <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              🤖 Agente de IA (Operativo / Action-Driven)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
              Interpreta intenciones y ejecuta herramientas autorizadas (Tool Calling): consulta disponibilidad en tiempo real, reserva o cancela citas y consulta historias clínicas de forma controlada.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Patrones de Diseño */}
      <div className="arch-grid">
        {patrones.map((p, idx) => (
          <div key={idx} className="arch-card">
            <div className="arch-card-title">
              {p.icon}
              <span>{p.patron}</span>
            </div>
            <div className="arch-card-subtitle">{p.donde}</div>
            <p className="arch-card-text">{p.justificacion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
