/**
 * --------------------------------------------------
 * Capa de servicio para la gestión de calificaciones.
 * Implementa toda la lógica de negocio relacionada con:
 * - Creación y actualización de calificaciones
 * - Consultas filtradas por estudiante, grupo, materia
 * - Generación automática de calificaciones finales
 * - Manejo de transacciones para operaciones múltiples
 */

import Qualification from '../models/qualifications.js';
// Modelos comentados hasta implementar la generación de finales
// import Period from '../models/period.js';
// import AcademicLoad from '../models/academicLoad.js';
// import Subject from '../models/subject.js';
import mongoose from 'mongoose';

/**
 * Crea una nueva calificación
 * @param {Object} data - Datos de la calificación según modelo
 * @returns {Promise<Object>} Calificación creada
 */
export const create = async (data) => {
  const created = await Qualification.create(data);
  return created;
};

/**
 * Crea múltiples calificaciones en una sola transacción
 * Si falla alguna inserción, se revierten todas (rollback)
 * @param {Array} qualificationsArray - Array de objetos calificación
 * @returns {Promise<Array>} Calificaciones creadas
 */
export const createBatch = async (qualificationsArray) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const docs = await Qualification.insertMany(qualificationsArray, { session });
    await session.commitTransaction();
    session.endSession();
    return docs;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/**
 * Genera calificaciones finales automáticamente para un año y (opcionalmente) grupo o colegio.
 * 
 * Estrategia básica:
 * 1. Para cada combinación estudiante+materia, calcula el promedio ponderado
 *    según los porcentajes de cada período (Period.percentage)
 * 2. Si la materia NO es independiente y la institución usa porcentajes por
 *    materia dentro del área, la lógica ideal sería:
 *    - Calcular nota final del área: suma(nota_final_materia * academicLoad.percentage/100)
 * 3. Aquí implementamos: cálculo de notas finales por períodos; si se requiere
 *    nota final por área, se maneja en otro endpoint/reporte.
 * 
 * @param {Object} params - Parámetros de generación
 * @param {string} params.schoolId - ID del colegio
 * @param {number} params.year - Año académico
 * @param {string} [params.groupId] - ID del grupo (opcional)
 */

/*Cuando el modelo Period esté disponible, descomenta
 * este bloque y la importación al inicio:*/
/*export const generateFinals = async ({ schoolId, year, groupId = null }) => {
  // 1) Obtener períodos del año con sus porcentajes
  const periods = await Period.find({ school: schoolId, year }).lean();
  const periodsMap = {};
  let sumPercentages = 0;
  periods.forEach(p => {
    const pct = p.percentage ?? 0;
    periodsMap[p._id.toString()] = pct;
    sumPercentages += pct;
  });
  if (sumPercentages === 0) {
    // Evitar división por cero; asumir peso igual entre períodos si no hay porcentajes
    const equalPct = 100 / (periods.length || 1);
    periods.forEach(p => { periodsMap[p._id.toString()] = equalPct; });
    sumPercentages = 100;
  }

  // 2) Buscar calificaciones tipo PERIOD para el año y filtros
  const match = { year, gradeType: 'PERIOD', school: schoolId };
  if (groupId) match.group = groupId;

  const periodGrades = await Qualification.find(match)
    .select('student subject period grade')
    .lean();

  // Agrupar por estudiante + materia
  const grouping = {};
  for (const g of periodGrades) {
    const key = `${g.student}_${g.subject}`;
    grouping[key] = grouping[key] || { student: g.student, subject: g.subject, sumWeighted: 0, sumPct: 0 };
    const pct = periodsMap[(g.period || '').toString()] ?? 0;
    grouping[key].sumWeighted += (g.grade ?? 0) * (pct/100);
    grouping[key].sumPct += pct;
  }

  // 3) Crear/actualizar calificaciones tipo FINAL
  const results = [];
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const key of Object.keys(grouping)) {
      const item = grouping[key];
      const norm = item.sumPct || 100;
      const finalGrade = (item.sumWeighted / (norm/100));
      const finalObj = {
        school: schoolId,
        student: item.student,
        subject: item.subject,
        group: null, 
        period: null,
        year,
        gradeType: 'FINAL',
        grade: Number(finalGrade.toFixed(2)),
        evaluativeJudgment: '',
        registrationDate: new Date(),
      };
     
      const filter = { student: item.student, subject: item.subject, year, gradeType: 'FINAL', school: schoolId };
      if (groupId) filter.group = groupId;
      const updated = await Qualification.findOneAndUpdate(filter, finalObj, { upsert: true, new: true, session, setDefaultsOnInsert: true });
      results.push(updated);
    }
    await session.commitTransaction();
    session.endSession();
    return results;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};*/

