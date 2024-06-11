require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.use(bodyParser.urlencoded({ extended: false }));

// In-memory store for URLs
let urlDatabase = [];
let idCounter = 1;

// Route to create a short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  
  // Validate URL format
  const urlPattern = /^(http|https):\/\/[^ "]+$/;
  if (!urlPattern.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract hostname to validate DNS
  const hostname = new URL(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Save URL in database
    const shortUrl = idCounter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
    
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});


// app.get('/api/hello', function(req, res) {
//   res.json({ greeting: 'hello API' });
// });


app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
