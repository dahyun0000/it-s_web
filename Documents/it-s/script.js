'use strict';

/* ═══════════════════════════════════════════
   데이터 정의
   ═══════════════════════════════════════════ */

const CORD_TYPES = [
  {
    id: 'braid',
    name: '브레이드끈',
    desc: 'PP 소재 유광 · 가장 널리 쓰이는 표준형 끈',
    bg: '#2c5f8a',
    pat: 'braid',
  },
  {
    id: 'cotton',
    name: '면·스판끈',
    desc: '천연 면 소재 · 부드럽고 자연스러운 질감',
    bg: '#7B6B52',
    pat: 'cotton',
  },
  {
    id: 'twist',
    name: '꽈배기끈',
    desc: '꼬임 구조 PP · 탄력 있고 견고한 형태',
    bg: '#3D6B50',
    pat: 'twist',
  },
  {
    id: 'ribbon',
    name: '리본끈',
    desc: '공단·골지 소재 · 고급 선물 쇼핑백용',
    bg: '#7C4F7A',
    pat: 'ribbon',
  },
];

/* 23가지 색상 */
const COLORS = [
  { id: 'white',      name: '흰색',    hex: '#F2F2F2', light: true  },
  { id: 'ivory',      name: '아이보리', hex: '#FFF8DC', light: true  },
  { id: 'lightgray',  name: '연회색',   hex: '#C0C0C0', light: true  },
  { id: 'gray',       name: '회색',    hex: '#7A7A7A', light: false },
  { id: 'darkgray',   name: '진회색',   hex: '#464646', light: false },
  { id: 'black',      name: '검정',    hex: '#1A1A1A', light: false },
  { id: 'red',        name: '빨강',    hex: '#D82020', light: false },
  { id: 'darkred',    name: '진빨강',   hex: '#860000', light: false },
  { id: 'pink',       name: '분홍',    hex: '#EE5C99', light: false },
  { id: 'lightpink',  name: '연분홍',   hex: '#F9AECE', light: true  },
  { id: 'orange',     name: '주황',    hex: '#F07600', light: false },
  { id: 'yellow',     name: '노랑',    hex: '#F8D000', light: true  },
  { id: 'lightgreen', name: '연두',    hex: '#78D478', light: true  },
  { id: 'green',      name: '초록',    hex: '#1E8E3E', light: false },
  { id: 'darkgreen',  name: '진초록',   hex: '#0E4E22', light: false },
  { id: 'skyblue',    name: '하늘',    hex: '#60B8F0', light: true  },
  { id: 'blue',       name: '파랑',    hex: '#1454B8', light: false },
  { id: 'navy',       name: '남색',    hex: '#1A2E4A', light: false },
  { id: 'purple',     name: '보라',    hex: '#7010A0', light: false },
  { id: 'lavender',   name: '연보라',   hex: '#C090D8', light: true  },
  { id: 'brown',      name: '갈색',    hex: '#6A3C0E', light: false },
  { id: 'beige',      name: '베이지',   hex: '#E8D0A0', light: true  },
  { id: 'gold',       name: '황금',    hex: '#C8940C', light: false },
];

