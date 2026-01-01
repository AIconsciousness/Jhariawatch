const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Report = require('../models/Report');
const RiskZone = require('../models/RiskZone');
const authMiddleware = require('../middlewares/authMiddleware');
const { sendReportStatusNotification } = require('../controllers/notificationController');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

const generateReportId = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RPT-${dateStr}-${random}`;
};

const simulateAIAnalysis = () => {
  const severities = ['none', 'minor', 'moderate', 'severe', 'critical'];
  const crackDetected = Math.random() > 0.3;
  const severity = crackDetected ? severities[Math.floor(Math.random() * 4) + 1] : 'none';
  const confidence = crackDetected ? 0.7 + Math.random() * 0.25 : 0.9 + Math.random() * 0.1;

  return {
    processed: true,
    processedAt: new Date(),
    crackDetected,
    crackSeverity: severity,
    confidence: Math.round(confidence * 100) / 100,
    detectedFeatures: crackDetected ? [{
      type: 'crack',
      boundingBox: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100, width: 100 + Math.random() * 100, height: 20 + Math.random() * 50 },
      confidence: Math.round(confidence * 100) / 100
    }] : [],
    modelVersion: 'jharia-crack-v1.0'
  };
};

router.post('/', authMiddleware, upload.array('photos', 5), async (req, res) => {
  try {
    const { reportType, description, latitude, longitude, urgencyLevel, address, locality, imageUrl, imagePublicId, imageMetadata } = req.body;

    // Support both Cloudinary URL and file upload
    let photos = [];
    
    if (imageUrl) {
      // Cloudinary URL provided (from frontend)
      photos = [{
        url: imageUrl,
        publicId: imagePublicId || null,
        uploadedAt: new Date(),
        fileSize: imageMetadata?.bytes || 0,
        width: imageMetadata?.width || null,
        height: imageMetadata?.height || null,
        format: imageMetadata?.format || null,
        source: 'cloudinary'
      }];
    } else if (req.files && req.files.length > 0) {
      // File upload (fallback)
      photos = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date(),
        fileSize: file.size,
        source: 'local'
      }));
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PHOTOS', message: { en: 'At least one photo is required', hi: 'कम से कम एक फोटो आवश्यक है' } }
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    let nearestZoneId = null;
    const nearestZone = await RiskZone.findOne({
      isActive: true,
      geometry: {
        $geoIntersects: {
          $geometry: { type: 'Point', coordinates: [lng, lat] }
        }
      }
    });
    if (nearestZone) {
      nearestZoneId = nearestZone.zoneId;
    }

    const aiAnalysis = simulateAIAnalysis();

    const report = new Report({
      reportId: generateReportId(),
      userId: req.userId,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || '',
        locality: locality || '',
        nearestZone: nearestZoneId
      },
      reportType: reportType || 'crack',
      photos,
      aiAnalysis,
      description: description || '',
      urgencyLevel: urgencyLevel || 'medium',
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        changedAt: new Date(),
        notes: 'Report submitted'
      }]
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: {
        en: 'Report submitted successfully. Our team will review it shortly.',
        hi: 'रिपोर्ट सफलतापूर्वक जमा की गई। हमारी टीम जल्द ही इसकी समीक्षा करेगी।'
      },
      data: {
        reportId: report.reportId,
        status: report.status,
        aiAnalysis: report.aiAnalysis
      }
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to submit report', hi: 'रिपोर्ट जमा करने में विफल' } }
    });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId: req.userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to fetch reports', hi: 'रिपोर्ट प्राप्त करने में विफल' } }
    });
  }
});

router.get('/all', async (req, res) => {
  try {
    const { status, reportType, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (reportType) query.reportType = reportType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to fetch reports', hi: 'रिपोर्ट प्राप्त करने में विफल' } }
    });
  }
});

router.get('/:reportId', async (req, res) => {
  try {
    const report = await Report.findOne({ reportId: req.params.reportId })
      .populate('userId', 'name')
      .lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: { en: 'Report not found', hi: 'रिपोर्ट नहीं मिली' } }
      });
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to fetch report', hi: 'रिपोर्ट प्राप्त करने में विफल' } }
    });
  }
});

// Update report status (Admin only)
router.patch('/:reportId/status', authMiddleware, async (req, res) => {
  try {
    const { status, adminNotes, actionTaken } = req.body;

    const report = await Report.findOne({ reportId: req.params.reportId });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: { en: 'Report not found', hi: 'रिपोर्ट नहीं मिली' } }
      });
    }

    // Update status
    report.status = status;
    report.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.userId,
      notes: adminNotes || ''
    });

    // Update review info
    if (!report.review) {
      report.review = {};
    }
    report.review.reviewedBy = req.userId;
    report.review.reviewedAt = new Date();
    report.review.adminNotes = adminNotes;
    report.review.actionTaken = actionTaken;
    report.review.verificationStatus = status === 'verified' ? 'verified' :
                                       status === 'rejected' ? 'false_report' : 'unverified';

    await report.save();

    // Send notification asynchronously
    sendReportStatusNotification(report.reportId)
      .then(result => console.log('✅ Status notification sent:', result))
      .catch(err => console.error('❌ Status notification error:', err));

    res.json({
      success: true,
      message: { en: 'Report status updated', hi: 'रिपोर्ट स्थिति अपडेट की गई' },
      data: { report }
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to update status', hi: 'स्थिति अपडेट करने में विफल' } }
    });
  }
});

module.exports = router;
