const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado :D ${conn.connection.host}`);
  } catch (error) {
    console.error('Error conectando a MongoDB :c', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('conectado a MongoDB :D');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión Mongoose :c', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

module.exports = connectDB;