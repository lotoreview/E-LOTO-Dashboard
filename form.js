// Importation des fonctions Firebase (modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD1Y82eZiGwHe074VYWmvWk_Fak_2taDQ4",
    authDomain: "lotoreview.firebaseapp.com",
    projectId: "lotoreview",
    storageBucket: "lotoreview.appspot.com",
    messagingSenderId: "882641137378",
    appId: "1:882641137378:web:22ef5d606d84c829fff8bb"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const dataRef = collection(db, "data");
console.log("Firebase initialisé avec succès !");

// Gestionnaire de formulaire
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form");
    const conformitesInput = document.getElementById("conformites");
    const nonConformitesInput = document.getElementById("nonConformites");
    const totalConformitesInput = document.getElementById("totalConformites");
    const totalNonConformitesInput = document.getElementById("totalNonConformites");

    if (!form) {
        console.error("Formulaire introuvable !");
        return;
    }

    // Calculer automatiquement les totaux
    const updateTotals = () => {
        const conformites = parseInt(conformitesInput.value, 10) || 0;
        const nonConformites = parseInt(nonConformitesInput.value, 10) || 0;

        totalConformitesInput.value = conformites;
        totalNonConformitesInput.value = nonConformites;
    };

    // Écouter les changements des champs Conformités et Non-Conformités
    conformitesInput.addEventListener("input", updateTotals);
    nonConformitesInput.addEventListener("input", updateTotals);

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        // Récupération des valeurs
        const collaborateur = document.getElementById("collaborateur").value;
        const annee = document.getElementById("annee").value;
        const mois = document.getElementById("mois").value;
        const conformites = parseInt(conformitesInput.value, 10) || 0;
        const nonConformites = parseInt(nonConformitesInput.value, 10) || 0;
        const totalConformites = conformites; // Total égale pour l'instant aux conformités actuelles
        const totalNonConformites = nonConformites; // Total égale pour l'instant aux non-conformités actuelles

        console.log("Données soumises :", {
            collaborateur,
            annee,
            mois,
            conformites,
            nonConformites,
            totalConformites,
            totalNonConformites,
        });

        // Ajouter les données dans Firebase
        try {
            const docRef = await addDoc(dataRef, {
                collaborateur,
                annee,
                mois,
                conformites,
                nonConformites,
                totalConformites,
                totalNonConformites,
            });
            console.log("Document ajouté avec ID :", docRef.id);
            alert("Données enregistrées avec succès !");
            form.reset();
            updateTotals(); // Réinitialiser les totaux
        } catch (error) {
            console.error("Erreur lors de l'enregistrement :", error);
            alert("Une erreur est survenue.");
        }
    });
});
