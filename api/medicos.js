// Serverless Function para Vercel: /api/medicos
import { db } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const medicos = db.getMedicos();
  const pacientes = db.getPacientes();

  return res.status(200).json({
    success: true,
    medicos,
    pacientes
  });
}
