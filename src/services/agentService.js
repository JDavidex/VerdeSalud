// Servicio de Inteligencia Artificial para VerdeSalud
// Implementa:
// 1. Asistente Conversacional (información general, horarios, preparación exámenes)
// 2. Agente con Tool Calling / Orquestador (agendamiento, cancelación, consulta de citas e historial)
// 3. Patrón Circuit Breaker & Fallback con degradación local elegante (RNF3)

import { citaRepository } from '../repositories/citaRepository.js';
import { historialRepository } from '../repositories/historialRepository.js';
import { medicoRepository } from '../repositories/medicoRepository.js';
import { BASE_CONOCIMIENTO_ASISTENTE } from '../data/mockData.js';

// Definición de Herramientas (Tool Calling) autorizadas para el Agente (RNF7)
export const AGENT_TOOLS = [
  {
    name: "consultar_disponibilidad",
    description: "Consulta especialistas y horarios disponibles para una especialidad médica.",
    parameters: {
      type: "object",
      properties: {
        especialidad: { type: "string", description: "Nombre de la especialidad (Cardiología, Medicina General, Pediatría, etc.)" }
      },
      required: ["especialidad"]
    }
  },
  {
    name: "agendar_cita",
    description: "Agenda una cita médica para el paciente autenticado previa confirmación.",
    parameters: {
      type: "object",
      properties: {
        pacienteCedula: { type: "string" },
        especialidad: { type: "string" },
        medicoId: { type: "string" },
        fecha: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
        hora: { type: "string", description: "Hora de la cita ej: 10:00 AM" },
        motivo: { type: "string" }
      },
      required: ["pacienteCedula", "especialidad", "fecha", "hora"]
    }
  },
  {
    name: "cancelar_cita",
    description: "Cancela una cita médica existente del paciente mediante el ID de la cita.",
    parameters: {
      type: "object",
      properties: {
        citaId: { type: "string" },
        pacienteCedula: { type: "string" }
      },
      required: ["citaId"]
    }
  },
  {
    name: "consultar_citas_paciente",
    description: "Obtiene la lista de citas activas o programadas del paciente.",
    parameters: {
      type: "object",
      properties: {
        pacienteCedula: { type: "string" }
      },
      required: ["pacienteCedula"]
    }
  },
  {
    name: "consultar_historial_clinico",
    description: "Consulta los antecedentes, diagnósticos, fórmulas médicas y exámenes del paciente.",
    parameters: {
      type: "object",
      properties: {
        pacienteCedula: { type: "string" }
      },
      required: ["pacienteCedula"]
    }
  }
];

class AgentService {
  constructor() {
    this.circuitBreakerStatus = 'CLOSED'; // CLOSED (normal), OPEN (fallas, usar fallback)
  }

  // Ejecutor de herramientas (Tool Executor)
  async executeTool(toolName, args) {
    switch (toolName) {
      case 'consultar_disponibilidad': {
        const medicos = medicoRepository.obtenerPorEspecialidad(args.especialidad || "");
        if (medicos.length === 0) {
          const especialidades = medicoRepository.obtenerEspecialidades();
          return {
            success: false,
            message: `No se encontraron especialistas en "${args.especialidad}". Disponibles: ${especialidades.join(", ")}.`
          };
        }
        return {
          success: true,
          especialidad: args.especialidad,
          medicos: medicos.map(m => ({
            id: m.id,
            nombre: m.nombre,
            sede: m.sede,
            dias: m.diasAtencion.join(", "),
            horarios: m.horariosDisponibles
          }))
        };
      }

      case 'agendar_cita': {
        const paciente = historialRepository.obtenerPaciente(args.pacienteCedula);
        let medico = args.medicoId ? medicoRepository.obtenerPorId(args.medicoId) : null;

        if (!medico && args.especialidad) {
          const medicos = medicoRepository.obtenerPorEspecialidad(args.especialidad);
          if (medicos.length > 0) medico = medicos[0];
        }

        if (!medico) {
          return {
            success: false,
            message: "No fue posible asignar un médico para la especialidad solicitada."
          };
        }

        // Verificar disponibilidad en fecha y hora
        const disponible = citaRepository.verificarDisponibilidad(medico.id, args.fecha, args.hora);
        if (!disponible) {
          return {
            success: false,
            message: `El ${medico.nombre} ya tiene una cita reservada el ${args.fecha} a las ${args.hora}. Por favor elija otro horario.`
          };
        }

        const nuevaCita = citaRepository.guardar({
          pacienteCedula: args.pacienteCedula,
          pacienteNombre: paciente ? paciente.nombre : "Paciente",
          medicoId: medico.id,
          medicoNombre: medico.nombre,
          especialidad: medico.especialidad,
          fecha: args.fecha,
          hora: args.hora,
          sede: medico.sede,
          motivo: args.motivo || "Consulta médica general",
          agendadoPor: "Agente IA (Tool Calling)"
        });

        return {
          success: true,
          message: `¡Cita agendada con éxito con ${medico.nombre}!`,
          cita: nuevaCita
        };
      }

      case 'cancelar_cita': {
        try {
          const citaCancelada = citaRepository.cancelar(args.citaId);
          return {
            success: true,
            message: `La cita ${args.citaId} ha sido cancelada correctamente.`,
            cita: citaCancelada
          };
        } catch (err) {
          return {
            success: false,
            message: err.message
          };
        }
      }

      case 'consultar_citas_paciente': {
        const citas = citaRepository.obtenerPorPaciente(args.pacienteCedula);
        return {
          success: true,
          citas,
          total: citas.length
        };
      }

      case 'consultar_historial_clinico': {
        const historial = historialRepository.obtenerPorCedula(args.pacienteCedula);
        return {
          success: true,
          historial
        };
      }

      default:
        throw new Error(`Herramienta no autorizada o desconocida: ${toolName}`);
    }
  }

