'use strict';
/* ═══════════════════════════════════════════
   공용 데이터 — index.html + admin.html 공유
   ═══════════════════════════════════════════ */

const CORD_TYPES = [
  { id: 'braid',  name: '브레이드끈', desc: 'PP 소재 유광 · 가장 널리 쓰이는 표준형 끈',  bg: '#2c5f8a', pat: 'braid'  },
  { id: 'cotton', name: '면·스판끈',  desc: '천연 면 소재 · 부드럽고 자연스러운 질감',  bg: '#7B6B52', pat: 'cotton' },
  { id: 'twist',  name: '꽈배기끈',   desc: '꼬임 구조 PP · 탄력 있고 견고한 형태',     bg: '#3D6B50', pat: 'twist'  },
  { id: 'ribbon', name: '리본끈',     desc: '공단·골지 소재 · 고급 선물 쇼핑백용',      bg: '#7C4F7A', pat: 'ribbon' },
];

const DEFAULT_COLORS = [
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
      { id: 'metal',   label: '철팁',      sub: '내구성 우수',   icon: '🔩' },
      { id: 'plastic', label: '플라스틱팁', sub: '부드러운 마감', icon: '🔗' },
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
