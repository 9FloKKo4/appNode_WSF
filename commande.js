const sqlite3 = require('sqlite3');
const readline = require('readline');

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
    rl.question('Entrez le nom du disque que vous souhaitez commander : ', (nomDisque) => {
        db.get('SELECT * FROM product WHERE genre = ? AND nom = ?', [genre, nomDisque.trim()], (err, row) => {
            if (err) {
                console.error('Erreur lors de la récupération du disque :', err.message);
                fermerConnexion();
                return;
            }

            if (row) {
                afficherDetailsArticle(row);
            } else {
                console.log(`Aucun disque trouvé pour "${nomDisque}" dans le genre "${genre}".`);
                commanderAutre();
            }
        });
    });
}

// Étape 4 : Afficher les détails du disque et confirmer la commande
function afficherDetailsArticle(produit) {
    console.log('---');
    console.log(`Nom : ${produit.nom}`);
    console.log(`Genre : ${produit.genre}`);
    console.log(`Stock : ${produit.stock}`);
    console.log(`Prix : ${produit.prix}€`);
    console.log('---');

    rl.question('Voulez-vous confirmer la commande de cet article ? (oui/non) : ', (reponse) => {
        const reponseNorm = reponse.trim().toLowerCase();
        if (reponseNorm === 'oui') {
            console.log(`Commande confirmée pour "${produit.nom}". Merci pour votre achat !`);
            fermerConnexion();
        } else if (reponseNorm === 'non') {
            commanderAutre();
        } else {
            console.log('Veuillez répondre par "oui" ou "non".');
            afficherDetailsArticle(produit);
        }
    });
}

// Étape 5 : Proposer de recommencer ou de quitter
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
