// DATA KANDIDAT
const defaultCandidates = [
  { id: 1, number: '01', name: 'Ahmad Fauzi & Rina Melati', vision: 'Mewujudkan OSIS/DPK yang responsif, inovatif, dan berakhlak mulia.', photo: 'paslon01.jpg' },
  { id: 2, number: '02', name: 'Bagas Pratama & Siti Nurhaliza', vision: 'Meningkatkan prestasi akademik dan non-akademik siswa melalui ekstrakurikuler unggulan.', photo: 'paslon02.jpg' },
  { id: 3, number: '03', name: 'Citra Dewi & Kevin Sanjaya', vision: 'Menciptakan lingkungan sekolah hijau, ramah lingkungan, dan inklusif.', photo: 'paslon03.jpg' },
  { id: 4, number: '04', name: 'Dion Permana & Annisa Putri', vision: 'Optimalisasi fasilitas digital dan wadah aspirasi siswa yang terbuka.', photo: 'paslon04.jpg' },
  { id: 5, number: '05', name: 'Eka Wijaya & Nadia Rahma', vision: 'Mengembangkan jiwa kewirausahaan siswa melalui event bazar berkala.', photo: 'paslon05.jpg' },
  { id: 6, number: '06', name: 'Fajar Nugraha & Maya Lestari', vision: 'Mempererat persaudaraan antar kelas lewat kompetisi seni dan olahraga.', photo: 'paslon06.jpg' },
  { id: 7, number: '07', name: 'Gilang Ramadhan & Tari Sukma', vision: 'Menanamkan budaya disiplin, saling menghargai, dan bebas perundungan.', photo: 'paslon07.jpg' },
  { id: 8, number: '08', name: 'Hendra Setiawan & Bella Safira', vision: 'Penguatan kegiatan literasi digital dan ruang karya kreatif siswa.', photo: 'paslon08.jpg' },
  { id: 9, number: '09', name: 'Indra Lesmana & Amanda Manopo', vision: 'Meningkatkan peran DPK sebagai jembatan aspirasi siswa kepada pihak sekolah.', photo: 'paslon09.jpg' },
  { id: 10, number: '10', name: 'Joko Widodo & Megawati S.', vision: 'Pemberdayaan OSIS dan DPK yang transparan, profesional, dan menyenangkan.', photo: 'paslon10.jpg' },
];

// STATE APLIKASI
let candidates = JSON.parse(localStorage.getItem('evoting_candidates')) || defaultCandidates;
let votes = JSON.parse(localStorage.getItem('evoting_votes')) || {};
let googleScriptUrl = localStorage.getItem('evoting_script_url') || '';
let selectedCandidateId = null;
let currentTokenInput = "";
let activeVerifiedToken = "";
let countdownInterval = null;
let recapChartInstance = null;

// INISIALISASI SAAT HALAMAN DIBUKA
window.onload = function() {
  renderCandidates();
  updateClock();
  setInterval(updateClock, 1000);
  checkApiStatus();
  showTokenOverlay();
  if (googleScriptUrl) {
    const inputEl = document.getElementById('inputScriptUrl');
    if (inputEl) inputEl.value = googleScriptUrl;
  }
};

// --- LOGIKA KEYPAD & TOKEN 4-DIGIT ---
function showTokenOverlay() {
  currentTokenInput = "";
  activeVerifiedToken = "";
  updateTokenDisplay();
  const errorEl = document.getElementById('tokenErrorMessage');
  if (errorEl) errorEl.classList.add('hidden');
  document.getElementById('tokenOverlay').classList.remove('hidden');
}

function pressKey(num) {
  if (currentTokenInput.length < 4) {
    currentTokenInput += num;
    updateTokenDisplay();
  }
}

function deleteKey() {
  if (currentTokenInput.length > 0) {
    currentTokenInput = currentTokenInput.slice(0, -1);
    updateTokenDisplay();
  }
}

function clearKey() {
  currentTokenInput = "";
  updateTokenDisplay();
}

function updateTokenDisplay() {
  for (let i = 1; i <= 4; i++) {
    const digitEl = document.getElementById(`digit${i}`);
    if (digitEl) {
      digitEl.innerText = currentTokenInput[i - 1] || "-";
      if (currentTokenInput[i - 1]) {
        digitEl.classList.add('border-brand-500', 'bg-slate-800/90');
      } else {
        digitEl.classList.remove('border-brand-500', 'bg-slate-800/90');
      }
    }
  }
}

