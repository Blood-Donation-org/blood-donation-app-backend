const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    createBloodRequest,
    getAllBloodRequests,
    getBloodRequestById,
    updateBloodRequest,
    deleteBloodRequest,
    updateBloodRequestStatus,
    updateBloodRequestConfirmationStatus,
    getAllBloodRequestsByUser
} = require('../controllers/BloodRequestController');


router.post('/create', upload.single('dtFormUpload'), createBloodRequest);
router.put('/update/:id', upload.single('dtFormUpload'), updateBloodRequest);
router.patch('/update-status/:id', updateBloodRequestStatus);
router.patch('/update-confirmation/:id', updateBloodRequestConfirmationStatus);
router.delete('/delete/:id', deleteBloodRequest);
router.get('/get-all', getAllBloodRequests);
router.get('/get-by-user/:userId', getAllBloodRequestsByUser);
router.get('/:id', getBloodRequestById);

module.exports = router;
