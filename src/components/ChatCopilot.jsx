import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, Wrench, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper para parsear Markdown básico (**negrilla**, *cursiva*, `código`) y saltos de línea
function renderFormattedMessage(text) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} style={{ height: '0.45rem' }} />;
    }

    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const matches = [...line.matchAll(regex)];

    if (matches.length === 0) {
      return (
        <div key={lineIdx} style={{ minHeight: '1.25em' }}>
          {line}
        </div>
      );
    }

    let currentIndex = 0;
    const elements = [];

    matches.forEach((m, mIdx) => {
      const matchText = m[0];
      const matchIndex = m.index;

      if (matchIndex > currentIndex) {
        elements.push(line.substring(currentIndex, matchIndex));
      }

      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        elements.push(
          <strong key={`${lineIdx}-${mIdx}`} style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        elements.push(
          <em key={`${lineIdx}-${mIdx}`} style={{ fontStyle: 'italic', color: 'var(--neutral-600)' }}>
            {matchText.slice(1, -1)}
          </em>
        );
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        elements.push(
          <code key={`${lineIdx}-${mIdx}`} style={{
            background: 'var(--primary-50)',
            color: 'var(--primary-800)',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'var(--font-mono)'
          }}>
            {matchText.slice(1, -1)}
          </code>
        );
      }

      currentIndex = matchIndex + matchText.length;
    });

    if (currentIndex < line.length) {
      elements.push(line.substring(currentIndex));
    }

    return (
      <div key={lineIdx} style={{ minHeight: '1.25em' }}>
        {elements}
      </div>
    );
  });
}

