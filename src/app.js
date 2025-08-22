const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const empleadoRoutes = require('./routes/empleadoRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');


const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/empleados', empleadoRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/asignaciones', asignacionRoutes);

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Sistema de Recursos Humanos',
    version: '1.0.0',
    endpoints: {
      empleados: '/api/empleados',
      proyectos: '/api/proyectos',
      asignaciones: '/api/asignaciones'
    }
  });
});


app.use('*', (req, res) => {
  res.status(404).json({
    estado: 'error',
    mensaje: 'Ruta no encontrada'
  });
});


app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  res.status(err.status || 500).json({
    estado: 'error',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;