async function verifyTokenInput() {
  const errorEl = document.getElementById('tokenErrorMessage');
  const btn = document.getElementById('btnVerifyToken');
  
  if (currentTokenInput.length !== 4) {
    errorEl.innerText = "Masukkan 4-digit kode token dengan lengkap!";
    errorEl.classList.remove('hidden');
    return;
  }

  // Jika URL Apps Script belum diisi, izinkan token untuk pengetesan lokal
  if (!googleScriptUrl) {
    activeVerifiedToken = currentTokenInput;
    document.getElementById('tokenOverlay').classList.add('hidden');
    showToast('Mode Lokal: Token diterima!');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Memeriksa Token...`;
  errorEl.classList.add('hidden');

  try {
    let res = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: "verifyToken", token: currentTokenInput })
    });
    let result = await res.json();

    if (result.valid) {
      activeVerifiedToken = currentTokenInput;
      document.getElementById('tokenOverlay').classList.add('hidden');
      showToast('Token Valid! Silakan tentukan pilihan Anda.');
    } else {
      errorEl.innerText = result.message || "Token tidak valid!";
      errorEl.classList.remove('hidden');
    }
  } catch (err) {
    errorEl.innerText = "Gagal terhubung ke server. Periksa koneksi internet!";
    errorEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>BUKA SURAT SUARA</span> <i class="fa-solid fa-arrow-right"></i>`;
  }
}