export default function ChatCopilot({
  isOpen,
  onClose,
  pacienteActual,
  onCitasActualizadas
}) {
  const [mensajes, setMensajes] = useState([
    {
      id: 'msg-welcome',
      emisor: 'bot',
      tipo: 'asistente',
      rol: 'Copiloto VerdeSalud',
      texto: `¡Hola ${pacienteActual.nombre}! 🌿 Soy el Copiloto de IA de **VerdeSalud**.\n\nPuedo orientarte como **Asistente** (horarios, sedes, preparación de laboratorios) o actuar como **Agente** (agendar o cancelar tus citas y consultar tu historial).\n\n¿En qué te puedo apoyar el día de hoy?`,
      toolEjecutado: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputTexto, setInputTexto] = useState('');
  const [modo, setModo] = useState('auto'); // 'auto', 'agente', 'asistente'
  const [cargando, setCargando] = useState(false);
  const [herramientaActiva, setHerramientaActiva] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, cargando, herramientaActiva]);

  // Actualizar bienvenida si cambia el paciente en el selector
  useEffect(() => {
    setMensajes([
      {
        id: `msg-welcome-${pacienteActual.cedula}`,
        emisor: 'bot',
        tipo: 'asistente',
        rol: 'Copiloto VerdeSalud',
        texto: `¡Hola ${pacienteActual.nombre}! 🌿 Te has identificado con Cédula **${pacienteActual.cedula}**.\n\n¿Deseas consultar tus citas, revisar tu historial clínico o resolver alguna duda médica hospitalaria?`,
        toolEjecutado: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [pacienteActual.cedula]);

  const enviarMensaje = async (textoAEnviar) => {
    const texto = (textoAEnviar || inputTexto).trim();
    if (!texto || cargando) return;

    // Agregar mensaje del usuario a la conversación
    const nuevoMensajeUsuario = {
      id: `msg-user-${Date.now()}`,
      emisor: 'user',
      tipo: 'user',
      texto,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes(prev => [...prev, nuevoMensajeUsuario]);
    setInputTexto('');
    setCargando(true);

    // Detección preliminar de herramienta para animación en UI
    const textoLower = texto.toLowerCase();
    if (textoLower.includes('agendar') || textoLower.includes('programar') || textoLower.includes('cita de') || textoLower.includes('cita para')) {
      setHerramientaActiva('agendar_cita');
    } else if (textoLower.includes('cancelar') && textoLower.includes('cita')) {
      setHerramientaActiva('cancelar_cita');
    } else if (textoLower.includes('historial') || textoLower.includes('diagnostico') || textoLower.includes('formula')) {
      setHerramientaActiva('consultar_historial_clinico');
    } else if (textoLower.includes('mis citas') || textoLower.includes('consultar citas')) {
      setHerramientaActiva('consultar_citas_paciente');
    }

    try {
      // Simular breve latencia de red para mostrar la ejecución del tool calling
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: texto,
          paciente: pacienteActual,
          modo
        })
      });

      const data = await resp.json();

      // Pequeño timeout para apreciar la ejecución de la herramienta
      setTimeout(() => {
        setHerramientaActiva(null);
        setCargando(false);

        const nuevoMensajeBot = {
          id: `msg-bot-${Date.now()}`,
          emisor: 'bot',
          tipo: data.tipo || 'asistente',
          rol: data.rol || (data.tipo === 'agente' ? 'Agente VerdeSalud (Gestor)' : 'Asistente VerdeSalud'),
          texto: data.mensaje,
          toolEjecutado: data.tool,
          datos: data.datos,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMensajes(prev => [...prev, nuevoMensajeBot]);

        // Si se agendó o canceló una cita, actualizar el estado principal del hospital
        if (data.tool === 'agendar_cita' || data.tool === 'cancelar_cita') {
          if (onCitasActualizadas) onCitasActualizadas();
          if (data.tool === 'agendar_cita') {
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.7 }
              });
            } catch {
              // Ignore
            }
          }
        }
      }, 600);

    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setHerramientaActiva(null);
      setCargando(false);

      setMensajes(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          emisor: 'bot',
          tipo: 'asistente',
          rol: 'Copiloto VerdeSalud (Circuit Breaker)',
          texto: `⚠️ El servicio de red no respondió como se esperaba, pero el portal de VerdeSalud continúa operando en modo contingencia (RNF3). Puedes usar el agendamiento manual desde la pantalla principal.`,
          toolEjecutado: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const sugerencias = [
    { label: "Quiero una cita de cardiología", prompt: "Por favor agenda una cita de cardiología para mi control" },
    { label: "¿Qué citas tengo?", prompt: "¿Cuáles son mis citas médicas activas?" },
    { label: "Ver mi historial y fórmulas", prompt: "Muestra mi historial clínico y las fórmulas médicas que tengo" },
    { label: "Preparación examen colesterol", prompt: "¿Qué preparación necesito para un examen de perfil lipídico o colesterol?" },
    { label: "Cancelar cita médica", prompt: "Quiero cancelar mi cita médica actual" },
    { label: "Horarios y sedes", prompt: "¿Cuáles son los horarios de atención y dónde quedan las sedes?" }
  ];

  if (!isOpen) return null;

  return (
    <div className="chat-window">
      {/* Header del Copiloto */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-ai-avatar">
            <Bot size={22} />
          </div>
          <div>
            <div className="chat-header-title">
              Copiloto VerdeSalud <Sparkles size={14} color="#34d399" />
            </div>
            <div className="chat-header-status">
              <span className="status-dot-pulse"></span>
              <span>Asistente & Agente Activo</span>
            </div>
          </div>
        </div>

        <button
          id="btn-close-chat"
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Selector de Modo Arquitectónico */}
      <div className="chat-mode-selector">
        <div className="mode-toggle-group">
          <button
            className={`mode-toggle-btn ${modo === 'auto' ? 'active' : ''}`}
            onClick={() => setModo('auto')}
            title="Detección inteligente de Asistente o Agente según la intención"
          >
            <Sparkles size={12} /> Auto Copilot
          </button>
          <button
            className={`mode-toggle-btn ${modo === 'agente' ? 'active' : ''}`}
            onClick={() => setModo('agente')}
            title="Modo Agente: enfocado en ejecución de herramientas (Tool Calling)"
          >
            <Wrench size={12} /> Agente (Acción)
          </button>
          <button
            className={`mode-toggle-btn ${modo === 'asistente' ? 'active' : ''}`}
            onClick={() => setModo('asistente')}
            title="Modo Asistente: consultas informativas generales sin cambios de datos"
          >
            <MessageSquare size={12} /> Asistente (Info)
          </button>
        </div>
      </div>

      {/* Cuerpo de Mensajes */}
      <div className="chat-messages-area">
        {mensajes.map((msg) => (
          <div key={msg.id} className={`chat-message-bubble ${msg.tipo}`}>
            {msg.emisor === 'bot' && (
              <div className="bubble-role-header">
                {msg.tipo === 'agente' ? (
                  <span className="role-agente">🤖 {msg.rol}</span>
                ) : (
                  <span className="role-assistant">💬 {msg.rol}</span>
                )}
                <span style={{ fontSize: '0.65rem', color: 'var(--neutral-400)', marginLeft: 'auto', fontWeight: 400 }}>
                  {msg.timestamp}
                </span>
              </div>
            )}

            {/* Si ejecutó una herramienta de agente, mostrar banner visual */}
            {msg.toolEjecutado && (
              <div className="tool-call-indicator">
                <Wrench size={13} color="var(--primary-600)" />
                <span>Tool ejecutado: <strong>{msg.toolEjecutado}</strong></span>
              </div>
            )}

            <div style={{ wordBreak: 'break-word' }}>
              {renderFormattedMessage(msg.texto)}
            </div>
          </div>
        ))}

        {/* Indicador de ejecución de Tool Calling en vivo */}
        {herramientaActiva && (
          <div className="tool-call-indicator" style={{ background: '#ecfdf5', borderColor: '#6ee7b7' }}>
            <RefreshCw size={14} className="tool-gear-spin" color="var(--primary-700)" />
            <span>Agente invocando herramienta autorizada: <strong>{herramientaActiva}()</strong>...</span>
          </div>
        )}

        {cargando && !herramientaActiva && (
          <div style={{ display: 'flex', gap: '0.35rem', padding: '0.5rem', color: 'var(--neutral-400)' }}>
            <span style={{ animation: 'bounce 1s infinite', fontSize: '1.2rem' }}>•</span>
            <span style={{ animation: 'bounce 1s infinite 0.2s', fontSize: '1.2rem' }}>•</span>
            <span style={{ animation: 'bounce 1s infinite 0.4s', fontSize: '1.2rem' }}>•</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugerencias Rápidas */}
      <div className="chat-suggestions-strip">
        {sugerencias.map((sug, i) => (
          <button
            key={i}
            className="chip-btn"
            onClick={() => enviarMensaje(sug.prompt)}
          >
            {sug.label}
          </button>
        ))}
      </div>

      {/* Barra de Entrada de Texto */}
      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          enviarMensaje();
        }}
      >
        <input
          id="input-chat-mensaje"
          type="text"
          className="chat-input-field"
          placeholder="Escribe tu consulta o pide agendar una cita..."
          value={inputTexto}
          onChange={(e) => setInputTexto(e.target.value)}
          disabled={cargando}
        />

        <button
          id="btn-enviar-chat"
          type="submit"
          className="chat-send-btn"
          disabled={!inputTexto.trim() || cargando}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
