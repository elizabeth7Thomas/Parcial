
const express = require('express');
const router = express.Router();


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


const validarCrearEmpleado = [ /* ... */ ];
const validarActualizarEmpleado = [ /* ... */ ];
const validarCrearProyecto = [ /* ... */ ];
const validarActualizarProyecto = [ /* ... */ ];

router.get('/empleados', obtenerEmpleados);
router.get('/empleados/disponibles', obtenerEmpleadosDisponibles);
router.get('/empleados/estadisticas', obtenerEstadisticas);
router.get('/empleados/:id', obtenerEmpleadoPorId);
router.post('/empleados', validarCrearEmpleado, crearEmpleado);
router.put('/empleados/:id', validarActualizarEmpleado, actualizarEmpleado);
router.delete('/empleados/:id', eliminarEmpleado);
router.post('/empleados/:id/asignar-proyecto', asignarEmpleadoAProyecto);
router.post('/empleados/:id/liberar-proyecto', liberarEmpleadoDeProyecto);


router.get('/proyectos', obtenerProyectos);
router.get('/proyectos/activos', obtenerProyectosActivos);
router.get('/proyectos/:id', obtenerProyectoPorId);
router.get('/proyectos/:id/empleados', obtenerEmpleadosDelProyecto);
router.post('/proyectos', validarCrearProyecto, crearProyecto);
router.put('/proyectos/:id', validarActualizarProyecto, actualizarProyecto);
router.delete('/proyectos/:id', eliminarProyecto);
router.post('/proyectos/:id/agregar-empleado', agregarEmpleadoAProyecto);
router.post('/proyectos/:id/remover-empleado', removerEmpleadoDeProyecto);

module.exports = router;