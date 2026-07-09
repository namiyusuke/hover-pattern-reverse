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
const shelter     = document.getElementById('shelter');   // hover されない隠れエリア(固定)

// 点(x,y)が矩形 r の外側になるよう、pad ぶん外へ押し出す。
// 中に入り込んでいたら一番近い辺の外側へ寄せる → カーソルが外周で足止めされる。
function clampOutside(r, x, y, pad) {
  if (x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad) {
    const dl = x - (r.left  - pad);   // 左辺の外まで
    const dr = (r.right + pad) - x;   // 右辺の外まで
    const dt = y - (r.top   - pad);   // 上辺の外まで
    const db = (r.bottom + pad) - y;  // 下辺の外まで
    const m = Math.min(dl, dr, dt, db);
    if      (m === dl) x = r.left  - pad;
    else if (m === dr) x = r.right + pad;
    else if (m === dt) y = r.top   - pad;
    else               y = r.bottom + pad;
  }
  return { x, y };
}

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

// 隠れエリアに逃げ込まれ、外周で足止めされている時に出す悔しがりコメント。
const blockedLines = [
  'そこはずるい！', '出てきて〜', 'そこ入れない…', 'ずるいぞ',
  'まだ hover してない', 'こっち来て', 'バリアかよ', '待ってるってば',
];

// あなたのカーソルを見つけて hover した(捕まえた)時に出すコメント。
const foundLines = [
  '見つけた！', 'みっけ！', 'いた！', '捕まえた', 'はい hover',
  '見〜つけた', 'ここにいた！', '逃がさない',
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
    // 左右それぞれの目の span を組み立てる。
    // 共通指定(e.w/h/iris/round)＋ 片目だけの上書き(e.l / e.r)に対応。
    const eyeSpan = (side) => {
      const c = { x: side === 'l' ? e.lx : e.rx, y: e.y,
                  w: e.w, h: e.h, iris: e.iris, round: e.round,
                  ...(side === 'l' ? e.l : e.r) };
      let st = `left:${c.x}%; top:${c.y}%;`;
      if (c.w    != null) st += `--eye-w:${c.w}%;`;
      if (c.h    != null) st += `--eye-h:${c.h}%;`;
      if (c.iris != null) st += `--iris:${c.iris}%;`;
      if (c.round)        st += `--eye-r:50%;`;   // 真円にする
      return `<span class="eye" style="${st}"><span class="pupil"></span></span>`;
    };
    thumbInner = `
      <img class="photo" src="${data.photo}" alt="${data.name}" draggable="false">
      ${eyeSpan('l')}${eyeSpan('r')}`;
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
    blockedLine: blockedLines[i % blockedLines.length],  // 足止め時のセリフ(個体で固定)
    foundLine:   foundLines[i % foundLines.length],      // 見つけた時のセリフ(個体で固定)
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

// 「あなた」ボタンの実際の位置。ポインタに“遅れて”追従(ラグ)し、
// 速く動かすと進行方向へ伸縮(スクワッシュ&ストレッチ)する。
// カーソル・目・hover 判定はこの遅れた位置を基準にする。
const you = { x: pointer.x, y: pointer.y, vx: 0, vy: 0 };
const YOU_LAG = 0.18;   // 0=固まる 1=遅れ無し(直付け)

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

  // 「あなた」ボタンをポインタへラグ追従させ、速度を記録
  const nx = you.x + (pointer.x - you.x) * YOU_LAG;
  const ny = you.y + (pointer.y - you.y) * YOU_LAG;
  you.vx = nx - you.x; you.vy = ny - you.y;
  you.x = nx; you.y = ny;

  // あなたが隠れエリアの中に居るか判定。中に居る間は hover されない。
  const sr = shelter.getBoundingClientRect();
  const youHidden = active &&
    you.x > sr.left && you.x < sr.right && you.y > sr.top && you.y < sr.bottom;
  shelter.classList.toggle('safe', youHidden);

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
      tx = you.x + Math.cos(a.offAng + elapsed * 0.6) * a.offRad;
      ty = you.y + Math.sin(a.offAng + elapsed * 0.6) * a.offRad;
    } else {
      tx = a.home.x; ty = a.home.y;
      // 巣に戻り切ったらオーバーレイ表示を消す
      if (Math.hypot(a.x - a.home.x, a.y - a.home.y) < 8) {
        a.mini.classList.remove('live');
        a.card.classList.remove('emitting');
      }
    }

    // あなたが隠れエリアに居る間は、カーソルはエリアの中へ入れず外周で足止め
    if (youHidden && a.deployed) {
      const c = clampOutside(sr, tx, ty, 16);
      tx = c.x; ty = c.y;
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
        const dx = you.x - cx, dy = you.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        // 黒目の可動半径(白目内に収める)。横長なので縦は控えめに
        const maxX = r.width * 0.24, maxY = r.height * 0.28;
        const s = Math.min(d / 120, 1);
        const ox = (dx / d) * maxX * s, oy = (dy / d) * maxY * s;
        eye.firstElementChild.style.transform =
          `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
      }
    }

    // hover 判定(隠れエリアに居る間は成立させない)。あなたを見つけたか。
    const nowHovering = !youHidden && a.deployed &&
      Math.hypot(a.x - you.x, a.y - you.y) < HOVER_DIST;

    // 吹き出し(カードから出る)。
    // ・待機中(定位置): 「どこに隠れた?」等をランダムに
    // ・隠れエリアに逃げ込まれ足止め中: 「そこはずるい!」等を出し続ける
    // ・あなたを見つけて hover 中: 「見つけた!」等を出し続ける
    if (youHidden && a.deployed) {
      if (a.bubble.textContent !== a.blockedLine || !a.bubbleShown) {
        a.bubble.textContent = a.blockedLine;
        a.bubble.classList.add('show');
        a.bubbleShown = true;
        a.bubbleHideAt = Infinity;   // エリアに居る間は出しっぱなし
      }
    } else if (nowHovering) {
      if (a.bubble.textContent !== a.foundLine || !a.bubbleShown) {
        a.bubble.textContent = a.foundLine;
        a.bubble.classList.add('show');
        a.bubbleShown = true;
        a.bubbleHideAt = Infinity;   // 見つけている間は出しっぱなし
      }
    } else if (!a.deployed) {
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
      // 出動中(足止めでない)なら吹き出しは引っ込める
      a.bubble.classList.remove('show');
      a.bubbleShown = false;
      a.nextBubbleAt = elapsed + 0.5 + Math.random() * 3;
    }

    if (nowHovering) {
      hoveringCount++;
      a.mini.classList.add('hovering');
    } else {
      a.mini.classList.remove('hovering');
    }
  });

  // あなたのカーソル(ボタン)描画。遅れた位置 + 速く動くと進行方向へ伸縮
  const speed = Math.hypot(you.vx, you.vy);
  let t = `translate(${you.x}px, ${you.y}px)`;
  if (speed > 0.5) {
    const ang = Math.atan2(you.vy, you.vx) * 180 / Math.PI;
    const sx = 1 + Math.min(speed / 40, 0.35);   // 進行方向に伸びる
    const sy = 1 - Math.min(speed / 90, 0.15);   // 直交方向に縮む
    t += ` rotate(${ang}deg) scale(${sx}, ${sy}) rotate(${-ang}deg)`;
  }
  userCursor.style.transform = t;
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
