/* ========================================
   RUANG HATI — DIARY WEBSITE v2
   PIN Lock • Music • Themes • Photos
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initParticles();
    initApp();
});

function initApp() {
    initNavbar();
    initDate();
    initMusic();
    initDiary();
    initGallery();
    initVideo();
    initLightbox();
    initScrollAnimations();
}

/* ========================================
   THEME (Light / Dark)
   ======================================== */
function initTheme() {
    const saved = localStorage.getItem('diary_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);

    const toggle = document.getElementById('themeToggle');
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('diary_theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ========================================
   PARTICLES
   ======================================== */
function initParticles() {
    const container = document.getElementById('particles');
    const count = 30;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 1;
        const colors = ['#a855f7', '#c084fc', '#ec4899', '#f472b6', '#818cf8'];
        p.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${size}px; height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 10}s;
        `;
        container.appendChild(p);
    }
}


/* ========================================
   MUSIC PLAYER (2 local songs)
   ======================================== */
function initMusic() {
    const audio = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    const switchBtn = document.getElementById('musicSwitch');
    const picker = document.getElementById('songPicker');
    const songOptions = document.querySelectorAll('.song-option');
    let isPlaying = false;

    const songs = {
        '1': 'music/sad song.mp3',
        '2': 'music/dj song.mp3'
    };

    // Load saved song preference
    let currentSong = localStorage.getItem('diary_song') || '1';
    audio.src = songs[currentSong];
    audio.volume = 0.3;
    updateSongUI(currentSong);

    // Play/Pause
    toggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            toggle.classList.remove('playing');
        } else {
            audio.play().catch(() => { });
            toggle.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });

    // Toggle song picker
    switchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        picker.classList.toggle('active');
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && e.target !== switchBtn) {
            picker.classList.remove('active');
        }
    });

    // Song selection
    songOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const songId = opt.dataset.song;
            if (songId === currentSong) return;

            currentSong = songId;
            localStorage.setItem('diary_song', currentSong);
            audio.src = songs[currentSong];
            updateSongUI(currentSong);

            if (isPlaying) {
                audio.play().catch(() => { });
            }

            picker.classList.remove('active');
            showToast(`Lagu ${currentSong} dipilih 🎵`);
        });
    });

    function updateSongUI(id) {
        songOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.song === id);
        });
    }

    // Expose music state for video integration
    window._musicState = {
        get isPlaying() { return isPlaying; },
        pause() {
            if (isPlaying) {
                audio.pause();
                toggle.classList.remove('playing');
            }
        },
        resume() {
            if (isPlaying) {
                audio.play().catch(() => { });
                toggle.classList.add('playing');
            }
        }
    };
}

/* ========================================
   NAVBAR
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const section = link.dataset.section;
            document.querySelectorAll('.nav-link, .mobile-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll(`[data-section="${section}"]`).forEach(l => l.classList.add('active'));
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // Scroll spy
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 150) current = s.id;
        });
        document.querySelectorAll('.nav-link, .mobile-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === current);
        });
    });
}

/* ========================================
   DATE
   ======================================== */
function initDate() {
    const el = document.getElementById('currentDate');
    el.textContent = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    loadDatePick();
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

/* ========================================
   STORAGE + TOAST
   ======================================== */
function getData(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Firestore sync keys (data that should sync across devices)
const SYNC_KEYS = ['diary_entries'];

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', info: '💜' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '💜'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.4s ease-out forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ========================================
   DIARY (Unified / Shared)
   ======================================== */
function initDiary() {
    const titleInput = document.getElementById('diaryTitle');
    const contentInput = document.getElementById('diaryContent');
    const charCount = document.getElementById('charCount');
    const saveBtn = document.getElementById('saveDiary');
    const moodBtns = document.querySelectorAll('.mood-btn');
    const photoInput = document.getElementById('diaryPhotoInput');
    const photoBtn = document.getElementById('diaryPhotoBtn');
    const photoPreview = document.getElementById('diaryPhotoPreview');
    const previewImg = document.getElementById('diaryPreviewImg');
    const removeBtn = document.getElementById('removeDiaryPhoto');
    let selectedMood = '';
    let attachedPhoto = null;

    // Mood
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.dataset.mood;
        });
    });

    // Char count
    contentInput.addEventListener('input', () => {
        const c = contentInput.value.length;
        charCount.textContent = c;
        charCount.style.color = c > 1800 ? '#ef4444' : '';
    });

    // Photo attachment
    photoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            attachedPhoto = ev.target.result;
            previewImg.src = attachedPhoto;
            photoPreview.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    });
    removeBtn.addEventListener('click', () => {
        attachedPhoto = null;
        photoPreview.style.display = 'none';
        photoInput.value = '';
    });

    // Save
    saveBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!content && !attachedPhoto) {
            showToast('Tulis dulu ceritamu, atau tambah foto ya... 💜', 'error');
            contentInput.focus();
            return;
        }

        const entry = {
            id: Date.now(),
            title: title || 'Tanpa Judul',
            content,
            mood: selectedMood || '💭',
            photo: attachedPhoto || null,
            date: new Date().toISOString()
        };

        // Save to localStorage
        const entries = getData('diary_entries');
        entries.unshift(entry);
        saveData('diary_entries', entries);

        // Save to Firestore (without photo — too large)
        const firestoreEntry = { ...entry, photo: null };
        dbSave('diary_entries', String(entry.id), firestoreEntry);

        // Reset
        titleInput.value = '';
        contentInput.value = '';
        charCount.textContent = '0';
        moodBtns.forEach(b => b.classList.remove('selected'));
        selectedMood = '';
        attachedPhoto = null;
        photoPreview.style.display = 'none';
        photoInput.value = '';

        showToast('Ceritamu tersimpan 📝');
        renderDiaryEntries();
        // Auto refresh
        setTimeout(() => window.location.reload(), 800);
    });

    // Load from Firestore on init (merge with local)
    loadDiaryFromCloud();
    renderDiaryEntries();

    // Real-time listener for cross-device sync
    if (typeof dbListen === 'function') {
        dbListen('diary_entries', (cloudEntries) => {
            if (!cloudEntries || !cloudEntries.length) return;
            const localEntries = getData('diary_entries');
            const localIds = new Set(localEntries.map(e => String(e.id)));
            let merged = [...localEntries];
            let changed = false;

            cloudEntries.forEach(ce => {
                if (!localIds.has(String(ce.id))) {
                    merged.push(ce);
                    changed = true;
                }
            });

            // Remove entries deleted from cloud
            const cloudIds = new Set(cloudEntries.map(e => String(e.id)));
            const beforeLen = merged.length;
            merged = merged.filter(e => cloudIds.has(String(e.id)) || !localIds.has(String(e.id)));
            if (merged.length !== beforeLen) changed = true;

            if (changed) {
                merged.sort((a, b) => new Date(b.date) - new Date(a.date));
                saveData('diary_entries', merged);
                renderDiaryEntries();
            }
        });
    }
}

async function loadDiaryFromCloud() {
    if (typeof dbLoadAll !== 'function') return;
    try {
        const cloudEntries = await dbLoadAll('diary_entries', 'date', 'desc');
        if (!cloudEntries || !cloudEntries.length) return;
        
        const localEntries = getData('diary_entries');
        const localIds = new Set(localEntries.map(e => String(e.id)));
        let merged = [...localEntries];
        let changed = false;

        cloudEntries.forEach(ce => {
            if (!localIds.has(String(ce.id))) {
                merged.push(ce);
                changed = true;
            }
        });

        if (changed) {
            merged.sort((a, b) => new Date(b.date) - new Date(a.date));
            saveData('diary_entries', merged);
            renderDiaryEntries();
        }
    } catch (err) {
        console.warn('Failed to load diary from cloud:', err);
    }
}

function renderDiaryEntries() {
    const container = document.getElementById('diaryEntries');
    const entries = getData('diary_entries');

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>Belum ada cerita</h3>
                <p>Mulai tulis curahan hati kita di atas. Semua perasaan valid. 💜</p>
            </div>`;
        return;
    }

    container.innerHTML = entries.map(e => `
        <div class="diary-entry" data-id="${e.id}">
            <div class="entry-card">
                <div class="entry-header">
                    <div class="entry-meta">
                        <span class="entry-mood">${e.mood}</span>
                        <span class="entry-date">${formatDate(e.date)}</span>
                    </div>
                    <button class="entry-delete" onclick="deleteDiaryEntry(${e.id})" title="Hapus">🗑️</button>
                </div>
                <h3 class="entry-title">${escapeHtml(e.title)}</h3>
                ${e.content ? `<p class="entry-content">${escapeHtml(e.content)}</p>` : ''}
                ${e.photo ? `<div class="entry-photo" onclick="openLightbox('${e.photo.replace(/'/g, "\\'")}', '${escapeHtml(e.title).replace(/'/g, "\\'")}')"><img src="${e.photo}" alt="${escapeHtml(e.title)}" loading="lazy"></div>` : ''}
            </div>
        </div>
    `).join('');
}

function deleteDiaryEntry(id) {
    if (!confirm('Yakin mau hapus cerita ini? 😢')) return;
    let entries = getData('diary_entries');
    entries = entries.filter(e => e.id !== id);
    saveData('diary_entries', entries);
    // Delete from Firestore too
    dbDelete('diary_entries', String(id));
    showToast('Cerita dihapus', 'info');
    renderDiaryEntries();
}

/* ========================================
   GALLERY
   ======================================== */
function initGallery() {
    const uploadArea = document.getElementById('uploadArea');
    const photoInput = document.getElementById('photoInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const captionForm = document.getElementById('captionForm');
    const previewImg = document.getElementById('previewImg');
    const photoCaption = document.getElementById('photoCaption');
    const savePhotoBtn = document.getElementById('savePhoto');
    const cancelBtn = document.getElementById('cancelUpload');
    let pendingPhoto = null;

    uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); photoInput.click(); });
    uploadArea.addEventListener('click', () => photoInput.click());

    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) processGalleryPhoto(file);
    });

    photoInput.addEventListener('change', (e) => {
        if (e.target.files[0]) processGalleryPhoto(e.target.files[0]);
    });

    function processGalleryPhoto(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            pendingPhoto = e.target.result;
            previewImg.src = pendingPhoto;
            captionForm.style.display = 'block';
            uploadArea.style.display = 'none';
            photoCaption.focus();
        };
        reader.readAsDataURL(file);
    }

    savePhotoBtn.addEventListener('click', () => {
        if (!pendingPhoto) return;
        const photos = getData('gallery_photos');
        photos.unshift({
            id: Date.now(),
            src: pendingPhoto,
            caption: photoCaption.value.trim() || '',
            date: new Date().toISOString()
        });
        saveData('gallery_photos', photos);
        resetGalleryForm();
        showToast('Foto tersimpan! 📸');
        renderGallery();
        // Auto refresh
        setTimeout(() => window.location.reload(), 800);
    });

    cancelBtn.addEventListener('click', resetGalleryForm);

    function resetGalleryForm() {
        pendingPhoto = null;
        photoCaption.value = '';
        captionForm.style.display = 'none';
        uploadArea.style.display = 'block';
        photoInput.value = '';
    }

    renderGallery();
}

function renderGallery() {
    const container = document.getElementById('galleryGrid');
    const photos = getData('gallery_photos');

    if (photos.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">📸</div>
                <h3>Belum ada foto</h3>
                <p>Upload foto-foto kenangan kita di sini.</p>
            </div>`;
        return;
    }

    container.innerHTML = photos.map(p => `
        <div class="gallery-item" data-id="${p.id}" onclick="openLightbox('${p.src.replace(/'/g, "\\'")}', '${escapeHtml(p.caption).replace(/'/g, "\\'")}')">
            <div class="photo-wrapper">
                <img src="${p.src}" alt="${escapeHtml(p.caption)}" loading="lazy">
            </div>
            <div class="photo-info">
                <span class="photo-caption">${escapeHtml(p.caption) || '✦'}</span>
                <div class="photo-date">${formatDate(p.date)}</div>
            </div>
            <button class="photo-delete-btn" onclick="event.stopPropagation(); deletePhoto(${p.id})" title="Hapus">✕</button>
        </div>
    `).join('');
}

