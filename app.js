import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

import qualificationsRoutes from './routes/qualificationsRoutes.js';
import validityRoutes from './routes/validityRoutes.js';
import authRoutes from './routes/auth.js'

// PRUEBAS POSTMAN -- BORRAR ESTOS CUANDO SE INTEGRE LOS MODELOS REALES
import './models/school.js';
import './models/subject.js';
import './models/group.js';
import './models/headquarter.js';

const app = express();

// Middlewares globales
app.use(cors()); // Permitir peticiones de otros orígenes
app.use(express.json()); // Parsear JSON
app.use(morgan('dev')); // Logs de peticiones (opcional)

dotenv.config(); // Carga variables de entorno (.env)

// Conexión a MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'sistema_educativo',
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

await connectDB();

// Rutas principales
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestión Escolar funcionando correctamente ✅' });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Montar las rutas del módulo de calificaciones
app.use('/api/calificaciones', qualificationsRoutes);

// Montar las rutas del módulo de vigencias
app.use('/api/vigencias', validityRoutes);

// Manejo básico de errores (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada 😕' });
});

// Servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
