const limdu = require("limdu");
const sqlite3 = require("sqlite3").verbose();
const prompt = require("prompt-sync")();

// Connexion à SQLite3
const db = new sqlite3.Database("./Vinyl.db", (err) => {
  if (err) {
    console.error("Erreur lors de l'ouverture de la base de données :", err);
  } else {
    console.log("Connecté à SQLite3 avec succès !");
  }
});

// Définir un classifieur Limdu
const TextClassifier = limdu.classifiers.Bayesian;
const WordExtractor = function (input) {
  return input.split(" ");
};

// Configurer le chatbot avec Limdu
const intentClassifier = new limdu.classifiers.EnhancedClassifier({
  classifierType: TextClassifier,
  featureExtractor: WordExtractor,
});

// Former le chatbot avec des phrases de demande
intentClassifier.trainBatch([
  { input: "Je cherche un vinyle de rock", output: "rock" },
  { input: "As-tu des vinyles de jazz ?", output: "jazz" },
  { input: "Montre-moi des albums hip hop", output: "hip hop" },
  { input: "Musique hip hop", output: "hip hop" },
  { input: "j aime du hip hop", output: "hip hop" },
  { input: "Je veux écouter du reggae", output: "reggae" },
  { input: "Quels sont les vinyles de blues disponibles ?", output: "blues" },
  { input: "As-tu des vinyles électroniques ?", output: "electronique" },
  { input: "Rien ", output: "rien" },
]);



// Fonction pour afficher jusqu'à 10 produits en fonction du genre
function displayProduct(genre) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM Product WHERE genre = "10 " LIMIT 10`,
      [],
      (err, rows) => {
        if (err) {
          reject("Erreur lors de la récupération des produits :", err);
        } else if (rows.length > 0) {
          console.log(
            `Voici les vinyles disponibles pour le genre "${genre}":`
          );
          rows.forEach((product, index) => {
            console.log(
              `${index + 1}. ${product.nom} par ${product.nom} (${
                product.prix
              }€)`
            );
          });
          resolve(rows);
        } else {
          console.log(
            `Désolé, aucun vinyle disponible pour le genre "${genre}".`
          );
          resolve([]);
        }
      }
    );
  });
}

// Fonction principale du chatbot
async function chatbot() {
  console.log("Bienvenue dans le chatbot de vinyles ! 🎶");
  console.log(
    "Tous les genres disponibles: Rock, Jazz, Blues, Hip-hop et Reggae"
  );
  let shopping = true;

  while (shopping) {
    const userInput = prompt("Que recherchez-vous ? ");
    const genre = intentClassifier.classify(userInput);
    console.log(`Genre détecté: ${genre}`); // Affichage du genre détecté pour déboguer

    if (!genre) {
      console.log(
        "Désolé, je n'ai pas compris le genre. Veuillez essayer à nouveau."
      );
      continue;
    }
    console.log(`Vous recherchez des vinyles de genre : ${genre}`);

    try {
      const products = await displayProduct("10");
      if (products.length === 0) continue;

      const selectedNumber = prompt(
        "Veuillez entrer le numéro du vinyle que vous souhaitez sélectionner : "
      );

      const selectedIndex = parseInt(selectedNumber) - 1; // On convertit le numéro en index 0-based

      if (selectedIndex >= 0 && selectedIndex < products.length) {
        const selectedProduct = products[selectedIndex];
        console.log(
          `Vous avez sélectionné "${selectedProduct.nom}" par ${selectedProduct.nom} (${selectedProduct.prix}€)`
        );

        const confirmation = prompt(`Confirmez-vous votre choix ? (oui/non) `);

        if (confirmation.toLowerCase() === "oui") {
          console.log(
            `Merci pour votre commande de "${selectedProduct.nom}" !`
          );
        } else {
          console.log("Sélection annulée.");
        }
      } else {
        console.log("Numéro de vinyle invalide. Veuillez réessayer.");
        continue; 
      }

      const continueShopping = prompt(
        "Souhaitez-vous commander un autre vinyle ? (oui/non) "
      );
      if (continueShopping.toLowerCase() !== "oui") {
        shopping = false;
        console.log("Merci pour votre visite ! À bientôt ! 🎵");
      }
    } catch (error) {
      console.error(error);
      shopping = false; 
    }
  }
}

// Exécuter 
chatbot();
