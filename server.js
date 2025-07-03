const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Custave backend is live 🚀');
});

// Robust scraping endpoint
app.post('/import', async (req, res) => {
  const { link } = req.body;

  if (!link || !link.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid product link.' });
  }

  try {
    const response = await axios.get(link, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    // Simple sample scraping - should be customized
    const title = $('title').first().text().trim();
    const images = [];

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !images.includes(src)) {
        images.push(src);
      }
    });

    res.json({
      title: title || 'No title found',
      images,
      price: 10000, // Placeholder
      description: 'Auto-imported from product link',
    });
  } catch (err) {
    console.error('Scraping failed:', err.message);
    res.status(500).json({ error: 'Failed to scrape product. Try another link.' });
  }
});

app.listen(PORT, () => {
  console.log(`Custave backend running on port ${PORT}`);
});
