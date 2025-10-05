const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files (PDF, DOC, DOCX, TXT) and images (JPEG, JPG, PNG, GIF) are allowed!'));
    }
  }
});
const {
    createBloodRequest,
    getAllBloodRequests,
    getBloodRequestById,
    updateBloodRequest,
    deleteBloodRequest,
    updateBloodRequestStatus,
    updateBloodRequestConfirmationStatus,
    getAllBloodRequestsByUser,
    downloadDtForm
} = require('../controllers/BloodRequestController');


// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large', statusCode: 400 });
    }
  } else if (error) {
    return res.status(400).json({ message: error.message, statusCode: 400 });
  }
  next();
};

router.post('/create', upload.single('dtFormUpload'), handleMulterError, createBloodRequest);
router.put('/update/:id', upload.single('dtFormUpload'), handleMulterError, updateBloodRequest);
router.patch('/update-status/:id', updateBloodRequestStatus);
router.patch('/update-confirmation/:id', updateBloodRequestConfirmationStatus);
router.delete('/delete/:id', deleteBloodRequest);
router.get('/get-all', getAllBloodRequests);
router.get('/get-by-user/:userId', getAllBloodRequestsByUser);
router.get('/download-dtform/:id', downloadDtForm);
router.get('/:id', getBloodRequestById);

module.exports = router;
