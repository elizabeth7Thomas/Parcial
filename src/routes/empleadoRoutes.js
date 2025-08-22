const express = require('express');
const { body } = require('express-validator');
const {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  asignarEmpleadoAProyecto,
  liberarEmpleadoDeProyecto,
  obtenerEmpleadosDisponibles,
  obtenerEstadisticas
} = require('../controllers/empleadoController');

const router = express.Router();


const validarCrearEmpleado = [
  body('nombres').notEmpty().withMessage('Los nombres son obligatorios').isLength({ max: 100 }).trim(),
  body('apellidos').notEmpty().withMessage('Los apellidos son obligatorios').isLength({ max: 100 }).trim(),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio').trim(),
  body('fechaNacimiento').isISO8601().withMessage('Fecha inválida'),
  body('tipoDocumento').isIn(['DPI', 'Pasaporte', 'Licencia']).withMessage('Tipo inválido'),
  body('numeroDocumento').notEmpty().withMessage('Número de documento obligatorio').trim(),
  body('direccion.calle').notEmpty().withMessage('La calle es obligatoria').trim(),
  body('direccion.ciudad').notEmpty().withMessage('La ciudad es obligatoria').trim(),
  body('direccion.departamento').notEmpty().withMessage('El departamento es obligatorio').trim(),
  body('puesto').notEmpty().withMessage('El puesto es obligatorio').trim(),
  body('departamento').isIn(['Desarrollo', 'Recursos Humanos', 'Ventas', 'Marketing', 'Finanzas', 'Administración', 'Soporte Técnico'])
    .withMessage('Departamento inválido'),
  body('salario').isFloat({ min: 0 }).withMessage('El salario debe ser positivo'),
  body('tipoContrato').isIn(['Indefinido', 'Temporal', 'Prácticas', 'Freelance']).withMessage('Tipo de contrato inválido'),
  body('nivelEducacion').isIn(['Primaria', 'Secundaria', 'Universidad', 'Maestría', 'Doctorado', 'Técnico']).withMessage('Nivel educativo inválido'),
  body('contactoEmergencia.nombre').notEmpty().withMessage('Nombre del contacto obligatorio').trim(),
  body('contactoEmergencia.telefono').notEmpty().withMessage('Teléfono obligatorio').trim(),
  body('contactoEmergencia.relacion').notEmpty().withMessage('Relación obligatoria').trim()
];

const validarActualizarEmpleado = [
  body('nombres').optional().isLength({ max: 100 }).trim(),
  body('apellidos').optional().isLength({ max: 100 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('salario').optional().isFloat({ min: 0 }),
  body('departamento').optional().isIn(['Desarrollo', 'Recursos Humanos', 'Ventas', 'Marketing', 'Finanzas', 'Administración', 'Soporte Técnico'])
];


router.get('/', obtenerEmpleados);
router.get('/disponibles', obtenerEmpleadosDisponibles);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerEmpleadoPorId);
router.post('/', validarCrearEmpleado, crearEmpleado);
router.put('/:id', validarActualizarEmpleado, actualizarEmpleado);
router.delete('/:id', eliminarEmpleado);
router.post('/:id/asignar-proyecto', asignarEmpleadoAProyecto);
router.post('/:id/liberar-proyecto', liberarEmpleadoDeProyecto);

module.exports = router;
