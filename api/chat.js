// Serverless Function para Vercel: /api/chat
import { db } from './_lib/db.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  try {
    const { mensaje, paciente, modo = 'auto' } = req.body || {};
    if (!mensaje) {
      return res.status(400).json({ error: 'El campo "mensaje" es requerido.' });
    }

    const texto = mensaje.toLowerCase().trim();
    const pacienteCedula = paciente ? paciente.cedula : "1005829140";
    const pacienteNombre = paciente ? paciente.nombre : "Paciente";

    // 1. Detección Asistente: Horarios, sedes y canales
    if (texto.includes('horario') || texto.includes('abierto') || texto.includes('atienden') || texto.includes('sede') || texto.includes('direccion') || texto.includes('telefono') || texto.includes('contacto') || texto.includes('donde queda')) {
      return res.status(200).json({
        tipo: 'asistente',
        rol: 'Asistente VerdeSalud (Informativo)',
        mensaje: `🏥 **Información del Hospital VerdeSalud:**\n\n• **Urgencias 24/7:** Atención médica ininterrumpida.\n• **Consulta Externa:** Lunes a Viernes de 7:00 AM a 7:00 PM | Sábados de 8:00 AM a 2:00 PM.\n\n📍 **Sedes:**\n• **Sede Principal:** Av. Salud #45-12 (Ibagué) - Tel: +57 (608) 270-1100\n• **Sede Norte:** Cra 5 #60-30 (Ibagué) - Tel: +57 (608) 270-1150\n\n📞 Línea Gratuita: 018000-83733 | WhatsApp: +57 310 999 0000`,
        tool: null
      });
    }

    // 2. Detección Asistente: Preparación de exámenes clínicos
    if (texto.includes('examen') || texto.includes('preparacion') || texto.includes('ayuno') || texto.includes('ecografia') || texto.includes('orina') || texto.includes('sangre') || texto.includes('laboratorio')) {
      return res.status(200).json({
        tipo: 'asistente',
        rol: 'Asistente VerdeSalud (Informativo)',
        mensaje: `🧪 **Instrucciones para Exámenes de Laboratorio:**\n\n• **Perfil Lipídico / Colesterol:** Ayuno de 10 a 12 horas. Comida ligera sin grasas la noche anterior.\n• **Glicemia / Cuadro Hemático:** Ayuno de 8 horas. Se permite agua moderada.\n• **Ecografía Abdominal:** Ayuno de 6 horas y vejiga llena (tomar 4 vasos de agua 1 hora antes sin orinar).\n• **Parcial de Orina:** Primera orina de la mañana en frasco estéril (descartar el primer chorro).`,
        tool: null
      });
    }

    // 3. Detección Agente: Consultar Citas
    if (texto.includes('mis citas') || texto.includes('que citas tengo') || texto.includes('ver citas') || texto.includes('consultar citas') || (texto.includes('citas') && texto.includes('tengo'))) {
      const citas = db.getCitas(pacienteCedula);
      if (citas.length === 0) {
        return res.status(200).json({
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          tool: 'consultar_citas_paciente',
          mensaje: `Hola ${pacienteNombre}, actualmente no tienes citas médicas activas. ¿Deseas programar una nueva cita?`,
          datos: { citas: [] }
        });
      }

      let resp = `Hola ${pacienteNombre}, tienes **${citas.length} cita(s) programada(s)**:\n\n`;
      citas.forEach((c, idx) => {
        resp += `🔹 **Cita #${idx + 1} (${c.id})**:\n• Especialidad: **${c.especialidad}**\n• Especialista: **${c.medicoNombre}**\n• Fecha y Hora: 📅 **${c.fecha}** a las ⏰ **${c.hora}**\n• Consultorio: 📍 ${c.sede}\n\n`;
      });
      resp += `*Para cancelar alguna, indícame: "Cancelar la cita ${citas[0].id}".*`;

      return res.status(200).json({
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'consultar_citas_paciente',
        mensaje: resp,
        datos: { citas }
      });
    }

    // 4. Detección Agente: Consultar Historial Médico
    if (texto.includes('historial') || texto.includes('diagnostico') || texto.includes('formula') || texto.includes('receta') || texto.includes('medicamento')) {
      const historial = db.getHistorial(pacienteCedula);
      let resp = `📋 **Historial de Salud - ${pacienteNombre}:**\n\n`;

      if (historial.diagnosticos?.length > 0) {
        resp += `🩺 **Diagnósticos Clínicos:**\n`;
        historial.diagnosticos.forEach(d => {
          resp += `• **${d.fecha}**: ${d.diagnostico} (${d.medico} - ${d.especialidad}). Estado: ${d.estado}\n`;
        });
        resp += `\n`;
      }

      if (historial.formulas?.length > 0) {
        resp += `💊 **Fórmulas Médicas:**\n`;
        historial.formulas.forEach(f => {
          resp += `• **${f.medicamento}**: ${f.posologia} (${f.estado})\n`;
        });
        resp += `\n`;
      }

      if (historial.examenes?.length > 0) {
        resp += `🔬 **Laboratorios:**\n`;
        historial.examenes.forEach(e => {
          resp += `• **${e.tipo}**: ${e.interpretacion}\n`;
        });
      }

      return res.status(200).json({
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'consultar_historial_clinico',
        mensaje: resp,
        datos: { historial }
      });
    }

    // 5. Detección Agente: Cancelar Cita (cubre 'cancela', 'cancelar', 'anular', 'eliminar')
    const esCancelacion = texto.includes('cancel') || texto.includes('anul') || texto.includes('elimin') || texto.includes('borr');
    if (esCancelacion && (texto.includes('cita') || texto.includes('turno') || texto.match(/cita-\d+/i))) {
      const citasActuales = db.getCitas(pacienteCedula);
      let citaACancelar = null;
      const matchId = texto.match(/cita-\d+/i);

      if (matchId) {
        const idBuscado = matchId[0].toUpperCase();
        citaACancelar = citasActuales.find(c => c.id === idBuscado) || db.getCitas().find(c => c.id === idBuscado);
      } else {
        // Buscar por especialidad o médico mencionado en el texto
        if (texto.includes('cardio') || texto.includes('vega')) {
          citaACancelar = citasActuales.find(c => c.especialidad.toLowerCase().includes('cardio') || c.medicoNombre.toLowerCase().includes('vega'));
        } else if (texto.includes('general') || texto.includes('camila') || texto.includes('morales')) {
          citaACancelar = citasActuales.find(c => c.especialidad.toLowerCase().includes('general') || c.medicoNombre.toLowerCase().includes('camila'));
        } else if (texto.includes('pedia') || texto.includes('valentina') || texto.includes('rios') || texto.includes('ríos')) {
          citaACancelar = citasActuales.find(c => c.especialidad.toLowerCase().includes('pedia') || c.medicoNombre.toLowerCase().includes('valentina'));
        } else if (texto.includes('dermato') || texto.includes('juan') || texto.includes('ortiz')) {
          citaACancelar = citasActuales.find(c => c.especialidad.toLowerCase().includes('dermato') || c.medicoNombre.toLowerCase().includes('ortiz'));
        } else if (texto.includes('odonto') || texto.includes('sofia') || texto.includes('sofía') || texto.includes('mendoza')) {
          citaACancelar = citasActuales.find(c => c.especialidad.toLowerCase().includes('odonto') || c.medicoNombre.toLowerCase().includes('mendoza'));
        } else if (texto.includes('ortope') || texto.includes('mateo') || texto.includes('restrepo')) {
          citaACancelar = citasActuales.find(c => c.especialidad.toLowerCase().includes('ortope') || c.medicoNombre.toLowerCase().includes('restrepo'));
        }

        // Si no especificó una en particular, cancelar la primera cita activa que tenga
        if (!citaACancelar && citasActuales.length > 0) {
          citaACancelar = citasActuales[0];
        }
      }

      if (!citaACancelar) {
        return res.status(200).json({
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          mensaje: `No se encontró ninguna cita activa pendiente para cancelar a nombre de ${pacienteNombre}.`,
          datos: null
        });
      }

      try {
        const cancelada = db.cancelarCita(citaACancelar.id);
        return res.status(200).json({
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          tool: 'cancelar_cita',
          mensaje: `✅ **Cita ${cancelada.id} cancelada exitosamente.**\n\n• **Especialidad:** ${cancelada.especialidad}\n• **Médico:** ${cancelada.medicoNombre}\n• **Fecha y Hora:** ${cancelada.fecha} a las ${cancelada.hora}\n\nEl cupo ha sido liberado en el sistema hospitalario.`,
          datos: { cita: cancelada, citaId: cancelada.id }
        });
      } catch (err) {
        return res.status(200).json({
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          mensaje: `⚠️ No fue posible cancelar la cita: ${err.message}`,
          datos: null
        });
      }
    }

    // 6. Detección Agente: Agendar Cita (Reconoce cualquier médico o especialidad y no confunde con cancelación)
    if (!esCancelacion && (texto.includes('agend') || texto.includes('program') || texto.includes('pedir cita') || texto.includes('solicitar cita') || texto.includes('sacar cita') || texto.includes('nueva cita') || texto.includes('cita de') || texto.includes('cita para') || texto.includes('cita con'))) {
      const todosMedicos = db.getMedicos();
      let medico = null;

      // 1. Detección por nombre o apellido del médico
      if (texto.includes('camila') || texto.includes('morales')) {
        medico = todosMedicos.find(m => m.id === 'med-2');
      } else if (texto.includes('valentina') || texto.includes('rios') || texto.includes('ríos')) {
        medico = todosMedicos.find(m => m.id === 'med-3');
      } else if (texto.includes('juan') || texto.includes('camilo') || texto.includes('ortiz')) {
        medico = todosMedicos.find(m => m.id === 'med-4');
      } else if (texto.includes('sofia') || texto.includes('sofía') || texto.includes('mendoza')) {
        medico = todosMedicos.find(m => m.id === 'med-5');
      } else if (texto.includes('mateo') || texto.includes('restrepo')) {
        medico = todosMedicos.find(m => m.id === 'med-6');
      } else if (texto.includes('roberto') || texto.includes('vega')) {
        medico = todosMedicos.find(m => m.id === 'med-1');
      }

      // 2. Detección por especialidad si no se indicó médico por nombre
      if (!medico) {
        if (texto.includes('cardio') || texto.includes('corazon') || texto.includes('corazón')) {
          medico = todosMedicos.find(m => m.especialidad === 'Cardiología');
        } else if (texto.includes('pedia') || texto.includes('niño') || texto.includes('niña') || texto.includes('hijo')) {
          medico = todosMedicos.find(m => m.especialidad === 'Pediatría');
        } else if (texto.includes('dermato') || texto.includes('piel') || texto.includes('mancha')) {
          medico = todosMedicos.find(m => m.especialidad === 'Dermatología');
        } else if (texto.includes('odonto') || texto.includes('diente') || texto.includes('muela') || texto.includes('boca')) {
          medico = todosMedicos.find(m => m.especialidad === 'Odontología');
        } else if (texto.includes('ortope') || texto.includes('trauma') || texto.includes('hueso') || texto.includes('fractura')) {
          medico = todosMedicos.find(m => m.especialidad === 'Ortopedia y Traumatología');
        } else if (texto.includes('general') || texto.includes('medicina')) {
          medico = todosMedicos.find(m => m.especialidad === 'Medicina General');
        } else {
          // Por defecto Medicina General (Dra. Camila Morales)
          medico = todosMedicos.find(m => m.especialidad === 'Medicina General') || todosMedicos[0];
        }
      }

      const fechaObj = new Date();
      fechaObj.setDate(fechaObj.getDate() + 3);
      const fechaStr = fechaObj.toISOString().split('T')[0];
      const horaStr = medico.horariosDisponibles[0] || "09:00 AM";

      const nuevaCita = db.agregarCita({
        pacienteCedula,
        pacienteNombre,
        medicoId: medico.id,
        medicoNombre: medico.nombre,
        especialidad: medico.especialidad,
        fecha: fechaStr,
        hora: horaStr,
        sede: medico.sede,
        motivo: `Cita de ${medico.especialidad} agendada por Agente IA`,
        agendadoPor: 'Agente IA'
      });

      return res.status(200).json({
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'agendar_cita',
        mensaje: `🎉 **¡Cita Médica Agendada con Éxito!**\n\n• **Código de Cita:** \`${nuevaCita.id}\`\n• **Especialidad:** ${nuevaCita.especialidad}\n• **Médico tratante:** ${nuevaCita.medicoNombre}\n• **Fecha y Hora:** 📅 ${nuevaCita.fecha} a las ⏰ ${nuevaCita.hora}\n• **Lugar:** 📍 ${nuevaCita.sede}`,
        datos: { cita: nuevaCita }
      });
    }

    // Respuesta por defecto
    return res.status(200).json({
      tipo: 'asistente',
      rol: 'Copiloto VerdeSalud',
      mensaje: `¡Hola ${pacienteNombre}! 🌿 Soy tu copiloto hospitalario en VerdeSalud.\n\n• **Como Asistente:** Te informo sobre horarios, sedes y preparación de exámenes.\n• **Como Agente:** Puedo **agendar tu cita**, **cancelarla** o **mostrarte tu historial de salud**.\n\n¿En qué te colaboro hoy?`,
      datos: null
    });

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
