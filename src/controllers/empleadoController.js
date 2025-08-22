const Empleado = require('../models/Empleado');
const Proyecto = require('../models/Proyecto');


exports.crearEmpleado = async (req, res) => {
  try {
    const empleado = new Empleado(req.body);
    await empleado.save();
    res.status(201).json(empleado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear empleado', error: error.message });
  }
};


exports.obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find().populate('proyectoActual', 'nombre codigoProyecto estado');
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empleados', error: error.message });
  }
};


exports.obtenerEmpleadoPorId = async (req, res) => {
  try {
    const empleado = await Empleado.findById(req.params.id).populate('proyectoActual', 'nombre codigoProyecto estado');
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empleado', error: error.message });
  }
};


exports.actualizarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar empleado', error: error.message });
  }
};


exports.eliminarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByIdAndDelete(req.params.id);
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json({ mensaje: 'Empleado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar empleado', error: error.message });
  }
};


exports.asignarEmpleadoAProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { idProyecto } = req.body;

    const empleado = await Empleado.findById(id);
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });

    if (empleado.proyectoActual) {
      return res.status(400).json({ mensaje: 'El empleado ya está asignado a un proyecto' });
    }

    const proyecto = await Proyecto.findById(idProyecto);
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });

    empleado.proyectoActual = proyecto._id;
    empleado.fechaAsignacionProyecto = new Date();
    await empleado.save();

    proyecto.empleados.push({ empleado: empleado._id });
    await proyecto.save();

    res.json({ mensaje: 'Empleado asignado al proyecto con éxito', empleado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar proyecto', error: error.message });
  }
};


exports.liberarEmpleadoDeProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findById(id);
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });

    if (!empleado.proyectoActual) {
      return res.status(400).json({ mensaje: 'El empleado no está asignado a ningún proyecto' });
    }

    const proyecto = await Proyecto.findById(empleado.proyectoActual);
    if (proyecto) {
      proyecto.empleados = proyecto.empleados.filter(e => e.empleado.toString() !== empleado._id.toString());
      await proyecto.save();
    }

    empleado.proyectoActual = null;
    empleado.fechaAsignacionProyecto = null;
    await empleado.save();

    res.json({ mensaje: 'Empleado liberado del proyecto con éxito', empleado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al liberar empleado', error: error.message });
  }
};


exports.obtenerEmpleadosDisponibles = async (req, res) => {
  try {
    const empleados = await Empleado.find({ proyectoActual: null, estado: 'Activo' });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empleados disponibles', error: error.message });
  }
};


exports.obtenerEstadisticas = async (req, res) => {
  try {
    const total = await Empleado.countDocuments();
    const activos = await Empleado.countDocuments({ estado: 'Activo' });
    const inactivos = await Empleado.countDocuments({ estado: 'Inactivo' });
    res.json({ total, activos, inactivos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
};
