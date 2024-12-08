const sqlite3 = require('sqlite3');
const readline = require('readline');
const limdu = require("limdu");
const prompt = require("prompt-sync")();
const crypto = require('crypto'); 

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

var TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
    binaryClassifierType: limdu.classifiers.Winnow.bind(0, { retrain_count: 10 })
});

var WordExtractor = function(input, features) {
    input.split(" ").forEach(function(word) {
        features[word] = 1;
    });
};

var intentClassifier = new limdu.classifiers.EnhancedClassifier({
    classifierType: TextClassifier,
    featureExtractor: WordExtractor
});

intentClassifier.trainBatch([
   
    // Rock
    { input: "Je cherche un vinyle de Rock", output: "Rock" },
    { input: "Du Rock, s'il te plaît", output: "Rock" },
    { input: "J'aimerais écouter du Rock", output: "Rock" },
    { input: "As-tu des vinyles Rock ?", output: "Rock" },
    { input: "Rock n roll, montre-moi ça", output: "Rock" },
    { input: "Musique Rock", output: "Rock" },
    { input: "Je veux des classiques du Rock", output: "Rock" },

     // Jazz
   { input: "Je cherche du Jazz", output: "Jazz" },
   { input: "As-tu des albums de Jazz ?", output: "Jazz" },
   { input: "Montre-moi les vinyles de Jazz", output: "Jazz" },
   { input: "J'aime le Jazz, qu'as-tu ?", output: "Jazz" },
   { input: "Du Jazz, s'il te plaît", output: "Jazz" },
   { input: "Musique Jazz", output: "Jazz" },
   { input: "J'aimerais découvrir du Jazz", output: "Jazz" },
 
   // Blues
   { input: "Quels sont les vinyles de Blues disponibles ?", output: "Blues" },
   { input: "Du Blues, ça serait bien", output: "Blues" },
   { input: "As-tu des vinyles Blues ?", output: "Blues" },
   { input: "Je veux écouter du Blues", output: "Blues" },
   { input: "Musique Blues, montre-moi", output: "Blues" },
   { input: "J'aime le Blues, qu'as-tu ?", output: "Blues" },
 
   // Hip-hop
   { input: "Je cherche de la musique hip-hop", output: "hip-hop" },
   { input: "Montre-moi des albums hip hop", output: "hip-hop" },
   { input: "Hip-hop, qu'est-ce que tu as ?", output: "hip-hop" },
   { input: "As-tu des disques hip hop ?", output: "hip-hop" },
   { input: "J'aime le hip-hop", output: "hip-hop" },
   { input: "Musique hip-hop", output: "hip-hop" },
 
   // House
   { input: "Je veux écouter de la House", output: "House" },
   { input: "Montre-moi des vinyles de House", output: "House" },
   { input: "As-tu de la musique House ?", output: "House" },
   { input: "House, s'il te plaît", output: "House" },
   { input: "Un vinyle de House serait parfait", output: "House" },
   { input: "Je cherche de la House", output: "House" },
 
   // Pop
   { input: "As-tu des vinyles de pop ?", output: "pop" },
   { input: "Montre-moi les albums de pop", output: "pop" },
   { input: "Pop, qu'as-tu en stock ?", output: "pop" },
   { input: "Je veux de la musique pop", output: "pop" },
   { input: "Du pop, s'il te plaît", output: "pop" },
   { input: "J'aime la pop, montre-moi ce que tu as", output: "pop" },
 
   // Reggae
   { input: "As-tu des albums de reggae ?", output: "reggae" },
   { input: "Du reggae, qu'as-tu ?", output: "reggae" },
   { input: "Je veux écouter du reggae", output: "reggae" },
   { input: "Montre-moi des vinyles de reggae", output: "reggae" },
   { input: "Musique reggae", output: "reggae" },
   { input: "J'aime le reggae, qu'as-tu ?", output: "reggae" }
 ]);

 function generateSalt() {
    return crypto.randomBytes(16).toString('hex'); // Génère un salt aléatoire
}
function hashPassword(password, salt) {
    return crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
}

