import express from 'express';
import * as controller from '../controllers/qualificationController.js';
// Autenticación temporalmente desactivada - descomentar cuando el módulo central esté listo
// import auth from '../middlewares/auth.js';
// import roleCheck from '../middlewares/roleCheck.js';

const router = express.Router();

/**
 * Reglas de acceso según documentación:
 * - Rector, Coordinador: solo pueden consultar (GET)
 * - Secretaria: puede realizar todas las operaciones (GET, POST, PUT)
 */

// Los siguientes endpoints funcionaran sin autenticacion temporalmente, si se necesita definir role para cada endpoint descomentar auth y roleCheck.

// Obtener calificación por ID
router.get('/:id',
  // auth,
  // roleCheck(['principal', 'coordinator', 'secretary']), 
  controller.get
);

// Calificaciones de un estudiante
router.get('/estudiantes/:studentId/calificaciones',
  // auth,
  // roleCheck(['principal', 'coordinator', 'secretary']),
  controller.listByStudent
);

// Calificaciones de un grupo
router.get('/grupos/:groupId/calificaciones',
  // auth,
  // roleCheck(['principal', 'coordinator', 'secretary']),
  controller.listByGroup
);

// Calificaciones por grupo y materia
router.get('/grupos/:groupId/materias/:subjectId/calificaciones',
  // auth,
  // roleCheck(['principal', 'coordinator', 'secretary']),
  controller.listByGroupAndSubject
);

// Listar todas las calificaciones finales por año
router.get('/finales/:year',
  // auth,
  // roleCheck(['principal', 'coordinator', 'secretary']),
  controller.listFinalsByYear
);

// Calificaciones finales de un estudiante (por año)
router.get('/estudiantes/:studentId/calificaciones/finales',
  // auth,
  // roleCheck(['principal', 'coordinator', 'secretary']),
  controller.listFinalsByStudent
);

// Calificaciones finales de un grupo
router.get('/grupos/:groupId/calificaciones/finales',
  // auth,
  // roleCheck(['principal', 'coordinator', 'secretary']),
  controller.listFinalsByGroup
);

// Crear calificación individual
router.post('/',
  // auth,
  // roleCheck(['secretary']),
  controller.create
);

// Crear múltiples calificaciones (lote)
router.post('/lote',
  // auth,
  // roleCheck(['secretary']),
  controller.createBatch
);

// Generar calificaciones finales automáticamente (Como aún no se tiene el modelo Period, se comenta completamente la función generateFinals en qualificationServces.js para evitar errores accidentales). Posteriormente descomentar esta ruta.
// router.post('/generar-finales',
//   // auth,
//   // roleCheck(['secretary']),
//   controller.generateFinals
// );

// Actualizar calificación de período
router.put('/:id',
  // auth,
  // roleCheck(['secretary']),
  controller.update
);

// Actualizar calificación final
router.put('/finales/:id',
  // auth,
  // roleCheck(['secretary']),
  controller.updateFinal
);

export default router;