// RENDER PASLON
function renderCandidates() {
  const grid = document.getElementById('candidatesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  candidates.forEach((c) => {
    const card = document.createElement('div');
    card.className = "glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer group relative overflow-hidden";
    card.onclick = () => selectCandidate(c.id);
    card.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="bg-gradient-to-r from-brand-600 to-emerald-500 text-white font-black text-sm px-3 py-1 rounded-xl shadow-md tracking-wider">
          NO. ${c.number}
        </span>
        <span class="text-[10px] font-bold text-slate-400 group-hover:text-brand-400 transition flex items-center gap-1">
          <i class="fa-solid fa-check-circle"></i> Pilih
        </span>
      </div>
      <div class="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-slate-800 border border-slate-700">
        <img src="${c.photo}" alt="${c.name}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/1e293b/22c55e?text=Paslon+${c.number}';" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition"></div>
      </div>
      <div class="flex-grow flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-sm sm:text-base text-white group-hover:text-brand-400 transition leading-snug line-clamp-2">
            ${c.name}
          </h3>
          <p class="text-[11px] text-slate-400 mt-1.5 line-clamp-2 italic leading-relaxed">
            "${c.vision}"
          </p>
        </div>
        <button class="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-800 group-hover:bg-brand-600 text-slate-200 group-hover:text-white font-black text-xs transition duration-300 flex items-center justify-center space-x-2 shadow-sm border border-slate-700 group-hover:border-brand-500">
          <i class="fa-solid fa-vote-yea"></i>
          <span>COBLOS PASLON</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function selectCandidate(id) {
  const candidate = candidates.find(c => c.id === id);
  if (!candidate) return;
  selectedCandidateId = id;

  document.getElementById('modalCandidateNumber').innerText = candidate.number;
  document.getElementById('modalCandidateName').innerText = candidate.name;
  document.getElementById('modalCandidateVision').innerText = `"${candidate.vision}"`;
  document.getElementById('modalCandidatePhoto').src = candidate.photo;

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

// KIRIM SUARA KE SPREADSHEET & UBAH STATUS TOKEN
async function executeVote() {
  if (!selectedCandidateId || !activeVerifiedToken) return;

  const candidate = candidates.find(c => c.id === selectedCandidateId);
  if (!candidate) return;

  const btn = document.getElementById('btnConfirmVote');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> Mengirim...`;

  votes[selectedCandidateId] = (votes[selectedCandidateId] || 0) + 1;
  localStorage.setItem('evoting_votes', JSON.stringify(votes));

  if (googleScriptUrl) {
    try {
      await fetch(googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: "submitVote",
          token: activeVerifiedToken,
          candidateId: candidate.id,
          candidateNumber: candidate.number,
          candidateName: candidate.name
        })
      });
    } catch (err) {
      console.log('Koneksi terputus, data tersimpan di lokal:', err);
    }
  }

  btn.disabled = false;
  btn.innerHTML = `<span>YAKIN & KIRIM</span> <i class="fa-solid fa-paper-plane ml-2"></i>`;

  closeConfirmModal();
  setTimeout(() => {
    triggerConfetti();
    showSuccessOverlay();
  }, 250);
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showTokenOverlay(); // Kunci kembali layar tablet untuk pemilih berikutnya
    }
  }, 1000);
}

// REKAP & PENGATURAN
function openRecapModal() { updateRecapStats(); document.getElementById('recapModal').classList.remove('hidden'); }
function closeRecapModal() { document.getElementById('recapModal').classList.add('hidden'); }

async function updateRecapStats() {
  if (googleScriptUrl) {
    try {
      let response = await fetch(googleScriptUrl);
      let resData = await response.json();
      if (resData.recap) votes = resData.recap;
    } catch (err) {}
  }
  let total = 0, maxVotes = -1, leaderName = '-';
  candidates.forEach(c => {
    const count = votes[c.id] || 0;
    total += count;
    if (count > maxVotes && count > 0) { maxVotes = count; leaderName = `No. ${c.number} ${c.name}`; }
  });

  document.getElementById('statTotalVotes').innerText = total;
  document.getElementById('statLeadingCandidate').innerText = leaderName;
  document.getElementById('statSyncStatus').innerText = googleScriptUrl ? 'G-Sheets Connected' : 'Lokal Mode';

  const tableBody = document.getElementById('recapTableBody');
  if (tableBody) {
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
  }
  renderRecapChart();
}

function renderRecapChart() {
  const ctxEl = document.getElementById('recapChart');
  if (!ctxEl) return;
  const ctx = ctxEl.getContext('2d');
  const labels = candidates.map(c => `No. ${c.number}`);
  const dataValues = candidates.map(c => votes[c.id] || 0);

  if (recapChartInstance) recapChartInstance.destroy();
  recapChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: 'Perolehan Suara', data: dataValues, backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: '#22c55e', borderWidth: 1.5, borderRadius: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}

function resetAllVotes() {
  if (confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA REKAP SUARA LOKAL?')) {
    votes = {}; localStorage.removeItem('evoting_votes'); updateRecapStats(); showToast('Data suara di-reset!');
  }
}

function openSettingsModal() { renderCandidateEditForm(); document.getElementById('settingsModal').classList.remove('hidden'); }
function closeSettingsModal() { document.getElementById('settingsModal').classList.add('hidden'); }
function switchSettingsTab(tab) {
  const scriptTab = document.getElementById('tabScriptContent'), candidatesTab = document.getElementById('tabCandidatesContent');
  const btnScript = document.getElementById('tabBtnAppsScript'), btnCandidates = document.getElementById('tabBtnCandidates');
  if (tab === 'script') {
    scriptTab.classList.remove('hidden'); candidatesTab.classList.add('hidden');
    btnScript.className = "py-2.5 px-4 text-brand-400 border-b-2 border-brand-500 font-bold transition";
    btnCandidates.className = "py-2.5 px-4 text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition";
  } else {
    scriptTab.classList.add('hidden'); candidatesTab.classList.remove('hidden');
    btnCandidates.className = "py-2.5 px-4 text-brand-400 border-b-2 border-brand-500 font-bold transition";
    btnScript.className = "py-2.5 px-4 text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition";
  }
}

function saveScriptUrl() {
  const url = document.getElementById('inputScriptUrl').value.trim();
  googleScriptUrl = url; localStorage.setItem('evoting_script_url', url); checkApiStatus(); showToast('URL Google Apps Script disimpan!');
}

function checkApiStatus() {
  const badge = document.getElementById('apiStatusBadge');
  if (!badge) return;
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
  if (!container) return; container.innerHTML = '';
  candidates.forEach((c) => {
    const box = document.createElement('div');
    box.className = "p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs";
    box.innerHTML = `
      <div class="sm:col-span-1 font-bold text-brand-400">#${c.number}</div>
      <div class="sm:col-span-5"><input type="text" id="editName_${c.id}" value="${c.name}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"></div>
      <div class="sm:col-span-6"><input type="text" id="editVision_${c.id}" value="${c.vision}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300"></div>
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
  showToast('Data kandidat diperbarui!');
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = "pointer-events-auto px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center space-x-2 animate-bounce-short";
  toast.innerHTML = `<i class="fa-solid fa-circle-info text-brand-400"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateClock() {
  const now = new Date();
  const clockEl = document.getElementById('liveClock');
  if (clockEl) clockEl.innerText = now.toLocaleTimeString('id-ID') + ' WIB';
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => showToast('Gagal fullscreen'));
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}
