// メンバーカードのデータ(参考: Nauts ホバー大喜利 のメンバー一覧レイアウト)
// 各カードから「分身カーソル」が出てきて、あなたを hover しにいきます。
import member01 from './images/member01.webp';
import member02 from './images/member02.webp';

// photo 付きカードは、目(eyes)の座標にカーソル追従の瞳を重ねる。
// x/y はサムネ(4:3 で cover 表示)に対する % 位置。ズレたら微調整可。
export const cards = [
  { name: '逆 ホバ太',   company: 'Freelance',      roles: ['Art Director', 'Designer'], hue: 210,
    photo: member01, eyes: { y: 34.5, lx: 42.5, rx: 55 } },
  { name: '追尾 みつこ', company: 'CURSOR inc.',     roles: ['Programmer'],               hue: 150,
    photo: member02, eyes: { y: 30.5, lx: 44, rx: 56.5 } },
  { name: '発光 あおい', company: 'GLOW studio',     roles: ['Designer'],                 hue: 330 },
  { name: '充填 ためる', company: 'Freelance',      roles: ['Motion Designer'],          hue:  40 },
  { name: '波紋 なみ',   company: 'RIPPLE',          roles: ['Art Director'],             hue: 270 },
  { name: '接近 ちかし', company: 'Freelance',      roles: ['Programmer', 'Designer'],   hue: 190 },
  { name: '包囲 かこむ', company: 'SIEGE works',     roles: ['Director'],                 hue:  10 },
  { name: '囁 ささや',   company: 'whisper.co',      roles: ['Copywriter'],               hue:  90 },
  { name: '追従 ついこ', company: 'Freelance',      roles: ['Designer'],                 hue: 300 },
  { name: '射出 いずる', company: 'EJECT lab',       roles: ['Programmer'],               hue: 240 },
];
