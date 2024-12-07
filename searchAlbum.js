const readline = require('readline');
const axios = require('axios');

const DISCOGS_TOKEN = 'cwGsRhpeEbVeQeguRAmKcAwyMEDLeqWDLjCXCNlk';

async function searchAlbum(albumName) {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.discogs.com/database/search?q=${encodeURIComponent(albumName)}&type=release&token=${DISCOGS_TOKEN}`,
  };

  try {
    const response = await axios.request(config);
    const results = response.data.results.slice(0, 5); 


    if (results.length === 0) {
      console.log(`Aucun résultat trouvé pour l'album "${albumName}".`);
    } else {
      console.log(`Résultats pour "${albumName}":`);
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. Titre : ${result.title}`);
        console.log(`   contributor : ${result.contributor}`);
        console.log(`   Année : ${result.year || 'Non spécifiée'}`);
        console.log(`   Genre : ${result.genre ? result.genre.join(', ') : 'Non spécifié'}`);
      });
    }
  } catch (error) {
    console.error('Erreur lors de la requête API :', error.message);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Bienvenue dans le programme de recherche d\'albums !');
rl.question('Entrez le nom de l\'album : ', (albumName) => {
  if (albumName.trim() === '') {
    console.log('Le nom de l\'album ne peut pas être vide.');
    rl.close();
    return;
  }

  searchAlbum(albumName).finally(() => rl.close());
});
