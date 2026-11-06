// INITIAL CANDIDATE DATA (10 Paslon DPK/DPS)
const defaultCandidates = [
  { id: 1, number: '01', name: 'Ahmad Fauzi & Rina Melati', vision: 'Mewujudkan OSIS/DPK yang responsif, inovatif, dan berakhlak mulia.', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 2, number: '02', name: 'Bagas Pratama & Siti Nurhaliza', vision: 'Meningkatkan prestasi akademik dan non-akademik siswa melalui ekstrakurikuler unggulan.', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
  { id: 3, number: '03', name: 'Citra Dewi & Kevin Sanjaya', vision: 'Menciptakan lingkungan sekolah hijau, ramah lingkungan, dan inklusif.', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 4, number: '04', name: 'Dion Permana & Annisa Putri', vision: 'Optimalisasi fasilitas digital dan wadah aspirasi siswa yang terbuka.', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { id: 5, number: '05', name: 'Eka Wijaya & Nadia Rahma', vision: 'Mengembangkan jiwa kewirausahaan siswa melalui event bazar berkala.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 6, number: '06', name: 'Fajar Nugraha & Maya Lestari', vision: 'Mempererat persaudaraan antar kelas lewat kompetisi seni dan olahraga.', photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80' },
  { id: 7, number: '07', name: 'Gilang Ramadhan & Tari Sukma', vision: 'Menanamkan budaya disiplin, saling menghargai, dan bebas perundungan.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { id: 8, number: '08', name: 'Hendra Setiawan & Bella Safira', vision: 'Penguatan kegiatan literasi digital dan ruang karya kreatif siswa.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 9, number: '09', name: 'Indra Lesmana & Amanda Manopo', vision: 'Meningkatkan peran DPK sebagai jembatan aspirasi siswa kepada pihak sekolah.', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
  { id: 10, number: '10', name: 'Joko Widodo & Megawati S.', vision: 'Pemberdayaan OSIS dan DPK yang transparan, profesional, dan menyenangkan.', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' },
];

// APP STATE
let candidates = JSON.parse(localStorage.getItem('evoting_candidates')) || defaultCandidates;
let votes = JSON.parse(localStorage.getItem('evoting_votes')) || {};
let googleScriptUrl = localStorage.getItem('evoting_script_url') || '';
let selectedCandidateId = null;
let countdownInterval = null;
let recapChartInstance = null;

// INITIALIZATION ON LOAD
window.onload = function() {
  renderCandidates();
  updateClock();
  setInterval(updateClock, 1000);
  checkApiStatus();
  if (googleScriptUrl) {
    const scriptInput = document.getElementById('inputScriptUrl');
    if (scriptInput) scriptInput.value = googleScriptUrl;
  }
};

// RENDER CANDIDATE CARDS (10 CARDS)
function renderCandidates() {
  const grid = document.getElementById('candidatesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  candidates.forEach((c) => {
    const card = document.createElement('div');
    card.className = "glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer group relative overflow-hidden";
    card.onclick = () => selectCandidate(c.id);
    card.innerHTML = `
      <!-- Card Top Header -->
      <div class="flex items-center justify-between mb-3">
        <span class="bg-gradient-to-r from-brand-600 to-emerald-500 text-white font-black text-sm px-3 py-1 rounded-xl shadow-md tracking-wider">
          NO. ${c.number}
        </span>
        <span class="text-[10px] font-bold text-slate-400 group-hover:text-brand-400 transition flex items-center gap-1">
          <i class="fa-solid fa-check-circle"></i> Pilih
        </span>
      </div>
      
      <!-- Photo Container -->
      <div class="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-slate-800 border border-slate-700">
        <img src="${c.photo}" alt="${c.name}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/1e293b/22c55e?text=Paslon+${c.number}';" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition"></div>
      </div>
      
      <!-- Candidate Details -->
      <div class="flex-grow flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-sm sm:text-base text-white group-hover:text-brand-400 transition leading-snug line-clamp-2">
            ${c.name}
          </h3>
          <p class="text-[11px] text-slate-400 mt-1.5 line-clamp-2 italic leading-relaxed">
            "${c.vision}"
          </p>
        </div>
        
        <!-- Coblos Button -->
        <button class="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-800 group-hover:bg-brand-600 text-slate-200 group-hover:text-white font-black text-xs transition duration-300 flex items-center justify-center space-x-2 shadow-sm border border-slate-700 group-hover:border-brand-500">
          <i class="fa-solid fa-vote-yea"></i>
          <span>COBLOS PASLON</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// CANDIDATE SELECTION & CONFIRMATION MODAL TRIGGER
function selectCandidate(id) {
  const candidate = candidates.find(c => c.id === id);
  if (!candidate) return;

  selectedCandidateId = id;

  // Fill confirmation modal details
  document.getElementById('modalCandidateNumber').innerText = candidate.number;
  document.getElementById('modalCandidateName').innerText = candidate.name;
  document.getElementById('modalCandidateVision').innerText = `"${candidate.vision}"`;
  document.getElementById('modalCandidatePhoto').src = candidate.photo;

  // Display Modal with Smooth Fade
  const modal = document.getElementById('confirmModal');
  const card = document.getElementById('confirmModalCard');
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
  }, 10);
}

function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  const card = document.getElementById('confirmModalCard');
  
  card.classList.remove('scale-100');
  card.classList.add('scale-95');
  modal.classList.add('opacity-0');
  
  setTimeout(() => {
    modal.classList.add('hidden');
    selectedCandidateId = null;
  }, 200);
}

// EXECUTE VOTE ON CONFIRM
function executeVote() {
  if (!selectedCandidateId) return;

  const candidate = candidates.find(c => c.id === selectedCandidateId);
  if (!candidate) return;

  // 1. Record Vote Locally
  votes[selectedCandidateId] = (votes[selectedCandidateId] || 0) + 1;
  localStorage.setItem('evoting_votes', JSON.stringify(votes));

  // 2. Send to Google Sheets if API URL exists
  if (googleScriptUrl) {
    const payload = {
      candidateId: candidate.id,
      candidateNumber: candidate.number,
      candidateName: candidate.name,
      timestamp: new Date().toISOString()
    };

    fetch(googleScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.log('Apps Script payload queued locally:', err));
  }

  // 3. Hide Confirmation Modal
  closeConfirmModal();

  // 4. Trigger Celebration Confetti & Success Screen
  setTimeout(() => {
    triggerConfetti();
    showSuccessOverlay();
  }, 250);
}

// CONFETTI ANIMATION EFFECT
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// SUCCESS OVERLAY & 3-SECOND AUTOMATIC SCREEN RESET
function showSuccessOverlay() {
  const overlay = document.getElementById('successOverlay');
  const timerEl = document.getElementById('countdownTimer');
  let count = 3;

  timerEl.innerText = count;
  overlay.classList.remove('hidden');

  countdownInterval = setInterval(() => {
    count--;
    timerEl.innerText = count;
    if (count <= 0) {
      clearInterval(countdownInterval);
      overlay.classList.add('hidden');
      // Reset view state completely for next student
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 1000);
}

// RECAP & ANALYTICS DASHBOARD MODAL
function openRecapModal() {
  updateRecapStats();
  const modal = document.getElementById('recapModal');
  modal.classList.remove('hidden');
}

function closeRecapModal() {
  document.getElementById('recapModal').classList.add('hidden');
}

function updateRecapStats() {
  let total = 0;
  let maxVotes = -1;
  let leaderName = '-';

  // Calculate total & leading candidate
  candidates.forEach(c => {
    const count = votes[c.id] || 0;
    total += count;
    if (count > maxVotes && count > 0) {
      maxVotes = count;
      leaderName = `No. ${c.number} ${c.name}`;
    }
  });

  document.getElementById('statTotalVotes').innerText = total;
  document.getElementById('statLeadingCandidate').innerText = leaderName;
  document.getElementById('statSyncStatus').innerText = googleScriptUrl ? 'G-Sheets Connected' : 'Lokal (Tanpa Script)';

  // Render Table Rows
  const tableBody = document.getElementById('recapTableBody');
  tableBody.innerHTML = '';
  candidates.forEach(c => {
    const count = votes[c.id] || 0;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-800/50 transition";
    row.innerHTML = `
      <td class="py-2.5 px-3 font-bold text-brand-400">${c.number}</td>
      <td class="py-2.5 px-3 font-medium text-white">${c.name}</td>
      <td class="py-2.5 px-3 text-center font-bold">${count}</td>
      <td class="py-2.5 px-3 text-right font-mono text-slate-300">${percentage}%</td>
    `;
    tableBody.appendChild(row);
  });

  // Render or Refresh Chart.js
  renderRecapChart();
}

function renderRecapChart() {
  const ctx = document.getElementById('recapChart').getContext('2d');
  const labels = candidates.map(c => `No. ${c.number}`);
  const dataValues = candidates.map(c => votes[c.id] || 0);

  if (recapChartInstance) {
    recapChartInstance.destroy();
  }

  recapChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Perolehan Suara',
        data: dataValues,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: '#22c55e',
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(34, 197, 94, 0.9)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });
}

function resetAllVotes() {
  if (confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA REKAP SUARA LOKAL? Data yang dihapus tidak dapat dikembalikan.')) {
    votes = {};
    localStorage.removeItem('evoting_votes');
    updateRecapStats();
    showToast('Semua data suara berhasil di-reset!');
  }
}

// SETTINGS MODAL & TABS MANAGEMENT
function openSettingsModal() {
  renderCandidateEditForm();
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function switchSettingsTab(tab) {
  const scriptTab = document.getElementById('tabScriptContent');
  const candidatesTab = document.getElementById('tabCandidatesContent');
  const btnScript = document.getElementById('tabBtnAppsScript');
  const btnCandidates = document.getElementById('tabBtnCandidates');

  if (tab === 'script') {
    scriptTab.classList.remove('hidden');
    candidatesTab.classList.add('hidden');
    btnScript.className = "py-2.5 px-4 text-brand-400 border-b-2 border-brand-500 font-bold transition";
    btnCandidates.className = "py-2.5 px-4 text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition";
  } else {
    scriptTab.classList.add('hidden');
    candidatesTab.classList.remove('hidden');
    btnCandidates.className = "py-2.5 px-4 text-brand-400 border-b-2 border-brand-500 font-bold transition";
    btnScript.className = "py-2.5 px-4 text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition";
  }
}

function saveScriptUrl() {
  const url = document.getElementById('inputScriptUrl').value.trim();
  googleScriptUrl = url;
  localStorage.setItem('evoting_script_url', url);
  checkApiStatus();
  showToast('URL Google Apps Script berhasil disimpan!');
}

function checkApiStatus() {
  const badge = document.getElementById('apiStatusBadge');
  if (googleScriptUrl) {
    badge.className = "px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5";
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Google Sheets Terhubung`;
  } else {
    badge.className = "px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1.5";
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Mode Lokal`;
  }
}

function renderCandidateEditForm() {
  const container = document.getElementById('candidateEditList');
  if (!container) return;
  container.innerHTML = '';
  candidates.forEach((c) => {
    const box = document.createElement('div');
    box.className = "p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs";
    box.innerHTML = `
      <div class="sm:col-span-1 font-bold text-brand-400">#${c.number}</div>
      <div class="sm:col-span-5">
        <input type="text" id="editName_${c.id}" value="${c.name}" placeholder="Nama Kandidat" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white">
      </div>
      <div class="sm:col-span-6">
        <input type="text" id="editVision_${c.id}" value="${c.vision}" placeholder="Visi Misi Singkat" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300">
      </div>
    `;
    container.appendChild(box);
  });
}

function saveCandidateEdits() {
  candidates.forEach(c => {
    const nameInput = document.getElementById(`editName_${c.id}`);
    const visionInput = document.getElementById(`editVision_${c.id}`);
    if (nameInput) c.name = nameInput.value.trim();
    if (visionInput) c.vision = visionInput.value.trim();
  });
  localStorage.setItem('evoting_candidates', JSON.stringify(candidates));
  renderCandidates();
  showToast('Data kandidat berhasil diperbarui!');
}

function copyAppsScriptCode() {
  const code = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Waktu", "ID Calon", "Nomor Urut", "Nama Calon"]);
  }
  sheet.appendRow([
    new Date(),
    data.candidateId,
    data.candidateNumber,
    data.candidateName
  ]);
  return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('Kode Google Apps Script disalin ke clipboard!');
    }).catch(() => {
      showToast('Gagal menyalin kode secara otomatis.');
    });
  } else {
    showToast('Salin kode secara manual di modal pengaturan.');
  }
}

// UTILS: TOAST NOTIFICATION & CLOCK
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = "pointer-events-auto px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center space-x-2 animate-bounce-short";
  toast.innerHTML = `<i class="fa-solid fa-circle-info text-brand-400"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID') + ' WIB';
  const clockEl = document.getElementById('liveClock');
  if (clockEl) clockEl.innerText = timeStr;
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {
      showToast('Tidak dapat masuk mode fullscreen');
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
