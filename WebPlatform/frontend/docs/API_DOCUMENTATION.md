# 🔌 API Documentation / एपीआई डॉक्यूमेंटेशन

## JhariaWatch Backend API Reference

**Base URL:** `http://localhost:5000/api` (Development)  
**Production URL:** `https://api.jhariawatch.in/api`

---

## 1. Authentication APIs

### 1.1 Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "firebaseUid": "firebase_user_id_here",
  "phone": "+919876543210",
  "name": "Rahul Kumar",
  "preferredLanguage": "hi",
  "homeLocation": {
    "coordinates": [86.396, 23.767],
    "address": "Near Alkusa Colliery, Jharia",
    "locality": "Alkusa"
  },
  "fcmToken": "firebase_fcm_token_here"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "user_object_id",
    "token": "jwt_access_token",
    "user": {
      "_id": "user_object_id",
      "name": "Rahul Kumar",
      "phone": "+919876543210",
      "role": "user",
      "preferredLanguage": "hi",
      "homeLocation": {
        "coordinates": [86.396, 23.767],
        "locality": "Alkusa"
      }
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Phone number already registered"
}
```

---

### 1.2 Login User

**POST** `/auth/login`

Login with Firebase authentication.

**Request Body:**
```json
{
  "firebaseUid": "firebase_user_id_here",
  "fcmToken": "updated_fcm_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_access_token",
    "user": {
      "_id": "user_object_id",
      "name": "Rahul Kumar",
      "role": "user",
      "preferredLanguage": "hi"
    }
  }
}
```

---

### 1.3 Update Profile

**PUT** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Rahul Kumar Updated",
  "preferredLanguage": "en",
  "homeLocation": {
    "coordinates": [86.400, 23.758],
    "address": "New Address",
    "locality": "Ena"
  },
  "notifications": {
    "enabled": true,
    "emergencyAlerts": true,
    "weeklyUpdates": false
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

---

## 2. Risk Zone APIs

### 2.1 Get All Risk Zones

**GET** `/risk/zones`

Get all active risk zones with GeoJSON data.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| riskLevel | string | Filter by risk level (critical, high, moderate, low, stable) |
| bounds | string | Bounding box "minLng,minLat,maxLng,maxLat" |

**Example:** `/risk/zones?riskLevel=critical`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "zoneId": "alkusa_critical_01",
          "zoneName": {
            "en": "Alkusa Critical Zone",
            "hi": "अल्कुसा क्रिटिकल जोन"
          },
          "riskLevel": "critical",
          "riskScore": 95,
          "subsidenceRate": 27,
          "description": {
            "en": "Critical subsidence zone...",
            "hi": "क्रिटिकल धंसाव क्षेत्र..."
          },
          "color": "#FF0000"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[86.394, 23.765], [86.398, 23.765], [86.398, 23.769], [86.394, 23.769], [86.394, 23.765]]]
        }
      }
    ],
    "metadata": {
      "totalZones": 15,
      "criticalZones": 6,
      "highZones": 5,
      "lastUpdated": "2025-12-04T10:00:00Z"
    }
  }
}
```

---

### 2.2 Check Risk at Location

**GET** `/risk/check`

Check subsidence risk at a specific location.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude |
| lng | number | Yes | Longitude |

