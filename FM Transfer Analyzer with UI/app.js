// Global variables
let players = [];
let currentView = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('FM Transfer Analyzer loaded');
    initializeUpload();
});

function initializeUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
}

function showUploadZone() {
    document.getElementById('uploadZone').style.display = 'block';
    document.querySelector('.hero-content').style.display = 'none';
}

function hideUploadZone() {
    document.getElementById('uploadZone').style.display = 'none';
    document.querySelector('.hero-content').style.display = 'block';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        showProgress();
        // Simulate processing
        setTimeout(() => {
            alert('Save file parsing will be available in the premium version! Loading demo data...');
            loadDemoData();
        }, 3000);
    }
}

function showProgress() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'block';
    
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const messages = [
        'Reading save file...',
        'Extracting player data...',
        'Calculating market values...',
        'Analyzing squad composition...',
        'Generating insights...'
    ];
    
    const interval = setInterval(() => {
        progress += 20;
        progressFill.style.width = progress + '%';
        
        const messageIndex = Math.floor((progress / 100) * messages.length);
        if (messageIndex < messages.length) {
            progressText.textContent = messages[messageIndex];
        }
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 600);
}

// THIS IS THE IMPORTANT FIX - Make sure loadDemoData actually works
function loadDemoData() {
    console.log('Loading demo data...');
    
    // Create realistic Liverpool squad
    players = [
        {
            name: "Alisson Becker",
            age: 30,
            position: "GK",
            currentAbility: 175,
            potential: 175,
            nationality: "Brazil",
            contractYears: 3,
            value: 45000000,
            status: "⭐ Star Player"
        },
        {
            name: "Virgil van Dijk",
            age: 32,
            position: "CB",
            currentAbility: 180,
            potential: 180,
            nationality: "Netherlands",
            contractYears: 2,
            value: 55000000,
            status: "⭐ Star Player"
        },
        {
            name: "Trent Alexander-Arnold",
            age: 25,
            position: "RB",
            currentAbility: 175,
            potential: 180,
            nationality: "England",
            contractYears: 4,
            value: 85000000,
            status: "⭐ Star Player"
        },
        {
            name: "Andy Robertson",
            age: 29,
            position: "LB",
            currentAbility: 172,
            potential: 172,
            nationality: "Scotland",
            contractYears: 3,
            value: 38000000,
            status: "⭐ Star Player"
        },
        {
            name: "Fabinho",
            age: 30,
            position: "DM",
            currentAbility: 170,
            potential: 170,
            nationality: "Brazil",
            contractYears: 2,
            value: 35000000,
            status: "👴 Veteran"
        },
        {
            name: "Jordan Henderson",
            age: 33,
            position: "CM",
            currentAbility: 158,
            potential: 158,
            nationality: "England",
            contractYears: 1,
            value: 15000000,
            status: "⚠️ Contract Expiring"
        },
        {
            name: "Thiago Alcantara",
            age: 32,
            position: "CM",
            currentAbility: 168,
            potential: 168,
            nationality: "Spain",
            contractYears: 1,
            value: 20000000,
            status: "⚠️ Contract Expiring"
        },
        {
            name: "Curtis Jones",
            age: 22,
            position: "CM",
            currentAbility: 155,
            potential: 170,
            nationality: "England",
            contractYears: 5,
            value: 35000000,
            status: "🚀 High Potential"
        },
        {
            name: "Dominik Szoboszlai",
            age: 22,
            position: "AM",
            currentAbility: 165,
            potential: 175,
            nationality: "Hungary",
            contractYears: 5,
            value: 55000000,
            status: "🚀 High Potential"
        },
        {
            name: "Mohamed Salah",
            age: 31,
            position: "RW",
            currentAbility: 178,
            potential: 178,
            nationality: "Egypt",
            contractYears: 2,
            value: 65000000,
            status: "⭐ Star Player"
        },
        {
            name: "Luis Diaz",
            age: 26,
            position: "LW",
            currentAbility: 168,
            potential: 175,
            nationality: "Colombia",
            contractYears: 5,
            value: 58000000,
            status: "⭐ Star Player"
        },
        {
            name: "Darwin Nunez",
            age: 24,
            position: "ST",
            currentAbility: 160,
            potential: 175,
            nationality: "Uruguay",
            contractYears: 5,
            value: 70000000,
            status: "🚀 High Potential"
        },
        {
            name: "Diogo Jota",
            age: 26,
            position: "ST",
            currentAbility: 165,
            potential: 170,
            nationality: "Portugal",
            contractYears: 4,
            value: 52000000,
            status: "⭐ Star Player"
        },
        {
            name: "Cody Gakpo",
            age: 24,
            position: "LW",
            currentAbility: 158,
            potential: 170,
            nationality: "Netherlands",
            contractYears: 5,
            value: 48000000,
            status: "🚀 High Potential"
        },
        {
            name: "Harvey Elliott",
            age: 20,
            position: "AM",
            currentAbility: 150,
            potential: 170,
            nationality: "England",
            contractYears: 5,
            value: 35000000,
            status: "🌟 Wonderkid"
        },
        {
            name: "Ryan Gravenberch",
            age: 21,
            position: "CM",
            currentAbility: 160,
            potential: 175,
            nationality: "Netherlands",
            contractYears: 5,
            value: 45000000,
            status: "🌟 Wonderkid"
        },
        {
            name: "Ibrahima Konate",
            age: 24,
            position: "CB",
            currentAbility: 165,
            potential: 175,
            nationality: "France",
            contractYears: 5,
            value: 42000000,
            status: "🚀 High Potential"
        },
        {
            name: "Caoimhin Kelleher",
            age: 24,
            position: "GK",
            currentAbility: 140,
            potential: 160,
            nationality: "Ireland",
            contractYears: 4,
            value: 12000000,
            status: "🚀 High Potential"
        },
        {
            name: "Kostas Tsimikas",
            age: 27,
            position: "LB",
            currentAbility: 150,
            potential: 155,
            nationality: "Greece",
            contractYears: 4,
            value: 18000000,
            status: "✅ Squad Player"
        },
        {
            name: "Stefan Bajcetic",
            age: 18,
            position: "DM",
            currentAbility: 145,
            potential: 165,
            nationality: "Spain",
            contractYears: 5,
            value: 25000000,
            status: "🌟 Wonderkid"
        },
        {
            name: "Ben Doak",
            age: 18,
            position: "RW",
            currentAbility: 135,
            potential: 160,
            nationality: "Scotland",
            contractYears: 5,
            value: 15000000,
            status: "🌟 Wonderkid"
        }
    ];
    
    // Sort by value
    players.sort((a, b) => b.value - a.value);
    
    console.log('Demo data loaded:', players.length, 'players');
    showResults();
}

