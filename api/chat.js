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

    // 5. Detección Agente: Cancelar Cita
    if (texto.includes('cancelar') && (texto.includes('cita') || texto.includes('cita-'))) {
      const citasActuales = db.getCitas(pacienteCedula);
      const matchId = texto.match(/cita-\d+/i);
      let citaId = matchId ? matchId[0].toUpperCase() : (citasActuales.length > 0 ? citasActuales[0].id : null);

      if (!citaId) {
        return res.status(200).json({
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          mensaje: `No se encontró ninguna cita activa pendiente para cancelar.`,
          datos: null
        });
      }

      try {
        const cancelada = db.cancelarCita(citaId);
        return res.status(200).json({
          tipo: 'agente',
          rol: 'Agente VerdeSalud (Gestor)',
          tool: 'cancelar_cita',
          mensaje: `✅ **Cita ${citaId} cancelada exitosamente.** El horario ha sido liberado en el sistema hospitalario.`,
          datos: { cita: cancelada }
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

    // 6. Detección Agente: Agendar Cita
    if (texto.includes('agendar') || texto.includes('programar') || texto.includes('cita de') || texto.includes('cita para') || texto.includes('sacar cita') || texto.includes('solicitar cita')) {
      let especialidad = "Medicina General";
      if (texto.includes('cardio')) especialidad = "Cardiología";
      else if (texto.includes('pedia')) especialidad = "Pediatría";
      else if (texto.includes('dermato')) especialidad = "Dermatología";
      else if (texto.includes('odonto') || texto.includes('diente')) especialidad = "Odontología";
      else if (texto.includes('ortope')) especialidad = "Ortopedia y Traumatología";

      const medicos = db.getMedicos().filter(m => m.especialidad.toLowerCase().includes(especialidad.toLowerCase()));
      const medico = medicos[0] || db.getMedicos()[0];

      const fechaObj = new Date();
      fechaObj.setDate(fechaObj.getDate() + 3);
      const fechaStr = fechaObj.toISOString().split('T')[0];
      const horaStr = medico.horariosDisponibles[1] || "10:00 AM";

      const nuevaCita = db.agregarCita({
        pacienteCedula,
        pacienteNombre,
        medicoId: medico.id,
        medicoNombre: medico.nombre,
        especialidad: medico.especialidad,
        fecha: fechaStr,
        hora: horaStr,
        sede: medico.sede,
        motivo: `Cita agendada por Agente IA (${especialidad})`,
        agendadoPor: 'Agente IA'
      });

      return res.status(200).json({
        tipo: 'agente',
        rol: 'Agente VerdeSalud (Gestor)',
        tool: 'agendar_cita',
        mensaje: `🎉 **¡Cita Médica Agendada con Éxito!**\n\n• **Código de Cita:** \`${nuevaCita.id}\`\n• **Especialidad:** ${nuevaCita.especialidad}\n• **Médico:** ${nuevaCita.medicoNombre}\n• **Fecha y Hora:** 📅 ${nuevaCita.fecha} a las ⏰ ${nuevaCita.hora}\n• **Lugar:** 📍 ${nuevaCita.sede}`,
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
