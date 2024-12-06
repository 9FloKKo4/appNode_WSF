const sqlite3 = require('sqlite3');
const readline = require('readline');

const db = new sqlite3.Database('Vinyl.db');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function passerCommande(nomProduct, stock) {
    db.serialize(() => {
        // Récupérer l'ID de l'article en fonction de son nom
        db.get('SELECT id, stock FROM product WHERE nom = ?', [nomProduct], (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }
            if (!row) {
                console.log('L\'article avec ce nom n\'existe pas.');
                commanderAutre();
                return;
            }
            const idProduct = row.id;
            const stockDisponible = row.stock;
            if (stockDisponible < stock) {
                console.log('Stock insuffisant.');
                commanderAutre();
                return;
            }
            // Mettre à jour le stock après la commande
            const nouveauStock = stockDisponible - stock;
            db.run('UPDATE Product SET stock = ? WHERE id = ?', [nouveauStock, idProduct], (err) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                console.log(`Commande passée avec succès pour ${stock} article(s) de ${nomProduct}.`);
                commanderAutre();
            });
        });
    });
}

function commander() {
    rl.question('Quel article voulez-vous ? : ', (nomProduct) => {
        rl.question('En quelle quantité voulez-vous commander cet article ? : ', (stock) => {
            stock = parseInt(stock);
            if (isNaN(stock) || stock <= 0) {
                console.log('La quantité doit être un nombre entier positif.');
                rl.close();
                return;
            }
            passerCommande(nomProduct, stock);
        });
    });
}

function commanderAutre() {
    rl.question('Voulez-vous commander autre chose ? (oui/non) : ', (reponse) => {
        if (reponse.toLowerCase() === 'oui') {
            commander();
        } else if (reponse.toLowerCase() === 'non') {
            rl.close();
        } else {
            console.log('Veuillez répondre par "oui" ou "non".');
            commanderAutre();
        }
    });
}

commander();