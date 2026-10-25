// Serverless Function para Vercel: /api/citas
import { db } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Obtener citas
  if (req.method === 'GET') {
    const { cedula } = req.query || {};
    const citas = db.getCitas(cedula);
    return res.status(200).json({ success: true, citas, total: citas.length });
  }

  // POST: Crear cita manual o vía agente
  if (req.method === 'POST') {
    const { pacienteCedula, pacienteNombre, medicoId, especialidad, fecha, hora, motivo } = req.body || {};
    
    if (!pacienteCedula || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos requeridos (pacienteCedula, fecha, hora).' });
    }

    let medico = null;
    if (medicoId) {
      medico = db.getMedicos().find(m => m.id === medicoId);
    } else if (especialidad) {
      medico = db.getMedicos().find(m => m.especialidad.toLowerCase() === especialidad.toLowerCase());
    }
    if (!medico) {
      medico = db.getMedicos()[0];
    }

    const nuevaCita = db.agregarCita({
      pacienteCedula,
      pacienteNombre: pacienteNombre || "Paciente",
      medicoId: medico.id,
      medicoNombre: medico.nombre,
      especialidad: medico.especialidad,
      fecha,
      hora,
      sede: medico.sede,
      motivo: motivo || "Consulta agendada vía portal",
      agendadoPor: 'Portal VerdeSalud'
    });

    return res.status(201).json({ success: true, cita: nuevaCita });
  }

  // DELETE: Cancelar cita
  if (req.method === 'DELETE') {
    const citaId = req.query.id || (req.body && req.body.id);
    if (!citaId) {
      return res.status(400).json({ error: 'El id de la cita es requerido.' });
    }

    try {
      const citaCancelada = db.cancelarCita(citaId);
      return res.status(200).json({ success: true, message: `Cita ${citaId} cancelada.`, cita: citaCancelada });
    } catch (err) {
      return res.status(404).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no soportado.' });
}
