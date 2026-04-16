const mongoose = require('mongoose');

const satelliteDataSchema = new mongoose.Schema({
  // Processing metadata
  processingId: {
    type: String,
    required: true,
    unique: true
  },
  processingDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  satellite: {
    type: String,
    default: 'Sentinel-1',
    required: true
  },
  mode: {
    type: String,
    default: 'IW',
    required: true
  },
  polarization: {
    type: String,
    default: 'VV+VH',
    required: true
  },

  // Date range of images processed
  dateRange: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },

  // Image statistics
  imageStats: {
    totalImages: {
      type: Number,
      required: true
    },
    validImages: {
      type: Number,
      required: true
    },
    averageCoherence: Number,
    temporalBaseline: Number,
    spatialBaseline: Number
  },

  // Regional data - processed for entire Jharia region
  regionalData: {
    bounds: {
      north: Number,
      south: Number,
      east: Number,
      west: Number
    },
    meanVV: Number,
    meanVH: Number,
    meanBackscatter: Number,
    totalArea: Number,
    processedArea: Number
  },

  // Zone-specific processed data
  zones: [{
    zoneId: {
      type: String,
      required: true
    },
    zoneName: {
      en: String,
      hi: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    geometry: {
      type: { type: String, enum: ['Point', 'Polygon'], default: 'Point' },
      coordinates: [Number] // [lng, lat] for Point
    },

    // SAR measurements
    sarData: {
      vvMean: Number,
      vhMean: Number,
      backscatterMean: Number,
      coherence: Number,
      incidenceAngle: Number
    },

    // Subsidence calculations
    subsidence: {
      rate: Number, // mm/year
      cumulative: Number, // mm
      velocity: Number, // m/s
      standardDeviation: Number,
      confidence: Number // 0-100%
    },

    // Risk assessment
    riskAssessment: {
      level: {
        type: String,
        enum: ['critical', 'high', 'moderate', 'low', 'stable'],
        required: true
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'unknown']
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },

    // Historical comparison
    historicalData: [{
      date: Date,
      rate: Number,
      coherence: Number
    }],

    // Quality indicators
    quality: {
      dataCompleteness: Number, // 0-100%
      temporalCoverage: Number, // days
      spatialResolution: Number // meters
    }
  }],

  // Processing status and metadata
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'partial'],
    default: 'processing'
  },
  processingTime: Number, // seconds
  errorMessage: String,

  // Data source information
  dataSource: {
    provider: {
      type: String,
      default: 'ESA Copernicus'
    },
    collection: {
      type: String,
      default: 'COPERNICUS/S1_GRD'
    },
    apiVersion: String,
    processingEngine: {
      type: String,
      default: 'Google Earth Engine'
    }
  },

  // Validation and quality control
  validation: {
    groundTruthComparison: Boolean,
    accuracyAssessment: {
      rmse: Number, // Root Mean Square Error
      correlation: Number, // with ground measurements
      confidenceInterval: Number
    },
    qualityFlags: [String] // ['low_coherence', 'atmospheric_effects', etc.]
  }
}, {
  timestamps: true,
  indexes: [
    { processingId: 1 },
    { processingDate: -1 },
    { 'dateRange.end': -1 },
    { 'zones.zoneId': 1 },
    { status: 1 }
  ]
});

// Static methods
satelliteDataSchema.statics.getLatestProcessing = function() {
  return this.findOne({ status: 'completed' }).sort({ processingDate: -1 });
};

satelliteDataSchema.statics.getZoneHistory = function(zoneId, limit = 10) {
  return this.find(
    { 'zones.zoneId': zoneId, status: 'completed' },
    { 'zones.$': 1, processingDate: 1, dateRange: 1 }
  ).sort({ processingDate: -1 }).limit(limit);
};

satelliteDataSchema.statics.getRegionalStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        processingDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        avgSubsidenceRate: { $avg: '$zones.subsidence.rate' },
        maxSubsidenceRate: { $max: '$zones.subsidence.rate' },
        totalZones: { $sum: { $size: '$zones' } },
        criticalZones: {
          $sum: {
            $size: {
              $filter: {
                input: '$zones',
                cond: { $eq: ['$$this.riskAssessment.level', 'critical'] }
              }
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('SatelliteData', satelliteDataSchema);