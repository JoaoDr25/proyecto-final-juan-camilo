import express from 'express';
import { check, validationResult } from 'express-validator';
import * as controller from '../controllers/qualificationController.js';
// import auth from '../middlewares/auth.js';
// import roleCheck from '../middlewares/roleCheck.js';

const router = express.Router();

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
};

/**
 * Obtener calificación por ID
 * GET /api/calificaciones/:id
 */
router.get(
  '/:id',
  [
    check('id').isMongoId().withMessage('El ID de la calificación no es válido'),
    // auth,
    // roleCheck(['principal', 'coordinator', 'secretary']),
  ],
  handleValidationErrors,
  controller.get
);

/**
 * Calificaciones de un estudiante
 * GET /api/calificaciones/estudiantes/:studentId/calificaciones
 */
router.get(
  '/estudiantes/:studentId/calificaciones',
  [
    check('studentId').isMongoId().withMessage('El ID del estudiante no es válido'),
    check('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser válido'),
    // auth,
    // roleCheck(['principal', 'coordinator', 'secretary']),
  ],
  handleValidationErrors,
  controller.listByStudent
);

/**
 * Calificaciones de un grupo
 * GET /api/calificaciones/grupos/:groupId/calificaciones
 */
router.get(
  '/grupos/:groupId/calificaciones',
  [
    check('groupId').isMongoId().withMessage('El ID del grupo no es válido'),
    check('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser válido'),
    // auth,
    // roleCheck(['principal', 'coordinator', 'secretary']),
  ],
  handleValidationErrors,
  controller.listByGroup
);

/**
 * Calificaciones por grupo y materia
 * GET /api/calificaciones/grupos/:groupId/materias/:subjectId/calificaciones
 */
router.get(
  '/grupos/:groupId/materias/:subjectId/calificaciones',
  [
    check('groupId').isMongoId().withMessage('El ID del grupo no es válido'),
    check('subjectId').isMongoId().withMessage('El ID de la materia no es válido'),
    check('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser válido'),
    // auth,
    // roleCheck(['principal', 'coordinator', 'secretary']),
  ],
  handleValidationErrors,
  controller.listByGroupAndSubject
);

/**
 * Listar todas las calificaciones finales por año
 * GET /api/calificaciones/finales/:year
 */
router.get(
  '/finales/:year',
  [
    check('year').isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un número válido'),
    // auth,
    // roleCheck(['principal', 'coordinator', 'secretary']),
  ],
  handleValidationErrors,
  controller.listFinalsByYear
);

/**
 * Calificaciones finales de un estudiante (por año)
 * GET /api/calificaciones/estudiantes/:studentId/calificaciones/finales
 */
router.get(
  '/estudiantes/:studentId/calificaciones/finales',
  [
    check('studentId').isMongoId().withMessage('El ID del estudiante no es válido'),
    check('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser válido'),
    // auth,
    // roleCheck(['principal', 'coordinator', 'secretary']),
  ],
  handleValidationErrors,
  controller.listFinalsByStudent
);

/**
 * Calificaciones finales de un grupo
 * GET /api/calificaciones/grupos/:groupId/calificaciones/finales
 */
router.get(
  '/grupos/:groupId/calificaciones/finales',
  [
    check('groupId').isMongoId().withMessage('El ID del grupo no es válido'),
    check('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser válido'),
    // auth,
    // roleCheck(['principal', 'coordinator', 'secretary']),
  ],
  handleValidationErrors,
  controller.listFinalsByGroup
);

/**
 * Crear calificación individual
 * POST /api/calificaciones
 */
router.post(
  '/',
  [
    check('school').isMongoId().withMessage('El ID del colegio no es válido'),
    check('student').isMongoId().withMessage('El ID del estudiante no es válido'),
    check('subject').isMongoId().withMessage('El ID de la materia no es válido'),
    check('group').optional().isMongoId().withMessage('El ID del grupo no es válido'),
    check('year').isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser válido'),
    check('gradeType').isIn(['PERIOD', 'FINAL']).withMessage('El tipo de nota debe ser PERIOD o FINAL'),
    check('grade').isFloat({ min: 0, max: 5 }).withMessage('La nota debe estar entre 0 y 5'),
    // auth,
    // roleCheck(['secretary']),
  ],
  handleValidationErrors,
  controller.create
);

/**
 * Crear múltiples calificaciones (lote)
 * POST /api/calificaciones/lote
 */
router.post(
  '/lote',
  [
    check().isArray().withMessage('Debe enviar un array de calificaciones'),
    // auth,
    // roleCheck(['secretary']),
  ],
  handleValidationErrors,
  controller.createBatch
);

/**
 * Actualizar calificación de período
 * PUT /api/calificaciones/:id
 */
router.put(
  '/:id',
  [
    check('id').isMongoId().withMessage('El ID de la calificación no es válido'),
    check('grade').optional().isFloat({ min: 0, max: 5 }).withMessage('La nota debe estar entre 0 y 5'),
    // auth,
    // roleCheck(['secretary']),
  ],
  handleValidationErrors,
  controller.update
);

/**
 * Actualizar calificación final
 * PUT /api/calificaciones/finales/:id
 */
router.put(
  '/finales/:id',
  [
    check('id').isMongoId().withMessage('El ID de la calificación final no es válido'),
    check('grade').optional().isFloat({ min: 0, max: 5 }).withMessage('La nota debe estar entre 0 y 5'),
    // auth,
    // roleCheck(['secretary']),
  ],
  handleValidationErrors,
  controller.updateFinal
);

export default router;