**Example:** `/risk/check?lat=23.767&lng=86.396`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location": {
      "coordinates": [86.396, 23.767],
      "address": "Near Alkusa Opencast Mine"
    },
    "riskAssessment": {
      "isInRiskZone": true,
      "zone": {
        "zoneId": "alkusa_critical_01",
        "zoneName": {
          "en": "Alkusa Critical Zone",
          "hi": "अल्कुसा क्रिटिकल जोन"
        },
        "riskLevel": "critical",
        "riskScore": 95
      },
      "subsidenceData": {
        "averageRate": 27,
        "unit": "mm/year",
        "lastMeasured": "2024-01-15"
      },
      "riskDescription": {
        "en": "You are in a CRITICAL subsidence zone. This area has recorded significant ground movement. Please exercise extreme caution.",
        "hi": "आप एक गंभीर धंसाव क्षेत्र में हैं। इस क्षेत्र में महत्वपूर्ण जमीन की गति दर्ज की गई है। कृपया अत्यधिक सावधानी बरतें।"
      }
    },
    "safetyRecommendations": {
      "en": [
        "Avoid prolonged stay in this area",
        "Regularly inspect buildings for cracks",
        "Keep emergency kit ready"
      ],
      "hi": [
        "इस क्षेत्र में लंबे समय तक रहने से बचें",
        "नियमित रूप से दरारों के लिए भवनों का निरीक्षण करें",
        "आपातकालीन किट तैयार रखें"
      ]
    },
    "emergencyContacts": [
      {
        "name": "BCCL Control Room",
        "phone": "0326-2222XXX"
      }
    ],
    "nearestSafeZone": {
      "name": "Dhanbad City Center",
      "distance": 5.2,
      "unit": "km",
      "direction": "Northwest"
    }
  }
}
```

**Response when NOT in risk zone:**
```json
{
  "success": true,
  "data": {
    "location": {
      "coordinates": [86.450, 23.800]
    },
    "riskAssessment": {
      "isInRiskZone": false,
      "nearestRiskZone": {
        "zoneName": "Alkusa Critical Zone",
        "distance": 3.5,
        "unit": "km"
      },
      "riskLevel": "stable",
      "riskScore": 15,
      "riskDescription": {
        "en": "This location is in a stable zone with minimal subsidence risk.",
        "hi": "यह स्थान न्यूनतम धंसाव जोखिम वाले स्थिर क्षेत्र में है।"
      }
    }
  }
}
```

---

### 2.3 Get Zone Details

**GET** `/risk/zones/:zoneId`

Get detailed information about a specific zone.

**Example:** `/risk/zones/alkusa_critical_01`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "zone": {
      "zoneId": "alkusa_critical_01",
      "zoneName": {
        "en": "Alkusa Critical Zone - East of Shankar Road",
        "hi": "अल्कुसा क्रिटिकल जोन - शंकर रोड के पूर्व"
      },
      "riskLevel": "critical",
      "riskScore": 95,
      "geometry": { /* GeoJSON */ },
      "subsidenceData": {
        "averageRate": 27,
        "maxRate": 29,
        "cumulativeDisplacement": 90,
        "measurementPeriod": {
          "start": "2007-03-17",
          "end": "2010-04-10"
        },
        "dataSource": "ENVISAT ASAR / Sentinel-1"
      },
      "description": {
        "en": "Critical subsidence zone...",
        "hi": "..."
      },
      "affectedArea": 0.44,
      "estimatedPopulation": 5000,
      "landmarks": [ /* array */ ],
      "safetyRecommendations": { /* en, hi arrays */ },
      "evacuationRoutes": [ /* array */ ],
      "bccl_area": "Area VIII",
      "lastUpdated": "2025-12-01"
    },
    "recentReports": [
      /* Last 5 reports from this zone */
    ],
    "activeAlerts": [
      /* Current active alerts for this zone */
    ]
  }
}
```

---

## 3. Report APIs

### 3.1 Submit Photo Report

**POST** `/reports`

**Headers:** `Authorization: Bearer <token>`  
**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| photos | File[] | Yes | Up to 5 images (max 5MB each) |
| reportType | string | Yes | crack, subsidence, building_damage, road_damage, other |
| description | string | No | Description of the issue |
| latitude | number | Yes | Location latitude |
| longitude | number | Yes | Location longitude |
| urgencyLevel | string | No | low, medium, high, emergency |

**Response (201 Created):**
```json
{
  "success": true,
  "message": {
    "en": "Report submitted successfully. Our team will review it shortly.",
    "hi": "रिपोर्ट सफलतापूर्वक जमा की गई। हमारी टीम जल्द ही इसकी समीक्षा करेगी।"
  },
  "data": {
    "reportId": "RPT-20251204-001",
    "status": "pending",
    "aiProcessing": {
      "status": "processing",
      "estimatedTime": "30 seconds"
    }
  }
}
```

