import * as service from '../services/qualificationService.js';

/**
 * get
 * - Obtiene una calificación por su _id.
 * - Path params: :id
 * - Respuestas: 200 -> objeto calificación, 404 -> no encontrada, 500 -> error
 */
export const get = async (req, res) => {
  try {
    const qualification = await service.getById(req.params.id);
    if (!qualification) return res.status(404).json({ message: 'No encontrado' });
    res.json(qualification);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * listByStudent
 * - Lista las calificaciones de un estudiante.
 * - Path params: :studentId
 * - Query params opcional: ?year=2023
 * - Respuesta: array de calificaciones
 */
export const listByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year } = req.query;
    const list = await service.listByStudent(studentId, year);
    res.json(list);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

/**
 * listByGroup
 * - Lista las calificaciones de un grupo.
 * - Path params: :groupId
 * - Query params opcional: ?year=2023
 */
export const listByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { year } = req.query;
    const list = await service.listByGroup(groupId, year);
    return res.status(200).json(list);
  } catch (err) {
    if (!res.headersSent)
      return res.status(500).json({ message: err.message });
  }
};

/**
 * listByGroupAndSubject
 * - Lista las calificaciones de un grupo para una materia específica.
 * - Path params: :groupId, :subjectId
 * - Query params opcional: ?year=2023
 */
export const listByGroupAndSubject = async (req, res) => {
  try {
    const { groupId, subjectId } = req.params;
    const { year } = req.query;
    const data = await service.listByGroupAndSubject(groupId, subjectId, year);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * listFinalsByYear
 * - Lista todas las calificaciones finales de un año concreto.
 * - Path params: :year
 */
export const listFinalsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const data = await service.listFinalsByYear(year);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * listFinalsByStudent
 * - Lista las calificaciones finales de un estudiante (opcionalmente por año).
 * - Path params: :studentId
 * - Query params opcional: ?year=2023
 */
export const listFinalsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year } = req.query;
    const data = await service.listFinalsByStudent(studentId, year);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * listFinalsByGroup
 * - Lista las calificaciones finales de un grupo (opcionalmente por año).
 * - Path params: :groupId
 */
export const listFinalsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { year } = req.query;
    const data = await service.listFinalsByGroup(groupId, year);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * create
 * - Crea una calificación (tipo PERIOD o FINAL según el body).
 * - Body: objeto con los campos del modelo qualifications.js
 * - Actualmente asigna registeredBy usando req.user (si existe) o el valor
 *   proporcionado en el body. Como autenticación puede estar desactivada,
 *   registeredBy es opcional.
 */
export const create = async (req, res) => {
  try {
    const data = req.body;
    // Por ahora permitimos que la secretaria cree calificaciones. En el futuro
    // se puede validar req.user.role === 'teacher' y que pertenezca a la materia/grupo.
    data.registeredBy = req.user?._id || data.registeredBy;
    const created = await service.create(data);
    res.status(201).json(created);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

/**
 * createBatch
 * - Inserta múltiples calificaciones en una operación atómica (transaction).
 * - Body: array de objetos con la estructura del modelo.
 */
export const createBatch = async (req, res) => {
  try {
    const data = await service.createBatch(req.body);
    res.status(201).json({
      message: `${data.length} calificaciones creadas correctamente`,
      data
    });
  } catch (err) {
    console.error('❌ Error al crear calificaciones en lote:', err);
    res.status(400).json({ message: err.message });
  }
};

/**
 * generateFinals
 * - Genera calificaciones finales a partir de las calificaciones por periodo.
 * - Body: { schoolId, year, groupId (opcional) }
 * - Devuelve { count, results } con los finales generados/actualizados.
 */
export const generateFinals = async (req, res) => {
  try {
    const { schoolId, year, groupId } = req.body;
    const results = await service.generateFinals({ schoolId, year, groupId });
    res.json({ count: results.length, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * update
 * - Actualiza una calificación por su id (normalmente calificación de periodo).
 * - Path params: :id
 * - Body: campos a actualizar
 */
export const update = async (req, res) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

/**
 * updateFinal
 * - Actualiza una calificación final (gradeType === 'FINAL').
 * - Path params: :id
 * - Body: campos a actualizar (por ejemplo: grade, observations)
 */
export const updateFinal = async (req, res) => {
  try {
    const { id } = req.params;
    const changes = req.body;
    const updated = await service.updateFinal(id, changes);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
