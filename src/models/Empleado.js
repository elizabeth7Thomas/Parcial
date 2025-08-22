const mongoose = require('mongoose');

const empleadoSchema = new mongoose.Schema({
  
  nombres: {
    type: String,
    required: [true, 'Los nombres son obligatorios'],
    trim: true,
    maxLength: [100, 'Los nombres no pueden exceder 100 caracteres']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
    trim: true,
    maxLength: [100, 'Los apellidos no pueden exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Formato de email inválido']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  

  tipoDocumento: {
    type: String,
    required: [true, 'El tipo de documento es obligatorio'],
    enum: ['DPI', 'Pasaporte', 'Licencia']
  },
  numeroDocumento: {
    type: String,
    required: [true, 'El número de documento es obligatorio'],
    unique: true,
    trim: true
  },
  
  
  direccion: {
    calle: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    departamento: { type: String, required: true, trim: true },
    codigoPostal: { type: String, trim: true },
    pais: { type: String, required: true, trim: true, default: 'Guatemala' }
  },
  

  codigoEmpleado: {
    type: String,
    required: [true, 'El código de empleado es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true
  },
  puesto: {
    type: String,
    required: [true, 'El puesto es obligatorio'],
    trim: true
  },
  departamento: {
    type: String,
    required: [true, 'El departamento es obligatorio'],
    enum: ['Desarrollo', 'Recursos Humanos', 'Ventas', 'Marketing', 'Finanzas', 'Administración', 'Soporte Técnico']
  },
  fechaIngreso: {
    type: Date,
    required: [true, 'La fecha de ingreso es obligatoria'],
    default: Date.now
  },
  salario: {
    type: Number,
    required: [true, 'El salario es obligatorio'],
    min: [0, 'El salario debe ser positivo']
  },
  tipoContrato: {
    type: String,
    required: [true, 'El tipo de contrato es obligatorio'],
    enum: ['Indefinido', 'Temporal', 'Prácticas', 'Freelance']
  },
  estado: {
    type: String,
    required: true,
    enum: ['Activo', 'Inactivo', 'Suspendido', 'Vacaciones'],
    default: 'Activo'
  },
  

  nivelEducacion: {
    type: String,
    required: true,
    enum: ['Primaria', 'Secundaria', 'Universidad', 'Maestría', 'Doctorado', 'Técnico']
  },
  habilidades: [{
    type: String,
    trim: true
  }],
  experienciaAnios: {
    type: Number,
    min: 0,
    default: 0
  },
  

  contactoEmergencia: {
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    relacion: { type: String, required: true, trim: true }
  },

  tipoSangre: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  alergias: [{
    type: String,
    trim: true
  }],
  

  proyectoActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proyecto',
    default: null
  },
  fechaAsignacionProyecto: {
    type: Date
  },

  creadoPor: {
    type: String,
    default: 'Sistema'
  },
  notas: {
    type: String,
    maxLength: [500, 'Las notas no pueden exceder 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


empleadoSchema.index({ email: 1 });
empleadoSchema.index({ numeroDocumento: 1 });
empleadoSchema.index({ codigoEmpleado: 1 });
empleadoSchema.index({ departamento: 1 });
empleadoSchema.index({ estado: 1 });


empleadoSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});


empleadoSchema.virtual('edad').get(function() {
  if (this.fechaNacimiento) {
    return Math.floor((Date.now() - this.fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }
  return null;
});


empleadoSchema.virtual('tiempoEmpresa').get(function() {
  if (this.fechaIngreso) {
    const dias = Math.floor((Date.now() - this.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
    const años = Math.floor(dias / 365);
    const meses = Math.floor((dias % 365) / 30);
    return { años, meses, dias };
  }
  return null;
});


empleadoSchema.pre('save', async function(next) {
  if (this.isNew && !this.codigoEmpleado) {
    try {
      
      const Counter = mongoose.model('Counter') || mongoose.model('Counter', new mongoose.Schema({
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 }
      }));
      
      const counter = await Counter.findByIdAndUpdate(
        'empleadoId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      this.codigoEmpleado = `EMP${String(counter.seq).padStart(4, '0')}`;
    } catch (error) {
      // Fallback: usar timestamp
      this.codigoEmpleado = `EMP${Date.now().toString().slice(-4)}`;
      console.error('Error generando código de empleado:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Empleado', empleadoSchema);