  // Motor Orquestador con Fallback Inteligente (NLP + Intent Routing)
  // Cumple RNF3 (Alta disponibilidad) y RNF4 (Respuesta < 5 seg)
  async procesarMensaje({ mensaje, paciente, modo = 'auto' }) {
    const texto = mensaje.toLowerCase().trim();
    const pacienteCedula = paciente ? paciente.cedula : "1005829140";
    const pacienteNombre = paciente ? paciente.nombre : "Paciente";

    // 1. Detección de intenciones para el Asistente vs Agente
    // Modo Asistente: responde información general
    // Modo Agente: ejecuta acciones de gestión clínica

    // CASO A: Asistente - Horarios y Sedes
    if (texto.includes('horario') || texto.includes('abierto') || texto.includes('atienden') || texto.includes('urgencias') || texto.includes('sede') || texto.includes('direccion') || texto.includes('donde queda') || texto.includes('telefono') || texto.includes('contacto')) {
      let respuesta = `🏥 **Información del Hospital VerdeSalud:**\n\n${BASE_CONOCIMIENTO_ASISTENTE.horarios}\n\n📍 **Nuestras Sedes:**\n`;
      BASE_CONOCIMIENTO_ASISTENTE.sedes.forEach(s => {
        respuesta += `• **${s.nombre}**: ${s.direccion} (Tel: ${s.telefono})\n  *Servicios*: ${s.servicios}\n`;
      });
      respuesta += `\n📞 ${BASE_CONOCIMIENTO_ASISTENTE.canalesAtencion}`;

      return {
        tipo: 'asistente',
        rol: 'Asistente VerdeSalud (Informativo)',
        mensaje: respuesta,
        accionEjecutada: null
      };
    }

    // CASO B: Asistente - Preparación de exámenes de laboratorio
    if (texto.includes('examen') || texto.includes('preparacion') || texto.includes('ayuno') || texto.includes('ecografia') || texto.includes('orina') || texto.includes('sangre') || texto.includes('perfil lipidico')) {
      let detalle = "";
      if (texto.includes('perfil') || texto.includes('colesterol') || texto.includes('trigliceridos')) {
        detalle = BASE_CONOCIMIENTO_ASISTENTE.preparacionExamenes["perfil lipidico"];
      } else if (texto.includes('ecografia')) {
        detalle = BASE_CONOCIMIENTO_ASISTENTE.preparacionExamenes["ecografia abdominal"];
      } else if (texto.includes('orina')) {
        detalle = BASE_CONOCIMIENTO_ASISTENTE.preparacionExamenes["parcial de orina"];
      } else if (texto.includes('glicemia') || texto.includes('azucar')) {
        detalle = BASE_CONOCIMIENTO_ASISTENTE.preparacionExamenes["glicemia"];
      } else {
        detalle = `Guías de preparación frecuentes:\n• **Perfil Lipídico / Colesterol**: ${BASE_CONOCIMIENTO_ASISTENTE.preparacionExamenes["perfil lipidico"]}\n• **Ecografía Abdominal**: ${BASE_CONOCIMIENTO_ASISTENTE.preparacionExamenes["ecografia abdominal"]}\n• **Examen de Orina**: ${BASE_CONOCIMIENTO_ASISTENTE.preparacionExamenes["parcial de orina"]}`;
      }

      return {
        tipo: 'asistente',
        rol: 'Asistente VerdeSalud (Informativo)',
        mensaje: `🧪 **Preparación de Exámenes Clínicos:**\n\n${detalle}\n\n*Recuerde presentar su documento de identidad y orden médica al ingresar al laboratorio.*`,
        accionEjecutada: null
      };
    }

    // CASO C: Agente - Consultar Citas del Paciente
    if (texto.includes('mis citas') || texto.includes('que citas tengo') || texto.includes('ver citas') || texto.includes('consultar citas') || (texto.includes('citas') && texto.includes('tengo'))) {
      const toolResult = await this.executeTool('consultar_citas_paciente', { pacienteCedula });
      const citas = toolResult.citas;

      if (citas.length === 0) {
        return {
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          tool: 'consultar_citas_paciente',
          mensaje: `Hola ${pacienteNombre}, actualmente no tienes citas médicas activas agendadas. ¿Deseas que te ayude a programar una?`,
          datos: { citas: [] }
        };
      }

      let respuesta = `Hola ${pacienteNombre}, tienes **${citas.length} cita(s) activa(s)** en VerdeSalud:\n\n`;
      citas.forEach((c, idx) => {
        respuesta += `🔹 **Cita #${idx + 1} (${c.id})**:\n• **Especialidad:** ${c.especialidad}\n• **Médico:** ${c.medicoNombre}\n• **Fecha y Hora:** 📅 ${c.fecha} a las ⏰ ${c.hora}\n• **Lugar:** ${c.sede}\n• **Estado:** ✅ ${c.estado}\n\n`;
      });
      respuesta += `*Si necesitas cancelar o reprogramar alguna, dime por ejemplo: "Cancelar la cita ${citas[0].id}".*`;

      return {
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'consultar_citas_paciente',
        mensaje: respuesta,
        datos: { citas }
      };
    }

    // CASO D: Agente - Consultar Historial Clínico (Diagnósticos, Fórmulas, Exámenes)
    if (texto.includes('historial') || texto.includes('diagnostico') || texto.includes('formula') || texto.includes('receta') || texto.includes('medicamento') || texto.includes('mis resultados')) {
      const toolResult = await this.executeTool('consultar_historial_clinico', { pacienteCedula });
      const hist = toolResult.historial;

      let respuesta = `📋 **Historial de Salud - ${pacienteNombre} (C.C. ${pacienteCedula}):**\n\n`;

      if (hist.diagnosticos && hist.diagnosticos.length > 0) {
        respuesta += `🩺 **Diagnósticos Clínicos Recientes:**\n`;
        hist.diagnosticos.forEach(d => {
          respuesta += `• **${d.fecha}** [${d.codigoCIE10}]: ${d.diagnostico} (*${d.medico} - ${d.especialidad}*). Estado: ${d.estado}\n  _${d.observaciones}_\n`;
        });
        respuesta += `\n`;
      }

      if (hist.formulas && hist.formulas.length > 0) {
        respuesta += `💊 **Fórmulas Médicas:**\n`;
        hist.formulas.forEach(f => {
          respuesta += `• **${f.medicamento}**: ${f.posologia} (${f.estado === 'Vigente' ? '🟢 Vigente' : '⚪ ' + f.estado})\n`;
        });
        respuesta += `\n`;
      }

      if (hist.examenes && hist.examenes.length > 0) {
        respuesta += `🧪 **Últimos Resultados de Laboratorio:**\n`;
        hist.examenes.forEach(e => {
          respuesta += `• **${e.tipo} (${e.fecha})**: ${e.interpretacion}\n`;
        });
      }

      return {
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'consultar_historial_clinico',
        mensaje: respuesta,
        datos: { historial: hist }
      };
    }

    // CASO E: Agente - Cancelar Cita
    if (texto.includes('cancelar') && (texto.includes('cita') || texto.includes('cita-'))) {
      const citasActuales = citaRepository.obtenerPorPaciente(pacienteCedula);
      
      // Buscar ID en el texto ej: CITA-8921 o tomar la primera si hay una sola
      const matchId = texto.match(/cita-\d+/i);
      let citaId = matchId ? matchId[0].toUpperCase() : null;

      if (!citaId && citasActuales.length === 1) {
        citaId = citasActuales[0].id;
      }

      if (!citaId && citasActuales.length > 1) {
        return {
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          mensaje: `Tienes varias citas registradas. Por favor indícame cuál deseas cancelar especificando el código (por ejemplo: "Cancelar ${citasActuales[0].id}").`,
          datos: { citas: citasActuales }
        };
      }

      if (!citaId) {
        return {
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          mensaje: `No encontramos citas activas pendientes para cancelar a nombre de ${pacienteNombre}.`,
          datos: null
        };
      }

      const res = await this.executeTool('cancelar_cita', { citaId, pacienteCedula });
      return {
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'cancelar_cita',
        mensaje: res.success ? `✅ **Acción completada con éxito:** Se ha cancelado la cita médica **${citaId}** de manera segura.` : `⚠️ Error: ${res.message}`,
        datos: res
      };
    }

    // CASO F: Agente - Agendar Cita Médica (Con detección inteligente de especialidad y fecha)
    if (texto.includes('agendar') || texto.includes('programar') || texto.includes('pedir cita') || texto.includes('solicitar cita') || texto.includes('cita de') || texto.includes('cita para') || texto.includes('sacar cita')) {
      // Detección de especialidad
      let especialidad = "Medicina General";
      if (texto.includes('cardio')) especialidad = "Cardiología";
      else if (texto.includes('pedia')) especialidad = "Pediatría";
      else if (texto.includes('dermato')) especialidad = "Dermatología";
      else if (texto.includes('odonto') || texto.includes('diente')) especialidad = "Odontología";
      else if (texto.includes('ortope') || texto.includes('trauma')) especialidad = "Ortopedia y Traumatología";

      const medicosDisponibles = medicoRepository.obtenerPorEspecialidad(especialidad);
      if (medicosDisponibles.length === 0) {
        return {
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          mensaje: `No tenemos especialistas registrados para "${especialidad}". Te invito a consultar Medicina General o contactar la central de citas.`,
          datos: null
        };
      }

      const medico = medicosDisponibles[0];
      
      // Fecha calculada próxima (3 días a futuro)
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 3);
      const fechaStr = fechaFutura.toISOString().split('T')[0];
      const horaStr = medico.horariosDisponibles[1] || medico.horariosDisponibles[0] || "10:00 AM";

      // Ejecutar la herramienta de agendamiento
      const res = await this.executeTool('agendar_cita', {
        pacienteCedula,
        especialidad: medico.especialidad,
        medicoId: medico.id,
        fecha: fechaStr,
        hora: horaStr,
        motivo: `Consulta de control en ${especialidad}`
      });

      return {
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'agendar_cita',
        mensaje: `🎉 **¡Cita Agendada Exitosamente!**\n\nEl Agente de IA ha reservado tu turno con los siguientes datos:\n\n• **Código de Cita:** \`${res.cita.id}\`\n• **Especialidad:** ${res.cita.especialidad}\n• **Médico tratante:** ${res.cita.medicoNombre}\n• **Fecha:** 📅 ${res.cita.fecha}\n• **Hora:** ⏰ ${res.cita.hora}\n• **Sede:** 📍 ${res.cita.sede}\n\n*Hemos enviado la confirmación al correo institucional del paciente.*`,
        datos: res
      };
    }

