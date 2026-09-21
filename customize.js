/**
 * =========================================================
 * 💖 LOVE STORY CUSTOMIZER STUDIO LOGIC (customize.js) 💖
 * =========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. TẢI DỮ LIỆU CẤU HÌNH HIỆN TẠI (Ưu tiên localStorage)
  let currentConfig = loadCurrentConfig();

  // Khởi tạo icons Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. XỬ LÝ CHUYỂN TAB
  initTabs();

  // 3. ĐIỀN DỮ LIỆU VÀO FORM
  populateForm(currentConfig);

  // 4. SỰ KIỆN NÚT LƯU, XUẤT FILE, RESET
  initActions(currentConfig);

  // 5. XỬ LÝ TẢI FILE NHẠC TỪ MÁY & NGHE THỬ
  initAudioUpload();

  // 6. TỰ ĐỘNG LƯU NHÁP LIÊN TỤC THEO THỜI GIAN THỰC (REALTIME AUTO-SAVE)
  initAutoSave();
});

/* =========================================================
   1. ĐỌC DỮ LIỆU HIỆN CÓ
   ========================================================= */
function loadCurrentConfig() {
  try {
    const draft = localStorage.getItem('STUDIO_DRAFT_CONFIG');
    if (draft) {
      return JSON.parse(draft);
    }
    const saved = localStorage.getItem('CUSTOM_LOVE_CONFIG');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Không thể đọc cấu hình từ localStorage:', e);
  }
  return window.LOVE_CONFIG || {};
}

/* =========================================================
   2. XỬ LÝ CHUYỂN TABS
   ========================================================= */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* =========================================================
   3. ĐIỀN DỮ LIỆU VÀO FORM
   ========================================================= */