const SPECS = {
  braid: {
    label: '브레이드끈',
    sizes: [
      { id: '6mm', label: '6mm', sub: '일반형', lengths: ['35cm', '40cm', '45cm', '50cm'] },
      { id: '8mm', label: '8mm', sub: '대형',   lengths: ['35cm', '40cm', '45cm', '50cm'] },
    ],
    tips: [
      { id: 'metal',   label: '철팁',      sub: '내구성 우수, 고급스러운 마감', icon: '🔩' },
      { id: 'plastic', label: '플라스틱팁', sub: '가볍고 부드러운 마감',         icon: '🔗' },
    ],
  },
  cotton: {
    label: '면·스판끈',
    sizes: [
      { id: '6mm', label: '6mm', sub: '일반형', lengths: ['35cm', '40cm'] },
      { id: '8mm', label: '8mm', sub: '대형',   lengths: ['35cm', '40cm'] },
    ],
    tips: [
      { id: 'metal',   label: '철팁',      sub: '내구성 우수',    icon: '🔩' },
      { id: 'plastic', label: '플라스틱팁', sub: '부드러운 마감',  icon: '🔗' },
    ],
  },
  twist: {
    label: '꽈배기끈',
    sizes: [
      { id: '5mm', label: '5mm', sub: '표준형', lengths: ['35cm', '40cm'] },
      { id: '7mm', label: '7mm', sub: '대형',   lengths: ['35cm', '40cm'] },
    ],
    tips: [
      { id: 'metal',   label: '철팁',      sub: '견고한 마감',   icon: '🔩' },
      { id: 'plastic', label: '플라스틱팁', sub: '부드러운 마감', icon: '🔗' },
    ],
  },
  ribbon: {
    label: '리본끈',
    sizes: [
      { id: 'satin',     label: '공단리본', sub: '광택 있는 실크 질감', lengths: ['35cm', '40cm'] },
      { id: 'grosgrain', label: '골지리본', sub: '무광 그로그랭 소재',   lengths: ['35cm', '40cm'] },
    ],
    tips: [
      { id: 'metal',   label: '철팁',      sub: '견고한 마감',   icon: '🔩' },
      { id: 'plastic', label: '플라스틱팁', sub: '부드러운 마감', icon: '🔗' },
    ],
  },
};

/* ═══════════════════════════════════════════
   앱 상태
   ═══════════════════════════════════════════ */
const state = {
  cord:   null,
  color:  null,
  size:   null,
  length: null,
  tip:    null,
};

const $app        = document.getElementById('app');
const $breadcrumb = document.getElementById('breadcrumb');

/* ═══════════════════════════════════════════
   네비게이션 이벤트
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
  if (!items.length) {
    $breadcrumb.className = 'breadcrumb breadcrumb-hidden';
    return;
  }
  $breadcrumb.className = 'breadcrumb';

  const homeBtn = document.createElement('button');
  homeBtn.className = 'bc-link';
  homeBtn.textContent = '홈';
  homeBtn.addEventListener('click', showLanding);
  $breadcrumb.appendChild(homeBtn);

  items.forEach((item, i) => {
    const sep = document.createElement('span');
    sep.className = 'bc-sep';
    sep.textContent = '›';
    $breadcrumb.appendChild(sep);

    if (item.action && i < items.length - 1) {
      const btn = document.createElement('button');
      btn.className = 'bc-link';
      btn.textContent = item.label;
      btn.addEventListener('click', item.action);
      $breadcrumb.appendChild(btn);
    } else {
      const span = document.createElement('span');
      span.textContent = item.label;
      $breadcrumb.appendChild(span);
    }
  });
}

/* ═══════════════════════════════════════════
   헬퍼: 끈 패턴 CSS 클래스
   ═══════════════════════════════════════════ */
function patClass(cordId) {
  return `cord-pat cord-pat-${cordId}`;
}

/* ═══════════════════════════════════════════
   뷰: 랜딩 (끈 종류 선택)
   ═══════════════════════════════════════════ */
function showLanding() {
  state.cord = state.color = state.size = state.length = state.tip = null;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  setBreadcrumb([]);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  $app.innerHTML = `
    <div class="landing-intro">
      <h2>원하는 끈 종류를 선택하세요</h2>
      <p>23가지 색상 &middot; 다양한 직경·길이 규격 &middot; 철팁 / 플라스틱팁 선택 가능</p>
    </div>
    <div class="cord-type-grid">
      ${CORD_TYPES.map(c => `
        <div class="cord-type-card" data-cord="${c.id}">
          <div class="cord-type-img" style="background-color:${c.bg};">
            <div class="${patClass(c.pat)}"></div>
            <div class="cord-type-shade"></div>
            <span class="cord-type-name">${c.name}</span>
          </div>
          <div class="cord-type-body">
            <p>${c.desc}</p>
            <span class="cord-type-link">색상 23가지 보기</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  $app.querySelectorAll('.cord-type-card').forEach(card => {
    card.addEventListener('click', () => {
      showColors(card.dataset.cord);
    });
  });
}

/* ═══════════════════════════════════════════
   뷰: 색상 선택
   ═══════════════════════════════════════════ */
