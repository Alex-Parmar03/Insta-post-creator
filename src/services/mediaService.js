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

async function fetchCreativeImages({ mood = 'romantic', subject = 'couple', count = 6 } = {}) {
  const moodTerms = {
    romantic: 'romantic intimate couple connection',
    sad: 'sad emotional person heartbreak solitude',
    hopeful: 'hopeful healing person sunrise connection',
    motivational: 'confident strong person portrait determination',
    calm: 'calm thoughtful person soft light portrait'
  };
  const subjectTerms = {
    couple: 'couple two people',
    woman: 'woman portrait',
    man: 'man portrait',
    friends: 'friends together',
    solitary: 'single person alone',
    symbolic: 'cinematic symbolic emotional scene'
  };
  const query = `${moodTerms[mood] || moodTerms.romantic} ${subjectTerms[subject] || subjectTerms.couple}`;
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (apiKey && apiKey !== 'your_unsplash_access_key_here') {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, orientation: 'portrait', per_page: count },
        headers: { Authorization: `Client-ID ${apiKey}` }
      });
      if (response.data?.results?.length) {
        return { topic: query, assets: response.data.results.map(item => item.urls.regular) };
      }
    } catch (err) {
      console.error('Creative media API error:', err.response?.data || err.message);
    }
  }

  const fallbackBySubject = {
    couple: [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=1080&q=85'
    ],
    woman: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1080&q=85'],
    man: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1080&q=85'],
    friends: ['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1080&q=85'],
    solitary: ['https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1080&q=85'],
    symbolic: ['https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&w=1080&q=85']
  };
  const assets = fallbackBySubject[subject] || fallbackBySubject.couple;
  return { topic: query, assets: Array.from({ length: count }, (_, index) => assets[index % assets.length]) };
}

module.exports = { fetchBackgroundImages, fetchCreativeImages };