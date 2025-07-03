import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import CurrencyConverter from 'currency-converter-lt';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/import', async (req, res) => {
  const { link } = req.body;

  if (!link || (!link.includes('temu.com') && !link.includes('pascaldesign.com'))) {
    return res.status(400).json({ message: 'Invalid link provided.' });
  }

  try {
    const html = (await axios.get(link)).data;
    const $ = cheerio.load(html);

    let title = $('title').text().trim();
    let priceText = $('meta[property="product:price:amount"]').attr('content') || '';
    let originalPrice = parseFloat(priceText || '0');

    if (!originalPrice || isNaN(originalPrice)) {
      const fallback = $('body').text().match(/\$\d+(\.\d+)?/g);
      originalPrice = fallback ? parseFloat(fallback[0].replace('$', '')) : 0;
    }

    const currencyConverter = new CurrencyConverter();
    const nairaPrice = await currencyConverter.from('USD').to('NGN').amount(originalPrice).convert();

    const markupRate = nairaPrice <= 10000 ? 1.45 : 1.30;
    const finalPrice = Math.ceil(nairaPrice * markupRate);

    const category = finalPrice > 100 * 100 ? 'Luxury' : 'Customized';
    const image = $('img').first().attr('src') || '';

    const product = {
      title,
      link,
      image,
      originalPriceUSD: originalPrice,
      convertedPriceNGN: finalPrice,
      category,
    };

    res.status(200).json({ message: 'Product imported successfully', product });
  } catch (error) {
    console.error('Scrape error:', error.message);
    res.status(500).json({ message: 'Failed to import product' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Custave backend running on port ${PORT}`));
