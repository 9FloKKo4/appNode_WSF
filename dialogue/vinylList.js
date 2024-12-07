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

var TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
	binaryClassifierType: limdu.classifiers.Winnow.bind(0, {retrain_count: 10})
});

// Now define our feature extractor - a function that takes a sample and adds features to a given features set:
var WordExtractor = function(input, features) {
	input.split(" ").forEach(function(word) {
		features[word]=1;
	});
};

// Initialize a classifier with the base classifier type and the feature extractor:
var intentClassifier = new limdu.classifiers.EnhancedClassifier({
	classifierType: TextClassifier,
	featureExtractor: WordExtractor
});

// Former le chatbot avec des phrases de demande
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
  

// Fonction pour afficher jusqu'à 10 produits en fonction du genre
function displayProduct(genre) {
  return new Promise((resolve, reject) => {
    db.all(
    `SELECT * FROM Product WHERE genre = '${genre}' LIMIT 10`,
      [],
      (err, rows) => {
        if (err) {
          reject(
            `Erreur lors de la récupération des produits : ${err.message}`
          );
        } else if (rows.length > 0) {
          console.log(
            `Voici les vinyles disponibles pour le genre "${genre}":`
          );
          rows.forEach((product, index) => {
            console.log(
              `${index + 1}. ${product.nom} par ${product.nom} (${
                product.prix
              }€) - Stock : ${product.stock}`
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

// Fonction pour mettre à jour le stock
async function handleStockSelection(product) {
    while (true) {
      const quantityInput = prompt(
        "Combien d'exemplaires souhaitez-vous commander ? "
      );
      const quantity = parseInt(quantityInput);
  
      if (isNaN(quantity) || quantity <= 0) {
        console.log("Quantité invalide. Veuillez entrer une quantité valide.");
        continue;
      }
  
      try {
        await updateStock(product.id, quantity);
        console.log(
          `Commande confirmée : ${quantity} exemplaire(s) de "${product.nom}".`
        );
        return; 
      } catch (error) {
        console.log(error); 
        console.log(
          "Veuillez essayer avec une quantité plus faible ou choisir un autre produit."
        );
      }
    }
  }
  

// Fonction principale du chatbot
async function chatbot() {
  console.log("Bienvenue dans le chatbot de vinyles ! 🎶");
  console.log(
    "Tous les genres disponibles: Rock, Jazz, Blues, Hip-hop, Reggae, House et Pop"
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
      const products = await displayProduct(genre);
      if (products.length === 0) continue;

      const selectedNumber = prompt(
        "Veuillez entrer le numéro du vinyle que vous souhaitez sélectionner : "
      );

      const selectedIndex = parseInt(selectedNumber) - 1; // On convertit le numéro en index 0-based

      if (selectedIndex >= 0 && selectedIndex < products.length) {
        const selectedProduct = products[selectedIndex];
        console.log(
          `Vous avez sélectionné "${selectedProduct.nom}" par ${selectedProduct.artist} (${selectedProduct.prix}€) - Stock : ${selectedProduct.stock}`
        );

        const quantity = parseInt(
          prompt("Combien d'exemplaires souhaitez-vous commander ? ")
        );

        if (quantity > 0) {
          try {
            await updateStock(selectedProduct.id, quantity);
            console.log(
              `Commande confirmée : ${quantity} exemplaire(s) de "${selectedProduct.nom}".`
            );
          } catch (error) {
            console.error(error);
          }
        } else {
          console.log("Quantité invalide. Commande annulée.");
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
