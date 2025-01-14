const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors"); // Import CORS


// Initialisation Firebase
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://reflex-80cd6.firebaseio.com", // Remplacez <YOUR_PROJECT_ID> par l'ID de votre projet
});

const db = admin.firestore();

const app = express();
const port = 4005;

app.use(cors());

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

/**
 * Endpoint : Ajouter un temps dans le classement
 * Méthode : POST
 * Corps de la requête : { "nom": "Joueur", "temps": 123.45 }
*/
app.post("/classement", async (req, res) => {
    const { nom, temps } = req.body;
    console.log("Ajout au classement");
    console.log(req);

    if (!nom || !temps || typeof temps !== "number") {
        return res.status(400).json({ error: "Paramètres invalides. 'nom' et 'temps' sont requis." });
    }

    try {
        // Ajouter le document dans la collection "classement"
        const docRef = await db.collection("classement").add({ nom, temps, date: new Date() });
        res.status(201).json({ message: "Temps ajouté au classement avec succès.", id: docRef.id });
    } catch (error) {
        console.error("Erreur lors de l'ajout au classement :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

/**
 * Endpoint : Récupérer le classement
 * Méthode : GET
 */
app.get("/classement", async (req, res) => {
    try {
        const snapshot = await db.collection("classement").orderBy("temps", "desc").get();
        const classement = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(classement);
    } catch (error) {
        console.error("Erreur lors de la récupération du classement :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

// Démarrer le serveur
app.listen(port, "0.0.0.0", () => {
    console.log(`API running at http://0.0.0.0:${port}`);
});

