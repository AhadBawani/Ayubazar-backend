const express = require('express');
const { ADD_COMPANY, EDIT_COMPANY, GET_ALL_COMPANY } = require('../Controllers/CompanyController');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./Images/CompanyImages");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage });

router.get('/', GET_ALL_COMPANY);
router.post('/', upload.single('companyImage'), ADD_COMPANY);
router.put('/:id', EDIT_COMPANY);

module.exports = router;