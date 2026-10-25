// Patrón Repository para la gestión de citas de VerdeSalud
// Mantiene el estado en memoria durante la sesión del servidor / cliente
import { CITAS_INICIALES } from '../data/mockData.js';

class CitaRepository {
  constructor() {
    // Clonamos las citas iniciales
    this.citas = [...CITAS_INICIALES];
  }

  // Obtener todas las citas
  obtenerTodas() {
    return [...this.citas];
  }

  // Obtener citas de un paciente por su cédula
  obtenerPorPaciente(cedula) {
    return this.citas.filter(c => c.pacienteCedula === String(cedula) && c.estado !== 'Cancelada');
  }

  // Obtener una cita por su ID
  obtenerPorId(id) {
    return this.citas.find(c => c.id === id);
  }

  // Verificar disponibilidad de horario para un médico en una fecha
  verificarDisponibilidad(medicoId, fecha, hora) {
    const ocupada = this.citas.some(
      c => c.medicoId === medicoId && c.fecha === fecha && c.hora === hora && c.estado !== 'Cancelada'
    );
    return !ocupada;
  }

  // Crear una nueva cita
  guardar(nuevaCita) {
    const idGenerado = `CITA-${Math.floor(1000 + Math.random() * 9000)}`;
    const cita = {
      id: idGenerado,
      fechaCreacion: new Date().toISOString(),
      estado: 'Confirmada',
      ...nuevaCita
    };
    this.citas.unshift(cita);
    return cita;
  }

  // Cancelar una cita
  cancelar(citaId) {
    const index = this.citas.findIndex(c => c.id === citaId);
    if (index === -1) {
      throw new Error(`Cita con ID ${citaId} no encontrada`);
    }
    this.citas[index] = {
      ...this.citas[index],
      estado: 'Cancelada',
      fechaCancelacion: new Date().toISOString()
    };
    return this.citas[index];
  }
}

// Instancia singleton para compartir en memoria
export const citaRepository = new CitaRepository();
