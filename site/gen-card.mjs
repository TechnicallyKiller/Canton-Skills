// Generates the 16:9 launch card (terminal compile-diff) → public/launch-card.png
import sharp from 'sharp';

const W = 1600, H = 900;
const MONO = "Consolas,'DejaVu Sans Mono',monospace";
const SANS = "'Segoe UI',Arial,sans-serif";

const card = (x, label, dot, lines) => {
  const w = 700, y = 300, h = 360, pad = 28;
  let body = '';
  let ly = y + 92;
  for (const [txt, color, weight] of lines) {
    body += `<text x="${x + pad}" y="${ly}" font-family="${MONO}" font-size="25" font-weight="${weight || 400}" fill="${color}" xml:space="preserve">${txt}</text>`;
    ly += 44;
  }
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#0C111B" stroke="#1B2335" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="${w}" height="46" rx="14" fill="#0E1422"/>
    <rect x="${x}" y="${y + 30}" width="${w}" height="16" fill="#0E1422"/>
    <circle cx="${x + 26}" cy="${y + 23}" r="6.5" fill="${dot}"/>
    <circle cx="${x + 46}" cy="${y + 23}" r="6.5" fill="#1B2335"/>
    <circle cx="${x + 66}" cy="${y + 23}" r="6.5" fill="#1B2335"/>
    <text x="${x + 90}" y="${y + 30}" font-family="${MONO}" font-size="19" fill="#7E8AA3">${label}</text>
    <line x1="${x}" y1="${y + 46}" x2="${x + w}" y2="${y + 46}" stroke="#1B2335" stroke-width="1.5"/>
    ${body}`;
};

const left = card(80, 'without skill — dpm build', '#FB7185', [
  ['  key (owner, num) : (Party, Text)', '#FB7185'],
  ['  maintainer key._1', '#FB7185'],
  ['$ dpm build', '#5A77A0'],
  ['✗ DsError: Contract keys.', '#FB7185'],
  ['✗ build failed          0/3', '#FB7185', 700],
]);

const right = card(820, 'with skill — dpm build', '#3DDC97', [
  ['  -- keys unsupported on', '#5A77A0'],
  ['  -- Canton 3.x', '#5A77A0'],
  ['  accountNumber : Text', '#3DDC97'],
  ['$ dpm build', '#5A77A0'],
  ['✓ RESULT_BUILD_OK      3/3', '#3DDC97', 700],
]);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1.4" fill="rgba(120,140,190,0.10)"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#07090F"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect x="0" y="0" width="${W}" height="3" fill="#4F7DFF" opacity="0.55"/>

  <text x="160" y="104" font-family="${SANS}" font-size="30" font-weight="700" fill="#E6EAF2">canton-dev-skills</text>
  <text x="${W - 80}" y="104" text-anchor="end" font-family="${MONO}" font-size="21" fill="#7E8AA3">verified, not vibes</text>

  <text x="80" y="205" font-family="${SANS}" font-size="48" font-weight="700" fill="#E6EAF2">AI gets Canton wrong by default.</text>
  <text x="80" y="250" font-family="${SANS}" font-size="26" fill="#8A96B0">Same prompt to Sonnet — with the skill it compiles, without it doesn’t.</text>

  ${left}
  ${right}

  <text x="80" y="745" font-family="${SANS}" font-size="40" font-weight="700"><tspan fill="#FB7185">0/3</tspan><tspan fill="#7E8AA3">  →  </tspan><tspan fill="#3DDC97">3/3 compiled</tspan></text>
  <text x="80" y="800" font-family="${MONO}" font-size="24" fill="#4F7DFF">$ npx skills add TechnicallyKiller/Canton-Skills</text>
  <text x="${W - 80}" y="795" text-anchor="end" font-family="${MONO}" font-size="26" fill="#4F7DFF">canton-dev-skills.netlify.app</text>
</svg>`;

const logo = await sharp('src/assets/logo-source.png').resize(72, 72).png().toBuffer();
await sharp(Buffer.from(svg))
  .composite([{ input: logo, top: 52, left: 76 }])
  .png()
  .toFile('public/launch-card.png');
console.log('wrote public/launch-card.png');
