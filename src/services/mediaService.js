const axios = require('axios');

function extractKeyword(text) {
  if (!text) return 'aesthetic';
  const lower = text.toLowerCase();
  if (/prem|pyaar|love|heart|couple|relationship/.test(lower)) return 'love';
  if (/sad|dard|alone|pain|broken/.test(lower)) return 'moody nature';
  if (/life|zindagi|motivation|success/.test(lower)) return 'cinematic landscape';
  return 'cinematic aesthetic';
}

async function fetchBackgroundImages(queryText, count = 3) {
  const keyword = extractKeyword(queryText);
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  // 1. Try Unsplash API if key exists
  if (apiKey && apiKey !== 'your_unsplash_access_key_here') {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: keyword, orientation: 'portrait', per_page: count },
        headers: { Authorization: `Client-ID ${apiKey}` }
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        return {
          topic: keyword,
          assets: response.data.results.map(item => item.urls.regular)
        };
      }
    } catch (err) {
      console.error('⚠️ Unsplash API Error:', err.response?.data || err.message);
    }
  }

  // 2. Safe Fallback URLs (Guaranteed to work without 500 error)
  return {
    topic: keyword,
    assets: [
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&w=1080&q=80'
    ].slice(0, count)
  };
}

module.exports = { fetchBackgroundImages };