// Cloudinary Image Upload Service
// Cloudinary credentials configured

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "duttqhauc";
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || "827344128327149";
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || "u47lj2W_liXuNG2e7psRMe4kuUQ";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "jharia_reports"; // unsigned preset

export const isCloudinaryConfigured = () => {
  return CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== "YOUR_CLOUD_NAME";
};

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise} Upload result with URL
 */
export const uploadImage = async (file, options = {}) => {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary not configured. Using fallback upload.');
    return uploadImageFallback(file);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    
    // Use unsigned upload with folder structure
    const folder = options.folder || 'jharia-reports';
    formData.append('folder', folder);
    
    // Add timestamp for unique public_id
    const timestamp = Date.now();
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    formData.append('public_id', `${folder}/${timestamp}_${fileName}`);
    
    // Add transformations if needed
    if (options.transformation) {
      formData.append('transformation', options.transformation);
    }

    // For unsigned uploads, we need to use API key and secret
    // But for security, we'll use unsigned preset or backend signature
    // For now, using direct upload with API credentials
    const timestampForAuth = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignatureForUpload(timestampForAuth, folder);
    
    formData.append('timestamp', timestampForAuth);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    console.log('✅ Image uploaded to Cloudinary:', data.secure_url);
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      cloudinaryUrl: data.secure_url
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate signature for Cloudinary upload
const generateSignatureForUpload = async (timestamp, folder) => {
  // In production, this should be done on backend
  // For now, using crypto-js or simple hash
  const params = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  
  // Simple hash (in production, use proper crypto)
  // For now, we'll use unsigned upload preset approach
  return '';
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Upload options
 * @returns {Promise} Array of upload results
 */
export const uploadMultipleImages = async (files, options = {}) => {
  const uploadPromises = files.map(file => uploadImage(file, options));
  return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise} Delete result
 */
export const deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    return { success: false, error: 'Cloudinary not configured' };
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(publicId, timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          public_id: publicId,
          timestamp,
          signature
        })
      }
    );

    const data = await response.json();
    return { success: data.result === 'ok' };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate Cloudinary signature (for secure operations)
 * Note: In production, this should be done on backend
 */
const generateSignature = async (publicId, timestamp) => {
  // This should be done on backend for security
  // For now, return empty (will work with unsigned uploads)
  return '';
};

/**
 * Upload image using unsigned preset (simpler approach)
 * This is the recommended way for client-side uploads
 * 
 * NOTE: You need to create an unsigned upload preset in Cloudinary Dashboard:
 * 1. Go to Cloudinary Dashboard > Settings > Upload
 * 2. Create new upload preset named "jharia_reports"
 * 3. Set it as "Unsigned" (no signature required)
 * 4. Set folder to "jharia-reports" (optional)
 */
export const uploadImageUnsigned = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const folder = options.folder || 'jharia-reports';
    formData.append('folder', folder);

    // Always use unsigned preset (no signature required)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Optional: specify public_id for better organization
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `${folder}/${timestamp}_${file.name.replace(/\.[^/.]+$/, '')}`;
    formData.append('public_id', publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    console.log('✅ Image uploaded to Cloudinary:', data.secure_url);
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fallback upload (when Cloudinary not configured)
 * Uploads to backend server
 */
const uploadImageFallback = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/reports/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      ...data
    };
  } catch (error) {
    console.error('Fallback upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  if (!isCloudinaryConfigured()) {
    return publicId; // Return as-is if not configured
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transformString = Object.entries(transformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return transformString 
    ? `${baseUrl}/${transformString}/${publicId}`
    : `${baseUrl}/${publicId}`;
};

