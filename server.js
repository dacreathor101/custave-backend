const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/import', async (req, res) => {
  const { link } = req.body;

  try {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const title = $('title').text(); // Replace with actual scraping logic
    const images = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('temu') || src.includes('pascaldesign')) {
        images.push(src);
      }
    });

    res.status(200).json({
      title,
      images,
      price: 10000, // Placeholder for price logic
      description: 'Fetched product details',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import product.' });
  }
});

app.get('/', (req, res) => {
  res.send('Custave backend is live 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
