/* BPS Games Shared Utilities (Audio & Google Sheets Integrations) */

// Initialize Audio Context lazily
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Synthesize custom sound effects using Web Audio API (extremely robust!)
const BPSAudio = {
    playTick() {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) { console.warn("Audio play blocked/unsupported", e); }
    },
    
    playDing() {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
            
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) { console.warn("Audio play blocked/unsupported", e); }
    },
    
    playBuzzer() {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(123, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            
            osc.start();
            osc2.start();
            osc.stop(ctx.currentTime + 0.4);
            osc2.stop(ctx.currentTime + 0.4);
        } catch (e) { console.warn("Audio play blocked/unsupported", e); }
    },

    playSuccess() {
        try {
            const ctx = getAudioContext();
            const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
                gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + index * 0.1 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.25);
                
                osc.start(ctx.currentTime + index * 0.1);
                osc.stop(ctx.currentTime + index * 0.1 + 0.25);
            });
        } catch (e) { console.warn("Audio play blocked/unsupported", e); }
    }
};

// Google Sheet integrations
const BPSScores = {
    // Get stored sheets url
    getSheetsUrl() {
        return localStorage.getItem('bps_sheets_url') || '';
    },
    
    // Save sheets url
    setSheetsUrl(url) {
        localStorage.setItem('bps_sheets_url', url);
    },
    
    // Send score to Google Sheets via POST
    async submitScore(gameName, playerName, score, detail = '') {
        const url = this.getSheetsUrl();
        if (!url) {
            console.warn("Google Sheets URL not configured.");
            return { success: false, message: "URL Google Sheets belum dikonfigurasi. Skor hanya disimpan lokal." };
        }
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors', // standard way for Google Apps Script Web Apps when not sending CORS headers
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game: gameName,
                    name: playerName,
                    score: score,
                    detail: detail,
                    timestamp: new Date().toISOString()
                })
            });
            
            // Note: with 'no-cors' response type is 'opaque' and status is 0.
            // We assume success if fetch finishes without throwing.
            return { success: true, message: "Skor berhasil dikirim ke Google Sheets!" };
        } catch (error) {
            console.error("Error submitting score:", error);
            return { success: false, message: "Gagal mengirim skor: " + error.message };
        }
    },
    
    // Setup and render Settings panel
    renderSettingsPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const currentUrl = this.getSheetsUrl();
        
        container.innerHTML = `
            <div class="config-panel mt-4">
                <div class="config-title">
                    <i class="fas fa-cog text-primary"></i> ⚙️ Integrasi Google Sheets (Skor)
                </div>
                <p class="small text-muted mb-2">
                    Skor game Anda dapat dikirim langsung ke Google Spreadsheet. Masukkan URL Web App Google Apps Script Anda di bawah ini:
                </p>
                <div class="config-input-group">
                    <input type="text" id="sheets-url-input" class="config-input" placeholder="https://script.google.com/macros/s/.../exec" value="${currentUrl}">
                    <button id="sheets-url-save-btn" class="btn btn-sm btn-game btn-game-primary px-3 py-2" style="font-size: 0.85rem;">Simpan</button>
                </div>
                <div id="sheets-url-status" class="small mt-2" style="display:none;"></div>
                <div class="mt-2 small text-muted">
                    <a href="#" id="view-setup-instructions" class="text-danger text-decoration-none">💡 Cara Setup Google Sheets (Klik di sini)</a>
                </div>
            </div>
        `;
        
        // Setup listener for save button
        document.getElementById('sheets-url-save-btn').addEventListener('click', () => {
            const input = document.getElementById('sheets-url-input');
            const status = document.getElementById('sheets-url-status');
            const url = input.value.trim();
            
            if (url && !url.startsWith('https://script.google.com/')) {
                status.style.display = 'block';
                status.style.color = '#f87171';
                status.textContent = '❌ URL tidak valid. Harus dimulai dengan script.google.com';
                return;
            }
            
            this.setSheetsUrl(url);
            status.style.display = 'block';
            status.style.color = '#10b981';
            status.textContent = url ? '✅ URL Google Sheets disimpan!' : '🗑️ URL Google Sheets dihapus!';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        });

        // Setup listener for instructions link
        document.getElementById('view-setup-instructions').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSetupModal();
        });
    },
    
    // Show instruction popup modal
    showSetupModal() {
        // Create modal div if not exists
        let modalEl = document.getElementById('sheets-instruction-modal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'sheets-instruction-modal';
            modalEl.className = 'modal fade';
            modalEl.setAttribute('tabindex', '-1');
            document.body.appendChild(modalEl);
        }
        
        modalEl.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content game-modal">
                    <div class="modal-header game-modal-header">
                        <h5 class="modal-title text-white"><i class="fas fa-info-circle text-danger"></i> Panduan Setup Google Sheets</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-white-50" style="font-size: 0.95rem; line-height: 1.6;">
                        <p class="text-white fw-bold mb-2">Ikuti langkah mudah ini untuk membuat Google Spreadsheet Anda sendiri:</p>
                        <ol class="ps-3 mb-4">
                            <li class="mb-2">Buat <strong>Google Spreadsheet</strong> baru.</li>
                            <li class="mb-2">Tulis nama kolom pada baris pertama (Row 1): <strong>Timestamp</strong>, <strong>Game</strong>, <strong>Name</strong>, <strong>Score</strong>, dan <strong>Detail</strong>.</li>
                            <li class="mb-2">Pilih menu <strong>Extensions (Ekstensi)</strong> &gt; <strong>Apps Script</strong>.</li>
                            <li class="mb-2">Hapus kode bawaan dan tempelkan (Paste) kode Apps Script berikut:</li>
                        </ol>
                        
                        <pre class="bg-dark text-success p-3 rounded mb-3 border border-secondary" style="font-size: 0.8rem; overflow-x: auto; max-height: 250px;"><code>function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  try {
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(), 
      data.game, 
      data.name, 
      data.score, 
      data.detail
    ]);
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch(error) {
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}</code></pre>

                        <ol class="ps-3" start="5">
                            <li class="mb-2">Klik tombol <strong>Save Project (Ikon Disket)</strong>.</li>
                            <li class="mb-2">Klik tombol <strong>Deploy (Terapkan)</strong> di kanan atas &gt; pilih <strong>New Deployment (Penerapan Baru)</strong>.</li>
                            <li class="mb-2">Pilih jenis penerapan: <strong>Web App (Aplikasi Web)</strong>.</li>
                            <li class="mb-2">Ubah <strong>Execute as:</strong> menjadi <strong>Me (Saya)</strong>, dan <strong>Who has access:</strong> menjadi <strong>Anyone (Siapa saja)</strong>. <span class="text-danger">*Penting agar web bisa mengirim data!</span></li>
                            <li class="mb-2">Klik <strong>Deploy</strong>, lalu salin (Copy) <strong>Web App URL</strong> yang dihasilkan.</li>
                            <li class="mb-2">Tempelkan URL tersebut ke kolom integrasi Google Sheets di bawah game dan klik Simpan!</li>
                        </ol>
                    </div>
                    <div class="modal-footer game-modal-footer">
                        <button type="button" class="btn btn-game btn-game-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal using bootstrap
        if (typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
};

// Auto render footer settings panel on load if container exists
document.addEventListener('DOMContentLoaded', () => {
    BPSScores.renderSettingsPanel('sheets-config-container');
});
