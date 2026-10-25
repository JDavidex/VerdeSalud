// Patrón Repository para Historial Clínico de VerdeSalud
import { HISTORIALES_INICIALES, PACIENTES_INICIALES } from '../data/mockData.js';

class HistorialRepository {
  constructor() {
    this.historiales = { ...HISTORIALES_INICIALES };
    this.pacientes = [...PACIENTES_INICIALES];
  }

  // Obtener perfil de paciente por cédula
  obtenerPaciente(cedula) {
    return this.pacientes.find(p => p.cedula === String(cedula)) || null;
  }

  // Obtener todos los pacientes disponibles para la demo
  obtenerTodosPacientes() {
    return [...this.pacientes];
  }

  // Obtener historial completo de un paciente
  obtenerPorCedula(cedula) {
    const cedulaStr = String(cedula);
    const historial = this.historiales[cedulaStr];
    const paciente = this.obtenerPaciente(cedulaStr);

    if (!historial) {
      return {
        pacienteCedula: cedulaStr,
        pacienteNombre: paciente ? paciente.nombre : "Paciente no registrado",
        diagnosticos: [],
        formulas: [],
        examenes: []
      };
    }

    return {
      ...historial,
      pacienteNombre: paciente ? paciente.nombre : "Paciente"
    };
  }

  // Agregar registro clínico (cumple RF7: El médico registra diagnósticos y anotaciones)
  agregarDiagnostico(cedula, nuevoDx) {
    const cedulaStr = String(cedula);
    if (!this.historiales[cedulaStr]) {
      this.historiales[cedulaStr] = {
        pacienteCedula: cedulaStr,
        diagnosticos: [],
        formulas: [],
        examenes: []
      };
    }
    const registro = {
      id: `DX-${Math.floor(100 + Math.random() * 900)}`,
      fecha: new Date().toISOString().split('T')[0],
      ...nuevoDx
    };
    this.historiales[cedulaStr].diagnosticos.unshift(registro);
    return registro;
  }
}

export const historialRepository = new HistorialRepository();
