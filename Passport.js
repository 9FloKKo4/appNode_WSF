const readline = require('readline');
const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const db = new sqlite3.Database('Vinyl.db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function register() {
    rl.question("Nom d'utilisateur : ", (username) => {
        rl.question("Mot de passe : ", (password) => {
            if (!username || !password) {
                console.log("Les champs utilisateur et mot de passe sont obligatoires.");
                return mainMenu();
            }

            if (password.length < 6) {
                console.log("Le mot de passe doit contenir au moins 6 caractères.");
                return mainMenu();
            }

            const salt = crypto.randomBytes(16).toString('hex');
            crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
                if (err) {
                    console.error("Erreur lors du hachage du mot de passe :", err.message);
                    return mainMenu();
                }

                db.run(
                    'INSERT INTO users (username, salt, hashed_password) VALUES (?, ?, ?)',
                    [username, salt, hashedPassword.toString('hex')],
                    (err) => {
                        if (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                console.log("Ce nom d'utilisateur existe déjà.");
                            } else {
                                console.error("Erreur lors de l'inscription :", err.message);
                            }
                            return mainMenu();
                        }
                        console.log("Compte créé avec succès !");
                        mainMenu();
                    }
                );
            });
        });
    });
}

function login() {
    rl.question("Nom d'utilisateur : ", (username) => {
        rl.question("Mot de passe : ", (password) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
                if (err) {
                    console.error("Erreur lors de la récupération de l'utilisateur :", err.message);
                    return mainMenu();
                }

                if (!user) {
                    console.log("Nom d'utilisateur incorrect.");
                    return mainMenu();
                }

                crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
                    if (err) {
                        console.error("Erreur lors du hachage :", err.message);
                        return mainMenu();
                    }

                    if (!crypto.timingSafeEqual(Buffer.from(user.hashed_password, 'hex'), hashedPassword)) {
                        console.log("Mot de passe incorrect.");
                        return mainMenu();
                    }

                    console.log(`Connexion réussie ! Bienvenue, ${username}.`);
                    mainMenu();
                });
            });
        });
    });
}

// Menu principal
function mainMenu() {
    console.log("\n=== Menu Principal ===");
    console.log("1. S'inscrire");
    console.log("2. Se connecter");
    console.log("3. Quitter");

    rl.question("Choisissez une option : ", (choice) => {
        switch (choice.trim()) {
            case '1':
                register();
                break;
            case '2':
                login();
                break;
            case '3':
                console.log("Au revoir !");
                rl.close();
                db.close();
                break;
            default:
                console.log("Choix invalide. Veuillez réessayer.");
                mainMenu();
                break;
        }
    });
}

db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mail TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        salt TEXT NOT NULL,
        hashed_password TEXT NOT NULL
    )`,
    (err) => {
        if (err) {
            console.error("Erreur lors de la création de la table :", err.message);
        } else {
            console.log("Base de données prête.");
            mainMenu();
        }
    }
);