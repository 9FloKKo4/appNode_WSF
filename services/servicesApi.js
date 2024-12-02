const axios = require('axios');

async function fetchAPIData(apiUrl, apiToken) {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'appel API:', error.message);
    throw error; // relancer l'erreur pour la gestion en amont
  }
}

module.exports = { fetchAPIData };

