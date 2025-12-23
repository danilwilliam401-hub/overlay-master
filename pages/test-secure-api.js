import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { getServerSideProps as getServerSidePropsAuth } from './dashboard';
import styles from '../styles/Dashboard.module.css';

export async function getServerSideProps(context) {
  return getServerSidePropsAuth(context);
}

export default function DesignTemplateGenerator() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [generatedUrl, setGeneratedUrl] = useState('');
  
  const [params, setParams] = useState({
    title: 'AMAZING DEALS ON GOLD JEWELRY',
    website: 'SHOPNOW.COM',
    design: 'bebas',
    w: '1080',
    h: '1350',
    hl: 'FFD700,FF8C00,00FFFF',
    wc: 'FF0000',
    keywords: 'AMAZING,GOLD,DEALS',
    titleColor: '',
    titleBgColor: '',
    titleBgGradient: '',
    image: 'https://picsum.photos/1080/1350'
  });

  // Fetch saved templates on mount
  useEffect(() => {
    if (session) {
      fetchTemplates();
    }
  }, [session]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates/list');
      if (response.ok) {
        const data = await response.json();
        setSavedTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const generatePreview = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `/api/v1/secure-overlay?${queryParams}`;
      
      console.log('🔗 Generating preview:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
      
      console.log('✅ Preview generated successfully');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName || templateName.length < 3) {
      setError('Template name must be at least 3 characters');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    setGeneratedUrl('');

    try {
      console.log('📤 Saving template:', { name: templateName, design: params.design });
      
      const response = await fetch('/api/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          design: params.design,
          parameters: params
        })
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to save template');
      }

      const data = await response.json();
      console.log('✅ Success data:', data);
      
      setSuccess(`✅ Template "${data.template.name}" saved successfully!`);
      setGeneratedUrl(data.template.fullUrl);
      setTemplateName('');
      
      // Refresh templates list
      await fetchTemplates();
      
      console.log('✅ Template created:', data.template);
    } catch (err) {
      console.error('❌ Error saving template:', err);
      setError(err.message || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id, name) => {
    if (!confirm(`Delete template "${name}"?`)) return;

    try {
      const response = await fetch(`/api/templates/delete?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess(`Template "${name}" deleted`);
        await fetchTemplates();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete template');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadTemplate = (template) => {
    setParams(template.parameters);
    setTemplateName(template.name);
    setGeneratedUrl(template.fullUrl);
    setSuccess(`Loaded template: ${template.name}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('URL copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (status === 'loading') {
    return <div className={styles.container} style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!session) {
    return (
      <div className={styles.container} style={{ padding: '80px', textAlign: 'center' }}>
        <h1>🔒 Design Template Generator</h1>
        <p style={{ marginTop: '20px', marginBottom: '30px', color: '#666' }}>
          Please sign in to create and save design templates
        </p>
        <button
          onClick={() => signIn()}
          style={{
            padding: '12px 32px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '10px' }}>🎨 Design Template Generator</h1>
        <p style={{ color: '#666' }}>
          Create custom design templates and get unique API URLs • Logged in as <strong>{session.user.email}</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
        {/* Left Column - Design Parameters */}
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>📝 Design Parameters</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Title</label>
            <input
              type="text"
              name="title"
              value={params.title}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Website</label>
            <input
              type="text"
              name="website"
              value={params.website}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Design Theme</label>
            <select
              name="design"
              value={params.design}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="default">Breaking News Boldness</option>
              <option value="tech">Professional Editorial</option>
              <option value="entertainment">Viral & Loud</option>
              <option value="antonBlack">Anton Black</option>
              <option value="bebas">Bebas Black Gradient</option>
              <option value="sports">Impact Headlines</option>
              <option value="anime">Friendly & Trustworthy</option>
              <option value="modern">Modern Authority</option>
              <option value="bold">Stylish Credibility</option>
              <option value="luxury">Luxury Burgundy</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Width</label>
              <input
                type="number"
                name="w"
                value={params.w}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Height</label>
              <input
                type="number"
                name="h"
                value={params.h}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Keywords</label>
            <input
              type="text"
              name="keywords"
              value={params.keywords}
              onChange={handleChange}
              placeholder="SALE,NEW,AMAZING"
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <small style={{ color: '#999', fontSize: '12px' }}>Comma-separated</small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Highlight Colors</label>
            <input
              type="text"
              name="hl"
              value={params.hl}
              onChange={handleChange}
              placeholder="FFD700,FF8C00,00FFFF"
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <small style={{ color: '#999', fontSize: '12px' }}>For keywords</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Website Color</label>
              <input
                type="text"
                name="wc"
                value={params.wc}
                onChange={handleChange}
                placeholder="FF0000"
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Title Color</label>
              <input
                type="text"
                name="titleColor"
                value={params.titleColor}
                onChange={handleChange}
                placeholder="FFFFFF"
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Title BG Color</label>
            <input
              type="text"
              name="titleBgColor"
              value={params.titleBgColor}
              onChange={handleChange}
              placeholder="000000"
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Title BG Gradient</label>
            <input
              type="text"
              name="titleBgGradient"
              value={params.titleBgGradient}
              onChange={handleChange}
              placeholder="FF0000,0000FF"
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Image URL</label>
            <input
              type="text"
              name="image"
              value={params.image}
              onChange={handleChange}
              placeholder="https://picsum.photos/1080/1350"
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <button
            onClick={generatePreview}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
              marginBottom: '10px'
            }}
          >
            {loading ? '⏳ Generating...' : '🔄 Generate Preview'}
          </button>
        </div>

        {/* Middle Column - Preview & Save */}
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>👁️ Preview & Save</h2>
          
          {imageUrl ? (
            <div>
              <img 
                src={imageUrl} 
                alt="Generated overlay" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  marginBottom: '15px'
                }} 
              />
            </div>
          ) : (
            <div style={{
              width: '100%',
              aspectRatio: '1080/1350',
              backgroundColor: '#f5f5f5',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              marginBottom: '15px'
            }}>
              {loading ? '⏳ Generating...' : '📷 Preview will appear here'}
            </div>
          )}

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f0f9ff', 
            border: '2px solid #0070f3', 
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>💾 Save as Template</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name (e.g., Gold Jewelry Ad)"
              style={{ 
                width: '100%', 
                padding: '10px', 
                fontSize: '14px', 
                border: '1px solid #0070f3', 
                borderRadius: '4px',
                marginBottom: '10px'
              }}
            />
            <button
              onClick={saveTemplate}
              disabled={saving || !templateName}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (saving || !templateName) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                opacity: (saving || !templateName) ? 0.6 : 1
              }}
            >
              {saving ? '💾 Saving...' : '💾 Save Template'}
            </button>
          </div>

          {generatedUrl && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#d1fae5', 
              border: '2px solid #10b981', 
              borderRadius: '8px'
            }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#047857' }}>
                🔗 Your Unique API URL
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  style={{ 
                    flex: 1,
                    padding: '8px', 
                    fontSize: '12px', 
                    border: '1px solid #10b981', 
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(generatedUrl)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📋 Copy
                </button>
              </div>
              <small style={{ display: 'block', marginTop: '8px', color: '#047857', fontSize: '11px' }}>
                Use this URL in Make.com, Zapier, n8n, or any HTTP request tool
              </small>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              color: '#c00',
              fontSize: '14px'
            }}>
              ❌ {error}
            </div>
          )}

          {success && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#047857',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}
        </div>

        {/* Right Column - Saved Templates */}
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>📚 My Templates ({savedTemplates.length})</h2>
          
          {savedTemplates.length === 0 ? (
            <div style={{
              padding: '40px',
              backgroundColor: '#f5f5f5',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#999'
            }}>
              <p style={{ margin: 0 }}>No templates saved yet</p>
              <small>Create your first template!</small>
            </div>
          ) : (
            <div style={{ 
              maxHeight: '800px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {savedTemplates.map(template => (
                <div 
                  key={template.id} 
                  style={{ 
                    padding: '15px', 
                    backgroundColor: '#fff', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700' }}>{template.name}</h3>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                        Design: <strong>{template.design}</strong>
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '4px', 
                    marginBottom: '10px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    color: '#374151'
                  }}>
                    {template.apiUrl}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => loadTemplate(template)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => copyToClipboard(template.fullUrl)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      📋 Copy URL
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id, template.name)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
