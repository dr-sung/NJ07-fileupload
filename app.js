const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const uploadImagePrefix = 'image-';

// set storage options of multer
const storageOptions = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/uploads');
    },
    filename: (req, file, callback) => {
        callback(null, uploadImagePrefix + Date.now()
            + path.extname(file.originalname));
    }
});

// configure multer
const upload = multer({
    storage: storageOptions,
    limits: {
        fileSize: 1024*1024*10   // max allowed size = 10 MBytes
    }, 
    fileFilter: (req, file, callback) => {
        const fileTypes = /jpeg|jpg|png|gif/; // accepted file types
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (mimetype && extname) {
            return callback(null, true);
        } else {
            return callback('Error: Images only');
        }
    }
}).single('imageUpload'); // parameter name at <form> of index.ejs

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.render('index', {msg: null, filename: null});
});

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.render('index', { msg: err, filename: null });
        }
        if (!req.file) {
            return res.render('index', {
                msg: 'Error: no file selected', filename: null
            });
        }
        res.render('index', {
            msg: 'File Uploded!',
            filename: `uploads/${req.file.filename}`
        });
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server started on port' , port);
});