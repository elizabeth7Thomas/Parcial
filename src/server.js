require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');


const empleadoRoutes = require('./routes/empleadoRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');


const app = express();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    estado: 'error',
    mensaje: 'Demasiadas peticiones, intenta de nuevo en 15 minutos'
  }
});


app.use(helmet());
app.use(limiter);
app.use(mongoSanitize());
app.use(xss());


app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


app.use('/api/empleados', empleadoRoutes);
app.use('/api/proyectos', proyectoRoutes);


app.get('/api/health', (req, res) => {
  res.json({
    estado: 'éxito',
    mensaje: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});


app.all('*', (req, res) => {
  res.status(404).json({
    estado: 'error',
    mensaje: `No se encontró la ruta ${req.originalUrl}`
  });
});


app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      estado: 'error',
      mensaje: 'Datos inválidos',
      errores: errors
    });
  }


  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      estado: 'error',
      mensaje: `Ya existe un registro con este ${field}`
    });
  }

 
  if (err.name === 'CastError') {
    return res.status(400).json({
      estado: 'error',
      mensaje: 'ID inválido'
    });
  }

  res.status(err.statusCode || 500).json({
    estado: 'error',
    mensaje: err.message || 'Error interno del servidor'
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};


const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });

  
  process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor');
    server.close(() => {
      console.log('Proceso terminado');
      mongoose.connection.close();
    });
  });
};

startServer();

module.exports = app;
