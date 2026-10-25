// Almacén en memoria compartido para las Serverless Functions de Vercel
// En Vercel, las instancias de funciones serverless conservan la memoria mientras la instancia esté caliente.

const MEDICOS = [
  {
    id: "med-1",
    nombre: "Dr. Roberto Vega",
    especialidad: "Cardiología",
    registroMedico: "RM-44912-COL",
    sede: "Sede Principal - Consultorio 302",
    horariosDisponibles: ["08:00 AM", "10:00 AM", "02:30 PM", "04:00 PM"],
    diasAtencion: ["Lunes", "Miércoles", "Viernes"],
    foto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "med-2",
    nombre: "Dra. Camila Morales",
    especialidad: "Medicina General",
    registroMedico: "RM-51203-COL",
    sede: "Sede Principal - Consultorio 104",
    horariosDisponibles: ["07:30 AM", "09:00 AM", "11:00 AM", "03:00 PM", "05:00 PM"],
    diasAtencion: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    foto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "med-3",
    nombre: "Dra. Valentina Ríos",
    especialidad: "Pediatría",
    registroMedico: "RM-39821-COL",
    sede: "Sede Norte - Consultorio 201",
    horariosDisponibles: ["08:30 AM", "10:30 AM", "02:00 PM", "03:30 PM"],
    diasAtencion: ["Martes", "Jueves", "Sábado"],
    foto: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "med-4",
    nombre: "Dr. Juan Camilo Ortiz",
    especialidad: "Dermatología",
    registroMedico: "RM-60194-COL",
    sede: "Sede Principal - Consultorio 405",
    horariosDisponibles: ["09:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"],
    diasAtencion: ["Lunes", "Martes", "Jueves"],
    foto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "med-5",
    nombre: "Dra. Sofía Mendoza",
    especialidad: "Odontología",
    registroMedico: "RM-28490-COL",
    sede: "Sede Norte - Consultorio 102",
    horariosDisponibles: ["08:00 AM", "10:00 AM", "01:30 PM", "04:00 PM"],
    diasAtencion: ["Lunes", "Miércoles", "Viernes"],
    foto: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "med-6",
    nombre: "Dr. Mateo Restrepo",
    especialidad: "Ortopedia y Traumatología",
    registroMedico: "RM-71042-COL",
    sede: "Sede Principal - Consultorio 210",
    horariosDisponibles: ["09:30 AM", "11:00 AM", "02:30 PM", "05:00 PM"],
    diasAtencion: ["Martes", "Jueves", "Viernes"],
    foto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80"
  }
];

const PACIENTES = [
  {
    cedula: "1005829140",
    nombre: "Julian David Carrillo Galvez",
    edad: 24,
    telefono: "+57 312 456 7890",
    email: "julian.carrillo@correo.com",
    eps: "Sanitas EPS",
    grupoSanguineo: "O+",
    ciudad: "Ibagué, Tolima",
    alergias: ["Penicilina", "Polen"],
    contactoEmergencia: "Martha Galvez (Madre) - 311 234 5678"
  },
  {
    cedula: "52849102",
    nombre: "María Fernanda Gómez",
    edad: 32,
    telefono: "+57 315 888 4422",
    email: "maria.gomez@correo.com",
    eps: "Sura EPS",
    grupoSanguineo: "A+",
    ciudad: "Ibagué, Tolima",
    alergias: ["Ninguna conocida"],
    contactoEmergencia: "Andrés Gómez (Hermano) - 315 999 1122"
  },
  {
    cedula: "1019283746",
    nombre: "Carlos Eduardo Pérez",
    edad: 45,
    telefono: "+57 320 111 2233",
    email: "carlos.perez@correo.com",
    eps: "Nueva EPS",
    grupoSanguineo: "B+",
    ciudad: "Ibagué, Tolima",
    alergias: ["AINES (Ibuprofeno)"],
    contactoEmergencia: "Lucía Pérez (Esposa) - 320 444 5566"
  }
];

let CITAS = [
  {
    id: "CITA-8921",
    pacienteCedula: "1005829140",
    pacienteNombre: "Julian David Carrillo Galvez",
    medicoId: "med-1",
    medicoNombre: "Dr. Roberto Vega",
    especialidad: "Cardiología",
    fecha: "2026-10-30",
    hora: "10:00 AM",
    sede: "Sede Principal - Consultorio 302",
    motivo: "Control cardiovascular semestral y chequeo de arritmias leves",
    estado: "Confirmada",
    fechaCreacion: "2026-10-20T09:15:00Z",
    agendadoPor: "Agente IA"
  },
  {
    id: "CITA-8410",
    pacienteCedula: "52849102",
    pacienteNombre: "María Fernanda Gómez",
    medicoId: "med-4",
    medicoNombre: "Dr. Juan Camilo Ortiz",
    especialidad: "Dermatología",
    fecha: "2026-11-04",
    hora: "03:00 PM",
    sede: "Sede Principal - Consultorio 405",
    motivo: "Revisión de manchas solares y control dérmico",
    estado: "Confirmada",
    fechaCreacion: "2026-10-22T14:30:00Z",
    agendadoPor: "Portal Web"
  }
];

