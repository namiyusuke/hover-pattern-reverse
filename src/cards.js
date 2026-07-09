// メンバーカードのデータ(参考: Nauts ホバー大喜利 のメンバー一覧レイアウト)
// 各カードから「分身カーソル」が出てきて、あなたを hover しにいきます。
import member01 from './images/member01.webp';
import member02 from './images/member02.webp';
import member03 from './images/member03.webp';
import member04 from './images/member04.webp';
import member05 from './images/member05.webp';
import member06 from './images/member06.webp';
import member07 from './images/member07.webp';
import member08 from './images/member08.webp';
import member09 from './images/member09.webp';
import member10 from './images/member10.webp';

// eyes: サムネ(正方形 = 画像そのまま)に対する目の設定。
//   ■ 位置(必須)  y … 上下(小さいほど上)  lx/rx … 左目/右目の左右位置(%)
//   ■ 大きさ・形(任意 / 省略で既定値)。w/h はサムネに対する %
//       w      … 白目の横幅(%)          例: 10   (大きいほど横に広い)
//       h      … 白目の高さ(%)          例: 5.5  (w>h でアーモンド型、w=h で丸)
//       iris   … 黒目の大きさ(白目に対する%) 例: 86  (小さいほど黒目が小さい)
//       round  … true で白目を真円にする
//   ■ 片目だけ変えたい時は l:{...} / r:{...} で上書き
//       例: eyes: { y:33, lx:43, rx:56, w:10, h:5.5, iris:80, r:{ w:8, h:5 } }
export const cards = [
  { name: '逆 ホバ太',   company: 'Freelance',   roles: ['Art Director', 'Designer'], hue: 210,
    photo: member01, eyes: { y: 34.5, lx: 42.5, rx: 55,   w: 10.1, h: 7.5 } },
  { name: '追尾 みつこ', company: 'CURSOR inc.',  roles: ['Programmer'],               hue: 150,
    photo: member02, eyes: { y: 28.5, lx: 44,   rx: 56.5, w: 9.2,  h: 4.1 } },
  { name: '発光 あおい', company: 'GLOW studio',  roles: ['Designer'],                 hue: 330,
    photo: member03, eyes: { y: 32,   lx: 43,   rx: 56,   w: 10.1, h: 3.5 } },
  { name: '充填 ためる', company: 'Freelance',   roles: ['Motion Designer'],          hue:  40,
    photo: member04, eyes: { y: 30.5, lx: 44,   rx: 56.5, w: 10.7, h: 5.9 } },
  { name: '波紋 なみ',   company: 'RIPPLE',       roles: ['Art Director'],             hue: 270,
    photo: member05, eyes: { y: 31,   lx: 44,   rx: 57,   w: 8.6,  h: 4.8 } },
  { name: '接近 ちかし', company: 'Freelance',   roles: ['Programmer', 'Designer'],   hue: 190,
    photo: member06, eyes: { y: 33,   lx: 43,   rx: 56,   w: 12.1, h: 5.5 } },
  { name: '包囲 かこむ', company: 'SIEGE works',  roles: ['Director'],                 hue:  10,
    photo: member07, eyes: { y: 32,   lx: 44,   rx: 56,   w: 8.1, h: 5.5 } },
  { name: '囁 ささや',   company: 'whisper.co',   roles: ['Copywriter'],               hue:  90,
    photo: member08, eyes: { y: 32.5, lx: 45,   rx: 57,   w: 10.7, h: 5.9 } },
  { name: '追従 ついこ', company: 'Freelance',   roles: ['Designer'],                 hue: 300,
    photo: member09, eyes: { y: 30.5, lx: 43,   rx: 56,   w: 9.2,  h: 5.1 } },
  { name: '射出 いずる', company: 'EJECT lab',    roles: ['Programmer'],               hue: 240,
    photo: member10, eyes: { y: 32,   lx: 44,   rx: 56,   w: 10.1, h: 3.5 } },
];