async function gestionUtilisateur() {
    const userId = prompt('Veuillez entrer votre identifiant : ').trim();
    const password = prompt('Veuillez entrer votre mot de passe : ').trim();

    // Vérifier si l'utilisateur existe dans la base de données
    db.get('SELECT * FROM users WHERE username = ?', [userId], (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'utilisateur :', err.message);
            return;
        }

        

        if (row) {
            // Vérification du mot de passe
            const crypto = require('crypto');
            const hashedInputPassword = crypto
                .pbkdf2Sync(password, row.salt, 1000, 64, 'sha512')
                .toString('hex');

            if (hashedInputPassword === row.hashed_password) {
                console.log(`Bienvenue, ${row.username} !`);
                afficherMenuUtilisateur(userId);
            } else {
                console.log('Mot de passe incorrect. Veuillez réessayer.');
                gestionUtilisateur(); // Relancer la connexion
            }
        } else {
            console.log('Identifiant introuvable.');
            const choice = prompt('Voulez-vous créer un nouveau compte ? (oui/non) : ').toLowerCase();
            if (choice === 'oui') {
                const username = prompt('Entrez votre username : ').trim();

                let email = '';
                while (true) {
                    email = prompt('Entrez votre email : ').trim();
                    // Validation de l'email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        console.log('Adresse email invalide. Assurez-vous qu\'elle contient un "@" et se termine par ".com".');
                    } else {
                        break; // Email valide
                    }
                }

                let password = '';
                while (true) {
                    password = prompt('Entrez votre mot de passe : ').trim();
                    // Validation du mot de passe
                    const passwordRegex = /^(?=.*[0-9]).{9,}$/; // Au moins 9 caractères et au moins un chiffre
                    if (!passwordRegex.test(password)) {
                        console.log('Mot de passe invalide. Il doit contenir au moins 9 caractères et inclure au moins un chiffre.');
                    } else {
                        break; // Mot de passe valide
                    }
                }



                if (!username || !email || !password) {
                    console.log('Tous les champs sont obligatoires.');
                    return;
                }

                // Générer un salt unique pour l'utilisateur
                const salt = crypto.randomBytes(16).toString('hex');
                const hashedPassword = hashPassword(password, salt);

                // Insérer un nouvel utilisateur dans la base de données
                db.run(
                    'INSERT INTO users (mail, username, salt, hashed_password) VALUES (?, ?, ?, ?)',
                    [email, username, salt, hashedPassword],
                    function (err) {
                        if (err) {
                            console.error('Erreur lors de la création du compte :', err.message);
                        } else {
                            console.log(`Compte créé avec succès ! Votre identifiant est ${this.lastID} et votre nom d'utilisateur est "${username}".`);
                            afficherMenuUtilisateur(userId);
                        }
                    }
                );
            } else {
                console.log('Action annulée. À bientôt !');
                rl.close();
            }
        }
    });
}


function afficherMenuUtilisateur(userId) {
    console.log('\nOptions disponibles :');
    console.log('1. Explorer les genres');
    console.log('2. Voir l\'historique de mes achats');
    console.log('3. Quitter');

    rl.question('Choisissez une option : ', (choix) => {
        switch (choix.trim()) {
            case '1':
                afficherGenres(userId);
                break;
            case '2':
                afficherHistorique(userId);
                break;
            case '3':
                console.log('À bientôt !');
                fermerConnexion();
                break;
            default:
                console.log('Option invalide. Réessayez.');
                afficherMenuUtilisateur(userId);
                break;
        }
    });
}

function afficherHistorique(userId) {
    db.all('SELECT * FROM orders WHERE id = ?', [userId], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'historique :', err.message);
            afficherMenuUtilisateur(userId);
            return;
        }

        if (rows.length === 0) {
            console.log('Aucun achat enregistré.');
        } else {
            console.log('Votre historique d\'achats :');
            rows.forEach((row) => {
                console.log(`- ${row.product_name} (${row.date})`);
            });
        }
        afficherMenuUtilisateur(userId);
    });
}

function afficherGenres(userId) {
    db.all('SELECT DISTINCT genre FROM product WHERE genre IS NOT NULL AND genre != ""', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des genres :', err.message);
            afficherMenuUtilisateur(userId);
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
                afficherDisquesParGenre(genreSelectionne, userId);
            } else {
                console.log('Numéro invalide.');
                afficherGenres(userId);
            }
        });
    });
}

