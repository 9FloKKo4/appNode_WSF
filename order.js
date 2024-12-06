const sqlite3 = require('sqlite3');
const readline = require('readline');
import searchAlbum from './searchAlbum'

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

function afficherGenres() {
    db.all('SELECT DISTINCT genre FROM product', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des genres :', err.message);
            rl.close();
            return;
        }

        if (rows.length === 0) {
            console.log('Aucun genre disponible.');
            rl.close();
            return;
        }

        console.log('Genres disponibles :');
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.genre}`);
        });

        rl.question('Quel genre souhaitez-vous explorer ? (Entrez le numéro correspondant) : ', (reponse) => {
            const genreIndex = parseInt(reponse, 10) - 1;
            if (genreIndex >= 0 && genreIndex < rows.length) {
                afficherProduitsParGenre(rows[genreIndex].genre);
            } else {
                console.log('Numéro de genre invalide.');
                afficherGenres();
            }
        });
    });
}

function afficherProduitsParGenre(genre) {
    db.all('SELECT * FROM product WHERE genre = ?', [genre], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits :', err.message);
            commanderAutre();
            return;
        }

        if (rows.length === 0) {
            console.log(`Aucun produit trouvé pour le genre "${genre}".`);
            commanderAutre();
            return;
        }

        console.log(`Produits disponibles pour le genre "${genre}" :`);
        rows.forEach((row, index) => {
            console.log(`${index + 1}. Nom : ${row.nom}, Stock : ${row.stock}, Prix : ${row.prix}`);
        });

        rl.question('Quel produit souhaitez-vous commander ? (Entrez le numéro correspondant) : ', (reponse) => {
            const produitIndex = parseInt(reponse, 10) - 1;
            if (produitIndex >= 0 && produitIndex < rows.length) {
                commander(rows[produitIndex]);
            } else {
                console.log('Numéro de produit invalide.');
                afficherProduitsParGenre(genre);
            }
        });
    });
}

function commander(produit) {
    rl.question(`Combien de "${produit.nom}" voulez-vous commander ? : `, (quantite) => {
        quantite = parseInt(quantite, 10);
        if (isNaN(quantite) || quantite <= 0) {
            console.log('La quantité doit être un nombre entier positif.');
            commander(produit);
            return;
        }

        const stockDisponible = produit.stock;

        if (stockDisponible < quantite) {
            console.log('Stock insuffisant.');
            commanderAutre();
            return;
        }

        const nouveauStock = stockDisponible - quantite;
        db.run('UPDATE product SET stock = ? WHERE id = ?', [nouveauStock, produit.id], (err) => {
            if (err) {
                console.error('Erreur lors de la mise à jour du stock :', err.message);
                commanderAutre();
                return;
            }
            console.log(`Commande passée avec succès pour ${quantite} article(s) de "${produit.nom}".`);
            commanderAutre();
        });
    });
}

function commanderAutre() {
    rl.question('Voulez-vous commander autre chose ? (oui/non) : ', (reponse) => {
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

afficherGenres();
