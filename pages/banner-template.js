import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { getServerSideProps as getServerSidePropsAuth } from './dashboard';
import styles from '../styles/Dashboard.module.css';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export async function getServerSideProps(context) {
  return getServerSidePropsAuth(context);
}

export default function DesignTemplateGenerator() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  
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
    image: 'https://picsum.photos/1080/1350',
    borderEnabled: false,
    borderWidth: '10',
    borderColor: '000000',
    borderInset: '0',
    logoUrl: '',
    logoPosition: 'top-center',
    logoSize: '150',
    topText: '',
    topTextPosition: 'left',
    topTextBgColor: 'FF0000',
    topTextColor: 'FFFFFF',
    topTextSize: '28',
    titleFontSize: '',
    titleAlign: 'center',
    websiteFontSize: '',
    websiteAlign: 'center'
  });

  // Load template from query parameter on mount
  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const templateId = urlParams.get('templateId');
      
      if (templateId) {
        loadTemplateById(templateId);
      }
    }
  }, [session]);

  const loadTemplateById = async (templateId) => {
    setLoadingTemplate(true);
    try {
      const response = await fetch('/api/templates/list');
      if (response.ok) {
        const data = await response.json();
        setSavedTemplates(data.templates || []);
        const template = data.templates.find(t => t.id === templateId);
        
        if (template) {
          setParams(template.parameters);
          setTemplateName(template.name);
          setGeneratedUrl(template.fullUrl);
          setSuccess(`Loaded template: ${template.name}`);
        } else {
          setError('Template not found');
        }
      }
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Failed to load template');
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Fetch saved templates
  useEffect(() => {
    if (session && !loadingTemplate) {
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

  // Debounce params to avoid too many API calls
  const debouncedParams = useDebounce(params, 800);

  // Auto-generate preview when params change
  useEffect(() => {
    if (session && debouncedParams.image) {
      generatePreview();
    }
  }, [debouncedParams, session]);

  const generatePreview = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      // Add watermark parameter for preview
      const previewParams = { ...params, watermark: 'PREVIEW - NOT FOR PRODUCTION USE' };
      const queryParams = new URLSearchParams(previewParams).toString();
      const url = `/api/v1/secure-overlay?${queryParams}`;
      
      console.log('🔗 Generating preview with watermark:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
      
      console.log('✅ Preview generated successfully with watermark');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) {
      setError('No preview image to download. Generate a preview first.');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      // Generate production image WITHOUT watermark
      const productionParams = { ...params }; // No watermark parameter
      const queryParams = new URLSearchParams(productionParams).toString();
      const url = `/api/v1/secure-overlay?${queryParams}`;
      
      console.log('📥 Downloading production image:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `banner-${params.design}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      setSuccess('✅ Image downloaded successfully!');
      console.log('✅ Download completed');
    } catch (err) {
      console.error('❌ Download error:', err);
      setError(err.message);
    } finally {
      setDownloading(false);
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
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '10px' }}>🎨 Banner Template Generator</h1>
          <p style={{ color: '#666' }}>
            Create custom design templates and get unique API URLs • Logged in as <strong>{session.user.email}</strong>
          </p>
        </div>
        <a
          href="/dashboard"
          style={{
            padding: '10px 20px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          ← Back to Dashboard
        </a>
      </div>

      {loadingTemplate && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '20px', border: '1px solid #0369a1' }}>
          <p style={{ margin: 0, color: '#0369a1' }}>⏳ Loading template...</p>
        </div>
      )}

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' }}>Font Size (px)</label>
                <input
                  type="number"
                  name="titleFontSize"
                  value={params.titleFontSize}
                  onChange={handleChange}
                  placeholder="Auto"
                  min="20"
                  max="120"
                  style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' }}>Alignment</label>
                <select
                  name="titleAlign"
                  value={params.titleAlign}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>📢 Top Label (e.g., Breaking News)</label>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Text</label>
              <input
                type="text"
                name="topText"
                value={params.topText}
                onChange={handleChange}
                placeholder="BREAKING NEWS"
                style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            {params.topText && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Position</label>
                  <select
                    name="topTextPosition"
                    value={params.topTextPosition}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' }}>BG Color</label>
                    <input
                      type="text"
                      name="topTextBgColor"
                      value={params.topTextBgColor}
                      onChange={handleChange}
                      placeholder="FF0000"
                      maxLength="6"
                      style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' }}>Text Color</label>
                    <input
                      type="text"
                      name="topTextColor"
                      value={params.topTextColor}
                      onChange={handleChange}
                      placeholder="FFFFFF"
                      maxLength="6"
                      style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' }}>Font Size</label>
                    <input
                      type="number"
                      name="topTextSize"
                      value={params.topTextSize}
                      onChange={handleChange}
                      min="12"
                      max="60"
                      style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
            )}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' }}>Font Size (px)</label>
                <input
                  type="number"
                  name="websiteFontSize"
                  value={params.websiteFontSize}
                  onChange={handleChange}
                  placeholder="Auto"
                  min="12"
                  max="60"
                  style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' }}>Alignment</label>
                <select
                  name="websiteAlign"
                  value={params.websiteAlign}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
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

          <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>🎨 Title Background</label>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Solid Color (Hex)</label>
              <input
                type="text"
                name="titleBgColor"
                value={params.titleBgColor}
                onChange={handleChange}
                placeholder="000000 (leave empty for no background)"
                maxLength="6"
                style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }}
              />
              <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '3px' }}>Single color background</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Gradient Colors (Hex)</label>
              <input
                type="text"
                name="titleBgGradient"
                value={params.titleBgGradient}
                onChange={handleChange}
                placeholder="FF0000,0000FF (overrides solid color)"
                style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }}
              />
              <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '3px' }}>Comma-separated for gradient (left to right)</small>
            </div>
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

          <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="borderEnabled"
                checked={params.borderEnabled}
                onChange={(e) => setParams({ ...params, borderEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="borderEnabled" style={{ fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>🖼️ Add Border</label>
            </div>
            
            {params.borderEnabled && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Width (px)</label>
                    <input
                      type="number"
                      name="borderWidth"
                      value={params.borderWidth}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Color (Hex)</label>
                    <input
                      type="text"
                      name="borderColor"
                      value={params.borderColor}
                      onChange={handleChange}
                      placeholder="000000"
                      maxLength="6"
                      style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Inset from Edges (px)</label>
                  <input
                    type="number"
                    name="borderInset"
                    value={params.borderInset}
                    onChange={handleChange}
                    min="0"
                    max="200"
                    placeholder="0"
                    style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <small style={{ color: '#999', fontSize: '11px', display: 'block', marginTop: '3px' }}>0 = Border at edges, &gt;0 = Inset from edges</small>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fef3f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>🏷️ Logo Image</label>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Logo URL</label>
              <input
                type="text"
                name="logoUrl"
                value={params.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            {params.logoUrl && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Position</label>
                  <select
                    name="logoPosition"
                    value={params.logoPosition}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>Size (width in px)</label>
                  <input
                    type="number"
                    name="logoSize"
                    value={params.logoSize}
                    onChange={handleChange}
                    min="50"
                    max="500"
                    style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <small style={{ color: '#999', fontSize: '11px', display: 'block', marginTop: '3px' }}>Logo maintains aspect ratio</small>
                </div>
              </div>
            )}
          </div>

          <div style={{ 
            padding: '10px 15px', 
            backgroundColor: loading ? '#fef3c7' : '#dbeafe', 
            border: `1px solid ${loading ? '#fbbf24' : '#3b82f6'}`, 
            borderRadius: '6px',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            <small style={{ color: loading ? '#92400e' : '#1e40af', fontSize: '12px', fontWeight: '600' }}>
              {loading ? '⏳ Auto-updating preview...' : '✨ Auto-preview enabled - changes update in 0.8s'}
            </small>
          </div>

          <button
            onClick={generatePreview}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
              marginBottom: '10px'
            }}
          >
            {loading ? '⏳ Generating...' : '🔄 Manual Refresh (Optional)'}
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
              
              <div style={{ 
                padding: '12px 15px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '6px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  <strong style={{ fontSize: '13px', color: '#856404' }}>Production Download</strong>
                </div>
                <small style={{ color: '#856404', fontSize: '11px', display: 'block' }}>
                  This downloads the final image without watermark and counts as an API request. Use for production/final output only.
                </small>
              </div>
              
              <button
                onClick={downloadImage}
                disabled={downloading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  opacity: downloading ? 0.6 : 1,
                  marginBottom: '15px'
                }}
              >
                {downloading ? '⏳ Downloading...' : '📥 Download Production Image'}
              </button>
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