---

### 3.2 Get User's Reports

**GET** `/reports`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "reportId": "RPT-20251204-001",
        "reportType": "crack",
        "status": "verified",
        "createdAt": "2025-12-04T10:30:00Z",
        "location": {
          "address": "Near Alkusa Colliery",
          "locality": "Alkusa"
        },
        "photos": [
          {
            "thumbnailUrl": "https://storage.firebase.com/thumb1.jpg"
          }
        ],
        "aiAnalysis": {
          "crackDetected": true,
          "crackSeverity": "moderate",
          "confidence": 0.87
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

---

### 3.3 Get Report Details

**GET** `/reports/:reportId`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "report": {
      "reportId": "RPT-20251204-001",
      "reportType": "crack",
      "description": "Large crack appeared on the road near my house",
      "status": "verified",
      "urgencyLevel": "high",
      "location": {
        "coordinates": [86.396, 23.767],
        "address": "Near Alkusa Colliery",
        "locality": "Alkusa",
        "nearestZone": "alkusa_critical_01"
      },
      "photos": [
        {
          "url": "https://storage.firebase.com/full1.jpg",
          "thumbnailUrl": "https://storage.firebase.com/thumb1.jpg",
          "uploadedAt": "2025-12-04T10:30:00Z"
        }
      ],
      "aiAnalysis": {
        "processed": true,
        "processedAt": "2025-12-04T10:30:45Z",
        "crackDetected": true,
        "crackSeverity": "moderate",
        "confidence": 0.87,
        "detectedFeatures": [
          {
            "type": "crack",
            "boundingBox": { "x": 100, "y": 150, "width": 200, "height": 50 },
            "confidence": 0.87
          }
        ]
      },
      "review": {
        "verificationStatus": "verified",
        "reviewedAt": "2025-12-04T11:00:00Z",
        "adminNotes": "Crack verified. Monitoring team dispatched."
      },
      "statusHistory": [
        { "status": "pending", "changedAt": "2025-12-04T10:30:00Z" },
        { "status": "under_review", "changedAt": "2025-12-04T10:45:00Z" },
        { "status": "verified", "changedAt": "2025-12-04T11:00:00Z" }
      ],
      "createdAt": "2025-12-04T10:30:00Z"
    }
  }
}
```

---

## 4. Alert APIs

### 4.1 Get Active Alerts

**GET** `/alerts`

Get all currently active alerts.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| zoneId | string | Filter by zone |
| severity | string | Filter by severity |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "alertId": "ALT-20251204-001",
        "alertType": "warning",
        "severity": "high",
        "title": {
          "en": "Increased Subsidence Activity",
          "hi": "धंसाव गतिविधि में वृद्धि"
        },
        "message": {
          "en": "Recent monitoring shows increased ground movement...",
          "hi": "हाल की निगरानी में जमीन की बढ़ी हुई गतिविधि..."
        },
        "targetZones": ["alkusa_critical_01"],
        "validFrom": "2025-12-04T00:00:00Z",
        "validUntil": "2025-12-11T00:00:00Z",
        "instructions": {
          "en": ["Monitor walls for cracks", "Keep documents ready"],
          "hi": ["दरारों के लिए दीवारों की निगरानी करें", "दस्तावेज तैयार रखें"]
        },
        "evacuationAdvised": false,
        "createdAt": "2025-12-04T08:00:00Z"
      }
    ],
    "totalActive": 3
  }
}
```

---

### 4.2 Get Alert Details

**GET** `/alerts/:alertId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alert": {
      "alertId": "ALT-20251204-001",
      /* full alert object */
      "affectedZones": [
        {
          "zoneId": "alkusa_critical_01",
          "zoneName": { "en": "Alkusa Critical Zone", "hi": "..." }
        }
      ],
      "emergencyContacts": [
        { "name": "BCCL Control Room", "phone": "0326-2222XXX" }
      ]
    }
  }
}
```