function populateForm(cfg) {
  const couple = cfg.couple || {};
  const inv = cfg.invitation || {};
  const letter = cfg.letter || {};
  const promises = cfg.promises || [];
  const playlist = cfg.playlist || [];

  // Tab 1: Cặp đôi
  setVal('cfg_partnerName', couple.partnerName);
  setVal('cfg_senderName', couple.senderName);
  setVal('cfg_startDate', couple.startDate);
  setVal('cfg_dayMilestone', couple.dayMilestone || 300);
  setVal('cfg_quote', couple.quote);

  // Tab 2: Thiệp mời
  setVal('cfg_invTitle', inv.title);
  setVal('cfg_invSalutation', inv.salutation);
  setVal('cfg_invBody', inv.bodyText);
  setVal('cfg_invDateVal', inv.dateValue);
  setVal('cfg_invLocVal', inv.locationValue);
  setVal('cfg_invDressVal', inv.dressCodeValue);
  setVal('cfg_rsvpAccept', inv.rsvpAcceptText);
  setVal('cfg_rsvpReject', inv.rsvpRejectText);
  setVal('cfg_rsvpSuccessMsg', inv.rsvpSuccessMessage);

  // Tab 3: Timeline
  renderTimelineList(cfg.timeline || []);

  // Tab 4: Gallery Polaroid
  renderGalleryList(cfg.gallery || []);

  // Tab 5: Thư tình & Lời hứa
  if (letter.paragraphs) {
    setVal('cfg_letterParagraphs', letter.paragraphs.join('\n\n'));
  }
  setVal('cfg_letterSignName', letter.senderSign);
  setVal('cfg_letterSignDate', letter.dateSign);

  setVal('cfg_promise1', promises[0] || '');
  setVal('cfg_promise2', promises[1] || '');
  setVal('cfg_promise3', promises[2] || '');
  setVal('cfg_promise4', promises[3] || '');

  // Tab 6: Nhạc
  if (playlist.length > 0) {
    setVal('cfg_songTitle', playlist[0].title);
    setVal('cfg_songArtist', playlist[0].artist);
    setVal('cfg_songSrc', playlist[0].src);
    const audioPreview = document.getElementById('audioPreviewPlayer');
    if (audioPreview && playlist[0].src) {
      audioPreview.src = playlist[0].src;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* =========================================================
   RENDER & QUẢN LÝ TIMELINE
   ========================================================= */
function renderTimelineList(items) {
  const container = document.getElementById('timelineListContainer');
  if (!container) return;

  container.innerHTML = '';
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">Cột mốc #${index + 1} (${item.day || 'Ngày ...'})</span>
        <button type="button" class="btn-remove-item" onclick="removeTimelineItem(${index})">
          <i data-lucide="trash-2"></i> Xóa
        </button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Tên cột mốc / Badge:</label>
          <input type="text" class="form-input tl-day" value="${escapeHtml(item.day || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Tiêu đề kỷ niệm:</label>
          <input type="text" class="form-input tl-title" value="${escapeHtml(item.title || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Thời gian hiển thị:</label>
          <input type="text" class="form-input tl-date" value="${escapeHtml(item.date || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Huy hiệu tag:</label>
          <input type="text" class="form-input tl-badge" value="${escapeHtml(item.badge || '')}">
        </div>
        <div class="form-group full-width">
          <label class="form-label">Nội dung câu chuyện:</label>
          <textarea class="form-textarea tl-desc" rows="2">${escapeHtml(item.desc || '')}</textarea>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

window.removeTimelineItem = function(index) {
  const items = collectTimelineData();
  items.splice(index, 1);
  renderTimelineList(items);
};

document.getElementById('btnAddTimelineItem')?.addEventListener('click', () => {
  const items = collectTimelineData();
  items.push({
    day: `Ngày ${items.length * 50 + 1}`,
    title: 'Kỷ niệm mới ngọt ngào ✨',
    date: 'Khoảnh khắc đáng nhớ',
    badge: 'Kỷ niệm',
    desc: 'Cùng nhau tạo nên những ký ức tuyệt vời nhất.'
  });
  renderTimelineList(items);
});

function collectTimelineData() {
  const container = document.getElementById('timelineListContainer');
  if (!container) return [];

  const cards = container.querySelectorAll('.dynamic-item-card');
  const items = [];
  cards.forEach(c => {
    items.push({
      day: c.querySelector('.tl-day')?.value.trim() || '',
      title: c.querySelector('.tl-title')?.value.trim() || '',
      date: c.querySelector('.tl-date')?.value.trim() || '',
      badge: c.querySelector('.tl-badge')?.value.trim() || '',
      desc: c.querySelector('.tl-desc')?.value.trim() || ''
    });
  });
  return items;
}

/* =========================================================
   RENDER & QUẢN LÝ GALLERY POLAROID (Hỗ trợ upload ảnh từ máy)
   ========================================================= */
function renderGalleryList(items) {
  const container = document.getElementById('galleryListContainer');
  if (!container) return;

  container.innerHTML = '';
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">Ảnh Polaroid #${index + 1}</span>
        <button type="button" class="btn-remove-item" onclick="removeGalleryItem(${index})">
          <i data-lucide="trash-2"></i> Xóa ảnh
        </button>
      </div>
      <div class="img-upload-row">
        <img src="${item.url || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=150&q=80'}" class="img-preview-thumb" id="thumb_${index}" alt="Xem trước">
        <div style="flex: 1;">
          <div class="form-group" style="margin-bottom: 8px;">
            <label class="form-label">Chọn ảnh từ máy tính / điện thoại:</label>
            <input type="file" accept="image/*" class="form-input" onchange="handleFileUpload(event, ${index})">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Hoặc nhập link ảnh trực tuyến (URL):</label>
            <input type="text" class="form-input gal-url" id="url_${index}" value="${escapeHtml(item.url || '')}" oninput="updateThumb(${index})">
          </div>
        </div>
      </div>
      <div class="form-grid" style="margin-top: 14px;">
        <div class="form-group full-width">
          <label class="form-label">Lời chú thích viết tay (Caption):</label>
          <input type="text" class="form-input gal-caption" value="${escapeHtml(item.caption || '')}">
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

window.handleFileUpload = function(e, index) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      // Tự động nén ảnh bằng Canvas để siêu nhẹ (<150KB), không làm đầy bộ nhớ trình duyệt!
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);

      const urlInput = document.getElementById(`url_${index}`);
      const thumbImg = document.getElementById(`thumb_${index}`);
      if (urlInput) urlInput.value = compressedBase64;
      if (thumbImg) thumbImg.src = compressedBase64;
      showToast('Đã nạp và tối ưu dung lượng ảnh thành công!');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
};

window.updateThumb = function(index) {
  const urlInput = document.getElementById(`url_${index}`);
  const thumbImg = document.getElementById(`thumb_${index}`);
  if (urlInput && thumbImg) {
    thumbImg.src = urlInput.value || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=150&q=80';
  }
};

window.removeGalleryItem = function(index) {
  const items = collectGalleryData();
  items.splice(index, 1);
  renderGalleryList(items);
};

document.getElementById('btnAddGalleryItem')?.addEventListener('click', () => {
  const items = collectGalleryData();
  items.push({
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80',
    caption: 'Khoảnh khắc đáng yêu của chúng mình ❤️',
    rotation: Math.floor(Math.random() * 6) - 3
  });
  renderGalleryList(items);
});

function collectGalleryData() {
  const container = document.getElementById('galleryListContainer');
  if (!container) return [];

  const cards = container.querySelectorAll('.dynamic-item-card');
  const items = [];
  cards.forEach((c, idx) => {
    items.push({
      url: c.querySelector('.gal-url')?.value.trim() || '',
      caption: c.querySelector('.gal-caption')?.value.trim() || '',
      rotation: (idx % 2 === 0 ? -2 : 3)
    });
  });
  return items;
}

/* =========================================================
   THU THẬP TẤT CẢ DỮ LIỆU TỪ FORM
   ========================================================= */
function collectAllFormData() {
  const letterParagraphs = getVal('cfg_letterParagraphs')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const promises = [
    getVal('cfg_promise1'),
    getVal('cfg_promise2'),
    getVal('cfg_promise3'),
    getVal('cfg_promise4')
  ].filter(p => p.length > 0);

  const playlist = [
    {
      title: getVal('cfg_songTitle') || 'Until I Found You',
      artist: getVal('cfg_songArtist') || 'Romantic Piano Melody',
      src: getVal('cfg_songSrc') || '',
      cover: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&q=80'
    }
  ];

  return {
    couple: {
      partnerName: getVal('cfg_partnerName') || 'Em Yêu',
      senderName: getVal('cfg_senderName') || 'Anh Yêu',
      nicknameCouple: 'Chàng & Nàng',
      startDate: getVal('cfg_startDate') || '2025-11-26',
      dayMilestone: parseInt(getVal('cfg_dayMilestone')) || 300,
      celebrationDate: getVal('cfg_invDateVal') || 'Tối thứ Bảy, 20:00',
      quote: getVal('cfg_quote') || '300 ngày bên em, từng phút giây đều là món quà ngọt ngào nhất của cuộc đời anh.'
    },
    invitation: {
      title: getVal('cfg_invTitle') || 'Thư Mời Dạ Tiệc Kỷ Niệm 300 Ngày',
      subtitle: 'A Romantic 300-Day Milestone Invitation',
      salutation: getVal('cfg_invSalutation') || 'Gửi công chúa nhỏ của anh,',
      bodyText: getVal('cfg_invBody') || 'Thấm thoát chúng ta đã cùng nhau trải qua tròn 300 ngày...',
      dateLabel: 'Thời gian',
      dateValue: getVal('cfg_invDateVal') || '20:00 - Tối Thứ Bảy Đặc Biệt',
      locationLabel: 'Địa điểm',
      locationValue: getVal('cfg_invLocVal') || 'Bàn tiệc nến & hoa bí mật bên hồ',
      dressCodeLabel: 'Dress code',
      dressCodeValue: getVal('cfg_invDressVal') || 'Chiếc váy em thích nhất (Anh sẽ mặc sơ mi trắng)',
      rsvpAcceptText: getVal('cfg_rsvpAccept') || 'Em đồng ý hẹn hò! ❤️',
      rsvpRejectText: getVal('cfg_rsvpReject') || 'Để suy nghĩ đã 😜',
      rsvpSuccessMessage: getVal('cfg_rsvpSuccessMsg') || 'Yaaaay! Hẹn gặp em tối nay nhé! 🥰✨'
    },
    timeline: collectTimelineData(),
    gallery: collectGalleryData(),
    letter: {
      senderSign: getVal('cfg_letterSignName') || 'Người luôn thương em nhất đời ❤️',
      dateSign: getVal('cfg_letterSignDate') || 'Kỷ niệm ngày thứ 300',
      paragraphs: letterParagraphs.length > 0 ? letterParagraphs : ['Chúc mừng 300 ngày yêu thương của hai đứa mình!']
    },
    promises: promises.length > 0 ? promises : [
      'Luôn lắng nghe em kể mọi điều vụn vặt trong ngày mà không thấy chán.',
      'Bất kể bận rộn thế nào cũng sẽ dành thời gian ôm em mỗi ngày.',
      'Cùng em đi du lịch ít nhất 2 vùng đất mới mỗi năm.',
      'Luôn là chỗ dựa vững chắc và vòng tay bình yên nhất của em.'
    ],
    playlist: playlist
  };
}

/* =========================================================
   XỬ LÝ NÚT LƯU, XUẤT FILE, RESET
   ========================================================= */
function initActions(initialConfig) {
  const btnSave = document.getElementById('btnSaveConfig');
  const btnExport = document.getElementById('btnExportConfig');
  const btnReset = document.getElementById('btnResetDefault');

  // LƯU & XEM TRƯỚC
  btnSave?.addEventListener('click', async () => {
    const updated = collectAllFormData();

    // Kiểm tra nếu người dùng vô tình dán link website ZingMP3/YouTube thay vì file nhạc
    const trackSrc = updated.playlist?.[0]?.src || '';
    if (isWebpageUrl(trackSrc)) {
      const confirmUseLocal = confirm(
        '⚠️ CHÚ Ý: Đường dẫn bài hát bạn vừa nhập là link trang web (ZingMP3 / YouTube), trình duyệt không thể phát âm thanh trực tiếp từ link web này!\n\n' +
        'Bạn có muốn hệ thống tự động đổi sang bài "Ánh nắng của anh - Đức Phúc.mp3" đã có sẵn trong máy tính để nghe được nhạc không?'
      );
      if (confirmUseLocal) {
        selectLocalAudio('audio/Ánh nắng của anh - Đức Phúc.mp3', 'Ánh Nắng Của Anh', 'Đức Phúc');
        updated.playlist[0].src = 'audio/Ánh nắng của anh - Đức Phúc.mp3';
        updated.playlist[0].title = 'Ánh Nắng Của Anh';
        updated.playlist[0].artist = 'Đức Phúc';
      }
    }

    // 1. Ghi trực tiếp vĩnh viễn vào file config.js trên máy tính
    try {
      await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.warn('Không thể gửi save-config tới server:', e);
    }

    // 2. Lưu an toàn vào localStorage (chống tràn quota)
    safeSaveLocalStorage(updated);

    showToast('Đã lưu cấu hình thành công! Đang chuyển đến trang chính...');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  });

  // XUẤT FILE config.js
  btnExport?.addEventListener('click', () => {
    const updated = collectAllFormData();
    const jsContent = `/**
 * =========================================================
 * 💖 CẤU HÌNH THÔNG TIN KỶ NIỆM 300 NGÀY YÊU 💖
 * =========================================================
 * Xuất từ Love Story Customizer Studio vào lúc ${new Date().toLocaleString()}
 */

window.LOVE_CONFIG = ${JSON.stringify(updated, null, 2)};
`;

    const blob = new Blob([jsContent], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Đã tải xuống file config.js! Bạn có thể lưu đè vào thư mục web.');
  });

  // NHẬP FILE config.js HOẶC .json
  const importInput = document.getElementById('btnImportFileInput');
  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      try {
        let importedConfig = null;
        if (text.trim().startsWith('{')) {
          importedConfig = JSON.parse(text);
        } else {
          const match = text.match(/window\.LOVE_CONFIG\s*=\s*(\{[\s\S]*\});?/);
          if (match && match[1]) {
            importedConfig = new Function(`return ${match[1]}`)();
          } else {
            const fn = new Function('window', text + '; return window.LOVE_CONFIG;');
            const fakeWin = {};
            importedConfig = fn(fakeWin);
          }
        }

        if (importedConfig && typeof importedConfig === 'object') {
          populateForm(importedConfig);
          try {
            localStorage.setItem('CUSTOM_LOVE_CONFIG', JSON.stringify(importedConfig));
            localStorage.setItem('STUDIO_DRAFT_CONFIG', JSON.stringify(importedConfig));
          } catch (err) {}
          showToast('Đã nhập file config thành công! Toàn bộ nội dung đã được nạp lại.');
        } else {
          alert('Không tìm thấy dữ liệu hợp lệ trong file config.');
        }
      } catch (err) {
        console.error('Lỗi khi import:', err);
        alert('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  });

  // ĐẶT LẠI MẶC ĐỊNH (NẠP LẠI TỪ FILE config.js)
  btnReset?.addEventListener('click', () => {
    if (confirm('Bạn có muốn nạp lại dữ liệu gốc từ file config.js trên máy?')) {
      localStorage.removeItem('CUSTOM_LOVE_CONFIG');
      localStorage.removeItem('STUDIO_DRAFT_CONFIG');
      showToast('Đang nạp lại dữ liệu từ file config.js...');
      setTimeout(() => {
        location.reload();
      }, 500);
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById('toastNotify');
  const msgEl = document.getElementById('toastMsg');
  if (toast && msgEl) {
    msgEl.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* =========================================================
   XỬ LÝ TẢI FILE NHẠC TỪ MÁY & NGHE THỬ
   ========================================================= */
function isWebpageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('zingmp3.vn') || 
         lower.includes('youtube.com') || 
         lower.includes('youtu.be') || 
         lower.includes('nhaccuatui.com') || 
         lower.includes('spotify.com') || 
         lower.includes('tiktok.com') || 
         lower.endsWith('.html') || 
         lower.endsWith('.htm');
}

function checkAudioUrlWarning(val) {
  const warnEl = document.getElementById('audioUrlWarning');
  if (!warnEl) return;

  if (isWebpageUrl(val)) {
    const isZing = val.toLowerCase().includes('zingmp3.vn');
    warnEl.style.display = 'block';
    warnEl.innerHTML = `
      <strong>⚠️ CHÚ Ý: ĐÂY LÀ LINK TRANG WEB ${isZing ? 'ZINGMP3' : ''}, KHÔNG PHẢI FILE NHẠC (.mp3)</strong><br>
      Trình duyệt chỉ có thể phát file nhạc trực tiếp (.mp3, .m4a). Link trang web HTML sẽ không thể phát được âm thanh.<br>
      <div style="margin-top: 8px;">
        👉 <em>Gợi ý:</em> Bạn đã có sẵn file <strong>"Ánh nắng của anh - Đức Phúc.mp3"</strong> trong thư mục máy tính! 
        <button type="button" id="btnAutoPickLocal" style="margin-left: 6px; padding: 4px 10px; background: var(--accent-rose); border: none; border-radius: 6px; color: #fff; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
          Dùng bài này ngay 🎵
        </button>
      </div>
    `;
    document.getElementById('btnAutoPickLocal')?.addEventListener('click', () => {
      selectLocalAudio('audio/Ánh nắng của anh - Đức Phúc.mp3', 'Ánh Nắng Của Anh', 'Đức Phúc');
    });
  } else {
    warnEl.style.display = 'none';
  }
}

function selectLocalAudio(path, title, artist) {
  const songSrcInput = document.getElementById('cfg_songSrc');
  const songTitleInput = document.getElementById('cfg_songTitle');
  const songArtistInput = document.getElementById('cfg_songArtist');
  const audioPreview = document.getElementById('audioPreviewPlayer');

  if (songSrcInput) songSrcInput.value = path;
  if (songTitleInput && title) songTitleInput.value = title;
  if (songArtistInput && artist) songArtistInput.value = artist;
  checkAudioUrlWarning(path);

  if (audioPreview) {
    audioPreview.src = path;
    audioPreview.play().catch(() => {});
  }
  showToast(`Đã chọn bài: ${title || path}! Đang phát thử 🎵`);
}

async function loadLocalAudioFiles() {
  const container = document.getElementById('localAudioList');
  if (!container) return;

  try {
    const res = await fetch('/api/list-audio');
    if (res.ok) {
      const files = await res.json();
      if (files && files.length > 0) {
        container.innerHTML = '';
        files.forEach(f => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText = 'padding: 6px 12px; background: rgba(212, 175, 55, 0.2); border: 1px solid var(--accent-gold); color: #fff; border-radius: 20px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; transition: all 0.2s;';
          const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
          btn.innerHTML = `🎵 <strong>${escapeHtml(f.name)}</strong> <span style="opacity: 0.7; font-size: 0.75rem;">(${sizeMB} MB)</span>`;
          btn.onmouseover = () => { btn.style.background = 'var(--accent-rose)'; };
          btn.onmouseout = () => { btn.style.background = 'rgba(212, 175, 55, 0.2)'; };
          btn.onclick = () => {
            const cleanTitle = f.name.replace(/\.[^/.]+$/, '').split('-')[0].trim();
            const cleanArtist = f.name.includes('-') ? f.name.split('-')[1].replace(/\.[^/.]+$/, '').trim() : '';
            selectLocalAudio(f.path, cleanTitle, cleanArtist);
          };
          container.appendChild(btn);
        });
        return;
      }
    }
  } catch (err) {
    console.warn('Không tải được danh sách nhạc local:', err);
  }

  container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">Chưa phát hiện file nhạc trong thư mục audio/. Bạn hãy chọn file từ nút bên dưới!</span>';
}

function initAudioUpload() {
  const audioFileInput = document.getElementById('cfg_audioFile');
  const songSrcInput = document.getElementById('cfg_songSrc');
  const songTitleInput = document.getElementById('cfg_songTitle');
  const audioPreview = document.getElementById('audioPreviewPlayer');
  const btnRefresh = document.getElementById('btnRefreshAudioList');

  // Load danh sách nhạc có sẵn trong máy tính
  loadLocalAudioFiles();
  btnRefresh?.addEventListener('click', loadLocalAudioFiles);

  if (audioFileInput) {
    audioFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (songTitleInput && (!songTitleInput.value || songTitleInput.value === 'Until I Found You')) {
        songTitleInput.value = fileNameWithoutExt;
      }

      showToast('Đang tải và lưu file nhạc vào thư mục...');

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload-audio', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.path) {
            if (songSrcInput) {
              songSrcInput.value = data.path;
              checkAudioUrlWarning(data.path);
            }
            if (audioPreview) {
              audioPreview.src = data.path;
              audioPreview.play().catch(() => {});
            }
            showToast('Đã lưu bài hát vào thư mục audio/ thành công! Đang nghe thử...');
            loadLocalAudioFiles();
            return;
          }
        }
      } catch (err) {
        console.warn('Server upload error, fallback to FileReader:', err);
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Audio = evt.target.result;
        if (songSrcInput) songSrcInput.value = base64Audio;
        if (audioPreview) {
          audioPreview.src = base64Audio;
          audioPreview.play().catch(() => {});
        }
        showToast('Đã nạp file nhạc từ máy tính thành công! Đang nghe thử...');
      };
      reader.readAsDataURL(file);
    });
  }

  if (songSrcInput) {
    checkAudioUrlWarning(songSrcInput.value.trim());
    songSrcInput.addEventListener('input', () => {
      const val = songSrcInput.value.trim();
      checkAudioUrlWarning(val);
      if (audioPreview && !isWebpageUrl(val)) {
        audioPreview.src = val;
      }
    });
  }
}

/* =========================================================
   LƯU AN TOÀN VÀO LOCALSTORAGE (CHỐNG TRÀN QUOTA)
   ========================================================= */
function safeSaveLocalStorage(data) {
  try {
    localStorage.setItem('CUSTOM_LOVE_CONFIG', JSON.stringify(data));
    localStorage.setItem('STUDIO_DRAFT_CONFIG', JSON.stringify(data));
  } catch (err) {
    console.warn('Lỗi QuotaExceededError khi lưu localStorage, đang dọn dẹp cache phụ...', err);
    try {
      localStorage.removeItem('STUDIO_DRAFT_CONFIG');
      localStorage.setItem('CUSTOM_LOVE_CONFIG', JSON.stringify(data));
    } catch (e2) {
      console.warn('Không thể lưu localStorage do vượt hạn mức. Trang chính sẽ đọc trực tiếp từ file config.js');
      // Xóa để index.html ưu tiên đọc config.js mới nhất
      localStorage.removeItem('CUSTOM_LOVE_CONFIG');
    }
  }
}

/* =========================================================
   TỰ ĐỘNG LƯU NHÁP THEO THỜI GIAN THỰC (REALTIME AUTO-SAVE)
   ========================================================= */
function initAutoSave() {
  const form = document.getElementById('studioForm');
  if (!form) return;

  let timer = null;
  const saveDraft = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const data = collectAllFormData();
      safeSaveLocalStorage(data);
    }, 400);
  };

  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);
}


