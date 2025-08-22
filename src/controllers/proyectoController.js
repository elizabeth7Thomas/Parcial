const Proyecto = require('../models/Proyecto');
const Empleado = require('../models/Empleado');

exports.crearProyecto = async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear proyecto', error: error.message });
  }
};


exports.obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find()
      .populate('empleados.empleado', 'nombres apellidos codigoEmpleado departamento estado');
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proyectos', error: error.message });
  }
};


exports.obtenerProyectoPorId = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id)
      .populate('empleados.empleado', 'nombres apellidos codigoEmpleado departamento estado');
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proyecto', error: error.message });
  }
};


exports.actualizarProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar proyecto', error: error.message });
  }
};


exports.eliminarProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    res.json({ mensaje: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar proyecto', error: error.message });
  }
};


exports.actualizarProgreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { porcentajeCompletado } = req.body;

    if (porcentajeCompletado < 0 || porcentajeCompletado > 100) {
      return res.status(400).json({ mensaje: 'El porcentaje debe estar entre 0 y 100' });
    }

    const proyecto = await Proyecto.findByIdAndUpdate(
      id,
      { porcentajeCompletado },
      { new: true, runValidators: true }
    );

    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });

    res.json(proyecto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar progreso', error: error.message });
  }
};


exports.obtenerEmpleadosDelProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id)
      .populate('empleados.empleado', 'nombres apellidos codigoEmpleado departamento estado');
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    res.json(proyecto.empleados);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empleados del proyecto', error: error.message });
  }
};


exports.agregarEmpleadoAProyecto = async (req, res) => {
  try {
    const { id } = req.params; // idProyecto
    const { idEmpleado, rol, horasAsignadas } = req.body;

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });

    const empleado = await Empleado.findById(idEmpleado);
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });

    
    const yaAsignado = proyecto.empleados.some(e => e.empleado.toString() === idEmpleado);
    if (!yaAsignado) {
      proyecto.empleados.push({ empleado: idEmpleado, rol, horasAsignadas });
      await proyecto.save();
    }

    
    empleado.proyectoActual = proyecto._id;
    empleado.fechaAsignacionProyecto = new Date();
    await empleado.save();

    res.json({ mensaje: 'Empleado agregado al proyecto con éxito', proyecto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar empleado al proyecto', error: error.message });
  }
};


exports.removerEmpleadoDeProyecto = async (req, res) => {
  try {
    const { id } = req.params; 
    const { idEmpleado } = req.body;

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });

    proyecto.empleados = proyecto.empleados.filter(e => e.empleado.toString() !== idEmpleado);
    await proyecto.save();

    const empleado = await Empleado.findById(idEmpleado);
    if (empleado) {
      empleado.proyectoActual = null;
      empleado.fechaAsignacionProyecto = null;
      await empleado.save();
    }

    res.json({ mensaje: 'Empleado removido del proyecto con éxito', proyecto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al remover empleado del proyecto', error: error.message });
  }
};


exports.obtenerProyectosActivos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ estado: 'Activo' });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proyectos activos', error: error.message });
  }
};