---

## 5. Admin APIs

### 5.1 Admin Login

**POST** `/admin/login`

**Request Body:**
```json
{
  "email": "admin@bccl.gov.in",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "admin_jwt_token",
    "admin": {
      "name": "Admin Name",
      "role": "bccl_official",
      "permissions": ["view_reports", "create_alerts", "manage_zones"]
    }
  }
}
```

---

### 5.2 Get Dashboard Stats

**GET** `/admin/dashboard`

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 15000,
      "activeUsersToday": 3500,
      "totalReports": 2500,
      "pendingReports": 45,
      "activeAlerts": 3
    },
    "riskZoneStats": {
      "critical": 6,
      "high": 5,
      "moderate": 8,
      "low": 12,
      "stable": 20
    },
    "recentReports": [
      /* last 10 reports */
    ],
    "reportsTrend": {
      "today": 12,
      "thisWeek": 85,
      "thisMonth": 320
    },
    "topAffectedAreas": [
      { "locality": "Alkusa", "reports": 45 },
      { "locality": "Ena", "reports": 38 },
      { "locality": "Bera-Dobari", "reports": 32 }
    ]
  }
}
```

---

### 5.3 Create Alert

**POST** `/admin/alerts`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "alertType": "warning",
  "severity": "high",
  "title": {
    "en": "New Alert Title",
    "hi": "नई अलर्ट शीर्षक"
  },
  "message": {
    "en": "Alert message in English",
    "hi": "हिंदी में अलर्ट संदेश"
  },
  "targetZones": ["alkusa_critical_01", "ena_critical_01"],
  "validUntil": "2025-12-11T00:00:00Z",
  "instructions": {
    "en": ["Instruction 1", "Instruction 2"],
    "hi": ["निर्देश 1", "निर्देश 2"]
  },
  "evacuationAdvised": false,
  "sendNotification": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Alert created and notification sent to 8500 users",
  "data": {
    "alertId": "ALT-20251204-002",
    "notificationsSent": 8500
  }
}
```

---

### 5.4 Update Risk Zone

**PUT** `/admin/zones/:zoneId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "riskLevel": "critical",
  "riskScore": 98,
  "subsidenceData": {
    "averageRate": 30,
    "maxRate": 32
  },
  "description": {
    "en": "Updated description",
    "hi": "अपडेटेड विवरण"
  }
}
```

---

### 5.5 Review Report

**PUT** `/admin/reports/:reportId/review`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "verified",
  "verificationStatus": "verified",
  "adminNotes": "Crack verified by field team",
  "actionTaken": "Monitoring team dispatched",
  "createAlert": false
}
```

---

### 5.6 Get All Reports (Admin)

**GET** `/admin/reports`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | pending, under_review, verified, resolved, rejected |
| reportType | string | crack, subsidence, etc. |
| zoneId | string | Filter by zone |
| severity | string | AI-detected severity |
| startDate | string | Filter from date |
| endDate | string | Filter to date |
| page | number | Page number |
| limit | number | Items per page |

---

## 6. Satellite Data APIs

### 6.1 Get Latest Satellite Data

**GET** `/satellite/latest`

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "dataId": "SAT-20251201",
    "acquisitionDate": "2025-12-01",
    "dataSource": "sentinel_1",
    "statistics": {
      "totalPoints": 2345,
      "criticalPoints": 120,
      "maxSubsidenceRate": 32,
      "averageSubsidenceRate": 8.5
    },
    "dataPoints": [
      /* GeoJSON points with velocity data */
    ]
  }
}
```

---

## 7. Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": {
      "en": "Error message in English",
      "hi": "हिंदी में त्रुटि संदेश"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| INVALID_TOKEN | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## 8. Rate Limiting

- **Public endpoints:** 100 requests/minute
- **Authenticated endpoints:** 200 requests/minute
- **Admin endpoints:** 500 requests/minute

---

*API Version: 1.0*
*Last Updated: December 2025*
