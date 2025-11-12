import { useState } from 'react';

export default function QuoteTest() {
  const [design, setDesign] = useState('quote1');
  const [title, setTitle] = useState('The only way to do great work is to love what you do');
  const [website, setWebsite] = useState('Steve Jobs');
  const [refreshKey, setRefreshKey] = useState(Date.now()); // Add refresh key for cache busting

  const quoteDesigns = {
    'quote1': 'Bold Quote Overlay (Anton) - Pure black background',
    'quote2': 'Elegant Quote Overlay (Playfair Display) - Dark charcoal',
    'quote3': 'Impact Quote Overlay (Impact) - Gradient black'
  };

  const inspirationalQuotes = [
    "The only way to do great work is to love what you do",
    "Your dreams don't have an expiration date",
    "Success is not final, failure is not fatal",
    "Believe you can and you're halfway there",
    "The future belongs to those who believe in the beauty of their dreams",
    "It always seems impossible until it's done",
    "Don't watch the clock; do what it does. Keep going",
    "The only limit to our realization of tomorrow will be our doubts of today"
  ];

  const authors = [
    "Steve Jobs", "Unknown", "Winston Churchill", "Theodore Roosevelt", 
    "Eleanor Roosevelt", "Nelson Mandela", "Sam Levenson", "Franklin D. Roosevelt"
  ];

  const tagalogQuotes = [
    "Ang taong walang pangarap ay parang barko na walang direksyon",
    "Huwag kang susuko, kahit gaano pa kahirap ang buhay",
    "Ang tagumpay ay nagsisimula sa pag-asa at determinasyon",
    "Kapag may tiyaga, may nilaga",
    "Ang tunay na lakas ay nagmumula sa loob",
    "Walang imposible sa taong may pangarap at sipag",
    "Ang bawat pagsubok ay pagkakataon upang lumago",
    "Magtiwala sa proseso, ang tagumpay ay darating",
    "Huwag matakot sa pagkakamali, ito ay bahagi ng pag-aaral",
    "Ang iyong kinabukasan ay nabubuo ng iyong mga desisyon ngayon"
  ];

  const tagalogAuthors = [
    "Karunungang Pilipino", "Kasabihan", "Inspirasyon", "Karunungan",
    "Pag-asa", "Sipag at Tiyaga", "Karanasan", "Positibong Pag-iisip",
    "Aral ng Buhay", "Pangarap"
  ];

  const apiUrl = `/api/bundled-font-overlay?image=https://picsum.photos/800/600&title=${encodeURIComponent(title)}&website=${encodeURIComponent(website)}&design=${design}&w=1080&h=1350&_t=${refreshKey}`;

  const loadRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    setTitle(inspirationalQuotes[randomIndex]);
    setWebsite(authors[randomIndex]);
    setRefreshKey(Date.now()); // Update refresh key to bust cache
  };

  const loadRandomTagalogQuote = () => {
    const randomIndex = Math.floor(Math.random() * tagalogQuotes.length);
    setTitle(tagalogQuotes[randomIndex]);
    setWebsite(tagalogAuthors[randomIndex]);
    setRefreshKey(Date.now()); // Update refresh key to bust cache
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>🎯 Quote Overlay Design Testing</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Test the new quote overlay designs that center text on the entire image with black backgrounds
      </p>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>🎨 Design Controls</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Quote Text:
              </label>
              <textarea 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '80px', 
                  padding: '10px', 
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Enter your inspirational quote..."
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Author/Source:
              </label>
              <input 
                type="text" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
                placeholder="Author or source name..."
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
              Quote Design Style:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {Object.entries(quoteDesigns).map(([key, name]) => (
                <label key={key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '10px',
                  border: design === key ? '2px solid #007cba' : '2px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: design === key ? '#f0f8ff' : 'white',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    value={key} 
                    checked={design === key}
                    onChange={(e) => setDesign(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '13px' }}>{name}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={loadRandomQuote}
              style={{
                backgroundColor: '#007cba',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              🎲 Load Random Inspirational Quote
            </button>

            <button 
              onClick={loadRandomTagalogQuote}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              🇵🇭 Mag-load ng Random na Inspirational Quote Tagalog
            </button>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>📸 Generated Quote Image</h3>
          
          <div style={{ 
            border: '3px solid #ddd', 
            borderRadius: '10px', 
            overflow: 'hidden',
            backgroundColor: '#f8f8f8',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={apiUrl} 
              alt="Quote overlay preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '600px',
                height: 'auto',
                borderRadius: '5px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onError={(e) => {
                e.target.alt = "⚠️ Error loading image. Check console logs.";
                e.target.style.background = "#ffe6e6";
                e.target.style.color = "#d63384";
                e.target.style.textAlign = "center";
                e.target.style.padding = "40px";
                e.target.style.border = "2px dashed #d63384";
              }}
            />
          </div>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <strong>API URL:</strong>
            <br />
            <code style={{ 
              fontSize: '11px', 
              wordBreak: 'break-all',
              backgroundColor: 'white',
              padding: '5px',
              borderRadius: '3px',
              border: '1px solid #ddd',
              display: 'block',
              marginTop: '5px'
            }}>
              {apiUrl}
            </code>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333' }}>✨ Quote Design Features</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>🎯 Centered Text:</strong> Text is positioned in the center of the image instead of bottom</li>
            <li><strong>🖤 Full Image Overlay:</strong> Black/dark background covers the entire image</li>
            <li><strong>🔤 Bold Typography:</strong> Uses the boldest fonts (Anton, Playfair Display, Impact)</li>
            <li><strong>📱 Perfect for Social Media:</strong> Great for Instagram quotes, motivational posts</li>
            <li><strong>🎨 Three Variations:</strong> 
              <ul style={{ marginTop: '8px' }}>
                <li><code>quote1</code>: Pure black background with Anton font (most bold)</li>
                <li><code>quote2</code>: Dark charcoal with elegant Playfair Display</li>
                <li><code>quote3</code>: Gradient black with Impact font for maximum impact</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}