import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './db.js';


import qualificationsRoutes from './routes/qualificationsRoutes.js';
import academicYearRoutes from './routes/academicYearRoutes.js';
import authRoutes from './routes/auth.js'

// ✅ IMPORTAR MODELOS PARA REGISTRARLOS EN MONGOOSE -- PRUEBAS POSTMAN -- BORRAR ESTOS CUANDO SE INTEGRE LOS MODELOS REALES
import './models/school.js';
import './models/subject.js';
import './models/group.js';
import './models/period.js';

dotenv.config(); // Carga variables de entorno (.env)
connectDB(); // Conexión a MongoDB

const app = express();

// Middlewares globales
app.use(cors()); // Permitir peticiones de otros orígenes
app.use(express.json()); // Parsear JSON
app.use(morgan('dev')); // Logs de peticiones (opcional)

// Rutas principales
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestión Escolar funcionando correctamente ✅' });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Montar las rutas del módulo de calificaciones
app.use('/api/calificaciones', qualificationsRoutes);

// Montar las rutas del módulo de vigencias
app.use('/api/vigencias', academicYearRoutes);

// Manejo básico de errores (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada 😕' });
});

// Servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
