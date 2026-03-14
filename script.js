'use strict';
/* CORD_TYPES, DEFAULT_COLORS, SPECS → data.js 에서 로드됨 */

/* ── 색상 배열 (관리자 수정분 우선) ── */
const COLORS = [...DEFAULT_COLORS];
(function loadAdminColors() {
  try {
    const saved = localStorage.getItem('namdo_colors');
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr) && arr.length > 0) { COLORS.length = 0; COLORS.push(...arr); }
    }
  } catch (e) {}
})();

/* ── 끈별 사용 색상 (관리자 지정) ── */
function getCordColors(cordId) {
  try {
    const cc = JSON.parse(localStorage.getItem('namdo_cord_colors') || '{}');
    if (cc[cordId] && Array.isArray(cc[cordId]) && cc[cordId].length > 0) {
      return COLORS.filter(c => cc[cordId].includes(c.id));
    }
  } catch (e) {}
  return COLORS;
}

/* ── 사진 조회 헬퍼 ── */
function getPhoto(cordId, colorId) {
  try {
    return (JSON.parse(localStorage.getItem('namdo_photos') || '{}'))[`${cordId}_${colorId}`] || null;
  } catch (e) { return null; }
}
function getSpecPhoto(cordId, type, id) {
  try {
    return (JSON.parse(localStorage.getItem('namdo_photos') || '{}'))[`${cordId}_${type}_${id}`] || null;
  } catch (e) { return null; }
}

/* ═══════════════════════════════════════════
   앱 상태
   ═══════════════════════════════════════════ */
const state = { cord: null, color: null, size: null, length: null, tip: null };

const $app        = document.getElementById('app');
const $breadcrumb = document.getElementById('breadcrumb');

/* ═══════════════════════════════════════════
   네비게이션
   ═══════════════════════════════════════════ */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cord = btn.dataset.cord;
    setNavActive(cord);
    if (cord === 'about') { showAbout(); return; }
    showColors(cord);
  });
});
document.getElementById('logo-btn').addEventListener('click', showLanding);

