import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default async function handler(req, res) {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'BebasNeue-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('font missing');
  const fontB64 = fs.readFileSync(fontPath).toString('base64');

  // Try multiple format declarations - librsvg is picky
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
  <defs>
    <style type="text/css">
      @font-face { 
        font-family: 'BebasNeue'; 
        src: url('data:application/x-font-ttf;base64,${fontB64}') format('truetype'),
             url('data:font/ttf;base64,${fontB64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      text { font-family: 'BebasNeue', 'Bebas Neue', sans-serif !important; }
      tspan { font-family: 'BebasNeue', 'Bebas Neue', sans-serif !important; font-style: normal; font-weight: 400; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#222"/>
  <text x="20" y="80" font-family="BebasNeue" font-size="64" fill="#fff">
    <tspan font-family="BebasNeue" fill="#fff">Hello</tspan>
    <tspan font-family="BebasNeue" fill="#ff0"> World</tspan>
  </text>
</svg>`;

  console.log('svg length', svg.length);
  console.log('sharp versions', sharp.versions);

  try {
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader('Content-Type','application/json');
    res.status(200).send(JSON.stringify({
      svg,
      pngBase64: png.toString('base64'),
      sharpVersions: sharp.versions
    }));
  } catch (err) {
    console.error('render error', err);
    res.status(500).send({ error: String(err) });
  }
}
