// Patrón Repository para Médicos y Especialidades de VerdeSalud
import { MEDICOS } from '../data/mockData.js';

class MedicoRepository {
  constructor() {
    this.medicos = [...MEDICOS];
  }

  obtenerTodos() {
    return [...this.medicos];
  }

  obtenerPorId(id) {
    return this.medicos.find(m => m.id === id) || null;
  }

  obtenerPorEspecialidad(especialidad) {
    const term = especialidad.toLowerCase().trim();
    return this.medicos.filter(m =>
      m.especialidad.toLowerCase().includes(term)
    );
  }

  obtenerEspecialidades() {
    const set = new Set(this.medicos.map(m => m.especialidad));
    return Array.from(set);
  }
}

export const medicoRepository = new MedicoRepository();
