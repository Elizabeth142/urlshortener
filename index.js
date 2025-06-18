const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory "database"
let urlDatabase = [];

// Home page
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ✅ POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const userUrl = req.body.url;

  // Validate URL format
  try {
    const urlObj = new URL(userUrl);
    const hostname = urlObj.hostname;

    // Check if domain resolves
    dns.lookup(hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      // Store and return short_url
      const short_url = urlDatabase.length + 1;
      urlDatabase.push({ original_url: userUrl, short_url });
      res.json({ original_url: userUrl, short_url });
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

// ✅ GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const entry = urlDatabase.find(item => item.short_url === short);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'invalid url' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
