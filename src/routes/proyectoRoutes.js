const express = require('express');
const { body } = require('express-validator');
const {
  obtenerProyectos,
  obtenerProyectoPorId,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  obtenerEmpleadosDelProyecto,
  agregarEmpleadoAProyecto,
  removerEmpleadoDeProyecto,
  obtenerProyectosActivos
} = require('../controllers/proyectoController');

const router = express.Router();


const validarCrearProyecto = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 200 }).withMessage('Máximo 200 caracteres').trim(),
  body('descripcion').notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ max: 1000 }).withMessage('Máximo 1000 caracteres').trim(),
  body('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fechaFinalizacion').isISO8601().withMessage('Fecha inválida')
    .custom((value, { req }) => {
      if (value <= req.body.fechaInicio) {
        throw new Error('La fecha final debe ser posterior a la de inicio');
      }
      return true;
    }),
  body('presupuesto').isFloat({ min: 0 }).withMessage('Debe ser positivo'),
  body('cliente.nombre').notEmpty().withMessage('Nombre del cliente obligatorio').trim(),
  body('cliente.email').isEmail().withMessage('Email inválido').normalizeEmail()
];


const validarActualizarProyecto = [
  body('nombre').optional().isLength({ max: 200 }).withMessage('Máximo 200 caracteres').trim(),
  body('descripcion').optional().isLength({ max: 1000 }).withMessage('Máximo 1000 caracteres').trim(),
  body('fechaInicio').optional().isISO8601().withMessage('Fecha inválida'),
  body('fechaFinalizacion').optional().isISO8601().withMessage('Fecha inválida')
    .custom((value, { req }) => {
      if (req.body.fechaInicio && value <= req.body.fechaInicio) {
        throw new Error('La fecha final debe ser posterior a la de inicio');
      }
      return true;
    }),
  body('presupuesto').optional().isFloat({ min: 0 }).withMessage('Debe ser positivo'),
  body('cliente.nombre').optional().trim(),
  body('cliente.email').optional().isEmail().withMessage('Email inválido').normalizeEmail()
];


router.get('/', obtenerProyectos);
router.get('/activos', obtenerProyectosActivos);
router.get('/:id', obtenerProyectoPorId);
router.get('/:id/empleados', obtenerEmpleadosDelProyecto);
router.post('/', validarCrearProyecto, crearProyecto);
router.put('/:id', validarActualizarProyecto, actualizarProyecto);
router.delete('/:id', eliminarProyecto);
router.post('/:id/agregar-empleado', agregarEmpleadoAProyecto);
router.post('/:id/remover-empleado', removerEmpleadoDeProyecto);

module.exports = router;