function deletePhoto(id) {
    if (!confirm('Hapus foto ini?')) return;
    let photos = getData('gallery_photos');
    photos = photos.filter(p => p.id !== id);
    saveData('gallery_photos', photos);
    showToast('Foto dihapus', 'info');
    renderGallery();
}


/* ========================================
   VIDEO RECAP (with music auto-pause)
   ======================================== */
function initVideo() {
    const video = document.getElementById('recapVideo');
    const overlay = document.getElementById('videoPlayOverlay');
    if (!video || !overlay) return;

    let musicWasPlaying = false;

    // Click overlay to play
    overlay.addEventListener('click', () => {
        video.play().catch(() => { });
        overlay.classList.add('hidden');
    });

    // Click video to toggle pause/play
    video.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    // Video starts playing → pause music
    video.addEventListener('play', () => {
        if (window._musicState && window._musicState.isPlaying) {
            musicWasPlaying = true;
            window._musicState.pause();
        }
    });

    // Video paused → resume music if it was playing
    video.addEventListener('pause', () => {
        if (musicWasPlaying && window._musicState) {
            window._musicState.resume();
            musicWasPlaying = false;
        }
    });

    // Video ended → show overlay again, resume music
    video.addEventListener('ended', () => {
        overlay.classList.remove('hidden');
        if (musicWasPlaying && window._musicState) {
            window._musicState.resume();
            musicWasPlaying = false;
        }
    });
}


