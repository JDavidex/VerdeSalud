# VerdeSalud | Arquitectura de un asistente y un agente de IA para un hospital


**Actividad 2:** Orquestando códigos: La sinfonía de los sistemas  
**Asignatura:** Arquitectura de software - 8° Semestre  
**Estudiante:** Julian David Carrillo Galvez  
**Docente:** Ing. Leydi Johana Polo Amador  
**Institución:** Tecnológica del Oriente  
**Fecha:** Octubre de 2026 - Ibagué, Tolima  

---

## 1. Descripción del caso de estudio

El hospital ficticio **VerdeSalud** busca reducir la congestión en líneas telefónicas y filas presenciales para el agendamiento de citas médicas, facilitando a los usuarios un acceso oportuno y seguro a su historial clínico digital.

Para resolver este desafío, se implementó este prototipo web en **React**, desplegable en **Vercel** sobre **Funciones Serverless**, combinando una interfaz visual intuitiva en tonos verdes institucionales y un **Copiloto Hospitalario de Inteligencia Artificial**.

---

## 2. Diferenciación arquitectónica: Asistente vs. Agente de IA

| Dimensión | Asistente de IA (Informativo) | Agente de IA (Operativo) |
| :--- | :--- | :--- |
| **Rol** | Orientación y resolución de dudas en lenguaje natural. | Ejecución autónoma y controlada de acciones sobre el sistema. |
| **Alcance** | Consulta de horarios de atención (Urgencias 24/7, Consulta externa), sedes disponibles, preparación para exámenes clínicos (ayuno, ecografías, análisis sanguíneos). | **Tool Calling:** Consultar disponibilidad de especialistas, agendar nueva cita médica, cancelar citas existentes y consultar historial de salud. |
| **Impacto en datos** | Solo lectura (`Read-Only`). No modifica el estado del sistema. | Escritura y modificación (`State Mutator`) mediante validaciones y confirmaciones. |
| **Seguridad** | Sin acceso a funciones críticas. | Opera exclusivamente bajo herramientas autorizadas; no emite diagnósticos médicos ni prescripciones no validadas. |

---

## 3. Patrones de diseño de arquitectura aplicados

1. **Arquitectura en capas (MVC):**
   - **Presentación:** React (SPA moderna con Vite, componentes modulares y tema verde hospitalario).
   - **Lógica de negocio / controladores:** Funciones Serverless de Vercel en la carpeta `/api` (`api/chat.js`, `api/citas.js`, `api/historial.js`, `api/medicos.js`).
   - **Datos / persistencia:** Repositorios de datos en memoria (`CitaRepository`, `HistorialRepository`, `MedicoRepository`).
2. **Patrón Repository:**
   - Oculta los detalles del almacenamiento de datos. En esta fase de prototipo los datos se mantienen en memoria volátil de las funciones serverless de Vercel. Si a futuro se migra a PostgreSQL, Supabase o MongoDB, **solo se reemplaza la capa del repositorio sin modificar la interfaz de usuario ni los controladores**.
3. **API Gateway / Fachada Serverless:**
   - Enrutamiento unificado de endpoints bajo `/api/*`, gestionando CORS, parseo de peticiones y validación de parámetros de entrada.
4. **Tool Calling & Orquestador de agente:**
   - El modelo de lenguaje / orquestador detecta intenciones y realiza llamadas a funciones controladas:
     - `consultar_disponibilidad(especialidad)`
     - `agendar_cita(pacienteCedula, especialidad, fecha, hora)`
     - `cancelar_cita(citaId)`
     - `consultar_citas_paciente(pacienteCedula)`
     - `consultar_historial_clinico(pacienteCedula)`
5. **Circuit Breaker & Fallback con degradación elegante:**
   - Si el servicio externo de IA presenta fallas o no dispone de conexión, el portal continúa 100% operativo tanto con su motor local de procesamiento como a través del **formulario tradicional de agendamiento manual**.
6. **Computación Serverless:**
   - Despliegue en la infraestructura sin servidor de Vercel, ofreciendo escalabilidad elástica automática y alta disponibilidad.

---

## 4. Pacientes simulados para la demostración

El prototipo incluye un selector de paciente en la barra superior para alternar fácilmente durante la sustentación:

1. **Julian David Carrillo Galvez** (C.C. `1005829140`) - Sanitas EPS (Paciente principal con cita de cardiología e historial clínico completo).
2. **María Fernanda Gómez** (C.C. `52849102`) - Sura EPS.
3. **Carlos Eduardo Pérez** (C.C. `1019283746`) - Nueva EPS.

---

## 5. Ejecución en entorno local

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd VerdeSalud

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo (con emulación serverless incluida en vite.config.js)
npm run dev
```

El portal estará disponible de inmediato en: **`http://localhost:3000`**.

---

## 6. Estructura del Proyecto

```text
VerdeSalud/
├── api/                           # Funciones Serverless de Vercel (Backend)
│   ├── _lib/db.js                 # Almacén de datos en memoria para Serverless
│   ├── chat.js                    # Endpoint del Copiloto (Asistente & Agente)
│   ├── citas.js                   # Endpoint CRUD de Citas
│   ├── historial.js               # Endpoint de Historial Clínico
│   └── medicos.js                 # Endpoint de Médicos y Especialidades
├── src/
│   ├── components/                # Componentes React
│   │   ├── Navbar.jsx             # Barra superior con estado de Vercel y selector
│   │   ├── HeroBanner.jsx         # Portada con métricas y llamadas a la acción
│   │   ├── CitasList.jsx          # Panel de citas activas y modal de agendamiento manual
│   │   ├── HistorialView.jsx      # Visor de diagnósticos, fórmulas y laboratorios
│   │   ├── MedicosDirectory.jsx   # Directorio de especialistas con filtros y horarios
│   │   ├── ArquitecturaView.jsx   # Tab interactivo con justificación de patrones UML
│   │   └── ChatCopilot.jsx        # Widget conversacional de Asistente & Agente
│   ├── data/
│   │   └── mockData.js            # Datos simulados del hospital
│   ├── repositories/              # Patrón Repository
│   │   ├── citaRepository.js
│   │   ├── historialRepository.js
│   │   └── medicoRepository.js
│   ├── services/
│   │   └── agentService.js        # Orquestador de Tool Calling y Circuit Breaker
│   ├── App.jsx                    # Contenedor principal de la aplicación
│   ├── index.css                  # Sistema de diseño y estilos en verde institucional
│   └── main.jsx                   # Punto de montaje de React
├── vercel.json                    # Enrutamiento para Vercel Serverless
├── vite.config.js                 # Middleware para ejecutar las Serverless APIs en local
└── package.json
```
