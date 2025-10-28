import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const schoolUserSchema = new Schema({
  // Campos de identificación
  identificationType: {
    type: String,
    enum: ['CC', 'TI', 'CE', 'PP'],
    required: true,
    description: 'Tipo de documento: CC (Cédula), TI (Tarjeta Identidad), CE (Cédula Extranjería), PP (Pasaporte)'
  },
  identificationNumber: {
    type: String,
    required: true,
    unique: true,
    description: 'Número de documento de identidad (único en el sistema)'
  },

  // Información personal
  firstName: { 
    type: String, 
    required: true,
    description: 'Nombre(s) del usuario'
  },
  lastName: { 
    type: String, 
    required: true,
    description: 'Apellido(s) del usuario'
  },
  email: { 
    type: String, 
    required: false,
    description: 'Correo electrónico (opcional, no requiere ser único)'
  },

  // Seguridad y acceso
  password: { 
    type: String, 
    required: true,
    description: 'Contraseña (se guarda hasheada automáticamente)'
  },
  role: {
    type: String,
    enum: ['rector', 'coordinador', 'secretaria', 'profesor', 'acudiente', 'estudiante'],
    required: true,
    description: 'Rol del usuario: principal (rector), coordinator (coordinador), ' +
                'secretary (secretaria), teacher (profesor), parent (acudiente), ' +
                'student (estudiante)'
  },

  // Relaciones
  school: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: false,
    description: 'Institución educativa asociada (opcional)'
  }
}, { 
    timestamps: true,
    description: 'Modelo de usuarios del sistema escolar'
});

/**
 * Middleware pre-save
 * ------------------
 * Se ejecuta antes de guardar el documento.
 * Si la contraseña fue modificada, la hashea usando bcrypt.
 * La sal (salt) se genera automáticamente con factor de costo 10.
 */
schoolUserSchema.pre('save', async function (next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) return next();
  
  // Generar sal y hashear contraseña
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Método: comparePassword
 * ----------------------
 * Compara una contraseña en texto plano con la hasheada almacenada.
 * 
 * @param {string} enteredPassword - Contraseña ingresada a validar
 * @returns {Promise<boolean>} - true si coinciden, false si no
 */
schoolUserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default model('SchoolUsers', schoolUserSchema);