function setNavActive(cordId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.nav-btn[data-cord="${cordId}"]`);
  if (btn) btn.classList.add('active');
}

/* ═══════════════════════════════════════════
   브레드크럼
   ═══════════════════════════════════════════ */
function setBreadcrumb(items) {
  $breadcrumb.innerHTML = '';
  if (!items.length) { $breadcrumb.className = 'breadcrumb breadcrumb-hidden'; return; }
  $breadcrumb.className = 'breadcrumb';

  const homeBtn = document.createElement('button');
  homeBtn.className = 'bc-link';
  homeBtn.textContent = '홈';
  homeBtn.addEventListener('click', showLanding);
  $breadcrumb.appendChild(homeBtn);

  items.forEach((item, i) => {
    const sep = document.createElement('span');
    sep.className = 'bc-sep'; sep.textContent = '›';
    $breadcrumb.appendChild(sep);

    if (item.action && i < items.length - 1) {
      const btn = document.createElement('button');
      btn.className = 'bc-link'; btn.textContent = item.label;
      btn.addEventListener('click', item.action);
      $breadcrumb.appendChild(btn);
    } else {
      const span = document.createElement('span');
      span.textContent = item.label;
      $breadcrumb.appendChild(span);
    }
  });
}

function patClass(cordId) { return `cord-pat cord-pat-${cordId}`; }

/* ═══════════════════════════════════════════
   뷰: 랜딩
   ═══════════════════════════════════════════ */
function showLanding() {
  state.cord = state.color = state.size = state.length = state.tip = null;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  setBreadcrumb([]);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  $app.innerHTML = `
    <div class="landing-intro">
      <h2>원하는 끈 종류를 선택하세요</h2>
      <p>다양한 색상 &middot; 직경·길이 규격 &middot; 철팁 / 플라스틱팁 선택 가능</p>
    </div>
    <div class="cord-type-grid">
      ${CORD_TYPES.map(c => {
        const cnt = getCordColors(c.id).length;
        return `
          <div class="cord-type-card" data-cord="${c.id}">
            <div class="cord-type-img" style="background-color:${c.bg};">
              <div class="${patClass(c.pat)}"></div>
              <div class="cord-type-shade"></div>
              <span class="cord-type-name">${c.name}</span>
            </div>
            <div class="cord-type-body">
              <p>${c.desc}</p>
              <span class="cord-type-link">색상 ${cnt}가지 보기</span>
            </div>
          </div>`;
      }).join('')}
    </div>
  `;

  $app.querySelectorAll('.cord-type-card').forEach(card => {
    card.addEventListener('click', () => showColors(card.dataset.cord));
  });
}

/* ═══════════════════════════════════════════
   뷰: 색상 선택
   ═══════════════════════════════════════════ */
function showColors(cordId) {
  state.cord = cordId; state.color = state.size = state.length = state.tip = null;
  setNavActive(cordId);
  setBreadcrumb([{ label: SPECS[cordId].label, action: () => showColors(cordId) }]);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const cord   = CORD_TYPES.find(c => c.id === cordId);
  const colors = getCordColors(cordId);

  $app.innerHTML = `
    <div class="color-view">
      <div class="color-preview-panel">
        <div class="preview-cord-wrap">
          <div class="preview-cord-bg" id="preview-bg" style="background-color:#e8f3fb;"></div>
          <div class="${patClass(cord.pat)} preview-cord-pat" id="preview-pat"></div>
          <div class="preview-cord-shine"></div>
          <div class="preview-cord-placeholder" id="preview-placeholder">
            <span style="font-size:36px;opacity:.4;">${cord.pat==='braid'?'🪢':cord.pat==='cotton'?'🧵':cord.pat==='twist'?'〰️':'🎀'}</span>
            <p>색상을 선택하세요</p>
          </div>
        </div>
        <div class="preview-color-name" id="preview-name">&nbsp;</div>
        <div class="preview-color-hex"  id="preview-hex">&nbsp;</div>
        <div class="preview-cord-type">${cord.name}</div>
        <div class="preview-select-hint" id="preview-select-hint">색상을 클릭하면 상세 옵션을 선택할 수 있습니다. \ (직경, 길이, 팁 종류) </div>
      </div>

      <div class="color-grid-panel">
        <div class="color-grid-header">
          <h3>색상 선택</h3>
          <small>${colors.length}가지</small>
        </div>
        <div class="color-grid">
          ${colors.map(c => {
            const photo = getPhoto(cordId, c.id);
            return `
              <div class="color-swatch-card" data-color="${c.id}" title="${c.name}">
                <div class="swatch-color-wrap">
                  ${photo
                    ? `<img class="swatch-img" src="${photo}" alt="${c.name}">`
                    : `<div class="swatch-color-bg" style="background-color:${c.hex};"></div>
                       <div class="swatch-cord-pat ${patClass(cord.pat)}"></div>`
                  }
                  <div class="swatch-shine"></div>
                </div>
                <div class="swatch-name-bar">${c.name}</div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  setupColorViewEvents();
}

function setupColorViewEvents() {
  const $previewBg   = document.getElementById('preview-bg');
  const $previewName = document.getElementById('preview-name');
  const $previewHex  = document.getElementById('preview-hex');
  const $placeholder = document.getElementById('preview-placeholder');
  const cards        = document.querySelectorAll('.color-swatch-card');

  function applyPreview(colorId) {
    const c     = COLORS.find(x => x.id === colorId);
    const photo = getPhoto(state.cord, colorId);
    const $pat  = document.getElementById('preview-pat');
    if (photo) {
      $previewBg.style.backgroundImage = `url('${photo}')`;
      $previewBg.style.backgroundSize  = 'cover';
      $previewBg.style.backgroundPosition = 'center';
      $previewBg.style.backgroundColor = '';
      if ($pat) $pat.style.display = 'none';
    } else {
      $previewBg.style.backgroundImage = '';
      $previewBg.style.backgroundSize  = '';
      $previewBg.style.backgroundPosition = '';
      $previewBg.style.backgroundColor = c.hex;
      if ($pat) $pat.style.display = '';
    }
    $previewName.textContent = c.name;
    $previewHex.textContent  = c.hex;
    $placeholder.style.display = 'none';
  }

  function restoreSelected() {
    if (state.color) {
      applyPreview(state.color);
    } else {
      const $pat = document.getElementById('preview-pat');
      $previewBg.style.backgroundImage = '';
      $previewBg.style.backgroundSize  = '';
      $previewBg.style.backgroundPosition = '';
      $previewBg.style.backgroundColor = '#e8f3fb';
      $previewName.innerHTML = '&nbsp;';
      $previewHex.innerHTML  = '&nbsp;';
      if ($pat) $pat.style.display = '';
      $placeholder.style.display = '';
    }
  }

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => applyPreview(card.dataset.color));
    card.addEventListener('mouseleave', restoreSelected);
    card.addEventListener('click', () => {
      state.color = card.dataset.color;
      showSpecs();
    });
  });
}

/* ═══════════════════════════════════════════
   뷰: 규격 / 팁 선택 (사진 미리보기 포함)
   ═══════════════════════════════════════════ */
function showSpecs() {
  if (!state.cord || !state.color) return;
  state.size = state.length = state.tip = null;

  const colorData  = COLORS.find(c => c.id === state.color);
  const spec       = SPECS[state.cord];
  const cord       = CORD_TYPES.find(c => c.id === state.cord);
  const colorPhoto = getPhoto(state.cord, state.color);

  setBreadcrumb([
    { label: spec.label,     action: () => showColors(state.cord) },
    { label: colorData.name, action: showSpecs },
  ]);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  $app.innerHTML = `
    <div class="spec-view">

      <!-- 헤더 -->
      <div class="spec-header">
        <div class="spec-color-dot" style="background-color:${colorData.hex};">
          <div class="spec-color-dot-pat ${patClass(cord.pat)}"></div>
          <div class="spec-color-dot-shine"></div>
        </div>
        <div class="spec-header-info">
          <h2>${spec.label} &middot; ${colorData.name}</h2>
          <p>직경과 길이, 팁 종류를 선택하세요. 선택 항목에 사진이 있으면 미리볼 수 있습니다.</p>
        </div>
      </div>

      <!-- 2열: 미리보기 + 선택 -->
      <div class="spec-view-layout">

        <!-- 왼쪽: 미리보기 패널 -->
        <div class="spec-preview-panel">
          <div class="spec-preview-wrap">
            <div class="spec-preview-bg" id="spec-preview-bg"
              style="${colorPhoto
                ? `background-image:url('${colorPhoto}');background-size:cover;background-position:center;`
                : `background-color:${colorData.hex};`}">
            </div>
            <div class="preview-cord-shine"></div>
            ${!colorPhoto ? `<div class="${patClass(cord.pat)}" style="position:absolute;inset:0;"></div>` : ''}
          </div>
          <div class="spec-preview-label" id="spec-preview-label">${colorData.name}</div>
          <div class="spec-preview-sub" id="spec-preview-sub">옵션 위에 마우스를 올리면<br>사진을 확인할 수 있습니다</div>
        </div>

        <!-- 오른쪽: 선택 영역 -->
        <div class="spec-selectors">

          <div class="spec-section">
            <div class="spec-section-title">끈 직경 선택</div>
            <div class="spec-options">
              ${spec.sizes.map(s => {
                const photo = getSpecPhoto(state.cord, 'size', s.id);
                return `
                  <div class="spec-card" data-size="${s.id}" data-photo="${photo || ''}">
                    ${photo ? `<img class="spec-card-thumb" src="${photo}" alt="${s.label}">` : ''}
                    <div class="spec-card-label">${s.label}</div>
                    <div class="spec-card-sub">${s.sub}</div>
                  </div>`;
              }).join('')}
            </div>
          </div>

          <div class="spec-section" id="length-section" style="display:none;">
            <div class="spec-section-title">길이 선택</div>
            <div class="spec-length-wrap" id="length-options"></div>
          </div>

          <div class="spec-section">
            <div class="spec-section-title">팁 종류 선택</div>
            <div class="spec-options">
              ${spec.tips.map(t => {
                const photo = getSpecPhoto(state.cord, 'tip', t.id);
                return `
                  <div class="spec-card tip-card" data-tip="${t.id}" data-photo="${photo || ''}">
                    ${photo
                      ? `<img class="spec-card-thumb" src="${photo}" alt="${t.label}">`
                      : `<div class="spec-card-icon">${t.icon}</div>`}
                    <div class="spec-card-label">${t.label}</div>
                    <div class="spec-card-sub">${t.sub}</div>
                  </div>`;
              }).join('')}
            </div>
          </div>

        </div>
      </div><!-- /spec-view-layout -->

      <!-- 선택 요약 + 주문서 -->
      <div class="spec-summary" id="spec-summary" style="display:none;">
        <h4>선택 요약</h4>
        <div class="spec-summary-row" id="summary-chips"></div>
        <div class="spec-summary-contact">
          주문 문의: <strong>062-000-0000</strong> &nbsp;|&nbsp; 평일 09:00~18:00
        </div>
        <button class="btn-order-form" id="btn-order-form">✉️ 주문 문의하기</button>
        <div class="order-inline-box" id="order-inline-box" hidden></div>
      </div>

    </div>
  `;

  setupSpecViewEvents();
}

function setupSpecViewEvents() {
  const spec       = SPECS[state.cord];
  const colorData  = COLORS.find(c => c.id === state.color);
  const colorPhoto = getPhoto(state.cord, state.color);

  /* 미리보기 업데이트 헬퍼 */
  function setPreview(photo, label, sub) {
    const $bg  = document.getElementById('spec-preview-bg');
    const $lbl = document.getElementById('spec-preview-label');
    const $sub = document.getElementById('spec-preview-sub');
    if (photo) {
      $bg.style.backgroundImage    = `url('${photo}')`;
      $bg.style.backgroundSize     = 'cover';
      $bg.style.backgroundPosition = 'center';
      $bg.style.backgroundColor    = '';
    }
    if ($lbl) $lbl.textContent = label || '';
    if ($sub) $sub.textContent = sub || '';
  }

  function restoreColorPreview() {
    const $bg  = document.getElementById('spec-preview-bg');
    const $lbl = document.getElementById('spec-preview-label');
    const $sub = document.getElementById('spec-preview-sub');
    if (colorPhoto) {
      $bg.style.backgroundImage    = `url('${colorPhoto}')`;
      $bg.style.backgroundSize     = 'cover';
      $bg.style.backgroundPosition = 'center';
      $bg.style.backgroundColor    = '';
    } else {
      $bg.style.backgroundImage = '';
      $bg.style.backgroundColor = colorData.hex;
    }
    if ($lbl) $lbl.textContent = colorData.name;
    if ($sub) $sub.textContent = '';
  }

  /* 직경 카드 이벤트 */
  document.querySelectorAll('.spec-card[data-size]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const photo = card.dataset.photo;
      const label = card.querySelector('.spec-card-label')?.textContent || '';
      if (photo) setPreview(photo, label, '직경');
    });
    card.addEventListener('mouseleave', restoreColorPreview);

    card.addEventListener('click', () => {
      state.size   = card.dataset.size;
      state.length = null;
      document.querySelectorAll('.spec-card[data-size]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // 직경 클릭 시 미리보기 고정
      const photo = card.dataset.photo;
      const label = card.querySelector('.spec-card-label')?.textContent || '';
      if (photo) setPreview(photo, label, '직경 선택됨');

      // 길이 버튼 표시
      const sizeData    = spec.sizes.find(s => s.id === state.size);
      const $lengthSec  = document.getElementById('length-section');
      const $lengthOpts = document.getElementById('length-options');
      $lengthSec.style.display = '';
      $lengthOpts.innerHTML = sizeData.lengths.map(l =>
        `<button class="spec-length-btn" data-length="${l}">${l}</button>`
      ).join('');

      document.querySelectorAll('.spec-length-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.length = btn.dataset.length;
          document.querySelectorAll('.spec-length-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          updateSummary();
        });
      });
      updateSummary();
    });
  });

  /* 팁 카드 이벤트 */
  document.querySelectorAll('.spec-card[data-tip]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const photo = card.dataset.photo;
      const label = card.querySelector('.spec-card-label')?.textContent || '';
      if (photo) setPreview(photo, label, '팁 종류');
    });
    card.addEventListener('mouseleave', restoreColorPreview);

    card.addEventListener('click', () => {
      state.tip = card.dataset.tip;
      document.querySelectorAll('.spec-card[data-tip]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const photo = card.dataset.photo;
      const label = card.querySelector('.spec-card-label')?.textContent || '';
      if (photo) setPreview(photo, label, '팁 선택됨');

      updateSummary();
    });
  });

  /* 주문서 버튼 */
  document.getElementById('btn-order-form').addEventListener('click', showOrderForm);
}

function updateSummary() {
  const $summary = document.getElementById('spec-summary');
  const $chips   = document.getElementById('summary-chips');
  if (!$summary || !$chips) return;

  const colorData = COLORS.find(c => c.id === state.color);
  const spec      = SPECS[state.cord];
  const sizeData  = spec.sizes.find(s => s.id === state.size);
  const tipData   = spec.tips.find(t => t.id === state.tip);

  if (!state.size && !state.tip) { $summary.style.display = 'none'; return; }

  const chips = [
    spec.label,
    colorData?.name,
    sizeData?.label,
    state.length || null,
    tipData?.label,
  ].filter(Boolean);

  $chips.innerHTML = chips.map(c => `<span class="spec-summary-chip">${c}</span>`).join('');
  $summary.style.display = '';
  $summary.style.animation = 'none';
  void $summary.offsetWidth;
  $summary.style.animation = '';
}

/* ═══════════════════════════════════════════
   주문 문의 인라인 박스
   ═══════════════════════════════════════════ */
function showOrderForm() {
  const box = document.getElementById('order-inline-box');
  const btn = document.getElementById('btn-order-form');
  if (!box) return;

  /* 토글: 이미 열려있으면 닫기 */
  if (!box.hidden) {
    box.hidden = true;
    btn.classList.remove('active');
    return;
  }

  const colorData = COLORS.find(c => c.id === state.color);
  const spec      = SPECS[state.cord];
  const sizeData  = spec?.sizes.find(s => s.id === state.size);
  const tipData   = spec?.tips.find(t => t.id === state.tip);

  const rows = [
    { label: '끈 종류', value: spec?.label },
    { label: '색상',   value: colorData?.name },
    { label: '직경',   value: sizeData?.label },
    { label: '길이',   value: state.length },
    { label: '팁 종류', value: tipData?.label },
  ].filter(r => r.value);

  box.innerHTML = `
    <div class="oib-order-title">내 주문 내용</div>
    <table class="oib-order-table">
      ${rows.map(r => `<tr><th>${r.label}</th><td>${r.value}</td></tr>`).join('')}
    </table>
    <div class="oib-contact-box">
      <div class="oib-contact-row">📞 <strong>전화 문의</strong>&nbsp; 053-313-4469</div>
      <div class="oib-contact-row">📠 <strong>팩스</strong>&nbsp; 053-955-0441</div>
      <p class="oib-contact-hint">위 내용을 전달하시면 담당자가 확인 후 안내드립니다.<br>평일 09:00 ~ 18:00</p>
    </div>
  `;

  box.hidden = false;
  btn.classList.add('active');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ═══════════════════════════════════════════
   뷰: 회사소개
   ═══════════════════════════════════════════ */
function showAbout() {
  setBreadcrumb([{ label: '회사소개' }]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $app.innerHTML = `
    <div class="about-view">
      <h2>남도실업 소개</h2>
      <p>남도실업은 쇼핑백끈 전문 유통기업으로 <br>20년 이상의 경력을 바탕으로 성장했습니다.</p>
      <p>브레이드·면·꽈배기·리본 등 다양한 끈을 대량으로 신속하게 공급하며,<br>맞춤 제작 상담도 가능합니다.</p>
      <p style="color:var(--gray);font-size:13px;">대구광역시 북구 국우동 1119-10 1층 &nbsp;|&nbsp; 주문문의: 053-313-4469</p>
      <div class="about-contact">대표 연락처: 010-6512-5835</div>
    </div>
  `;
}

/* ── 초기 화면 ── */
showLanding();
