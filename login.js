const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const prompt = require("prompt-sync")();

// Connexion à une base de données SQLite existante
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Erreur lors de l'ouverture de la base de données :", err);
  } else {
    console.log("Connecté à SQLite3 avec succès !");
    initializeDatabase();
  }
});

// Vérification de la connexion à la base de données
function initializeDatabase() {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", (err, row) => {
      if (err) {
        console.error("Erreur lors de la vérification de la table :", err);
      } else if (row) {
        console.log("Table 'users' trouvée et prête.");
      } else {
        console.error(
          "La table 'users' n'existe pas dans la base de données. Assurez-vous qu'elle est déjà configurée."
        );
        process.exit(1); // Arrêter l'application si la table est absente
      }
    });
  }
  

// Fonction pour s'inscrire
async function register() {
  const username = prompt("Entrez un nom d'utilisateur : ");
  const plainPassword = prompt("Entrez un mot de passe : ", { echo: "*" });

  try {
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Ajout de l'utilisateur dans la base de données
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err) => {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            console.log("Ce nom d'utilisateur est déjà pris.");
          } else {
            console.error("Erreur lors de l'inscription :", err);
          }
        } else {
          console.log("Inscription réussie !");
        }
      }
    );
  } catch (error) {
    console.error("Erreur lors du hashage du mot de passe :", error);
  }
}

// Fonction pour se connecter
function login() {
  const username = prompt("Entrez votre nom d'utilisateur : ");
  const plainPassword = prompt("Entrez votre mot de passe : ", { echo: "*" });

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        console.error("Erreur lors de la recherche de l'utilisateur :", err);
        return;
      }

      if (!user) {
        console.log("Nom d'utilisateur introuvable.");
        return;
      }

      try {
        // Comparaison des mots de passe
        const match = await bcrypt.compare(plainPassword, user.password);
        if (match) {
          console.log("Connexion réussie !");
        } else {
          console.log("Mot de passe incorrect.");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du mot de passe :", error);
      }
    }
  );
}

// Menu principal
async function main() {
  console.log("Bienvenue dans le système de gestion des utilisateurs.");
  console.log("1. S'inscrire");
  console.log("2. Se connecter");
  console.log("3. Quitter");

  const choice = prompt("Choisissez une option : ");
  switch (choice) {
    case "1":
      await register();
      break;
    case "2":
      login();
      break;
    case "3":
      console.log("Au revoir !");
      process.exit();
    default:
      console.log("Option invalide. Veuillez réessayer.");
  }

  main(); // Rappeler le menu après une action
}

// Lancer le programme
main();
