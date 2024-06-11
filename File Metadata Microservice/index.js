var express = require('express');
var cors = require('cors');
require('dotenv').config()
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

// Middleware to parse URL-encoded and JSON bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Route to handle file upload
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;
  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  });
});

// Serve an HTML form for uploading files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// app.get('/', function (req, res) {
//   res.sendFile(process.cwd() + '/views/index.html');
// });


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
