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
        <button class="btn-select-color" id="btn-select-color" disabled>색상을 선택해주세요</button>
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
  const $btnSelect   = document.getElementById('btn-select-color');
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
      const c = COLORS.find(x => x.id === state.color);
      applyPreview(state.color);
      $btnSelect.disabled = false;
      $btnSelect.textContent = `${c.name} 선택 →`;
      cards.forEach(x => x.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  $btnSelect.addEventListener('click', () => { if (state.color) showSpecs(); });
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
  const today     = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  box.innerHTML = `
    <div class="oib-chips">
      ${spec       ? `<span class="oib-chip">${spec.label}</span>`       : ''}
      ${colorData  ? `<span class="oib-chip">${colorData.name}</span>`   : ''}
      ${sizeData   ? `<span class="oib-chip">${sizeData.label}</span>`   : ''}
      ${state.length ? `<span class="oib-chip">${state.length}</span>`   : ''}
      ${tipData    ? `<span class="oib-chip">${tipData.label}</span>`    : ''}
    </div>
    <div class="oib-fields">
      <label class="oib-field"><span>업체명</span><input type="text"    id="of-company" placeholder="업체명" /></label>
      <label class="oib-field"><span>담당자</span><input type="text"    id="of-name"    placeholder="담당자명" /></label>
      <label class="oib-field"><span>연락처</span><input type="tel"     id="of-tel"     placeholder="010-0000-0000" /></label>
      <label class="oib-field"><span>수량</span>  <input type="number"  id="of-qty"     placeholder="수량 (개)" min="1" /></label>
      <label class="oib-field oib-field-full"><span>요청사항</span><textarea id="of-note" placeholder="특이사항"></textarea></label>
    </div>
    <div class="oib-btns">
      <button class="oib-btn oib-btn-email" id="oib-btn-email">📧 이메일로 보내기</button>
      <button class="oib-btn oib-btn-fax"   id="oib-btn-fax">📠 팩스로 보내기</button>
    </div>
    <div class="oib-fax-box" id="oib-fax-box" hidden>
      <div class="oib-fax-num">📠 팩스번호: <strong>062-000-0001</strong></div>
      <pre class="oib-fax-content" id="oib-fax-content"></pre>
      <p class="oib-fax-hint">위 내용을 팩스로 보내주시면 담당자가 확인 후 연락드립니다.</p>
    </div>
  `;

  box.hidden = false;
  btn.classList.add('active');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  function getOrderText() {
    return (
`남도실업 주문 문의
━━━━━━━━━━━━━━━━━━━━━━━━
일자: ${today}
업체명: ${document.getElementById('of-company').value.trim() || '(미입력)'}
담당자: ${document.getElementById('of-name').value.trim() || '(미입력)'}
연락처: ${document.getElementById('of-tel').value.trim() || '(미입력)'}

[주문 내용]
끈 종류: ${spec?.label || '-'}
색상: ${colorData?.name || '-'}
직경: ${sizeData?.label || '-'}
길이: ${state.length || '-'}
팁 종류: ${tipData?.label || '-'}
수량: ${document.getElementById('of-qty').value.trim() || '(미입력)'}

[요청사항]
${document.getElementById('of-note').value.trim() || '없음'}
━━━━━━━━━━━━━━━━━━━━━━━━`
    );
  }

  document.getElementById('oib-btn-email').addEventListener('click', () => {
    const subject = encodeURIComponent(`[주문문의] 남도실업 쇼핑백끈 - ${spec?.label || ''} ${colorData?.name || ''}`);
    const body    = encodeURIComponent(getOrderText());
    window.location.href = `mailto:namdo@example.com?subject=${subject}&body=${body}`;
  });

  document.getElementById('oib-btn-fax').addEventListener('click', () => {
    const faxBox = document.getElementById('oib-fax-box');
    document.getElementById('oib-fax-content').textContent = getOrderText();
    faxBox.hidden = false;
    faxBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
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
      <p>1990년대부터 쇼핑백끈 전문 유통기업으로 시작하여<br>20년 이상의 경력을 바탕으로 성장한 남도실업입니다.</p>
      <p>브레이드·면·꽈배기·리본 등 다양한 끈을 대량으로 신속하게 공급하며,<br>맞춤 제작 상담도 가능합니다.</p>
      <p style="color:var(--gray);font-size:13px;">광주광역시 남구 &nbsp;|&nbsp; 사업자등록번호: 000-00-00000</p>
      <div class="about-contact">고객센터: 062-000-0000</div>
    </div>
  `;
}

/* ── 초기 화면 ── */
showLanding();
