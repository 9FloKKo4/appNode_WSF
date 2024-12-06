const limdu = require('limdu');
const sqlite3 = require('sqlite3').verbose();

// Connecter à la base de données SQLite
const db = new sqlite3.Database('../db/vinyls.db');

// Classifieur
var TextClassifier = limdu.classifiers.Bayesian;
var WordExtractor = function (input) {
    return input.split(' '); 
};

var intentClassifierSearch = new limdu.classifiers.EnhancedClassifier({
    classifierType: TextClassifier,
    featureExtractor: WordExtractor
});

// Train
intentClassifierSearch.trainBatch([
    { input: "Je cherche un vinyle de Nas", output: "searchByArtist" },
    { input: "Avez-vous des vinyles de Miles Davis ?", output: "searchByArtist" },
    { input: "Qu'avez-vous en rock ?", output: "searchByGenre" },
    { input: "Montrez-moi du jazz", output: "searchByGenre" },
    { input: "Quels sont vos vinyles en promo ?", output: "searchPromotions" },
    { input: "Ajoutez Dark Side of the Moon à mon panier", output: "addToCart" }
]);

// Fonction pour rechercher dans la base de données
function searchVinylsByArtist(artist, callback) {
    db.all(
        `SELECT * FROM vinyls WHERE artist LIKE ?`,
        [`%${artist}%`],
        (err, rows) => {
            if (err) {
                callback("Désolé, une erreur est survenue lors de la recherche.");
            } else if (rows.length === 0) {
                callback(`Je n'ai trouvé aucun vinyle pour l'artiste ${artist}.`);
            } else {
                let response = `Voici ce que j'ai trouvé pour ${artist} :\n`;
                rows.forEach((vinyl) => {
                    response += `🎵 ${vinyl.album} de ${vinyl.artist} (${vinyl.genre}) - ${vinyl.price} €\n`;
                });
                callback(response);
            }
        }
    );
}

function searchVinylsByGenre(genre, callback) {
    db.all(
        `SELECT * FROM vinyls WHERE genre LIKE ?`,
        [`%${genre}%`],
        (err, rows) => {
            if (err) {
                callback("Désolé, une erreur est survenue lors de la recherche.");
            } else if (rows.length === 0) {
                callback(`Je n'ai trouvé aucun vinyle dans le genre ${genre}.`);
            } else {
                let response = `Voici les vinyles dans le genre ${genre} :\n`;
                rows.forEach((vinyl) => {
                    response += `🎵 ${vinyl.album} de ${vinyl.artist} - ${vinyl.price} €\n`;
                });
                callback(response);
            }
        }
    );
}

// Simuler une intention utilisateur
function handleUserQuery(query) {
    const intent = intentClassifierSearch.classify(query);
    console.log(`Client : ${query}`);
    switch (intent) {
        case "searchByArtist":
            const artist = query.split(" ").slice(-2).join(" "); // Extraire l'artiste
            searchVinylsByArtist(artist, (response) => {
                console.log("ChatBot : " + response);
            });
            break;

        case "searchByGenre":
            const genre = query.split(" ").pop(); // Extraire le genre
            searchVinylsByGenre(genre, (response) => {
                console.log("ChatBot : " + response);
            });
            break;

        // case "searchPromotions":
        //     console.log(
        //         "ChatBot : Nous avons des promotions sur les vinyles de jazz et rock cette semaine. Voulez-vous en savoir plus ?"
        //     );
        //     break;

        // case "addToCart":
        //     console.log(
        //         "ChatBot : 'Dark Side of the Moon' a été ajouté à votre panier. Souhaitez-vous continuer vos achats ou passer à la caisse ?"
        //     );
        //     break;

        default:
            console.log("ChatBot : Désolé, je n'ai pas compris votre demande.");
    }
}

// Test console
handleUserQuery("Je cherche un vinyle de nas");
handleUserQuery("Qu'avez-vous en rock ?");
handleUserQuery("Ajoutez Dark Side of the Moon à mon panier");
