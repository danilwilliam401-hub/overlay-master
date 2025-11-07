import { useState } from 'react';

export default function FontTest() {
  const [design, setDesign] = useState('aesthetic');
  const [title, setTitle] = useState('Font Test Example');
  const [website, setWebsite] = useState('TestSite.com');

  const designs = {
    'default': 'Breaking News Boldness (Bebas Neue)',
    'tech': 'Professional Editorial (Oswald)',
    'entertainment': 'Viral & Loud (Anton)',
    'sports': 'Impact Headlines (Impact)',
    'anime': 'Friendly & Trustworthy (Poppins)',
    'eco': 'Smart & Minimal (League Spartan)',
    'news': 'Breaking News Crimson (Bebas Neue)',
    'minimal': 'Editorial Prestige (Playfair Display)',
    'modern': 'Modern Authority (Montserrat)',
    'bold': 'Stylish Credibility (Raleway)',
    'viral': 'Versatile & Balanced (Roboto Condensed)',
    'breaking': 'Breaking News Alert (Bebas Neue)',
    'thoughtful': 'Thoughtful Deep Purple (Montserrat)',
    'colorful': 'Colorful Amber (Anton)',
    'overlay': 'Photo Overlay Dark Gray (Roboto Condensed)',
    'aesthetic': 'Aesthetic Sea Green (Poppins)',
    'monochrome': 'Monochrome Graphite (Impact)',
    'vintage': 'Vintage Copper (Playfair Display)',
    'luxury': 'Luxury Burgundy (Playfair Display)',
    'cinematic': 'Cinematic Steel Blue (Anton)',
    'neon': 'Neon Indigo (Bebas Neue)',
    'inspire': 'Inspirational Olive (League Spartan)',
    'cute': 'Cute Royal Violet (Poppins)',
    'warmbrown': 'Warm Espresso (Montserrat)',
    'pokemon': 'Pokémon Wine (Impact)'
  };

  const apiUrl = `/api/bundled-font-overlay?image=https://picsum.photos/800/600&title=${encodeURIComponent(title)}&website=${encodeURIComponent(website)}&design=${design}&w=1080&h=1350`;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔤 Font Testing Dashboard</h1>
      <p>Test your new fonts to verify they're properly applied!</p>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Title: </strong>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '300px', padding: '5px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Website: </strong>
            <input 
              type="text" 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)}
              style={{ width: '300px', padding: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Design: </strong>
            <select 
              value={design} 
              onChange={(e) => setDesign(e.target.value)}
              style={{ width: '300px', padding: '5px' }}
            >
              {Object.entries(designs).map(([key, name]) => (
                <option key={key} value={key}>{key} - {name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>API URL:</strong>
        <br />
        <code style={{ backgroundColor: '#f5f5f5', padding: '5px', fontSize: '12px', wordBreak: 'break-all' }}>
          {apiUrl}
        </code>
      </div>

      <div style={{ border: '2px solid #ddd', padding: '10px', maxWidth: '800px' }}>
        <h3>Generated Image Preview:</h3>
        <img 
          src={apiUrl} 
          alt="Font test preview" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            border: '1px solid #ccc'
          }}
          onError={(e) => {
            e.target.alt = "Error loading image. Check console logs.";
            e.target.style.background = "#f0f0f0";
            e.target.style.color = "#666";
            e.target.style.textAlign = "center";
            e.target.style.padding = "20px";
          }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>🎯 All 25 Font Issues Fixed:</h3>
        <ul>
          <li>✅ Added missing fontFamily to 'aesthetic' design (now uses Poppins)</li>
          <li>✅ Added missing fontFamily to 'thoughtful' design (now uses Montserrat)</li>
          <li>✅ Added missing fontFamily to 'colorful' design (now uses Anton)</li>
          <li>✅ Added missing fontFamily to 'overlay' design (now uses Roboto Condensed)</li>
          <li>✅ Added missing fontFamily to 'monochrome' design (now uses Impact)</li>
          <li>✅ Added missing fontFamily to 'vintage' design (now uses Playfair Display)</li>
          <li>✅ Added missing fontFamily to 'luxury' design (now uses Playfair Display)</li>
          <li>✅ Added missing fontFamily to 'cinematic' design (now uses Anton)</li>
          <li>✅ Added missing fontFamily to 'neon' design (now uses Bebas Neue)</li>
          <li>✅ Added missing fontFamily to 'inspire' design (now uses League Spartan)</li>
          <li>✅ Added missing fontFamily to 'cute' design (now uses Poppins)</li>
          <li>✅ Added missing fontFamily to 'warmbrown' design (now uses Montserrat)</li>
          <li>✅ Added missing fontFamily to 'pokemon' design (now uses Impact)</li>
          <li>✅ Fixed duplicate CSS filter rule</li>
          <li>🎉 <strong>All 25 designs now have proper font families assigned!</strong></li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>🔤 Available Fonts:</h3>
        <ul>
          <li><strong>Noto Sans</strong> (Regular & Bold)</li>
          <li><strong>Inter</strong> (Regular & Bold)</li>
          <li><strong>Bebas Neue</strong> (Regular)</li>
          <li><strong>Anton</strong> (Regular)</li>
          <li><strong>Impact</strong> (Regular)</li>
          <li><strong>Oswald</strong> (Bold)</li>
          <li><strong>Montserrat</strong> (ExtraBold)</li>
          <li><strong>League Spartan</strong> (Bold)</li>
          <li><strong>Raleway</strong> (Heavy)</li>
          <li><strong>Roboto Condensed</strong> (Bold)</li>
          <li><strong>Poppins</strong> (ExtraBold)</li>
          <li><strong>Playfair Display</strong> (Black)</li>
        </ul>
      </div>
    </div>
  );
}