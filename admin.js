'use strict';
/* DEFAULT_COLORS, CORD_TYPES, SPECS → data.js 에서 로드됨 */

const LS_COLORS      = 'namdo_colors';
const LS_PHOTOS      = 'namdo_photos';
const LS_CORD_COLORS = 'namdo_cord_colors';
const LS_PW          = 'namdo_pw';
const DEFAULT_PW     = 'namdo2024';

/* ═══════════════════════════════════════════
   유틸
   ═══════════════════════════════════════════ */
async function hashPw(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toast(msg, duration = 2400) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* ── 색상 ── */
function getColors() {
  try {
    const s = localStorage.getItem(LS_COLORS);
    if (s) { const a = JSON.parse(s); if (Array.isArray(a) && a.length) return a; }
  } catch (e) {}
  return [...DEFAULT_COLORS];
}
function saveColors(arr) { localStorage.setItem(LS_COLORS, JSON.stringify(arr)); }

/* ── 끈별 색상 지정 ── */
function getCordColorsMap() {
  try { return JSON.parse(localStorage.getItem(LS_CORD_COLORS) || '{}'); }
  catch (e) { return {}; }
}
function saveCordColorsMap(obj) { localStorage.setItem(LS_CORD_COLORS, JSON.stringify(obj)); }

/* ── 사진 ── */
function getPhotos() {
  try { return JSON.parse(localStorage.getItem(LS_PHOTOS) || '{}'); } catch (e) { return {}; }
}
function savePhotos(obj) { localStorage.setItem(LS_PHOTOS, JSON.stringify(obj)); }

/* ── 이미지 압축 (최대 600px, JPEG 82%) ── */
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          const r = Math.min(MAX / w, MAX / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ═══════════════════════════════════════════
   로그인
   ═══════════════════════════════════════════ */
async function verifyLogin(pw) {
  const stored    = localStorage.getItem(LS_PW);
  const inputHash = await hashPw(pw);
  if (stored) return inputHash === stored;
  if (pw === DEFAULT_PW) { localStorage.setItem(LS_PW, await hashPw(DEFAULT_PW)); return true; }
  return false;
}

document.getElementById('pw-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

document.getElementById('login-btn').addEventListener('click', async () => {
  const pw  = document.getElementById('pw-input').value;
  const err = document.getElementById('login-error');
  if (!pw) { err.textContent = '비밀번호를 입력해주세요.'; return; }
  const ok = await verifyLogin(pw);
  if (ok) {
    sessionStorage.setItem('namdo_admin', '1');
    document.getElementById('login-wrap').style.display = 'none';
    document.getElementById('dashboard').style.display  = 'block';
    initDashboard();
  } else {
    err.textContent = '비밀번호가 올바르지 않습니다.';
    document.getElementById('pw-input').value = '';
    document.getElementById('pw-input').focus();
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('namdo_admin');
  location.reload();
});

if (sessionStorage.getItem('namdo_admin') === '1') {
  document.getElementById('login-wrap').style.display = 'none';
  document.getElementById('dashboard').style.display  = 'block';
  window.addEventListener('DOMContentLoaded', initDashboard);
}

/* ═══════════════════════════════════════════
   대시보드 초기화
   ═══════════════════════════════════════════ */
function initDashboard() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  renderColorTab();
  initCordColorSection();
  renderPhotoTab();
  initSettingsTab();
}

/* ═══════════════════════════════════════════
   색상 관리 탭
   ═══════════════════════════════════════════ */
function renderColorTab() {
  const colors = getColors();
  const tbody  = document.getElementById('color-tbody');
  tbody.innerHTML = '';

  colors.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--gray);font-size:12px;">${idx + 1}</td>
      <td>
        <div class="color-row-swatch">
          <span class="color-dot" style="background:${c.hex};"></span>
          <input type="color" class="color-picker-inline" value="${c.hex}" title="색상 선택" />
        </div>
      </td>
      <td><input class="tbl-input" value="${c.name}" data-field="name" /></td>
      <td><input class="tbl-input tbl-input-hex" value="${c.hex}" data-field="hex" /></td>
      <td style="text-align:center;"><input type="checkbox" ${c.light ? 'checked' : ''} data-field="light" /></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-success btn-sm save-row-btn">저장</button>
          <button class="btn btn-outline btn-sm delete-row-btn" style="color:var(--red);border-color:#fca5a5;">삭제</button>
        </div>
      </td>
    `;

    const picker = tr.querySelector('.color-picker-inline');
    const hexIn  = tr.querySelector('[data-field="hex"]');
    const dot    = tr.querySelector('.color-dot');

    picker.addEventListener('input', () => { hexIn.value = picker.value; dot.style.background = picker.value; });
    hexIn.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hexIn.value.trim())) {
        picker.value = hexIn.value.trim(); dot.style.background = hexIn.value.trim();
      }
    });

    tr.querySelector('.save-row-btn').addEventListener('click', () => {
      const name  = tr.querySelector('[data-field="name"]').value.trim();
      const hex   = tr.querySelector('[data-field="hex"]').value.trim();
      const light = tr.querySelector('[data-field="light"]').checked;
      if (!name || !/^#[0-9a-fA-F]{6}$/.test(hex)) { toast('⚠️ 색상명과 올바른 헥스 코드를 입력하세요.'); return; }
      const arr = getColors(); arr[idx] = { ...arr[idx], name, hex, light };
      saveColors(arr); renderColorTab(); initCordColorSection(); toast('✅ 저장되었습니다.');
    });

    tr.querySelector('.delete-row-btn').addEventListener('click', () => {
      if (!confirm(`"${c.name}" 색상을 삭제하시겠습니까?`)) return;
      const arr = getColors(); arr.splice(idx, 1);
      saveColors(arr); renderColorTab(); initCordColorSection(); toast('🗑️ 삭제되었습니다.');
    });

    tbody.appendChild(tr);
  });

  /* 기본값 초기화 */
  document.getElementById('reset-colors-btn').onclick = () => {
    if (!confirm('색상을 기본값으로 초기화하시겠습니까?')) return;
    localStorage.removeItem(LS_COLORS);
    renderColorTab(); initCordColorSection(); toast('✅ 기본값으로 초기화되었습니다.');
  };

  /* 색상 추가 */
  const picker2 = document.getElementById('new-picker');
  const hexIn2  = document.getElementById('new-hex');
  picker2.addEventListener('input', () => { hexIn2.value = picker2.value; });
  hexIn2.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(hexIn2.value)) picker2.value = hexIn2.value; });

  document.getElementById('add-color-btn').onclick = () => {
    const name  = document.getElementById('new-name').value.trim();
    const hex   = document.getElementById('new-hex').value.trim();
    const light = document.getElementById('new-light').checked;
    if (!name)                              { toast('⚠️ 색상명을 입력하세요.'); return; }
    if (!/^#[0-9a-fA-F]{6}$/.test(hex))    { toast('⚠️ 올바른 헥스 코드를 입력하세요. (예: #FF0000)'); return; }
    const arr = getColors();
    arr.push({ id: 'c_' + Date.now(), name, hex, light });
    saveColors(arr);
    renderColorTab(); initCordColorSection();
    document.getElementById('new-name').value    = '';
    document.getElementById('new-hex').value     = '#00C896';
    document.getElementById('new-picker').value  = '#00C896';
    document.getElementById('new-light').checked = false;
    toast(`✅ "${name}" 색상이 추가되었습니다.`);
  };
}

/* ═══════════════════════════════════════════
   끈별 색상 지정 섹션
   ═══════════════════════════════════════════ */
let activeCordColorTab = CORD_TYPES[0].id;

function initCordColorSection() {
  const tabsEl = document.getElementById('cord-color-tabs');
  tabsEl.innerHTML = CORD_TYPES.map(c => `
    <button class="cord-color-tab-btn ${c.id === activeCordColorTab ? 'active' : ''}" data-cord="${c.id}">${c.name}</button>
  `).join('');

  tabsEl.querySelectorAll('.cord-color-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCordColorTab = btn.dataset.cord;
      initCordColorSection();
    });
  });

  renderCordColorGrid(activeCordColorTab);

  document.getElementById('select-all-btn').onclick = () => {
    document.querySelectorAll('.color-checkbox-item').forEach(el => {
      el.classList.add('checked');
      el.querySelector('input[type=checkbox]').checked = true;
    });
  };
  document.getElementById('deselect-all-btn').onclick = () => {
    document.querySelectorAll('.color-checkbox-item').forEach(el => {
      el.classList.remove('checked');
      el.querySelector('input[type=checkbox]').checked = false;
    });
  };

  document.getElementById('save-cord-colors-btn').onclick = () => {
    const checked = [...document.querySelectorAll('.color-checkbox-item input:checked')]
      .map(el => el.value);
    const map = getCordColorsMap();
    map[activeCordColorTab] = checked.length ? checked : null;
    saveCordColorsMap(map);
    toast(`✅ ${CORD_TYPES.find(c=>c.id===activeCordColorTab)?.name} 색상이 저장되었습니다.`);
  };
}

function renderCordColorGrid(cordId) {
  const colors    = getColors();
  const map       = getCordColorsMap();
  const selected  = map[cordId] || colors.map(c => c.id); // null → all selected
  const grid      = document.getElementById('cord-color-grid');

  grid.innerHTML = colors.map(c => {
    const isChecked = selected.includes(c.id);
    return `
      <label class="color-checkbox-item ${isChecked ? 'checked' : ''}">
        <input type="checkbox" value="${c.id}" ${isChecked ? 'checked' : ''} />
        <span class="color-checkbox-dot" style="background:${c.hex};"></span>
        <span class="color-checkbox-name">${c.name}</span>
      </label>
    `;
  }).join('');

  grid.querySelectorAll('.color-checkbox-item').forEach(item => {
    item.addEventListener('click', () => {
      const cb = item.querySelector('input');
      // toggle is handled by label, just update class
      setTimeout(() => item.classList.toggle('checked', cb.checked), 0);
    });
  });
}

/* ═══════════════════════════════════════════
   사진 관리 탭
   ═══════════════════════════════════════════ */
let currentPhotoCord = CORD_TYPES[0].id;
let currentPhotoType = 'color'; // 'color' | 'size' | 'tip'

function renderPhotoTab() {
  /* 끈 종류 탭 */
  const bar = document.getElementById('cord-tab-bar');
  bar.innerHTML = CORD_TYPES.map(c => `
    <button class="cord-tab-btn ${c.id === currentPhotoCord ? 'active' : ''}" data-cord="${c.id}">${c.name}</button>
  `).join('');
  bar.querySelectorAll('.cord-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => { currentPhotoCord = btn.dataset.cord; renderPhotoTab(); });
  });

  /* 사진 유형 탭 */
  document.querySelectorAll('.photo-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ptype === currentPhotoType);
    btn.onclick = () => { currentPhotoType = btn.dataset.ptype; renderPhotoTab(); };
  });

  renderPhotoGrid();
}

function renderPhotoGrid() {
  const photos = getPhotos();
  const grid   = document.getElementById('photo-grid');
  const spec   = SPECS[currentPhotoCord];
  let items    = [];

  if (currentPhotoType === 'color') {
    items = getColors().map(c => ({
      key:      `${currentPhotoCord}_${c.id}`,
      label:    c.name,
      bgColor:  c.hex,
      photo:    photos[`${currentPhotoCord}_${c.id}`] || null,
    }));
  } else if (currentPhotoType === 'size') {
    items = spec.sizes.map(s => ({
      key:      `${currentPhotoCord}_size_${s.id}`,
      label:    s.label + ' · ' + s.sub,
      bgColor:  '#e8f3fb',
      photo:    photos[`${currentPhotoCord}_size_${s.id}`] || null,
    }));
  } else if (currentPhotoType === 'tip') {
    items = spec.tips.map(t => ({
      key:      `${currentPhotoCord}_tip_${t.id}`,
      label:    t.label,
      bgColor:  '#e8f3fb',
      photo:    photos[`${currentPhotoCord}_tip_${t.id}`] || null,
    }));
  }

  grid.innerHTML = items.map(item => `
    <div class="photo-card" data-key="${item.key}">
      <div class="photo-card-img">
        ${item.photo
          ? `<img src="${item.photo}" alt="${item.label}" /><span class="photo-badge">사진</span>`
          : `<div class="photo-card-color-bg" style="background:${item.bgColor};"></div>`
        }
      </div>
      <div class="photo-card-name">${item.label}</div>
      <div class="photo-card-actions">
        <label class="photo-upload-label" style="display:block;width:100%;padding:6px 0;font-size:11.5px;text-align:center;cursor:pointer;background:var(--light);color:var(--blue);font-weight:500;border-radius:0 0 6px 6px;">
          ${item.photo ? '사진 교체' : '+ 사진 업로드'}
          <input type="file" class="file-input-hidden photo-upload-input" accept="image/*" />
        </label>
        ${item.photo ? `<button class="photo-delete-btn">삭제</button>` : ''}
      </div>
    </div>
  `).join('');

  /* 업로드 */
  grid.querySelectorAll('.photo-upload-input').forEach(input => {
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      const key = input.closest('.photo-card').dataset.key;
      try {
        const dataUrl = await compressImage(file);
        const p = getPhotos(); p[key] = dataUrl; savePhotos(p);
        renderPhotoGrid(); toast('✅ 사진이 업로드되었습니다.');
      } catch (e) { toast('⚠️ 사진 업로드 중 오류가 발생했습니다.'); }
    });
  });

  /* 삭제 */
  grid.querySelectorAll('.photo-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.closest('.photo-card').dataset.key;
      if (!confirm('이 사진을 삭제하시겠습니까?')) return;
      const p = getPhotos(); delete p[key]; savePhotos(p);
      renderPhotoGrid(); toast('🗑️ 사진이 삭제되었습니다.');
    });
  });
}

/* ═══════════════════════════════════════════
   설정 탭
   ═══════════════════════════════════════════ */
function initSettingsTab() {
  document.getElementById('change-pw-btn').addEventListener('click', async () => {
    const oldPw  = document.getElementById('old-pw').value;
    const newPw  = document.getElementById('new-pw').value;
    const newPw2 = document.getElementById('new-pw2').value;
    const msg    = document.getElementById('pw-msg');
    if (!oldPw || !newPw || !newPw2) { showMsg(msg, '모든 항목을 입력해주세요.', 'err'); return; }
    if (newPw.length < 4)            { showMsg(msg, '새 비밀번호는 4자 이상이어야 합니다.', 'err'); return; }
    if (newPw !== newPw2)            { showMsg(msg, '새 비밀번호가 일치하지 않습니다.', 'err'); return; }
    if (!await verifyLogin(oldPw))   { showMsg(msg, '현재 비밀번호가 올바르지 않습니다.', 'err'); return; }
    localStorage.setItem(LS_PW, await hashPw(newPw));
    showMsg(msg, '✅ 비밀번호가 변경되었습니다.', 'ok');
    ['old-pw','new-pw','new-pw2'].forEach(id => { document.getElementById(id).value = ''; });
  });

  document.getElementById('reset-all-btn').addEventListener('click', () => {
    if (!confirm('⚠️ 모든 관리자 데이터(색상·사진·설정·비밀번호)가 삭제됩니다.\n계속하시겠습니까?')) return;
    [LS_COLORS, LS_PHOTOS, LS_CORD_COLORS, LS_PW].forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem('namdo_admin');
    toast('초기화 완료. 페이지를 새로고침합니다.');
    setTimeout(() => location.reload(), 1500);
  });
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className   = `settings-msg ${type}`;
}
