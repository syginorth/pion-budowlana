// Generates the flat drawings of Pion's (sample) projects: elevations and plans.
// Run: node tools/drawings.mjs  → writes assets/drawings/*.svg
import { mkdirSync, writeFileSync } from 'node:fs';

const C = { ground: '#ecf0f2', ink: '#1f3038', brick: '#9b4a33', mortar: '#c98a72', glass: '#2b434d', frame: '#f7f9fa', roof: '#1f3038', soil: '#5d6b72', yellow: '#f2c300' };
const W = 1046, H = 600;
mkdirSync('assets/drawings', { recursive: true });

const bricks = (id) => `<pattern id="${id}" width="24" height="12" patternUnits="userSpaceOnUse">
  <rect width="24" height="12" fill="${C.mortar}"/>
  <rect x="0" y="0" width="22.5" height="5" fill="${C.brick}"/>
  <rect x="-12" y="6" width="22.5" height="5" fill="${C.brick}"/><rect x="12" y="6" width="22.5" height="5" fill="${C.brick}"/>
</pattern>`;

const win = (x, y, w, h, bars = true) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.frame}"/>
<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="${C.glass}"/>
${bars ? `<rect x="${x + w / 2 - 2}" y="${y + 5}" width="4" height="${h - 10}" fill="${C.frame}"/>` : ''}`;

const svg = (body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}"><defs>${bricks('b')}</defs><rect width="${W}" height="${H}" fill="${C.ground}"/>${body}</svg>`;

// 1. Brick house, gable roof (Nowosolna)
{
  let b = `<rect x="0" y="520" width="${W}" height="80" fill="${C.soil}"/>`;
  b += `<polygon points="250,250 523,90 796,250" fill="${C.roof}"/>`;
  b += `<rect x="270" y="250" width="506" height="270" fill="url(#b)"/>`;
  b += `<rect x="740" y="60" width="34" height="150" fill="url(#b)"/>`;
  b += win(310, 290, 90, 120) + win(646, 290, 90, 120) + win(478, 140, 90, 70);
  b += `<rect x="478" y="380" width="90" height="140" fill="${C.ink}"/><rect x="548" y="446" width="8" height="8" fill="${C.yellow}"/>`;
  b += `<rect x="440" y="370" width="166" height="10" fill="${C.ink}"/>`;
  writeFileSync('assets/drawings/nowosolna-elewacja.svg', svg(b, 'Rysunek elewacji: dom z cegły z dwuspadowym dachem'));
}
// 1b. plan
{
  let b = `<g fill="${C.ink}">`;
  const wall = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  b += wall(220, 80, 606, 18) + wall(220, 502, 606, 18) + wall(220, 80, 18, 440) + wall(808, 80, 18, 440);
  b += wall(500, 98, 12, 220) + wall(500, 390, 12, 112) + wall(238, 300, 160, 12) + wall(640, 280, 168, 12) + wall(640, 280, 12, 120);
  b += `</g><g fill="${C.ground}">${[[300, 80, 110, 18], [600, 80, 140, 18], [300, 502, 80, 18], [470, 502, 70, 18], [808, 160, 18, 90], [220, 360, 18, 80]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</g>`;
  b += `<rect x="652" y="292" width="156" height="210" fill="${C.mortar}" opacity=".35"/>`;
  b += `<g font-family="Libre Franklin, Arial, sans-serif" font-weight="700" font-size="22" fill="${C.ink}"><text x="280" y="200">Salon 38 m²</text><text x="560" y="200">Kuchnia 16 m²</text><text x="270" y="420">Pokój 14 m²</text><text x="660" y="420">Łazienka</text><text x="540" y="460">Hol</text></g>`;
  writeFileSync('assets/drawings/nowosolna-rzut.svg', svg(b, 'Rzut parteru domu w Nowosolnej, 142 m²'));
}
// 2. Tenement, four storeys (ul. Wschodnia)
{
  let b = `<rect x="0" y="560" width="${W}" height="40" fill="${C.soil}"/>`;
  b += `<rect x="60" y="40" width="926" height="520" fill="url(#b)"/>`;
  b += `<rect x="60" y="40" width="926" height="26" fill="${C.ink}"/>`;
  for (let f = 0; f < 4; f++) for (let i = 0; i < 7; i++) {
    const x = 110 + i * 126, y = 96 + f * 112;
    b += win(x, y, 66, 84);
    b += `<rect x="${x - 8}" y="${y - 12}" width="82" height="8" fill="${C.mortar}"/>`;
  }
  b += `<rect x="60" y="512" width="926" height="48" fill="${C.mortar}"/>`;
  b += `<rect x="486" y="448" width="74" height="112" fill="${C.ink}"/>`;
  b += `<rect x="60" y="40" width="926" height="520" fill="none"/>`;
  b += `<rect x="40" y="30" width="16" height="530" fill="${C.yellow}"/><rect x="990" y="30" width="16" height="530" fill="${C.yellow}"/>`;
  for (let k = 0; k < 6; k++) b += `<rect x="40" y="${60 + k * 90}" width="966" height="10" fill="${C.yellow}" opacity=".9"/>`;
  writeFileSync('assets/drawings/wschodnia-elewacja.svg', svg(b, 'Rysunek elewacji kamienicy w rusztowaniu, cztery kondygnacje'));
}
// 2b. section of a floor: wooden beams replaced with steel
{
  let b = `<rect x="80" y="120" width="40" height="400" fill="url(#b)"/><rect x="926" y="120" width="40" height="400" fill="url(#b)"/>`;
  b += `<rect x="120" y="290" width="806" height="22" fill="${C.ink}"/>`;
  for (let i = 0; i < 14; i++) b += `<rect x="${140 + i * 56}" y="312" width="22" height="40" fill="${C.soil}"/>`;
  b += `<rect x="120" y="268" width="806" height="22" fill="${C.mortar}"/>`;
  b += `<rect x="120" y="352" width="806" height="14" fill="${C.frame}"/>`;
  b += `<g font-family="Libre Franklin, Arial, sans-serif" font-weight="700" font-size="24" fill="${C.ink}"><text x="140" y="240">Nowy strop: belki stalowe co 56 cm</text><text x="140" y="420">Mur z cegły pełnej, 51 cm</text></g>`;
  writeFileSync('assets/drawings/wschodnia-przekroj.svg', svg(b, 'Przekrój stropu kamienicy: nowe belki stalowe w ceglanym murze'));
}
// 3. Semi-detached pair, flat roofs (Łagiewniki)
{
  let b = `<rect x="0" y="520" width="${W}" height="80" fill="${C.soil}"/>`;
  b += `<rect x="130" y="180" width="390" height="340" fill="url(#b)"/><rect x="526" y="180" width="390" height="340" fill="${C.frame}"/>`;
  b += `<rect x="526" y="180" width="390" height="340" fill="url(#b)" opacity=".35"/>`;
  b += `<rect x="110" y="160" width="826" height="24" fill="${C.ink}"/><rect x="520" y="160" width="6" height="360" fill="${C.ink}"/>`;
  b += win(180, 230, 140, 110) + win(370, 230, 100, 110) + win(576, 230, 100, 110) + win(726, 230, 140, 110);
  b += `<rect x="180" y="400" width="80" height="120" fill="${C.ink}"/><rect x="786" y="400" width="80" height="120" fill="${C.ink}"/>`;
  b += win(310, 400, 160, 90, false) + win(576, 400, 160, 90, false);
  writeFileSync('assets/drawings/lagiewniki-elewacja.svg', svg(b, 'Rysunek elewacji domu w zabudowie bliźniaczej z płaskim dachem'));
}
console.log('drawings written');