const HISTORIALES = {
  "1005829140": {
    pacienteCedula: "1005829140",
    diagnosticos: [
      {
        id: "DX-101",
        fecha: "2026-09-15",
        diagnostico: "Rinofaringitis aguda (Gripa común estacional)",
        codigoCIE10: "J00",
        medico: "Dra. Camila Morales",
        especialidad: "Medicina General",
        observaciones: "Paciente presenta congestión nasal, odinofagia y cefalea leve. Sin signos de dificultad respiratoria. Manejo ambulatorio sintomático.",
        estado: "Resuelto"
      },
      {
        id: "DX-089",
        fecha: "2026-06-10",
        diagnostico: "Evaluación cardiovascular preventiva - Bradicardia sinusal benigna",
        codigoCIE10: "R00.1",
        medico: "Dr. Roberto Vega",
        especialidad: "Cardiología",
        observaciones: "Electrocardiograma dentro de parámetros normales en reposo. Frecuencia cardíaca en 55 lpm atribuible a buena condición física. Control en 6 meses.",
        estado: "En seguimiento"
      }
    ],
    formulas: [
      {
        id: "RX-401",
        fecha: "2026-09-15",
        medicamento: "Acetaminofén 500 mg",
        posologia: "1 tableta cada 8 horas vía oral por 3 días",
        medico: "Dra. Camila Morales",
        estado: "Completado"
      },
      {
        id: "RX-402",
        fecha: "2026-09-15",
        medicamento: "Loratadina 10 mg",
        posologia: "1 tableta diaria en la noche por 5 días",
        medico: "Dra. Camila Morales",
        estado: "Completado"
      },
      {
        id: "RX-388",
        fecha: "2026-10-01",
        medicamento: "Complejo B + Vitamina C (Suplemento)",
        posologia: "1 cápsula diaria con el desayuno por 30 días",
        medico: "Dra. Camila Morales",
        estado: "Vigente"
      }
    ],
    examenes: [
      {
        id: "LAB-701",
        fecha: "2026-06-12",
        tipo: "Perfil Lipídico Completo",
        laboratorio: "Laboratorio Clínico VerdeSalud",
        resultados: [
          { parametro: "Colesterol Total", valor: "172 mg/dL", referencia: "< 200 mg/dL", estado: "Normal" },
          { parametro: "Triglicéridos", valor: "128 mg/dL", referencia: "< 150 mg/dL", estado: "Normal" },
          { parametro: "Colesterol HDL", valor: "54 mg/dL", referencia: "> 40 mg/dL", estado: "Óptimo" },
          { parametro: "Colesterol LDL", valor: "92 mg/dL", referencia: "< 100 mg/dL", estado: "Óptimo" }
        ],
        interpretacion: "Metabolismo lipídico en rango saludable. Mantener hábitos actuales."
      },
      {
        id: "LAB-702",
        fecha: "2026-06-12",
        tipo: "Cuadro Hemático (Hemograma)",
        laboratorio: "Laboratorio Clínico VerdeSalud",
        resultados: [
          { parametro: "Hemoglobina", valor: "15.4 g/dL", referencia: "13.5 - 17.5 g/dL", estado: "Normal" },
          { parametro: "Leucocitos", valor: "6.700 /mcL", referencia: "4.500 - 11.000 /mcL", estado: "Normal" },
          { parametro: "Plaquetas", valor: "245.000 /mcL", referencia: "150.000 - 450.000 /mcL", estado: "Normal" }
        ],
        interpretacion: "Recuentos celulares sanguíneos normales. Sin anemia ni leucocitosis."
      }
    ]
  }
};

export const db = {
  getMedicos: () => MEDICOS,
  getPacientes: () => PACIENTES,
  getPaciente: (cedula) => PACIENTES.find(p => p.cedula === String(cedula)),
  getCitas: (cedula) => cedula ? CITAS.filter(c => c.pacienteCedula === String(cedula) && c.estado !== 'Cancelada') : CITAS,
  agregarCita: (citaData) => {
    const nueva = {
      id: `CITA-${Math.floor(1000 + Math.random() * 9000)}`,
      fechaCreacion: new Date().toISOString(),
      estado: 'Confirmada',
      ...citaData
    };
    CITAS.unshift(nueva);
    return nueva;
  },
  cancelarCita: (id) => {
    const idx = CITAS.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Cita no encontrada");
    CITAS[idx].estado = 'Cancelada';
    return CITAS[idx];
  },
  getHistorial: (cedula) => HISTORIALES[String(cedula)] || {
    pacienteCedula: String(cedula),
    diagnosticos: [],
    formulas: [],
    examenes: []
  }
};
