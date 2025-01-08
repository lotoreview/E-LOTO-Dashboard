import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1Y82eZiGwHe074VYWmvWk_Fak_2taDQ4",
  authDomain: "lotoreview.firebaseapp.com",
  projectId: "lotoreview",
  storageBucket: "lotoreview.appspot.com",
  messagingSenderId: "882641137378",
  appId: "1:882641137378:web:22ef5d606d84c829fff8bb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let overviewChart = null;

function changeYear(year) {
  // Mettre à jour les onglets pour indiquer l'année active
  const tabLinks = document.querySelectorAll('.tablink');
  tabLinks.forEach(tab => tab.classList.remove('active'));
  const activeTab = Array.from(tabLinks).find(tab => tab.textContent === year);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  // Charger les données depuis Firebase
  const dataRef = collection(db, "data");
  onSnapshot(dataRef, (snapshot) => {
    const rawData = snapshot.docs.map(doc => doc.data());

    // Filtrer les données pour l'année sélectionnée
    const data = rawData.filter(entry => entry.annee === year);

    // Trier les mois dans l'ordre
    const months = [...new Set(data.map(d => d.mois))].sort((a, b) =>
      new Date(`1 ${a} 2000`) - new Date(`1 ${b} 2000`)
    );

    // Calcul des conformités et non-conformités par mois
    const conformities = months.map(month =>
      data.filter(d => d.mois === month).reduce((sum, d) => sum + d.conformites, 0)
    );
    const nonConformities = months.map(month =>
      data.filter(d => d.mois === month).reduce((sum, d) => sum + d.nonConformites, 0)
    );

    renderOverviewChart(months, conformities, nonConformities);
  });
}

function create3DGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
  gradient.addColorStop(1, color);
  return gradient;
}

function renderOverviewChart(months, conformities, nonConformities) {
  const ctx = document.getElementById('overview-chart').getContext('2d');

  if (overviewChart) overviewChart.destroy();

  overviewChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Conformités',
          data: conformities,
          backgroundColor: conformities.map(() => create3DGradient(ctx, 'rgba(0, 150, 255, 0.9)')),
          borderColor: '#B0C4DE',
          borderWidth: 1.5,
        },
        {
          label: 'Non-Conformités',
          data: nonConformities,
          backgroundColor: nonConformities.map(() => create3DGradient(ctx, 'rgba(255, 69, 100, 0.9)')),
          borderColor: '#F08080',
          borderWidth: 1.5,
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#B0B0B0',
            stepSize: 1 // Définit l'incrément de l'échelle à 1
          },
        },
        x: {
            ticks: { maxRotation: 45, minRotation: 45, color: '#B0B0B0' }
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: '#B0B0B0',
          },
        },
      },
    },
)};


// Appelle par défaut pour l'année 2024
changeYear('2024');

// Rendre la fonction accessible dans le contexte global
window.changeYear = changeYear;