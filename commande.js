const sqlite3 = require('sqlite3');
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
    const results = response.data.results.slice(0, 1); 


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
// Connexion à la base de données
const db = new sqlite3.Database('Vinyl.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err.message);
        process.exit(1);
    }
    console.log('Connecté à la base de données SQLite.');
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Étape 1 : Afficher les genres disponibles
function afficherGenres() {
    db.all('SELECT DISTINCT genre FROM product WHERE genre IS NOT NULL AND genre != ""', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des genres :', err.message);
            fermerConnexion();
            return;
        }

        if (rows.length === 0) {
            console.log('Aucun genre disponible.');
            fermerConnexion();
            return;
        }

        console.log('Genres disponibles :');
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.genre}`);
        });

        rl.question('Quel genre souhaitez-vous explorer ? (Entrez le numéro correspondant) : ', (reponse) => {
            const genreIndex = parseInt(reponse, 10) - 1;
            if (!isNaN(genreIndex) && genreIndex >= 0 && genreIndex < rows.length) {
                const genreSelectionne = rows[genreIndex].genre.trim();
                console.log(`Vous avez sélectionné le genre : "${genreSelectionne}"`);
                afficherDisquesParGenre(genreSelectionne);
            } else {
                console.log('Numéro de genre invalide.');
                afficherGenres();
            }
        });
    });
}

// Étape 2 : Afficher les disques disponibles dans le genre sélectionné
function afficherDisquesParGenre(genre) {
    db.all('SELECT * FROM product WHERE genre = ?', [genre], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des disques :', err.message);
            fermerConnexion();
            return;
        }

        if (rows.length === 0) {
            console.log(`Aucun disque disponible pour le genre "${genre}".`);
            commanderAutre();
            return;
        }

        console.log(`Disques disponibles dans le genre "${genre}" :`);
        rows.forEach((row, index) => {
            console.log(`${index + 1}. Nom : ${row.nom}, Stock : ${row.stock}, Prix : ${row.prix}€`);
        });

        demanderNomDisque(genre);
    });
}

// Étape 3 : Demander le nom du disque
function demanderNomDisque(genre) {
    rl.question('Entrez le nom du disque que vous souhaitez explorer : ', (nomDisque) => {
        db.get('SELECT * FROM product WHERE genre = ? AND nom = ?', [genre, nomDisque.trim()], (err, row) => {
            if (err) {
                console.error('Erreur lors de la récupération du disque :', err.message);
                fermerConnexion();
                return;
            }

            if (row) {
                demanderAfficherDetails(row);
            } else {
                console.log(`Aucun disque trouvé pour "${nomDisque}" dans le genre "${genre}".`);
                commanderAutre();
            }
        });
    });
}

// Étape 4 : Demander si l'utilisateur souhaite afficher les détails
function demanderAfficherDetails(produit) {
    rl.question('Voulez-vous afficher les détails de cet article ? (oui/non) : ', (reponse) => {
        const reponseNorm = reponse.trim().toLowerCase();
        if (reponseNorm === 'oui') {
            afficherDetailsArticle(produit);
        } else if (reponseNorm === 'non') {
            confirmerCommande(produit);
        } else {
            console.log('Veuillez répondre par "oui" ou "non".');
            demanderAfficherDetails(produit);
        }
    });
}

// Étape 5 : Afficher les détails et demander confirmation pour la commande
async function afficherDetailsArticle(produit) {
    console.log('--- Détails locaux ---');
    console.log(`Nom : ${produit.nom}`);
    console.log(`Genre : ${produit.genre}`);
    console.log(`Stock : ${produit.stock}`);
    console.log(`Prix : ${produit.prix}€`);
    console.log('---');

    rl.question('Voulez-vous afficher des informations supplémentaires sur cet article via l\'API ? (oui/non) : ', async (reponse) => {
        const reponseNorm = reponse.trim().toLowerCase();
        if (reponseNorm === 'oui') {
            try {
                const details = await searchAlbum(produit.nom); // Appel asynchrone à l'API
                console.log('--- Détails supplémentaires obtenus via l\'API ---');
                console.log(`Titre : ${details.title}`);
                console.log(`Année : ${details.year}`);
                console.log(`Genre : ${details.genre}`);
                console.log(`Artiste : ${details.artist}`);
                console.log('---');
            } catch (err) {
                console.error('Erreur lors de la récupération des informations via l\'API :', err.message);
            }
        }
        confirmerCommande(produit);
    });
}

// Demander confirmation pour la commande
function confirmerCommande(produit) {
    rl.question('Voulez-vous confirmer la commande de cet article ? (oui/non) : ', (reponse) => {
        const reponseNorm = reponse.trim().toLowerCase();
        if (reponseNorm === 'oui') {
            console.log(`Commande confirmée pour "${produit.nom}". Merci pour votre achat !`);
            fermerConnexion();
        } else if (reponseNorm === 'non') {
            commanderAutre();
        } else {
            console.log('Veuillez répondre par "oui" ou "non".');
            confirmerCommande(produit);
        }
    });
}

// Proposer de recommencer ou de quitter
function commanderAutre() {
    rl.question('Voulez-vous explorer autre chose ? (oui/non) : ', (reponse) => {
        const reponseNorm = reponse.trim().toLowerCase();
        if (reponseNorm === 'oui') {
            afficherGenres();
        } else if (reponseNorm === 'non') {
            console.log('Merci et à bientôt !');
            fermerConnexion();
        } else {
            console.log('Veuillez répondre par "oui" ou "non".');
            commanderAutre();
        }
    });
}

// Fermer les connexions proprement
function fermerConnexion() {
    rl.close();
    db.close((err) => {
        if (err) {
            console.error('Erreur lors de la fermeture de la base de données :', err.message);
        } else {
            console.log('Connexion à la base de données fermée.');
        }
    });
}

// Lancer le programme
console.log('Bienvenue dans le programme de recherche et commande de disques !');
afficherGenres();