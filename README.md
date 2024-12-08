# appNode_WSF

Gestion des Vinyles avec Recherche API Discogs
Ce projet est une application interactive de gestion de vinyles. Il permet aux utilisateurs de rechercher des albums ou des artistes via l'API Discogs, d'explorer des genres musicaux, de gérer leurs commandes, et de consulter leur historique d'achats. L'application utilise une base de données SQLite pour gérer les informations locales.

Fonctionnalités principales
Gestion des utilisateurs :

Connexion avec nom d'utilisateur et mot de passe sécurisé.
Création de compte avec validation d'email et de mot de passe.
Recherches avancées :

Albums : Trouver des informations détaillées sur un album en utilisant l'API Discogs.
Artistes : Rechercher jusqu'à 5 artistes maximum via l'API Discogs.
Exploration des genres musicaux :

Afficher les genres disponibles à partir de la base de données.
Parcourir et commander des disques par genre.
Gestion des commandes :

Passer des commandes avec vérification du stock.
Mise à jour automatique des stocks après commande.
Historique des achats :

Visualisation de l'historique des commandes par utilisateur.
Structure du projet
Vinyl.db : Base de données SQLite contenant les informations sur les utilisateurs, produits, genres, et commandes.
test.js : Script principal de l'application. Contient les fonctionnalités principales et le menu interactif.
Sous-dossier dialogue : Contient le rendu final des interactions utilisateur.
Technologies utilisées
Node.js : Environnement d'exécution pour exécuter le script.
SQLite3 : Base de données locale pour stocker les informations.
Discogs API : API externe utilisée pour obtenir des informations détaillées sur les albums et artistes.
Limdu : Librairie pour le traitement du langage naturel afin de classifier les genres musicaux.
Crypto : Pour sécuriser les mots de passe utilisateur via un mécanisme de salage et de hachage.
Prompt-sync : Pour les interactions utilisateur dans le terminal.
Axios : Pour effectuer des appels HTTP à l'API Discogs.
Prérequis
Node.js installé sur votre machine.
Clé API Discogs (fournie dans le script via DISCOGS_TOKEN).

Utilisation
Suivez les instructions dans le menu interactif.
Pour rechercher des albums ou artistes, entrez les noms appropriés.
Pour explorer les genres, choisissez parmi les options disponibles.
L'historique des achats est accessible via le menu utilisateur.
Organisation du projet
Fichier principal : test.js contient tout le code du programme.
Rendu final : Situé dans le sous-dossier dialogue, il représente les interactions simulées entre l'utilisateur et le programme.
Contributeurs
Projet développé pour une démonstration de gestion des vinyles avec API externe et base de données locale.

Merci pour votre intérêt et bonne découverte ! 🎵