function showColors(cordId) {
  state.cord = cordId;
  state.color = state.size = state.length = state.tip = null;
  setNavActive(cordId);
  setBreadcrumb([
    { label: SPECS[cordId].label, action: () => showColors(cordId) },
  ]);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const cord = CORD_TYPES.find(c => c.id === cordId);

  $app.innerHTML = `
    <div class="color-view">

      <!-- 왼쪽: 미리보기 패널 -->
      <div class="color-preview-panel">
        <div class="preview-cord-wrap">
          <div class="preview-cord-bg" id="preview-bg" style="background-color:#e8f3fb;"></div>
          <div class="${patClass(cord.pat)} preview-cord-pat" id="preview-pat"></div>
          <div class="preview-cord-shine"></div>
          <div class="preview-cord-placeholder" id="preview-placeholder">
            <span style="font-size:36px; opacity:.4;">${cord.pat === 'braid' ? '🪢' : cord.pat === 'cotton' ? '🧵' : cord.pat === 'twist' ? '〰️' : '🎀'}</span>
            <p>색상을 선택하세요</p>
          </div>
        </div>

        <div class="preview-color-name" id="preview-name">&nbsp;</div>
        <div class="preview-color-hex"  id="preview-hex">&nbsp;</div>
        <div class="preview-cord-type">${cord.name}</div>

        <button class="btn-select-color" id="btn-select-color" disabled>
          색상을 선택해주세요
        </button>
      </div>

      <!-- 오른쪽: 색상 그리드 -->
      <div class="color-grid-panel">
        <div class="color-grid-header">
          <h3>색상 선택</h3>
          <small>${COLORS.length}가지</small>
        </div>
        <div class="color-grid">
          ${COLORS.map(c => `
            <div class="color-swatch-card" data-color="${c.id}" title="${c.name}">
              <div class="swatch-color-wrap">
                <div class="swatch-color-bg" style="background-color:${c.hex};"></div>
                <div class="swatch-cord-pat ${patClass(cord.pat)}"></div>
                <div class="swatch-shine"></div>
                <!--
                  실제 제품 사진으로 교체 시 아래 img 태그 주석 해제:
                  <img class="swatch-img" src="images/${cordId}_${c.id}.jpg" alt="${c.name} ${cord.name}" onerror="this.style.display='none'">
                -->
              </div>
              <div class="swatch-name-bar">${c.name}</div>
            </div>
          `).join('')}
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
    const c = COLORS.find(x => x.id === colorId);
    $previewBg.style.backgroundColor = c.hex;
    $previewName.textContent = c.name;
    $previewHex.textContent  = c.hex;
    $placeholder.style.display = 'none';
  }

  function restoreSelected() {
    if (state.color) {
      applyPreview(state.color);
    } else {
      $previewBg.style.backgroundColor = '#e8f3fb';
      $previewName.innerHTML = '&nbsp;';
      $previewHex.innerHTML  = '&nbsp;';
      $placeholder.style.display = '';
    }
  }

  cards.forEach(card => {
    // 마우스 오버: 미리보기 업데이트
    card.addEventListener('mouseenter', () => applyPreview(card.dataset.color));
    card.addEventListener('mouseleave', restoreSelected);

    // 클릭: 색상 선택 확정
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

  $btnSelect.addEventListener('click', () => {
    if (state.color) showSpecs();
  });
}

/* ═══════════════════════════════════════════
   뷰: 규격 / 팁 선택
   ═══════════════════════════════════════════ */
function showSpecs() {
  if (!state.cord || !state.color) return;
  state.size = state.length = state.tip = null;

  const colorData = COLORS.find(c => c.id === state.color);
  const spec      = SPECS[state.cord];
  const cord      = CORD_TYPES.find(c => c.id === state.cord);

  setBreadcrumb([
    { label: spec.label,      action: () => showColors(state.cord) },
    { label: colorData.name,  action: showSpecs },
  ]);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  $app.innerHTML = `
    <div class="spec-view">

      <!-- 헤더: 선택한 끈 + 색상 -->
      <div class="spec-header">
        <div class="spec-color-dot" style="background-color:${colorData.hex};">
          <div class="spec-color-dot-pat ${patClass(cord.pat)}"></div>
          <div class="spec-color-dot-shine"></div>
        </div>
        <div class="spec-header-info">
          <h2>${spec.label} &middot; ${colorData.name}</h2>
          <p>직경과 길이, 팁 종류를 선택하세요. 문의는 고객센터로 연락해 주세요.</p>
        </div>
      </div>

      <!-- 규격 (직경) -->
      <div class="spec-section">
        <div class="spec-section-title">끈 직경 선택</div>
        <div class="spec-options">
          ${spec.sizes.map(s => `
            <div class="spec-card" data-size="${s.id}">
              <div class="spec-card-label">${s.label}</div>
              <div class="spec-card-sub">${s.sub}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 길이 (직경 선택 후 표시) -->
      <div class="spec-section" id="length-section" style="display:none;">
        <div class="spec-section-title">길이 선택</div>
        <div class="spec-length-wrap" id="length-options"></div>
      </div>

      <!-- 팁 종류 -->
      <div class="spec-section">
        <div class="spec-section-title">팁 종류 선택</div>
        <div class="spec-options">
          ${spec.tips.map(t => `
            <div class="spec-card tip-card" data-tip="${t.id}">
              <div class="spec-card-icon">${t.icon}</div>
              <div class="spec-card-label">${t.label}</div>
              <div class="spec-card-sub">${t.sub}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 선택 요약 -->
      <div class="spec-summary" id="spec-summary" style="display:none;">
        <h4>선택 요약</h4>
        <div class="spec-summary-row" id="summary-chips"></div>
        <div class="spec-summary-contact">
          주문 문의: <strong>062-000-0000</strong> &nbsp;|&nbsp; 평일 09:00~18:00
        </div>
      </div>

    </div>
  `;

  setupSpecViewEvents();
}

function setupSpecViewEvents() {
  const spec = SPECS[state.cord];

  /* 직경 선택 */
  document.querySelectorAll('.spec-card[data-size]').forEach(card => {
    card.addEventListener('click', () => {
      state.size   = card.dataset.size;
      state.length = null;

      document.querySelectorAll('.spec-card[data-size]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // 길이 옵션 표시
      const sizeData      = spec.sizes.find(s => s.id === state.size);
      const $lengthSec    = document.getElementById('length-section');
      const $lengthOpts   = document.getElementById('length-options');
      $lengthSec.style.display = '';
      $lengthOpts.innerHTML = sizeData.lengths.map(l => `
        <button class="spec-length-btn" data-length="${l}">${l}</button>
      `).join('');

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

  /* 팁 선택 */
  document.querySelectorAll('.spec-card[data-tip]').forEach(card => {
    card.addEventListener('click', () => {
      state.tip = card.dataset.tip;
      document.querySelectorAll('.spec-card[data-tip]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      updateSummary();
    });
  });
}

function updateSummary() {
  const $summary = document.getElementById('spec-summary');
  const $chips   = document.getElementById('summary-chips');
  if (!$summary || !$chips) return;

  const colorData = COLORS.find(c => c.id === state.color);
  const spec      = SPECS[state.cord];
  const sizeData  = spec.sizes.find(s => s.id === state.size);
  const tipData   = spec.tips.find(t => t.id === state.tip);

  if (!state.size && !state.tip) {
    $summary.style.display = 'none';
    return;
  }

  const chips = [
    spec.label,
    colorData ? colorData.name : null,
    sizeData ? sizeData.label : null,
    state.length || null,
    tipData ? tipData.label : null,
  ].filter(Boolean);

  $chips.innerHTML = chips.map(c =>
    `<span class="spec-summary-chip">${c}</span>`
  ).join('');

  $summary.style.display = '';
  $summary.style.animation = 'none';
  void $summary.offsetWidth; // reflow
  $summary.style.animation = '';
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
      <p>
        1990년대부터 쇼핑백끈 전문 유통기업으로 시작하여<br>
        20년 이상의 경력을 바탕으로 성장한 남도실업입니다.
      </p>
      <p>
        브레이드·면·꽈배기·리본 등 다양한 끈을 대량으로 신속하게 공급하며,<br>
        맞춤 제작 상담도 가능합니다.
      </p>
      <p style="color:var(--gray); font-size:13px;">
        광주광역시 남구 &nbsp;|&nbsp; 사업자등록번호: 000-00-00000
      </p>
      <div class="about-contact">고객센터: 062-000-0000</div>
    </div>
  `;
}

/* ═══════════════════════════════════════════
   초기 화면
   ═══════════════════════════════════════════ */
showLanding();
