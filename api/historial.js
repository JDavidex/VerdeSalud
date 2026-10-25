// Serverless Function para Vercel: /api/historial
import { db } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Use GET.' });
  }

  const { cedula } = req.query || {};
  if (!cedula) {
    return res.status(400).json({ error: 'La cédula del paciente es requerida.' });
  }

  const historial = db.getHistorial(cedula);
  const paciente = db.getPaciente(cedula);

  return res.status(200).json({
    success: true,
    paciente,
    historial
  });
}