function showResults() {
    console.log('Showing results...');
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    updateStats();
    updatePlayersTable('all');
}

function updateStats() {
    const totalValue = players.reduce((sum, player) => sum + player.value, 0);
    const avgAge = players.reduce((sum, player) => sum + player.age, 0) / players.length;
    const starPlayers = players.filter(player => 
        player.status.includes('Star') || player.status.includes('Wonderkid')).length;
    
    document.getElementById('totalPlayers').textContent = players.length;
    document.getElementById('totalValue').textContent = `€${Math.round(totalValue / 1000000)}M`;
    document.getElementById('avgAge').textContent = avgAge.toFixed(1);
    document.getElementById('starPlayers').textContent = starPlayers;
}

function showTab(filter, tabElement) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tabElement.classList.add('active');
    
    currentView = filter;
    updatePlayersTable(filter);
}

function updatePlayersTable(filter) {
    let filteredPlayers = [...players];
    
    switch (filter) {
        case 'valuable':
            filteredPlayers = players.filter(p => p.value >= 40000000);
            break;
        case 'young':
            filteredPlayers = players.filter(p => p.age <= 23);
            break;
        case 'contracts':
            filteredPlayers = players.filter(p => p.contractYears <= 2);
            break;
    }
    
    const tbody = document.getElementById('playersTableBody');
    tbody.innerHTML = '';
    
    filteredPlayers.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${player.name}</strong><br>
                <small style="color: #94a3b8;">${player.nationality}</small>
            </td>
            <td>${player.age}</td>
            <td>
                <span style="background: rgba(0,212,255,0.2); color: var(--fm-cyan); padding: 0.25rem 0.5rem; border-radius: 5px; font-size: 0.8rem;">
                    ${player.position}
                </span>
            </td>
            <td>${player.currentAbility}</td>
            <td>${player.potential}</td>
            <td><strong>€${(player.value / 1000000).toFixed(1)}M</strong></td>
            <td>${player.contractYears} year${player.contractYears !== 1 ? 's' : ''}</td>
            <td>${player.status}</td>
        `;
        tbody.appendChild(row);
    });
}

function goBack() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    document.querySelector('.hero-content').style.display = 'block';
    document.getElementById('uploadZone').style.display = 'none';
}

function exportToCSV() {
    const headers = ['Name', 'Age', 'Position', 'Current Ability', 'Potential', 'Value', 'Contract Years', 'Status'];
    const csvContent = [
        headers.join(','),
        ...players.map(player => [
            `"${player.name}"`,
            player.age,
            player.position,
            player.currentAbility,
            player.potential,
            player.value,
            player.contractYears,
            `"${player.status}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liverpool_squad_analysis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function showPremiumModal() {
    document.getElementById('premiumModal').style.display = 'flex';
}

function closePremiumModal() {
    document.getElementById('premiumModal').style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('premiumModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});