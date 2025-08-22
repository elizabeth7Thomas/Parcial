const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del proyecto es obligatorio'],
    trim: true,
    maxLength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxLength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  codigoProyecto: {
    type: String,
    required: [true, 'El código del proyecto es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFinalizacion: {
    type: Date,
    required: [true, 'La fecha de finalización es obligatoria'],
    validate: {
      validator: function(value) {
        return value > this.fechaInicio;
      },
      message: 'La fecha de finalización debe ser posterior a la fecha de inicio'
    }
  },
  
  
  estado: {
    type: String,
    required: true,
    enum: ['Planificación', 'En Progreso', 'En Pausa', 'Completado', 'Cancelado'],
    default: 'Planificación'
  },
  porcentajeCompletado: {
    type: Number,
    required: true,
    min: [0, 'El porcentaje no puede ser negativo'],
    max: [100, 'El porcentaje no puede ser mayor a 100'],
    default: 0
  },
  

  prioridad: {
    type: String,
    required: true,
    enum: ['Baja', 'Media', 'Alta', 'Crítica'],
    default: 'Media'
  },
  categoria: {
    type: String,
    required: true,
    enum: ['Desarrollo Web', 'Aplicación Móvil', 'API', 'Base de Datos', 'Infraestructura', 'Diseño', 'Marketing', 'Otro']
  },
  
 
  presupuesto: {
    type: Number,
    required: [true, 'El presupuesto es obligatorio'],
    min: [0, 'El presupuesto debe ser positivo']
  },
  moneda: {
    type: String,
    required: true,
    enum: ['GTQ', 'USD', 'EUR'],
    default: 'GTQ'
  },
  
  
  cliente: {
    nombre: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Formato de email inválido']
    },
    telefono: { type: String, trim: true },
    empresa: { type: String, trim: true }
  },
  
  // Empleados asignados
  empleados: [{
    empleado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      required: true
    },
    rol: {
      type: String,
      required: true,
      enum: ['Project Manager', 'Desarrollador Senior', 'Desarrollador Junior', 'Diseñador', 'Tester', 'DevOps', 'Analista']
    },
    fechaAsignacion: {
      type: Date,
      required: true,
      default: Date.now
    },
    horasAsignadas: {
      type: Number,
      required: true,
      min: [1, 'Las horas asignadas deben ser al menos 1']
    },
    activo: {
      type: Boolean,
      default: true
    }
  }],
  

  tecnologias: [{
    type: String,
    trim: true
  }],
  repositorio: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'URL de repositorio inválida']
  },
  urlDemo: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'URL de demo inválida']
  },
  
  // Seguimiento
  hitos: [{
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    fechaObjetivo: { type: Date, required: true },
    completado: { type: Boolean, default: false },
    fechaCompletado: { type: Date }
  }],
  

  riesgos: [{
    descripcion: { type: String, required: true, trim: true },
    nivel: { 
      type: String, 
      required: true, 
      enum: ['Bajo', 'Medio', 'Alto', 'Crítico'] 
    },
    mitigacion: { type: String, trim: true },
    fechaIdentificado: { type: Date, default: Date.now }
  }],
  
  notas: {
    type: String,
    maxLength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  
 
  creadoPor: {
    type: String,
    required: true,
    default: 'Sistema'
  },
  actualizadoPor: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


proyectoSchema.index({ codigoProyecto: 1 });
proyectoSchema.index({ estado: 1 });
proyectoSchema.index({ fechaInicio: 1 });
proyectoSchema.index({ fechaFinalizacion: 1 });
proyectoSchema.index({ 'cliente.empresa': 1 });


proyectoSchema.virtual('duracionDias').get(function() {
  if (this.fechaInicio && this.fechaFinalizacion) {
    return Math.ceil((this.fechaFinalizacion - this.fechaInicio) / (1000 * 60 * 60 * 24));
  }
  return null;
});

proyectoSchema.virtual('diasRestantes').get(function() {
  if (this.fechaFinalizacion) {
    const dias = Math.ceil((this.fechaFinalizacion - Date.now()) / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  }
  return null;
});

proyectoSchema.virtual('empleadosActivos').get(function() {
  return this.empleados.filter(e => e.activo);
});

proyectoSchema.virtual('totalHorasAsignadas').get(function() {
  return this.empleados
    .filter(e => e.activo)
    .reduce((total, e) => total + e.horasAsignadas, 0);
});


proyectoSchema.pre('save', async function(next) {
  if (!this.codigoProyecto) {
    const count = await this.constructor.countDocuments();
    this.codigoProyecto = `PROJ${String(count + 1).padStart(4, '0')}`;
  }
  
 
  if (this.porcentajeCompletado === 100 && this.estado !== 'Completado') {
    this.estado = 'Completado';
  } else if (this.porcentajeCompletado > 0 && this.estado === 'Planificación') {
    this.estado = 'En Progreso';
  }
  
  next();
});


proyectoSchema.pre('save', function(next) {
  const empleadoIds = this.empleados
    .filter(e => e.activo)
    .map(e => e.empleado.toString());
  
  const empleadosUnicos = [...new Set(empleadoIds)];
  
  if (empleadoIds.length !== empleadosUnicos.length) {
    return next(new Error('No se puede asignar el mismo empleado múltiples veces al proyecto'));
  }
  
  next();
});

module.exports = mongoose.model('Proyecto', proyectoSchema);