/**
 * Actualiza una calificación existente
 * @param {string} id - ID de la calificación
 * @param {Object} changes - Cambios a aplicar
 * @returns {Promise<Object>} Calificación actualizada
 */
export const update = async (id, changes) => {
  return Qualification.findByIdAndUpdate(id, changes, { new: true });
};

/**
 * Obtiene una calificación por su ID
 * Incluye población de referencias:
 * - estudiante (student)
 * - materia (subject)
 * - período (period)
 * - registrado por (registeredBy)
 * - grupo (group)
 * - colegio (school)
 * @param {string} id - ID de la calificación
 * @returns {Promise<Object>} Calificación con referencias pobladas
 */
export const getById = async (id) => {
  return Qualification.findById(id).populate('student subject period registeredBy group school');
};

/**
 * Lista calificaciones de un estudiante, opcionalmente filtradas por año
 * @param {string} studentId - ID del estudiante
 * @param {number} [year] - Año académico (opcional)
 * @returns {Promise<Array>} Calificaciones ordenadas por año y tipo, incluye:
 * - materia (subject)
 * - período (period)
 * - grupo (group)
 * - colegio (school)
 */
export const listByStudent = async (studentId, year) => {
  const q = { student: studentId };
  if (year) q.year = year;
  return Qualification.find(q).populate('subject period group school').sort({ year: -1, gradeType: 1 });
};

/**
 * Lista calificaciones de un grupo, opcionalmente filtradas por año
 * @param {string} groupId - ID del grupo
 * @param {number} [year] - Año académico (opcional)
 * @returns {Promise<Array>} Calificaciones ordenadas por materia, incluye:
 * - estudiante (student)
 * - materia (subject) 
 * - período (period)
 */
export const listByGroup = async (groupId, year) => {
  const q = { group: groupId };
  if (year) q.year = year;
  return Qualification.find(q).populate('student subject period').sort({ 'subject': 1 });
};

/**
 * Lista calificaciones de un grupo en una materia específica
 * @param {string} groupId - ID del grupo
 * @param {string} subjectId - ID de la materia
 * @param {number} [year] - Año académico (opcional)
 * @returns {Promise<Array>} Calificaciones ordenadas por estudiante, incluye:
 * - estudiante (student)
 * - materia (subject)
 * - período (period)
 * - grupo (group)
 * - colegio (school)
 */
export const listByGroupAndSubject = async (groupId, subjectId, year) => {
  const query = { group: groupId, subject: subjectId };
  if (year) query.year = year;
  return Qualification.find(query)
    .populate('student subject period group school')
    .sort({ 'student': 1 });
};

/**
 * Lista todas las calificaciones finales de un año específico
 * @param {number} year - Año académico
 * @returns {Promise<Array>} Calificaciones finales ordenadas por grupo y estudiante, incluye:
 * - estudiante (student)
 * - materia (subject)
 * - grupo (group)
 * - colegio (school)
 */
export const listFinalsByYear = async (year) => {
  return Qualification.find({ year, gradeType: 'FINAL' })
    .populate('student subject group school')
    .sort({ group: 1, student: 1 });
};

/**
 * Lista calificaciones finales de un estudiante
 * @param {string} studentId - ID del estudiante
 * @param {number} [year] - Año académico (opcional)
 * @returns {Promise<Array>} Calificaciones finales ordenadas por año, incluye:
 * - materia (subject)
 * - grupo (group)
 * - colegio (school)
 */
export const listFinalsByStudent = async (studentId, year) => {
  const q = { student: studentId, gradeType: 'FINAL' };
  if (year) q.year = year;
  return Qualification.find(q)
    .populate('subject group school')
    .sort({ year: -1 });
};

/**
 * Lista calificaciones finales de un grupo
 * @param {string} groupId - ID del grupo
 * @param {number} [year] - Año académico (opcional)
 * @returns {Promise<Array>} Calificaciones finales ordenadas por estudiante, incluye:
 * - estudiante (student)
 * - materia (subject)
 * - colegio (school)
 */
export const listFinalsByGroup = async (groupId, year) => {
  const q = { group: groupId, gradeType: 'FINAL' };
  if (year) q.year = year;
  return Qualification.find(q)
    .populate('student subject school')
    .sort({ 'student': 1 });
};

/**
 * Actualiza una calificación final
 * Verifica que sea de tipo FINAL antes de actualizar
 * @param {string} id - ID de la calificación final
 * @param {Object} changes - Cambios a aplicar
 * @returns {Promise<Object>} Calificación final actualizada
 */
export const updateFinal = async (id, changes) => {
  return Qualification.findOneAndUpdate(
    { _id: id, gradeType: 'FINAL' },
    changes,
    { new: true }
  );
};
