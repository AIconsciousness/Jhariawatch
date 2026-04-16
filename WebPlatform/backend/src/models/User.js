const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    required: false
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi'],
    default: 'hi'
  },
  addressDetails: {
    area: {
      type: String,
      required: false,
      trim: true,
      description: 'Area/Colony name in Jharia (e.g., Alkusa, Ena, Tisra)'
    },
    street: {
      type: String,
      required: false,
      trim: true,
      description: 'Street/Road name'
    },
    landmark: {
      type: String,
      trim: true,
      description: 'Nearby landmark for easy identification'
    },
    pincode: {
      type: String,
      trim: true,
      match: /^[0-9]{6}$/
    },
    nearbyMiningSite: {
      type: String,
      trim: true,
      description: 'Optional: Name of nearby mining site/colliery'
    }
  },
  homeLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] },
    riskZoneId: String,
    currentRiskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical']
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'bccl_official', 'govt_official'],
    default: 'user'
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true },
    weeklyUpdates: { type: Boolean, default: true },
    reportUpdates: { type: Boolean, default: true }
  },
  subscribedZones: [String],
  lastActive: Date,
  reportsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  fcmToken: {
    type: String,
    default: null,
    description: 'Firebase Cloud Messaging token for push notifications'
  },
  fcmTokenUpdatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.index({ 'homeLocation': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
