import { useState, useRef } from 'react';

export default function BinaryDataTest() {
  const [title, setTitle] = useState('Binary Data Test');
  const [website, setWebsite] = useState('TestSite.com');
  const [design, setDesign] = useState('tech');
  const [imageData, setImageData] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  const designs = {
    'default': 'Classic Dark',
    'tech': 'Tech Blue',
    'entertainment': 'Entertainment Purple',
    'sports': 'Sports Dynamic',
    'anime': 'Anime Dark',
    'eco': 'Eco Green',
    'news': 'News Professional',
    'minimal': 'Minimal Clean',
    'quote1': 'Bold Quote Overlay',
    'quote2': 'Elegant Quote Overlay',
    'quote3': 'Impact Quote Overlay',
    'blank': 'Transparent Text Only'
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      setImageData(base64Data);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageData('');
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTest = () => {
    if (!imageData) {
      alert('Please upload an image first');
      return;
    }

    console.log('Testing with binary data length:', imageData.length);
    
    // For GET method with binary data, we need to use POST instead due to URL length limits
    const testUrl = `/api/bundled-font-overlay`;
    
    // Create form data for POST request
    const formData = new FormData();
    formData.append('imageData', imageData);
    formData.append('title', title);
    formData.append('website', website);
    formData.append('design', design);
    formData.append('w', '1080');
    formData.append('h', '1350');

    // Use POST method for binary data
    fetch(testUrl, {
      method: 'POST',
      body: JSON.stringify({
        imageData: imageData,
        title: title,
        website: website,
        design: design,
        w: '1080',
        h: '1350'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        return response.blob();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    })
    .catch(error => {
      console.error('Binary data test error:', error);
      alert('Error: ' + error.message);
    });
  };

  const generateSampleBase64 = () => {
    // Generate a simple 100x100 colored square as base64
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(0.5, '#4ECDC4');
    gradient.addColorStop(1, '#45B7D1');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);
    
    // Add some text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE', 50, 35);
    ctx.fillText('IMAGE', 50, 50);
    ctx.fillText('DATA', 50, 65);
    
    const base64Data = canvas.toDataURL('image/png');
    setImageData(base64Data);
    setUploadedFileName('sample-generated.png');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔬 Binary Data Testing (imageData Parameter)</h1>
      <p>Test the new <code>imageData</code> parameter that accepts base64-encoded binary image data directly!</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>📁 Upload Image File</h3>
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          style={{ marginBottom: '10px' }}
        />
        <br/>
        <button 
          onClick={generateSampleBase64}
          style={{ 
            padding: '8px 16px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🎨 Generate Sample Image
        </button>
        
        {uploadedFileName && (
          <span style={{ color: '#28a745', fontWeight: 'bold' }}>
            ✅ {uploadedFileName}
          </span>
        )}
        
        {imageData && (
          <button 
            onClick={clearImage}
            style={{ 
              padding: '8px 16px', 
              marginLeft: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear
          </button>
        )}
      </div>

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

      <div style={{ marginBottom: '20px' }}>
        <label>
          <strong>Design: </strong>
          <select 
            value={design} 
            onChange={(e) => setDesign(e.target.value)}
            style={{ width: '300px', padding: '5px' }}
          >
            {Object.entries(designs).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <button 
        onClick={handleTest}
        disabled={!imageData}
        style={{ 
          padding: '12px 24px', 
          fontSize: '16px', 
          backgroundColor: imageData ? '#007bff' : '#6c757d',
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: imageData ? 'pointer' : 'not-allowed'
        }}
      >
        🧪 Test Binary Data Overlay
      </button>

      {imageData && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <h3>📊 Binary Data Info:</h3>
          <ul>
            <li><strong>Data Length:</strong> {imageData.length} characters</li>
            <li><strong>File Name:</strong> {uploadedFileName}</li>
            <li><strong>Data Type:</strong> {imageData.startsWith('data:') ? 'Data URI' : 'Raw Base64'}</li>
            <li><strong>Estimated Size:</strong> {Math.round((imageData.length * 3/4) / 1024)} KB</li>
          </ul>
          
          <div style={{ marginTop: '15px' }}>
            <strong>Preview:</strong><br/>
            <img 
              src={imageData} 
              alt="Binary data preview" 
              style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc', marginTop: '5px' }}
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
        <h3>💡 How Binary Data Parameter Works:</h3>
        <ul>
          <li><strong>Parameter Name:</strong> <code>imageData</code></li>
          <li><strong>Format:</strong> Base64-encoded image data</li>
          <li><strong>Supports:</strong> Data URI format (<code>data:image/jpeg;base64,...</code>) or raw base64</li>
          <li><strong>Method:</strong> POST recommended for large binary data</li>
          <li><strong>Priority:</strong> imageData &gt; image URL &gt; blank background</li>
        </ul>
        
        <h4>📝 API Example:</h4>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', fontSize: '12px', overflow: 'auto' }}>
{`POST /api/bundled-font-overlay
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "title": "Binary Data Test",
  "website": "TestSite.com", 
  "design": "tech",
  "w": "1080",
  "h": "1350"
}`}
        </pre>
      </div>
    </div>
  );
}