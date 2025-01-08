import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1Y82eZiGwHe074VYWmvWk_Fak_2taDQ4",
  authDomain: "lotoreview.firebaseapp.com",
  projectId: "lotoreview",
  storageBucket: "lotoreview.appspot.com",
  messagingSenderId: "882641137378",
  appId: "1:882641137378:web:22ef5d606d84c829fff8bb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentChart = null;

// Fonction pour créer un effet 3D
function create3DGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
  gradient.addColorStop(1, color);
  return gradient;
}

// Fonction pour mettre à jour le graphique pour un mois donné
function updateGraph(month, year) {
  console.log(`Mise à jour du graphique pour ${month} ${year}`);
  const dataRef = collection(db, "data");

  onSnapshot(dataRef, (snapshot) => {
    const filteredData = snapshot.docs
      .map(doc => doc.data())
      .filter(entry => entry.annee === year && entry.mois === month);

    // Vérifier s'il y a des données
    if (filteredData.length === 0) {
      console.warn(`Aucune donnée trouvée pour ${month} ${year}`);
      resetChart(year); // Réinitialiser le graphique
      return; // Sortir de la fonction si aucune donnée n'est trouvée
    }

    const labels = filteredData.map(d => d.collaborateur);
    const conformityData = filteredData.map(d => d.conformites);
    const nonConformityData = filteredData.map(d => d.nonConformites);

    // Sélectionner le canvas correspondant à l'année
    const canvasId = `myChart${year}`;
    const ctx = document.getElementById(canvasId)?.getContext('2d');

    // Vérifier que le canvas existe
    if (!ctx) {
      console.error(`Canvas avec l'ID ${canvasId} introuvable.`);
      return; // Sortir si le canvas n'existe pas
    }

    renderChart(ctx, labels, conformityData, nonConformityData, year);
  });
}

// Réinitialiser le graphique
function resetChart(year) {
  console.log(`Réinitialisation du graphique pour ${year}`);
  const canvasId = `myChart${year}`;
  const ctx = document.getElementById(canvasId)?.getContext('2d');

  if (currentChart) {
    currentChart.destroy(); // Détruire le graphique actuel
    currentChart = null;
  }}

// Fonction pour afficher le graphique total pour une année donnée
function showTotal(year) {
  console.log(`Affichage du graphique total pour ${year}`);
  const dataRef = collection(db, "data");

  onSnapshot(dataRef, (snapshot) => {
    const filteredData = snapshot.docs
      .map((doc) => doc.data())
      .filter((entry) => entry.annee === year);

    if (filteredData.length === 0) {
      console.warn(`Aucune donnée trouvée pour Total ${year}`);
      return;
    }

    const labels = [...new Set(filteredData.map((d) => d.collaborateur))];
    const conformityData = labels.map((label) =>
      filteredData
        .filter((d) => d.collaborateur === label)
        .reduce((total, d) => total + (d.totalConformites || 0), 0)
    );
    const nonConformityData = labels.map((label) =>
      filteredData
        .filter((d) => d.collaborateur === label)
        .reduce((total, d) => total + (d.totalNonConformites || 0), 0)
    );

    const canvasId = `myChart${year}`;
    const canvasElement = document.getElementById(canvasId);

    if (!canvasElement) {
      console.error(`Canvas avec l'ID ${canvasId} introuvable.`);
      return;
    }

    const ctx = canvasElement.getContext("2d");
    renderChart(ctx, labels, conformityData, nonConformityData, year);
  });
}

// Fonction pour afficher un graphique
function renderChart(ctx, labels, conformities, nonConformities, year) {
  if (currentChart) {
    currentChart.destroy();
  }

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Conformités",
          data: conformities,
          backgroundColor: labels.map(() =>
            create3DGradient(ctx, "rgba(0, 150, 255, 0.9)")
          ),
          borderColor: "#B0C4DE",
          borderWidth: 1.5,
        },
        {
          label: "Non-Conformités",
          data: nonConformities,
          backgroundColor: labels.map(() =>
            create3DGradient(ctx, "rgba(255, 69, 100, 0.9)")
          ),
          borderColor: "#F08080",
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: "#B0B0B0" },
        },
        x: {
          ticks: { maxRotation: 45, minRotation: 45, color: "#B0B0B0" },
        },
      },
      plugins: {
        legend: { labels: { color: "#B0B0B0" } },
      },
    },
  });
}

// Gérer les clics sur les onglets d'années
function openTab(event, year) {
  console.log(`Changement d'année pour ${year}`);

  document.querySelectorAll(".tablink").forEach((tab) => tab.classList.remove("active"));
  event.currentTarget.classList.add("active");

  document.querySelectorAll(".tabcontent").forEach((content) => {
    content.classList.remove("active");
  });

  const yearContent = document.getElementById(`year-${year}`);
  yearContent.classList.add("active");

  const activeMonth = document.querySelector(".month-btn.active")?.textContent || "January";
  updateGraph(activeMonth, year);
}

// Gestion des clics sur les onglets mois et total
document.querySelectorAll('.month-btn, .total-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const year = document.querySelector('.tablink.active')?.textContent;

    // Réinitialiser les classes actives pour tous les boutons
    document.querySelectorAll('.month-btn, .total-btn').forEach(btn =>
      btn.classList.remove('active')
    );

    // Ajouter la classe active au bouton sélectionné
    button.classList.add('active');

    // Vérifier si c'est un onglet "Total"
    if (button.classList.contains('total-btn')) {
      console.log(`Affichage des totaux pour l'année ${year}`);
      showTotal(year); // Afficher le graphique total
    } else {
      const month = button.textContent;
      console.log(`Affichage des données pour ${month} ${year}`);
      updateGraph(month, year); // Mettre à jour le graphique pour le mois
    }
  });
});

window.openTab = openTab;
window.updateGraph = updateGraph;
window.showTotal = showTotal;