/* ========================================
   LIGHTBOX
   ======================================== */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxCaption').textContent = caption || '';
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.section-header, .glass-card, .diary-entry, .gallery-item').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);
}

/* ========================================
   PICK NUMBER (28 or 29)
   ======================================== */
function pickNumber(num) {
    const popup = document.getElementById('pickPopup');
    const msg = document.getElementById('pickMsg');

    // Save choice locally + Firestore
    localStorage.setItem('diary_date_pick', num);
    dbSave('settings', 'date_pick', { value: num });

    msg.textContent = `Kamu pilih tanggal ${num}! Siap-siap ya beb 💜`;
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Show banner on hero
    showDateBanner(num);
}

function closePickPopup() {
    document.getElementById('pickPopup').classList.remove('active');
    document.body.style.overflow = '';
}

function showDateBanner(num) {
    const banner = document.getElementById('dateBanner');
    const text = document.getElementById('dateBannerText');
    const clearBtn = document.getElementById('clearDateBtn');
    if (banner && text) {
        text.textContent = `Date kita tanggal ${num} ya beb! Lihat undangan →`;
        banner.style.display = 'inline-flex';
    }
    if (clearBtn) clearBtn.style.display = 'block';
}

// Load saved date pick on page load (called from initDate)
async function loadDatePick() {
    // Try Firestore first, fallback to localStorage
    let saved = localStorage.getItem('diary_date_pick');
    if (typeof dbLoad === 'function') {
        const cloud = await dbLoad('settings', 'date_pick');
        if (cloud && cloud.value) {
            saved = cloud.value;
            localStorage.setItem('diary_date_pick', saved);
        }
    }
    if (saved) showDateBanner(saved);
}

/* ========================================
   CLEAR DATE PICK
   ======================================== */
function clearDatePick() {
    localStorage.removeItem('diary_date_pick');
    localStorage.removeItem('diary_rsvp');
    // Clear from Firestore
    dbDelete('settings', 'date_pick');
    dbDelete('settings', 'rsvp');

    const banner = document.getElementById('dateBanner');
    const clearBtn = document.getElementById('clearDateBtn');
    if (banner) banner.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';

    showToast('Tanggal dihapus, pilih lagi di bawah ya!', 'info');
}
