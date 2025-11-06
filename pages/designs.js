import Head from 'next/head';
import { useState } from 'react';

export default function Designs() {
  const [selectedDesign, setSelectedDesign] = useState('default');
  const [title, setTitle] = useState('Breaking News Today');
  const [website, setWebsite] = useState('NewsHub.com');
  const [imageUrl, setImageUrl] = useState('https://picsum.photos/800/600');

  const designs = {
    // Original 8 designs
    'default': 'Classic Dark',
    'tech': 'Tech Blue',
    'entertainment': 'Entertainment Purple', 
    'sports': 'Sports Dynamic',
    'anime': 'Anime Dark',
    'eco': 'Eco Green',
    'news': 'News Professional',
    'minimal': 'Minimal Clean',
    
    // New 15 Universal Designs
    'modern': '🎨 Modern Lifestyle',
    'bold': '⚡ Bold Impact',
    'viral': '💬 Viral Entertainment',
    'breaking': '📰 Breaking News',
    'thoughtful': '🧠 Thoughtful Quotes',
    'colorful': '🌈 Colorful Youth',
    'overlay': '📸 Photo Overlay',
    'aesthetic': '🎨 Aesthetic Style',
    'monochrome': '🖤 Monochrome Minimal',
    'vintage': '🧩 Vintage Retro',
    'luxury': '💎 Luxury Premium',
    'cinematic': '🎥 Cinematic Drama',
    'neon': '⚙️ Neon Tech',
    'inspire': '☀️ Inspirational',
    'cute': '🧁 Cute Aesthetic'
  };

  const generateUrl = (design) => {
    const params = new URLSearchParams({
      title: title,
      website: website,
      image: imageUrl,
      design: design,
      w: '1080',
      h: '600'
    });
    return `/api/bundled-font-overlay.jpg?${params.toString()}`;
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <Head>
        <title>Font Overlay Design Gallery</title>
      </Head>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
          🎨 Font Overlay Design Gallery
        </h1>
        
        {/* Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0 }}>Customize Your Overlay:</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Website:</label>
              <input 
                type="text" 
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Background Image URL:</label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Design Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '20px' 
        }}>
          {Object.entries(designs).map(([key, name]) => (
            <div key={key} style={{ 
              backgroundColor: 'white', 
              borderRadius: '10px', 
              padding: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedDesign(key)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#333',
                borderBottom: selectedDesign === key ? '3px solid #007acc' : '3px solid transparent',
                paddingBottom: '5px'
              }}>
                {name}
              </h3>
              
              <div style={{ 
                border: '2px solid #ddd', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: '#f9f9f9'
              }}>
                <img 
                  src={generateUrl(key)}
                  alt={`${name} design preview`}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block',
                    maxHeight: '300px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{ 
                  display: 'none', 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666'
                }}>
                  Loading preview...
                </div>
              </div>
              
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                <strong>Design Key:</strong> <code>{key}</code>
              </div>
              
              <div style={{ marginTop: '8px' }}>
                <button 
                  style={{
                    backgroundColor: '#007acc',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginRight: '8px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(generateUrl(key), '_blank');
                  }}
                >
                  Open Full Size
                </button>
                
                <button 
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(window.location.origin + generateUrl(key));
                    alert('URL copied to clipboard!');
                  }}
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Instructions */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginTop: '30px'
        }}>
          <h3 style={{ marginTop: 0 }}>📖 How to Use:</h3>
          <p><strong>URL Format:</strong></p>
          <code style={{ 
            display: 'block', 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            wordBreak: 'break-all'
          }}>
            /api/bundled-font-overlay.jpg?title=Your+Title&website=YourSite.com&design=tech&image=https://your-image.jpg
          </code>
          
          <p style={{ marginTop: '15px' }}><strong>Available Designs:</strong></p>
          <ul style={{ columns: 2, margin: 0 }}>
            {Object.entries(designs).map(([key, name]) => (
              <li key={key} style={{ marginBottom: '5px' }}>
                <code>{key}</code> - {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}