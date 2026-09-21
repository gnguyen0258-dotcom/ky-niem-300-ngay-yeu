/**
 * =========================================================
 * 💖 APPLICATION LOGIC - 300 DAYS LOVE ANNIVERSARY 💖
 * =========================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  // Ưu tiên đọc cấu hình tùy biến từ localStorage (từ trang customize.html)
  let config = window.LOVE_CONFIG || {};
  try {
    const saved = localStorage.getItem('CUSTOM_LOVE_CONFIG');
    if (saved) {
      config = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Lỗi khi đọc cấu hình tùy biến:', e);
  }

  // Khởi tạo icons Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. ÁNH XẠ DỮ LIỆU TỪ CONFIG VÀO DOM
  populateConfigData(config);

  // 2. KHỞI TẠO HIỆU ỨNG CÁNH HOA HỒNG & ĐOM ĐÓM CANVAS
  initAtmosphereCanvas();

  // 3. XỬ LÝ PHONG BÌ VÀ CON DẤU SÁP 3D
  initEnvelopeInteraction();

  // 4. LOGIC RSVP HẸN HÒ (NÚT ĐỒNG Ý & NÚT NÉ CHUỘT)
  initRsvpInteractions(config);

  // 5. BỘ ĐẾM THỜI GIAN 300 NGÀY REALTIME
  initLiveLoveClock(config.couple?.startDate);

  // 6. BỘ PHÁT NHẠC ĐĨA THAN CỔ ĐIỂN (VINYL MUSIC PLAYER)
  initVinylPlayer(config.playlist || []);

  // 7. LIGHTBOX XEM ẢNH POLAROID
  initLightboxModal();

  // 8. TƯƠNG TÁC CHẠM GỬI TIM
  initHeartBurst();
});

/* =========================================================
   1. ĐIỀN DỮ LIỆU TỪ CONFIG VÀO GIAO DIỆN
   ========================================================= */
