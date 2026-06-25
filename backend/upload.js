const multer = require('multer');

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (_req, file, callback) => {
        const uniquePrefix = Date.now();
        const safeOriginalName = file.originalname.replaceAll(' ', '-');
        callback(null, `${uniquePrefix}-${safeOriginalName}`);
    }
});

const upload = multer({ storage });

module.exports = upload;