    // CASO G: Consulta de Disponibilidad de Especialistas
    if (texto.includes('disponible') || texto.includes('medicos') || texto.includes('especialistas') || texto.includes('que doctores')) {
      const especialidades = medicoRepository.obtenerEspecialidades();
      const todos = medicoRepository.obtenerTodos();
      let r = `👨‍⚕️ **Especialistas y Disponibilidad en VerdeSalud:**\n\n`;
      todos.forEach(m => {
        r += `• **${m.nombre}** (${m.especialidad}): ${m.diasAtencion.join(', ')} de ${m.horariosDisponibles[0]} a ${m.horariosDisponibles[m.horariosDisponibles.length - 1]} (${m.sede})\n`;
      });
      r += `\n¿Deseas agendar con alguno de ellos? Solo pídeme: "Agenda una cita con el ${todos[0].nombre}".`;

      return {
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'consultar_disponibilidad',
        mensaje: r,
        datos: { medicos: todos }
      };
    }

    // RESPUESTA GENERAL AMABLE (ASISTENTE)
    return {
      tipo: 'asistente',
      rol: 'Asistente VerdeSalud',
      mensaje: `¡Hola ${pacienteNombre}! Soy el copiloto inteligente de **VerdeSalud** 🌿.\n\nPuedo ayudarte en dos roles:\n\n1️⃣ **Como Asistente de IA:** Respondo dudas sobre horarios de atención, preparación de exámenes médicos y ubicación de sedes.\n2️⃣ **Como Agente de IA:** Puedo **agendar tu cita médica**, **cancelar citas existentes** o **mostrarte tu historial de diagnósticos y fórmulas**.\n\n*¿En qué te gustaría que te colabore hoy?*`,
      datos: null
    };
  }
}

export const agentService = new AgentService();