function populateConfigData(config) {
  const { couple = {}, invitation = {}, timeline = [], gallery = [], letter = {}, promises = [] } = config;

  // Lời tựa & tiêu đề
  setText('invitationTitle', invitation.title);
  setText('invitationSubtitle', invitation.subtitle);
  setText('invitationSalutation', invitation.salutation);
  setText('invitationBody', invitation.bodyText);
  setText('invitationDateVal', invitation.dateValue);
  setText('invitationLocVal', invitation.locationValue);
  setText('invitationDressVal', invitation.dressCodeValue);
  setText('invitationSignature', `Forever with you, ${couple.senderName || 'Anh Yêu'} ❤️`);
  setText('rsvpAcceptLabel', invitation.rsvpAcceptText || 'Em đồng ý hẹn hò! ❤️');
  setText('rsvpRejectLabel', invitation.rsvpRejectText || 'Để suy nghĩ đã 😜');
  setText('rsvpSuccessMsg', invitation.rsvpSuccessMessage);

  // Quote & Footer
  setText('coupleQuote', `"${couple.quote || '300 ngày bên em là món quà ngọt ngào nhất.'}"`);
  setText('footerPartnerName', couple.partnerName || 'Em Yêu');

  // Render Timeline
  const timelineContainer = document.getElementById('timelineContainer');
  if (timelineContainer && timeline.length) {
    timelineContainer.innerHTML = timeline.map((item, idx) => `
      <div class="timeline-item">
        <div class="timeline-node">
          <i data-lucide="heart"></i>
        </div>
        <div class="timeline-card">
          <span class="timeline-badge">${item.badge || item.day}</span>
          <h4 class="timeline-title">${item.title}</h4>
          <div class="timeline-date">${item.date}</div>
          <p class="timeline-desc">${item.desc}</p>
        </div>
      </div>
    `).join('');
  }

  // Render Polaroid Wall
  const polaroidWall = document.getElementById('polaroidWall');
  if (polaroidWall && gallery.length) {
    polaroidWall.innerHTML = gallery.map((pic, idx) => `
      <div class="polaroid-item" style="transform: rotate(${pic.rotation || (idx % 2 === 0 ? -2 : 3)}deg);" data-img="${pic.url}" data-caption="${pic.caption}">
        <div class="wood-pin" aria-hidden="true"></div>
        <div class="polaroid-img-wrap">
          <img src="${pic.url}" alt="${pic.caption}" loading="lazy">
        </div>
        <div class="polaroid-caption">${pic.caption}</div>
      </div>
    `).join('');
  }

  // Render Secret Letter
  const secretLetterContent = document.getElementById('secretLetterContent');
  if (secretLetterContent && letter.paragraphs) {
    secretLetterContent.innerHTML = letter.paragraphs.map(p => `<p>${p}</p>`).join('');
    setText('letterSignDate', letter.dateSign || 'Kỷ niệm ngày thứ 300');
    setText('letterSignName', letter.senderSign || 'Người luôn thương em nhất đời ❤️');
  }

  // Render Promises
  const promisesGrid = document.getElementById('promisesGrid');
  if (promisesGrid && promises.length) {
    promisesGrid.innerHTML = promises.map((text, idx) => `
      <div class="promise-card">
        <span class="promise-number">Lời Hứa #${idx + 1}</span>
        <p class="promise-text">${text}</p>
      </div>
    `).join('');
  }

  // Refresh icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

/* =========================================================
   2. CANVAS CÁNH HOA HỒNG & ĐOM ĐÓM LÃNG MẠN
   ========================================================= */
function initAtmosphereCanvas() {
  const canvas = document.getElementById('atmosphereCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const fireflies = [];
  const TOTAL_PETALS = 28;
  const TOTAL_FIREFLIES = 35;

  class Petal {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 8;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.random() * 1 - 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.color = Math.random() > 0.4 ? '#f4728b' : '#c73859';
    }
    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.01) * 0.8 + this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y > height + 20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
      ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  class Firefly {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.alpha = Math.random();
      this.alphaSpeed = Math.random() * 0.02 + 0.01;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha += this.alphaSpeed;
      if (this.alpha >= 1 || this.alpha <= 0.1) {
        this.alphaSpeed = -this.alphaSpeed;
      }
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${Math.max(0, this.alpha)})`;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < TOTAL_PETALS; i++) petals.push(new Petal());
  for (let i = 0; i < TOTAL_FIREFLIES; i++) fireflies.push(new Firefly());

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let f of fireflies) {
      f.update();
      f.draw();
    }
    for (let p of petals) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* =========================================================
   3. PHONG BÌ & CON DẤU SÁP 3D
   ========================================================= */
function initEnvelopeInteraction() {
  const waxSealBtn = document.getElementById('waxSealBtn');
  const envelope = document.getElementById('envelope');

  if (!waxSealBtn || !envelope) return;

  waxSealBtn.addEventListener('click', () => {
    if (envelope.classList.contains('opened')) return;

    envelope.classList.add('opened');

    // Nổ confetti trái tim nhẹ nhàng khi bóc sáp
    fireHeartConfetti();

    // Tự động phát nhạc đĩa than khi có tương tác đầu tiên của người dùng
    if (window.vinylPlayer) {
      window.vinylPlayer.play();
    }
  });
}

/* =========================================================
   4. LOGIC RSVP HẸN HÒ (ĐỒNG Ý HOẶC NÉ CHUỘT)
   ========================================================= */
function initRsvpInteractions(config) {
  const btnAccept = document.getElementById('btnRsvpAccept');
  const btnReject = document.getElementById('btnRsvpReject');
  const rsvpBtnGroup = document.getElementById('rsvpBtnGroup');
  const rsvpSuccessBanner = document.getElementById('rsvpSuccessBanner');
  const btnScrollDecor = document.getElementById('btnScrollDecor');

  if (!btnAccept || !btnReject) return;

  // Khi bấm "Đồng ý hẹn hò"
  btnAccept.addEventListener('click', () => {
    // 1. Nổ pháo hoa lớn ăn mừng
    fireGrandCelebration();

    // 2. Ẩn nút chọn, hiển thị thiệp xác nhận hẹn hò
    rsvpBtnGroup.style.display = 'none';
    rsvpSuccessBanner.style.display = 'block';

    // 3. Đảm bảo nhạc lãng mạn đang phát
    if (window.vinylPlayer) {
      window.vinylPlayer.play();
    }
  });

  // Nút cuộn xuống xem không gian decor
  if (btnScrollDecor) {
    btnScrollDecor.addEventListener('click', () => {
      const decorSection = document.getElementById('sectionDecor');
      if (decorSection) {
        decorSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Khi di chuột hoặc chạm vào nút "Để suy nghĩ đã 😜" (Evasive Button)
  const funnyTexts = [
    'Không cho từ chối đâu nha! 😜',
    'Bấm nút bên kia kìa em ❤️',
    'Suy nghĩ gì nữa nè! 🥰',
    'Chắc chắn phải đi rồi! 💖',
    'Nút này hỏng rồi bạn ơi! 😆',
    'Yêu anh thì bấm đồng ý đi! ✨'
  ];
  let rejectClickCount = 0;

  function evadeButton(e) {
    e.preventDefault();
    rejectClickCount++;

    // Thay đổi chữ ngộ nghĩnh
    const rejectLabel = document.getElementById('rsvpRejectLabel');
    if (rejectLabel) {
      rejectLabel.textContent = funnyTexts[rejectClickCount % funnyTexts.length];
    }

    // Di chuyển ngẫu nhiên nhẹ nhàng
    const maxOffset = 90;
    const randX = (Math.random() - 0.5) * maxOffset * 2;
    const randY = (Math.random() - 0.5) * maxOffset;
    btnReject.style.transform = `translate(${randX}px, ${randY}px)`;

    // Nút Đồng ý tự phóng to nhẹ để mời gọi
    const currentScale = 1 + Math.min(rejectClickCount * 0.05, 0.3);
    btnAccept.style.transform = `scale(${currentScale})`;
  }

  btnReject.addEventListener('mouseenter', evadeButton);
  btnReject.addEventListener('touchstart', evadeButton);
}

/* =========================================================
   5. BỘ ĐẾM THỜI GIAN 300 NGÀY REALTIME
   ========================================================= */
function initLiveLoveClock(startDateStr) {
  const daysEl = document.getElementById('counterDays');
  const hoursEl = document.getElementById('counterHours');
  const minutesEl = document.getElementById('counterMinutes');
  const secondsEl = document.getElementById('counterSeconds');
  const totalHoursEl = document.getElementById('totalHoursText');

  // Mặc định ngày bắt đầu nếu không có
  const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 300 * 24 * 60 * 60 * 1000);

  function updateClock() {
    const now = new Date();
    const diffMs = now - startDate;

    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    if (daysEl) daysEl.textContent = days.toLocaleString();
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    if (totalHoursEl) totalHoursEl.textContent = totalHours.toLocaleString();
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* =========================================================
   6. BỘ PHÁT NHẠC ĐĨA THAN CỔ ĐIỂN (VINYL MUSIC PLAYER)
   ========================================================= */
function initVinylPlayer(playlist) {
  let currentTrackIdx = 0;
  let isPlaying = false;
  let isMuted = false;

  const vinylDisk = document.getElementById('vinylDisk');
  const vinylDiskBtn = document.getElementById('vinylDiskBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const prevTrackBtn = document.getElementById('prevTrackBtn');
  const nextTrackBtn = document.getElementById('nextTrackBtn');
  const muteBtn = document.getElementById('muteBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const songTitle = document.getElementById('songTitle');
  const songArtist = document.getElementById('songArtist');

  // Audio element
  const audio = new Audio();
  audio.loop = true;

  // Web Audio Synthesizer Fallback (Giai điệu piano lãng mạn du dương khi không có nhạc online)
  let synthInterval = null;
  let audioCtx = null;

  function playSynthMelody() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [220.00, 261.63, 329.63, 440.00], // A Minor
      [174.61, 220.00, 261.63, 349.23], // F Major
      [196.00, 246.94, 293.66, 392.00]  // G Major
    ];
    let step = 0;

    synthInterval = setInterval(() => {
      if (!isPlaying || isMuted) return;
      const currentChord = chords[Math.floor(step / 4) % chords.length];
      const noteFreq = currentChord[step % currentChord.length];
      step++;

      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {}
    }, 450);
  }

  function stopSynthMelody() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function loadTrack(idx) {
    if (!playlist || playlist.length === 0) return;
    currentTrackIdx = (idx + playlist.length) % playlist.length;
    const track = playlist[currentTrackIdx];

    if (songTitle) songTitle.textContent = track.title;
    if (songArtist) songArtist.textContent = track.artist;

    if (track && track.src && track.src.trim() !== '') {
      try {
        audio.src = encodeURI(track.src);
      } catch (e) {
        audio.src = track.src;
      }
      if (isPlaying) {
        audio.play().catch(() => {
          playSynthMelody();
        });
      }
    } else {
      // Nếu không có src, chạy piano synth du dương
      if (isPlaying) {
        playSynthMelody();
      }
    }
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      vinylDisk.classList.add('playing');
      if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
      const track = playlist[currentTrackIdx];
      if (track && track.src && track.src.trim() !== '') {
        try {
          audio.src = encodeURI(track.src);
        } catch (e) {
          audio.src = track.src;
        }
        audio.play().catch(() => playSynthMelody());
      } else {
        playSynthMelody();
      }
    } else {
      vinylDisk.classList.remove('playing');
      if (playIcon) playIcon.setAttribute('data-lucide', 'play');
      audio.pause();
      stopSynthMelody();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
  if (vinylDiskBtn) vinylDiskBtn.addEventListener('click', togglePlay);

  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      loadTrack(currentTrackIdx + 1);
    });
  }

  if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', () => {
      loadTrack(currentTrackIdx - 1);
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      audio.muted = isMuted;
      if (volumeIcon) {
        volumeIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  loadTrack(0);

  // Expose ra window để có thể gọi từ nút mở sáp
  window.vinylPlayer = {
    play: () => {
      if (!isPlaying) togglePlay();
    },
    pause: () => {
      if (isPlaying) togglePlay();
    }
  };
}

/* =========================================================
   7. LIGHTBOX XEM ẢNH POLAROID
   ========================================================= */
function initLightboxModal() {
  const modal = document.getElementById('lightboxModal');
  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');

  if (!modal) return;

  // Lắng nghe sự kiện click trên các ảnh polaroid
  document.addEventListener('click', (e) => {
    const polaroid = e.target.closest('.polaroid-item');
    if (!polaroid) return;

    const imgUrl = polaroid.getAttribute('data-img');
    const caption = polaroid.getAttribute('data-caption');

    if (modalImg) modalImg.src = imgUrl;
    if (modalCaption) modalCaption.textContent = caption;
    modal.classList.add('active');
  });

  function closeModal() {
    modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* =========================================================
   8. TƯƠNG TÁC CHẠM GỬI TIM
   ========================================================= */
function initHeartBurst() {
  const heartBtn = document.getElementById('interactiveHeartBtn');
  const countEl = document.getElementById('heartCount');
  let heartCount = 300;

  if (!heartBtn) return;

  heartBtn.addEventListener('click', (e) => {
    heartCount++;
    if (countEl) countEl.textContent = heartCount.toLocaleString();

    // Hiệu ứng scale nút
    heartBtn.style.transform = 'scale(1.25)';
    setTimeout(() => {
      heartBtn.style.transform = '';
    }, 150);

    // Bắn tim bay từ vị trí bấm
    const rect = heartBtn.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    if (window.confetti) {
      window.confetti({
        particleCount: 15,
        spread: 60,
        origin: { x, y },
        shapes: ['heart'],
        colors: ['#f4728b', '#c73859', '#ffd700', '#ff69b4']
      });
    }
  });
}

/* =========================================================
   HIỆU ỨNG PHÁO HOA CONFETTI
   ========================================================= */
function fireHeartConfetti() {
  if (!window.confetti) return;
  window.confetti({
    particleCount: 40,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#b82346', '#ffd700', '#f4728b', '#ffccd5']
  });
}

function fireGrandCelebration() {
  if (!window.confetti) return;
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    window.confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ffd700', '#ff69b4', '#f4728b']
    });
    window.confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ffd700', '#ff69b4', '#f4728b']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
