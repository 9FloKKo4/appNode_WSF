const http = require('http');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


//API

require('dotenv').config(); // Charger les variables d'environnement
const { fetchAPIData } = require('./services/apiService');

const apiUrl = process.env.API_URL;
const apiToken = process.env.API_TOKEN;

async function main() {
  try {
    const data = await fetchAPIData(apiUrl, apiToken);
    console.log('Données récupérées:', data);
  } catch (error) {
    console.error('Erreur dans le programme principal:', error.message);
  }
}

main();
