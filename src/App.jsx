import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import CitasList from './components/CitasList.jsx';
import HistorialView from './components/HistorialView.jsx';
import MedicosDirectory from './components/MedicosDirectory.jsx';
import ArquitecturaView from './components/ArquitecturaView.jsx';
import ChatCopilot from './components/ChatCopilot.jsx';

import { PACIENTES_INICIALES, MEDICOS, CITAS_INICIALES, HISTORIALES_INICIALES } from './data/mockData.js';
import { Calendar, FileText, Stethoscope, Layers, MessageSquare, Bot, Sparkles, User, ShieldCheck } from 'lucide-react';

export default function App() {
  const [pacientes] = useState(PACIENTES_INICIALES);
  const [pacienteActual, setPacienteActual] = useState(PACIENTES_INICIALES[0]); // Julian David Carrillo Galvez
  const [medicos, setMedicos] = useState(MEDICOS);
  const [citas, setCitas] = useState([]);
  const [historial, setHistorial] = useState(null);
  const [tabActiva, setTabActiva] = useState('citas'); // 'citas', 'historial', 'medicos', 'arquitectura'
  
  // Estado del Chat Copiloto
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isModalManualOpen, setIsModalManualOpen] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Cargar datos de la API (o repositorios en fallback)
  const cargarDatos = async () => {
    try {
      // 1. Citas del paciente actual
      const resCitas = await fetch(`/api/citas?cedula=${pacienteActual.cedula}`);
      if (resCitas.ok) {
        const data = await resCitas.json();
        setCitas(data.citas || []);
      } else {
        // Fallback local
        const citasLocales = CITAS_INICIALES.filter(c => c.pacienteCedula === pacienteActual.cedula && c.estado !== 'Cancelada');
        setCitas(citasLocales);
      }

      // 2. Historial clínico
      const resHist = await fetch(`/api/historial?cedula=${pacienteActual.cedula}`);
      if (resHist.ok) {
        const data = await resHist.json();
        setHistorial(data.historial || HISTORIALES_INICIALES[pacienteActual.cedula]);
      } else {
        setHistorial(HISTORIALES_INICIALES[pacienteActual.cedula] || {
          pacienteCedula: pacienteActual.cedula,
          diagnosticos: [],
          formulas: [],
          examenes: []
        });
      }

      // 3. Médicos
      const resMed = await fetch('/api/medicos');
      if (resMed.ok) {
        const data = await resMed.json();
        if (data.medicos) setMedicos(data.medicos);
      }
    } catch (err) {
      console.warn('Usando fallback local para datos:', err);
      const citasLocales = CITAS_INICIALES.filter(c => c.pacienteCedula === pacienteActual.cedula && c.estado !== 'Cancelada');
      setCitas(citasLocales);
      setHistorial(HISTORIALES_INICIALES[pacienteActual.cedula] || null);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [pacienteActual.cedula]);

  // Cancelar cita médica
  const handleCancelarCita = async (citaId) => {
    try {
      await fetch(`/api/citas?id=${citaId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Cancelando cita en modo fallback:', err);
    }
    // Actualizar estado local inmediatamente
    setCitas(prev => prev.filter(c => c.id !== citaId));
  };

  // Crear cita manual (RNF3: Alta disponibilidad)
  const handleCrearCitaManual = async (nuevaCita) => {
    try {
      const resp = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCita)
      });
      if (resp.ok) {
        const data = await resp.json();
        setCitas(prev => [data.cita, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Guardando cita en modo fallback:', err);
    }

    const citaMock = {
      id: `CITA-${Math.floor(1000 + Math.random() * 9000)}`,
      fechaCreacion: new Date().toISOString(),
      estado: 'Confirmada',
      ...nuevaCita
    };
    setCitas(prev => [citaMock, ...prev]);
  };

  // Acción para agendar cita manual desde cualquier pestaña
  const handleOpenAgendarManual = () => {
    setTabActiva('citas');
    setIsModalManualOpen(true);
  };

  // Acción desde directorio médico para agendar con especialista
  const handleSelectMedicoParaCita = (medico) => {
    setTabActiva('citas');
    setIsModalManualOpen(true);
  };

  return (
    <div className="app-container">
      {/* NAVBAR SUPERIOR */}
      <Navbar
        pacienteActual={pacienteActual}
        setPacienteActual={setPacienteActual}
        listaPacientes={pacientes}
      />

      <main className="main-content">
        {/* HERO BANNER INSTITUCIONAL */}
        <HeroBanner
          totalCitas={citas.length}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenAgendarManual={handleOpenAgendarManual}
        />

        {/* DATOS DEL PACIENTE ACTIVO */}
        <div className="patient-badge-strip">
          <div className="patient-meta-list">
            <div className="patient-meta-item">
              <User size={16} color="var(--primary-600)" />
              <span>Paciente: <strong>{pacienteActual.nombre}</strong></span>
            </div>
            <div className="patient-meta-item">
              <span>Cédula: <strong>{pacienteActual.cedula}</strong></span>
            </div>
            <div className="patient-meta-item">
              <span>EPS: <strong>{pacienteActual.eps}</strong></span>
            </div>
            <div className="patient-meta-item">
              <span>Grupo: <strong>{pacienteActual.grupoSanguineo}</strong></span>
            </div>
            <div className="patient-meta-item">
              <span>Ciudad: <strong>{pacienteActual.ciudad}</strong></span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={16} /> Sesión Autenticada
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="tabs-nav">
          <button
            id="tab-citas"
            className={`tab-btn ${tabActiva === 'citas' ? 'active' : ''}`}
            onClick={() => setTabActiva('citas')}
          >
            <Calendar size={18} />
            <span>Mis Citas ({citas.length})</span>
          </button>

          <button
            id="tab-historial"
            className={`tab-btn ${tabActiva === 'historial' ? 'active' : ''}`}
            onClick={() => setTabActiva('historial')}
          >
            <FileText size={18} />
            <span>Historial Clínico</span>
          </button>

          <button
            id="tab-medicos"
            className={`tab-btn ${tabActiva === 'medicos' ? 'active' : ''}`}
            onClick={() => setTabActiva('medicos')}
          >
            <Stethoscope size={18} />
            <span>Especialistas & Médicos</span>
          </button>

          <button
            id="tab-arquitectura"
            className={`tab-btn ${tabActiva === 'arquitectura' ? 'active' : ''}`}
            onClick={() => setTabActiva('arquitectura')}
          >
            <Layers size={18} />
            <span>Arquitectura UML & Patrones</span>
          </button>
        </div>

        {/* VISTA ACTIVA */}
        {tabActiva === 'citas' && (
          <CitasList
            citas={citas}
            onCancelarCita={handleCancelarCita}
            onCrearCitaManual={handleCrearCitaManual}
            medicos={medicos}
            isModalOpen={isModalManualOpen}
            setIsModalOpen={setIsModalManualOpen}
            pacienteActual={pacienteActual}
          />
        )}

        {tabActiva === 'historial' && (
          <HistorialView
            historial={historial}
            pacienteActual={pacienteActual}
          />
        )}

        {tabActiva === 'medicos' && (
          <MedicosDirectory
            medicos={medicos}
            onSelectMedicoParaCita={handleSelectMedicoParaCita}
          />
        )}

        {tabActiva === 'arquitectura' && (
          <ArquitecturaView />
        )}
      </main>

      {/* BOTÓN FLOTANTE TRIGGER DEL COPILOTO IA */}
      {!isChatOpen && (
        <button
          id="btn-abrir-chat-copilot"
          className="chat-floating-trigger"
          onClick={() => setIsChatOpen(true)}
          title="Abrir Copiloto de IA VerdeSalud"
        >
          <Bot size={22} />
          <span>Copiloto VerdeSalud</span>
          <span className="chat-spark-badge">IA</span>
        </button>
      )}

      {/* WIDGET DEL CHAT COPILOT (ASISTENTE & AGENTE) */}
      <ChatCopilot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        pacienteActual={pacienteActual}
        onCitasActualizadas={cargarDatos}
      />
    </div>
  );
}
