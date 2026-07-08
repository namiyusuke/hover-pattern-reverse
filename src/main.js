import './style.css';
import { cards as cardData } from './cards.js';

/* =====================================================================
   逆ホバー大喜利 作品.02
   ---------------------------------------------------------------------
   Nauts のメンバー一覧のようなカードグリッド。
   各カードから「分身カーソル」が出てきて、あなたのカーソルを hover しにくる。
   - カーソルはバネ物理であなたを追尾する
   - あなたに十分近づくと「hover 中」になり、あなたのカーソルが発光する
   - 何個のカーソルに hover されているか / 通算何回かを下部に集計表示
   ===================================================================== */

const grid        = document.getElementById('grid');
const layer       = document.getElementById('cursorLayer');
const hint        = document.getElementById('hint');

// カードと分身カーソルを結ぶ「リード線」を描くSVGレイヤー(カーソルの後ろ)
const leashSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
leashSVG.setAttribute('class', 'leash-layer');
layer.appendChild(leashSVG);
const hoverNowEl  = document.getElementById('hoverNow');
const hoverTotEl  = document.getElementById('hoverTotal');

// カーソルの矢印グリフ(SVG)。色は hue で塗り分ける。
const glyphSVG = (fill, stroke) => `
  <svg class="glyph" width="24" height="28" viewBox="0 0 26 30">
    <path d="M 4 2 L 4 24 L 9.5 19 L 13 27 L 16.5 25.5 L 13 17.5 L 20 17 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`;

// 待機中(定位置)にカードから出るセリフ。ランダムに選ばれる。
const idleLines = [
  'どこに隠れた?', 'あれ、いない…', 'どこ行った?', 'かくれんぼ?',
  '出ておいで', 'まだ hover してない', 'カーソルどこ?', 'ここにいる?',
  '逃げないで〜', '見失った…', 'そろそろ hover させて',
];

// ── カードとカーソルを生成 ────────────────────────────────────────
const agents = [];   // 各カード = 1エージェント(1カーソル)

cardData.forEach((data, i) => {
  // カード DOM
  const card = document.createElement('article');
  card.className = 'card';
  card.style.setProperty('--hue', data.hue);
  // photo 付きなら写真 + 追従する瞳、無ければグラデーション
  let thumbInner = '';
  if (data.photo) {
    const e = data.eyes;
    thumbInner = `
      <img class="photo" src="${data.photo}" alt="${data.name}" draggable="false">
      <span class="eye" style="left:${e.lx}%; top:${e.y}%"><span class="pupil"></span></span>
      <span class="eye" style="left:${e.rx}%; top:${e.y}%"><span class="pupil"></span></span>`;
    card.classList.add('has-photo');
  }
  card.innerHTML = `
    <div class="thumb">${thumbInner}<div class="port"></div><div class="bubble"></div></div>
    <div class="meta">
      <div class="name">${data.name}</div>
      <div class="company">${data.company}</div>
      <div class="roles">${data.roles.map(r => `<span class="role">${r}</span>`).join('')}</div>
    </div>`;
  grid.appendChild(card);

  // 分身カーソル DOM(オーバーレイに配置)
  const mini = document.createElement('div');
  mini.className = 'cursor mini';
  mini.style.setProperty('--hue', data.hue);
  mini.innerHTML = glyphSVG(`hsl(${data.hue} 70% 55%)`, '#fff') +
                   `<span class="chip">hoverしにきました</span>`;
  layer.appendChild(mini);

  // このカーソルのリード線(カード → カーソル)
  const leash = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  leash.setAttribute('fill', 'none');
  leash.setAttribute('stroke', `hsl(${data.hue} 60% 55%)`);
  leash.setAttribute('stroke-width', '1.6');
  leash.setAttribute('stroke-dasharray', '4 5');
  leash.setAttribute('stroke-linecap', 'round');
  leash.style.opacity = '0';
  leashSVG.appendChild(leash);

  agents.push({
    data, card, mini, leash,
    eyes: [...card.querySelectorAll('.eye')],
    bubble: card.querySelector('.bubble'),
    nextBubbleAt: 0.6 + Math.random() * 3.5,  // 次に吹き出しを出す時刻
    bubbleShown: false,
    bubbleHideAt: 0,
    x: 0, y: 0, vx: 0, vy: 0,     // カーソルの現在位置・速度(viewport座標)
    home: { x: 0, y: 0 },          // 射出口(カード)の位置
    deployed: false,
    hovering: false,
    // 個体差: あなたの周りに散らばるためのオフセットと硬さ
    offAng: (i / cardData.length) * Math.PI * 2,
    offRad: 22 + (i % 3) * 12,
    stiff: 42 + (i % 4) * 10,
    delay: 0.12 * i,               // 出動の時間差
  });

  // あなたが本当にカードへ hover しにいったら、カードは怯む
  card.addEventListener('pointerenter', () => {
    card.classList.add('recoil');
    setTimeout(() => card.classList.remove('recoil'), 300);
  });
});

