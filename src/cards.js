// メンバーカードのデータ(参考: Nauts ホバー大喜利 のメンバー一覧レイアウト)
// 各カードから「分身カーソル」が出てきて、あなたを hover しにいきます。
import member01 from './images/member01.png';
import member02 from './images/member02.png';
import member03 from './images/member03.png';
import member04 from './images/member04.png';
import member05 from './images/member05.png';
import member06 from './images/member06.png';
import member07 from './images/member07.png';
import member08 from './images/member08.png';
import member09 from './images/member09.png';
import member10 from './images/member10.png';

// eyes: サムネ(正方形 = 画像そのまま)に対する目の % 位置。ズレたら微調整可。
//   y … 上下(小さいほど上)  lx/rx … 左目/右目の左右位置
export const cards = [
  { name: '逆 ホバ太',   company: 'Freelance',   roles: ['Art Director', 'Designer'], hue: 210,
    photo: member01, eyes: { y: 34.5, lx: 42.5, rx: 55 } },
  { name: '追尾 みつこ', company: 'CURSOR inc.',  roles: ['Programmer'],               hue: 150,
    photo: member02, eyes: { y: 30.5, lx: 44,   rx: 56.5 } },
  { name: '発光 あおい', company: 'GLOW studio',  roles: ['Designer'],                 hue: 330,
    photo: member03, eyes: { y: 34,   lx: 43,   rx: 56 } },
  { name: '充填 ためる', company: 'Freelance',   roles: ['Motion Designer'],          hue:  40,
    photo: member04, eyes: { y: 30.5, lx: 44,   rx: 56.5 } },
  { name: '波紋 なみ',   company: 'RIPPLE',       roles: ['Art Director'],             hue: 270,
    photo: member05, eyes: { y: 31,   lx: 44,   rx: 57 } },
  { name: '接近 ちかし', company: 'Freelance',   roles: ['Programmer', 'Designer'],   hue: 190,
    photo: member06, eyes: { y: 33,   lx: 43,   rx: 56 } },
  { name: '包囲 かこむ', company: 'SIEGE works',  roles: ['Director'],                 hue:  10,
    photo: member07, eyes: { y: 32,   lx: 44,   rx: 56 } },
  { name: '囁 ささや',   company: 'whisper.co',   roles: ['Copywriter'],               hue:  90,
    photo: member08, eyes: { y: 32.5, lx: 45,   rx: 57 } },
  { name: '追従 ついこ', company: 'Freelance',   roles: ['Designer'],                 hue: 300,
    photo: member09, eyes: { y: 30.5, lx: 43,   rx: 56 } },
  { name: '射出 いずる', company: 'EJECT lab',    roles: ['Programmer'],               hue: 240,
    photo: member10, eyes: { y: 32,   lx: 44,   rx: 56 } },
];
