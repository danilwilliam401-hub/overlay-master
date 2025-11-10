import { useState } from 'react';

export default function LongTextTest() {
  const [title, setTitle] = useState("Baha'y dumating, puso'y nalunod, alaala'y sumasabit sa bawat debris. Lululutang ang pag-asa, kahit anong lakas ng agos, may darating na araw. Sa gitna ng delubyo, ang yakap mo'y santuwaryo, panangga sa lahat. Ang bawat patak ng ulan, alaala ng kahapon, paalala ng kinabukasan. Nawala ang lahat, ngunit ang puso'y nananatiling matatag, handang muling bumangon.");
  const [design, setDesign] = useState('quote3');
  const [website, setWebsite] = useState('- Lalake Po Ako');
  const [method, setMethod] = useState('GET');

  const handleTest = async () => {
    console.log('Testing with title length:', title.length);
    
    if (method === 'POST') {
      try {
        const response = await fetch('/api/bundled-font-overlay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: '',
            title: title,
            website: website,
            design: design,
            w: '1080',
            h: '1350'
          })
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } else {
          console.error('POST request failed:', response.status, response.statusText);
          const text = await response.text();
          console.error('Error details:', text);
        }
      } catch (error) {
        console.error('POST request error:', error);
      }
    } else {
      // GET method with proper URL encoding
      const params = new URLSearchParams({
        image: '',
        title: title,
        website: website,
        design: design,
        w: '1080',
        h: '1350'
      });
      const url = `/api/bundled-font-overlay?${params}`;
      console.log('GET URL length:', url.length);
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔤 Long Text Testing (Tagalog Poetry)</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          <strong>Title (Long Text): </strong><br/>
          <textarea 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', height: '120px', padding: '10px' }}
          />
        </label>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Character count: {title.length} | URL encoded length: {encodeURIComponent(title).length}
        </div>
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
            <option value="quote1">Quote 1 - Bold (Anton)</option>
            <option value="quote2">Quote 2 - Elegant (Playfair)</option>
            <option value="quote3">Quote 3 - Impact</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <strong>Method: </strong>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '200px', padding: '5px' }}
          >
            <option value="GET">GET (URL Parameters)</option>
            <option value="POST">POST (Request Body)</option>
          </select>
        </label>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          💡 Use POST for very long text to avoid URL length limits
        </div>
      </div>

      <button 
        onClick={handleTest}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🧪 Test Long Text ({method})
      </button>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>📋 URL Encoding Issues & Solutions:</h3>
        <ul>
          <li><strong>Problem:</strong> Long text with apostrophes (') causes "Invalid URL" errors</li>
          <li><strong>Solution 1:</strong> Use POST method instead of GET to avoid URL length limits</li>
          <li><strong>Solution 2:</strong> Proper URL encoding: Replace ' with %27, spaces with %20</li>
          <li><strong>Recommended:</strong> Use POST for texts longer than 200 characters</li>
        </ul>
      </div>
    </div>
  );
}