// ── あなたのカーソル(自前描画) ──────────────────────────────────
const userCursor = document.createElement('div');
userCursor.className = 'cursor user-cursor';
userCursor.innerHTML =
  `<span class="you-tag">あなた :hover</span>` +
  `<div class="btn">あなた</div>`;
layer.appendChild(userCursor);

// ── 最初のガイドモーダル ─────────────────────────────────────────
let started = false;
const modal = document.getElementById('modal');
document.getElementById('modalStart').addEventListener('click', () => {
  started = true;
  modal.classList.add('hide');
});

// ── ポインタ状態 ─────────────────────────────────────────────────
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, in: false, seen: false };

window.addEventListener('pointermove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.in = true;
  if (!pointer.seen) { pointer.seen = true; hint.classList.add('hide'); }
  userCursor.style.opacity = 1;
});
window.addEventListener('pointerleave', () => { pointer.in = false; userCursor.style.opacity = 0; });
document.addEventListener('mouseleave', () => { pointer.in = false; userCursor.style.opacity = 0; });

// カードの射出口位置を更新(スクロール・リサイズで変わる)
function updateHomes() {
  agents.forEach(a => {
    const port = a.card.querySelector('.port');
    const r = port.getBoundingClientRect();
    a.home.x = r.left + r.width / 2;
    a.home.y = r.top + r.height / 2;
    if (!a.spawned) { a.x = a.home.x; a.y = a.home.y; a.spawned = true; }
  });
}
window.addEventListener('resize', updateHomes);
window.addEventListener('scroll', updateHomes, { passive: true });
updateHomes();

// ── メインループ ─────────────────────────────────────────────────
const HOVER_DIST = 34;   // これより近ければ「hover 中」
let prevT = performance.now() / 1000;
let elapsed = 0;
let hoverTotal = 0;
let prevHoverSet = new Set();