function afficherDisquesParGenre(genre, userId) {
    db.all('SELECT * FROM product WHERE genre = ?', [genre], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des disques :', err.message);
            afficherMenuUtilisateur(userId);
            return;
        }

        if (rows.length === 0) {
            console.log(`Aucun disque disponible pour le genre "${genre}".`);
            afficherMenuUtilisateur(userId);
            return;
        }

        console.log(`Disques disponibles dans le genre "${genre}" :`);
        rows.forEach((row) => {
            console.log(`${row.id} | ${row.nom} | Prix : ${row.prix}€ | Stock : ${row.stock}`);
        });

        rl.question('Entrez le numéro du disque que vous souhaitez commander : ', (idDisque) => {
            db.get('SELECT * FROM product WHERE genre = ? AND id = ?', [genre, parseInt(idDisque, 10)], (err, row) => {
                if (err) {
                    console.error('Erreur lors de la récupération du disque :', err.message);
                    afficherMenuUtilisateur(userId);
                    return;
                }

                if (row) {
                    confirmerCommande(row, userId);
                } else {
                    console.log(`Aucun disque trouvé pour le numéro "${idDisque}".`);
                    afficherDisquesParGenre(genre, userId);
                }
            });
        });
    });
}


function confirmerCommande(produit, genre, userId) {
    console.log(`Vous avez sélectionné : ${produit.nom} | Prix unitaire : ${produit.prix}€ | Stock actuel : ${produit.stock}`);

    rl.question('Entrez la quantité souhaitée : ', (inputQuantite) => {
        const quantite = parseInt(inputQuantite.trim(), 10);

        // Validation de la quantité entrée
        if (isNaN(quantite) || quantite <= 0) {
            console.log('Quantité invalide. Veuillez entrer un nombre positif.');
            confirmerCommande(produit, genre, userId);
            return;
        }

        if (quantite > produit.stock) {
            console.log(`Désolé, la quantité demandée (${quantite}) dépasse le stock disponible (${produit.stock}).`);
            proposerAutreAchat(genre, userId);
            return;
        }

        const total = produit.prix * quantite;
        console.log(`Vous avez sélectionné ${quantite} exemplaire(s) de "${produit.nom}". Total : ${total}€`);

        rl.question('Confirmer l\'achat ? (oui/non) : ', (reponse) => {
            if (reponse.trim().toLowerCase() === 'oui') {
                // Insérer la commande
                db.run(
                    'INSERT INTO orders (id, nom,prix_total, account) VALUES (?, ?, ?, ?)',
                    [userId, produit.id, quantite, total],
                    (err) => {
                        if (err) {
                            console.error('Erreur lors de l\'enregistrement de l\'achat :', err.message);
                            proposerAutreAchat(genre, userId);
                            return;
                        }

                        console.log('Achat confirmé ! Merci pour votre commande.');

                        // Mettre à jour le stock
                        const nouveauStock = produit.stock - quantite;
                        db.run(
                            'UPDATE product SET stock = ? WHERE id = ?',
                            [nouveauStock, produit.id],
                            (err) => {
                                if (err) {
                                    console.error('Erreur lors de la mise à jour du stock :', err.message);
                                } else {
                                    console.log(`Le stock de "${produit.nom}" a été mis à jour. Nouveau stock : ${nouveauStock}`);
                                }
                                proposerAutreAchat(genre, userId);
                            }
                        );
                    }
                );
            } else {
                proposerAutreAchat(genre, userId);
            }
        });
    });
}


function proposerAutreAchat(genre, userId) {
    rl.question('Voulez-vous acheter un autre disque ? (oui/non) : ', (reponse) => {
        if (reponse.trim().toLowerCase() === 'oui') {
            rl.question('Souhaitez-vous changer de genre ? (oui/non) : ', (changerGenre) => {
                if (changerGenre.trim().toLowerCase() === 'oui') {
                    afficherMenuUtilisateur(userId);
                } else {
                    afficherDisquesParGenre(genre, userId);
                }
            });
        } else {
            console.log('Merci pour vos achats ! À bientôt.');
            afficherMenuUtilisateur(userId);
        }
    });
}



function fermerConnexion() {
    rl.close();
    db.close((err) => {
        if (err) {
            console.error('Erreur lors de la fermeture de la base de données :', err.message);
        }
        console.log('Connexion à la base de données fermée.');
    });
}

// Lancer le programme
console.log('Bienvenue dans le programme de recherche et commande de disques !');
gestionUtilisateur();