function tick() {
  const now = performance.now() / 1000;
  const dt = Math.min(now - prevT, 0.05);
  prevT = now;
  elapsed += dt;

  let hoveringCount = 0;
  const active = started && pointer.in && pointer.seen;

  agents.forEach((a, i) => {
    // 出動判定(時間差で順に出てくる)
    if (active && !a.deployed && elapsed > a.delay) {
      a.deployed = true;
      a.mini.classList.add('live');
      a.card.classList.add('emitting');
    }
    if (!active && a.deployed) {
      // ポインタが居ないと巣(カード)へ戻る
      a.deployed = false;
    }

    // 目標位置: 出動中はあなたの周りの持ち場、非出動中はカード
    let tx, ty;
    if (a.deployed) {
      tx = pointer.x + Math.cos(a.offAng + elapsed * 0.6) * a.offRad;
      ty = pointer.y + Math.sin(a.offAng + elapsed * 0.6) * a.offRad;
    } else {
      tx = a.home.x; ty = a.home.y;
      // 巣に戻り切ったらオーバーレイ表示を消す
      if (Math.hypot(a.x - a.home.x, a.y - a.home.y) < 8) {
        a.mini.classList.remove('live');
        a.card.classList.remove('emitting');
      }
    }

    // バネ積分
    const K = a.stiff, C = 10;
    a.vx += ((tx - a.x) * K - a.vx * C) * dt;
    a.vy += ((ty - a.y) * K - a.vy * C) * dt;
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    a.mini.style.transform = `translate(${a.x - 4}px, ${a.y - 2}px)`;

    // リード線: カードの射出口 → カーソル先端 をゆるいカーブで結ぶ
    const dx = a.x - a.home.x, dy = a.y - a.home.y;
    const len = Math.hypot(dx, dy);
    if (len > 10) {
      const mx = (a.home.x + a.x) / 2;
      const my = (a.home.y + a.y) / 2 + Math.min(len * 0.22, 60);
      a.leash.setAttribute('d', `M ${a.home.x} ${a.home.y} Q ${mx} ${my} ${a.x} ${a.y}`);
      a.leash.style.opacity = a.deployed ? '0.55' : '0.3';
    } else {
      a.leash.style.opacity = '0';
    }

    // 写真の瞳をカーソルの方へ向ける(目が追う)
    if (a.eyes.length) {
      for (const eye of a.eyes) {
        const r = eye.getBoundingClientRect();
        if (!r.width) continue;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = pointer.x - cx, dy = pointer.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        // 黒目の可動半径(白目内に収める)。横長なので縦は控えめに
        const maxX = r.width * 0.24, maxY = r.height * 0.28;
        const s = Math.min(d / 120, 1);
        const ox = (dx / d) * maxX * s, oy = (dy / d) * maxY * s;
        eye.firstElementChild.style.transform =
          `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
      }
    }

    // 待機中(定位置)は「どこに隠れた?」等の吹き出しをランダムに出す
    if (!a.deployed) {
      if (!a.bubbleShown && elapsed >= a.nextBubbleAt) {
        a.bubble.textContent = idleLines[Math.floor(Math.random() * idleLines.length)];
        a.bubble.classList.add('show');
        a.bubbleShown = true;
        a.bubbleHideAt = elapsed + 1.6 + Math.random() * 1.0;
      } else if (a.bubbleShown && elapsed >= a.bubbleHideAt) {
        a.bubble.classList.remove('show');
        a.bubbleShown = false;
        a.nextBubbleAt = elapsed + 2.5 + Math.random() * 4.5;  // 次はしばらく後
      }
    } else if (a.bubbleShown) {
      // 出動したら吹き出しは引っ込める
      a.bubble.classList.remove('show');
      a.bubbleShown = false;
      a.nextBubbleAt = elapsed + 0.5 + Math.random() * 3;
    }

    // hover 判定
    const nowHovering = a.deployed && Math.hypot(a.x - pointer.x, a.y - pointer.y) < HOVER_DIST;
    if (nowHovering) {
      hoveringCount++;
      a.mini.classList.add('hovering');
    } else {
      a.mini.classList.remove('hovering');
    }
  });

  // あなたのカーソル(ボタン)描画。ポインタ中心にボタンを合わせる
  userCursor.style.transform = `translate(${pointer.x}px, ${pointer.y}px)`;
  userCursor.classList.toggle('hovered', hoveringCount > 0);
  userCursor.classList.toggle('pressed', hoveringCount >= 3);   // 大勢に囲まれると押し込まれる

  // 集計: 新しく hover された分を通算に加算
  const curSet = new Set(agents.filter(a => a.mini.classList.contains('hovering')).map(a => a.data.name));
  curSet.forEach(name => { if (!prevHoverSet.has(name)) hoverTotal++; });
  prevHoverSet = curSet;

  hoverNowEl.textContent = hoveringCount;
  hoverTotEl.textContent = hoverTotal;

  requestAnimationFrame(tick);
}
tick();
