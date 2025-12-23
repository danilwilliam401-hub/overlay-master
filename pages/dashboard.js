import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import styles from '../styles/Dashboard.module.css';

const prisma = new PrismaClient();

/**
 * Dashboard Page - Server-Side Rendered
 * 
 * Features:
 * - User profile display with avatar and stats
 * - API key management (create, list, revoke, copy)
 * - Usage metrics and charts (last 7 days)
 * - Recent banners with preview
 * - Code snippets for API usage
 */

export default function Dashboard({ user, apiKeys, usageStats, templates, recentBanners }) {
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLimit, setNewKeyLimit] = useState(60);
  const [createdKey, setCreatedKey] = useState(null);
  const [copiedText, setCopiedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState(apiKeys);
  const [baseUrl, setBaseUrl] = useState('https://yourdomain.com');
  const [storedApiKey, setStoredApiKey] = useState(null);
  const [resettingKeyId, setResettingKeyId] = useState(null);
  
  // Set base URL after component mounts (client-side only)
  useEffect(() => {
    setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    // Load stored API key from localStorage if available
    const stored = localStorage.getItem('apiKey');
    if (stored) {
      setStoredApiKey(stored);
    }
  }, []);

  // Copy to clipboard helper
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  // Create new API key
  const handleCreateKey = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          limitPerMinute: newKeyLimit
        })
      });

      const data = await res.json();

      if (data.status === 'success') {
        setCreatedKey(data);
        // Store the full API key in localStorage
        localStorage.setItem('apiKey', data.apiKey);
        setStoredApiKey(data.apiKey);
        setNewKeyName('');
        setNewKeyLimit(60);
        // Refresh key list
        const listRes = await fetch('/api/keys/list');
        const listData = await listRes.json();
        if (listData.status === 'success') {
          setKeys(listData.keys);
        }
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  // Revoke API key
  const handleRevokeKey = async (keyId, keyName) => {
    if (!confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/keys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Clear stored API key if this key was stored
        localStorage.removeItem('apiKey');
        setStoredApiKey(null);
        // Refresh key list
        const listRes = await fetch('/api/keys/list');
        const listData = await listRes.json();
        if (listData.status === 'success') {
          setKeys(listData.keys);
        }
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to revoke API key');
    }
  };

  // Reset API key
  const handleResetKey = async (keyId, keyName) => {
    if (!confirm(`Are you sure you want to reset "${keyName}"? The old key will no longer work and you'll receive a new one.`)) {
      return;
    }

    setResettingKeyId(keyId);

    try {
      const res = await fetch('/api/keys/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Store the new API key
        localStorage.setItem('apiKey', data.apiKey);
        setStoredApiKey(data.apiKey);
        setCreatedKey(data);
        // Refresh key list
        const listRes = await fetch('/api/keys/list');
        const listData = await listRes.json();
        if (listData.status === 'success') {
          setKeys(listData.keys);
        }
        alert('✅ API key has been reset! Your new key is displayed below. Make sure to copy it.');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to reset API key');
    } finally {
      setResettingKeyId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Overlay Banner API</title>
        <meta name="description" content="Manage your API keys and usage" />
      </Head>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.logo}>🎨 Overlay Banner API</h1>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <a 
                href="/checkout" 
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                💳 Upgrade Plan
              </a>
              <a 
                href="/billing" 
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#667eea';
                }}
              >
                📊 Billing
              </a>
              <button onClick={() => signOut({ callbackUrl: '/landing' })} className={styles.signOutBtn}>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className={styles.dashboard}>
          {/* Sidebar - User Profile */}
          <aside className={styles.sidebar}>
            <div className={styles.profile}>
              {user.image && (
                <img src={user.image} alt={user.name} className={styles.avatar} />
              )}
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userEmail}>{user.email}</p>
              
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.stats.activeApiKeys}</span>
                  <span className={styles.statLabel}>Active Keys</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.stats.totalRequests.toLocaleString()}</span>
                  <span className={styles.statLabel}>Total Requests</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.stats.totalBanners}</span>
                  <span className={styles.statLabel}>Banners</span>
                </div>
              </div>

              <div className={styles.memberSince}>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.main}>
            {/* Usage Stats */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📊 Usage Statistics (Last 7 Days)</h2>
              
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{usageStats.totalRequests}</div>
                  <div className={styles.statCardLabel}>Total Requests</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{usageStats.successRate}%</div>
                  <div className={styles.statCardLabel}>Success Rate</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{usageStats.avgLatencyMs}ms</div>
                  <div className={styles.statCardLabel}>Avg Latency</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{(usageStats.totalBytes / 1024 / 1024).toFixed(2)}MB</div>
                  <div className={styles.statCardLabel}>Data Transfer</div>
                </div>
              </div>

              {/* Daily chart */}
              <div className={styles.chart}>
                <h3>Daily Requests</h3>
                <div className={styles.barChart}>
                  {Object.entries(usageStats.dailyCounts).map(([date, count]) => {
                    const maxCount = Math.max(...Object.values(usageStats.dailyCounts));
                    const height = (count / maxCount) * 100;
                    return (
                      <div key={date} className={styles.barWrapper}>
                        <div 
                          className={styles.bar} 
                          style={{ height: `${height}%` }}
                          title={`${date}: ${count} requests`}
                        />
                        <span className={styles.barLabel}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* API Keys */}
            <section className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className={styles.sectionTitle}>🔑 API Keys</h2>
                {keys.filter(k => k.isActive).length === 0 && (
                  <button 
                    onClick={() => setShowCreateKeyModal(true)}
                    className={styles.primaryBtn}
                  >
                    + Create New Key
                  </button>
                )}
              </div>

              <div className={styles.keysList}>
                {keys.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No API keys yet. Create your first key to get started!</p>
                  </div>
                ) : (
                  keys.map(key => (
                    <div key={key.id} className={`${styles.keyCard} ${!key.isActive ? styles.revokedKey : ''}`}>
                      <div className={styles.keyHeader}>
                        <div>
                          <h3 className={styles.keyName}>{key.name}</h3>
                          {/* Show full API key if stored, otherwise show prefix */}
                          {storedApiKey && key.isActive ? (
                            <div className={styles.fullKeyDisplay}>
                              <code className={styles.keyFull}>{storedApiKey}</code>
                              <button
                                onClick={() => copyToClipboard(storedApiKey, `fullkey-${key.id}`)}
                                className={styles.copyKeyBtn}
                                title="Copy full API key"
                              >
                                {copiedText === `fullkey-${key.id}` ? '✓' : '📋'}
                              </button>
                            </div>
                          ) : (
                            <code className={styles.keyPrefix}>{key.prefix}...</code>
                          )}
                        </div>
                        {key.isActive ? (
                          <span className={styles.badge}>Active</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeInactive}`}>Revoked</span>
                        )}
                      </div>

                      <div className={styles.keyStats}>
                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{key.usageCount} requests</span>
                        <span>•</span>
                        <span>{key.usageLast24h} in last 24h</span>
                        <span>•</span>
                        <span>Limit: {key.metadata.limitPerMinute}/min</span>
                      </div>

                      {key.lastUsedAt && (
                        <div className={styles.keyMeta}>
                          Last used: {new Date(key.lastUsedAt).toLocaleString()}
                        </div>
                      )}

                      {key.isActive && (
                        <div className={styles.keyActions}>
                          {storedApiKey && (
                            <button
                              onClick={() => copyToClipboard(storedApiKey, `copykey-${key.id}`)}
                              className={styles.secondaryBtn}
                            >
                              {copiedText === `copykey-${key.id}` ? '✓ Copied' : 'Copy Full Key'}
                            </button>
                          )}
                          <button
                            onClick={() => handleResetKey(key.id, key.name)}
                            className={styles.secondaryBtn}
                            disabled={resettingKeyId === key.id}
                          >
                            {resettingKeyId === key.id ? 'Resetting...' : 'Reset Key'}
                          </button>
                          <button
                            onClick={() => handleRevokeKey(key.id, key.name)}
                            className={styles.dangerBtn}
                          >
                            Revoke
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Banner Templates */}
            <section className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className={styles.sectionTitle}>🎨 Banner Templates</h2>
                <a 
                  href="/banner-template"
                  className={styles.primaryBtn}
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  + Create New Template
                </a>
              </div>

              <div className={styles.keysList}>
                {!templates || templates.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No templates yet. Create your first template to get started!</p>
                    <a href="/banner-template" style={{ marginTop: '10px', display: 'inline-block', padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
                      Create First Template
                    </a>
                  </div>
                ) : (
                  templates.map(template => (
                    <div key={template.id} className={styles.keyCard}>
                      <div className={styles.keyHeader}>
                        <div>
                          <h3 className={styles.keyName}>{template.name}</h3>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Design: <strong>{template.design}</strong></span>
                            <span style={{ fontSize: '13px', color: '#666' }}>•</span>
                            <code className={styles.keyPrefix} style={{ fontSize: '12px', padding: '2px 8px' }}>{template.uniqueUrl}</code>
                          </div>
                        </div>
                        <span className={styles.badge}>Active</span>
                      </div>

                      <div className={styles.keyStats}>
                        <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>API Endpoint:</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <code style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all' }}>
                            {template.apiUrl}
                          </code>
                          <button
                            onClick={() => {
                              const fullUrl = `${window.location.origin}${template.apiUrl}`;
                              copyToClipboard(fullUrl, `template-url-${template.id}`);
                            }}
                            className={styles.secondaryBtn}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            {copiedText === `template-url-${template.id}` ? '✓' : '📋'}
                          </button>
                        </div>
                      </div>

                      <div className={styles.keyActions}>
                        <a
                          href={`/banner-template?templateId=${template.id}`}
                          className={styles.secondaryBtn}
                          style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                        >
                          ✏️ Edit Template
                        </a>
                        <a
                          href={template.apiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.secondaryBtn}
                          style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                        >
                          🖼️ Preview
                        </a>
                        <button
                          onClick={() => {
                            const fullUrl = `${window.location.origin}${template.apiUrl}`;
                            copyToClipboard(fullUrl, `template-copy-${template.id}`);
                          }}
                          className={styles.secondaryBtn}
                        >
                          {copiedText === `template-copy-${template.id}` ? '✓ Copied' : 'Copy URL'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Code Examples */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>💻 How to Use Your API Key</h2>
              
              <div className={styles.codeExamples}>
                <div className={styles.codeBlock}>
                  <h3>Node.js / JavaScript</h3>
                  <pre><code>{`const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const form = new FormData();
form.append('image', fs.createReadStream('./hero.jpg'));
form.append('title', 'Sale Banner');
form.append('theme', 'antonBlack');

const response = await fetch('${baseUrl}/api/bundled-font-overlay', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE'
  },
  body: form
});

const imageBuffer = await response.buffer();
fs.writeFileSync('./banner.jpg', imageBuffer);`}</code></pre>
                  <button
                    onClick={() => copyToClipboard(document.querySelector(`.${styles.codeBlock} code`).textContent, 'nodejs')}
                    className={styles.copyBtn}
                  >
                    {copiedText === 'nodejs' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                <div className={styles.codeBlock}>
                  <h3>cURL</h3>
                  <pre><code>{`curl -X POST \\
  ${baseUrl}/api/bundled-font-overlay \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -F "image=@hero.jpg" \\
  -F "title=Sale Banner" \\
  -F "theme=antonBlack" \\
  -o banner.jpg`}</code></pre>
                  <button
                    onClick={() => copyToClipboard(document.querySelectorAll(`.${styles.codeBlock} code`)[1].textContent, 'curl')}
                    className={styles.copyBtn}
                  >
                    {copiedText === 'curl' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                <div className={styles.codeBlock}>
                  <h3>Python</h3>
                  <pre><code>{`import requests

with open('hero.jpg', 'rb') as f:
    files = {'image': f}
    data = {
        'title': 'Sale Banner',
        'theme': 'antonBlack'
    }
    headers = {
        'Authorization': 'Bearer YOUR_API_KEY_HERE'
    }
    
    response = requests.post(
        '${baseUrl}/api/bundled-font-overlay',
        files=files,
        data=data,
        headers=headers
    )
    
    with open('banner.jpg', 'wb') as output:
        output.write(response.content)`}</code></pre>
                  <button
                    onClick={() => copyToClipboard(document.querySelectorAll(`.${styles.codeBlock} code`)[2].textContent, 'python')}
                    className={styles.copyBtn}
                  >
                    {copiedText === 'python' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* Create Key Modal */}
        {showCreateKeyModal && (
          <div className={styles.modalOverlay} onClick={() => !createdKey && setShowCreateKeyModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              {!createdKey ? (
                <>
                  <h2>Create New API Key</h2>
                  <form onSubmit={handleCreateKey}>
                    <div className={styles.formGroup}>
                      <label>Key Name *</label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        placeholder="Production Key"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Rate Limit (requests per minute)</label>
                      <input
                        type="number"
                        value={newKeyLimit}
                        onChange={e => setNewKeyLimit(parseInt(e.target.value))}
                        min={1}
                        max={1000}
                      />
                    </div>

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        onClick={() => setShowCreateKeyModal(false)}
                        className={styles.secondaryBtn}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.primaryBtn}
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Key'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2>⚠️ Save Your API Key</h2>
                  <p className={styles.warning}>
                    This is the only time you'll see the full API key. 
                    Copy it now and store it securely!
                  </p>

                  <div className={styles.keyDisplay}>
                    <code>{createdKey.apiKey}</code>
                    <button
                      onClick={() => copyToClipboard(createdKey.apiKey, 'newkey')}
                      className={styles.primaryBtn}
                    >
                      {copiedText === 'newkey' ? '✓ Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>

                  <div className={styles.keyInfo}>
                    <p><strong>Name:</strong> {createdKey.name}</p>
                    <p><strong>Prefix:</strong> {createdKey.prefix}...</p>
                    <p><strong>Rate Limit:</strong> {createdKey.metadata.limitPerMinute} requests/min</p>
                  </div>

                  <button
                    onClick={() => {
                      setCreatedKey(null);
                      setShowCreateKeyModal(false);
                    }}
                    className={styles.primaryBtn}
                  >
                    I've Saved My Key
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Toast notification */}
        {copiedText && (
          <div className={styles.toast}>
            ✓ Copied to clipboard!
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Server-Side Rendering
 * Fetch user data, API keys, and usage stats
 */
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      }
    };
  }

  try {
    // Fetch user with stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            apiKeys: true,
            banners: true
          }
        }
      }
    });

    // Check if email is verified (only for email/password users)
    if (user && !user.emailVerified) {
      return {
        redirect: {
          destination: '/verify-email',
          permanent: false,
        }
      };
    }

    // Count active API keys
    const activeApiKeys = await prisma.apiKey.count({
      where: {
        userId: session.user.id,
        revokedAt: null
      }
    });

    // Count total requests
    const totalRequests = await prisma.apiUsage.count({
      where: {
        apiKey: {
          userId: session.user.id
        }
      }
    });

    // Fetch API keys with usage stats
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        prefix: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
        metadata: true,
        _count: {
          select: {
            usage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get usage for last 24 hours for each key
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const keysWithStats = await Promise.all(
      apiKeys.map(async (key) => {
        const recentUsage = await prisma.apiUsage.count({
          where: {
            apiKeyId: key.id,
            createdAt: { gte: twentyFourHoursAgo }
          }
        });

        return {
          id: key.id,
          prefix: key.prefix,
          name: key.name,
          createdAt: key.createdAt.toISOString(),
          lastUsedAt: key.lastUsedAt?.toISOString() || null,
          revokedAt: key.revokedAt?.toISOString() || null,
          metadata: JSON.parse(key.metadata || '{}'),
          usageCount: key._count.usage,
          usageLast24h: recentUsage,
          isActive: !key.revokedAt
        };
      })
    );

    // Fetch user's templates
    const templates = await prisma.template.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        design: true,
        uniqueUrl: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const templatesWithUrls = templates.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      apiUrl: `/api/templates/${t.uniqueUrl}`,
      editUrl: `/banner-template?templateId=${t.id}`
    }));

    // Get usage stats for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const usage = await prisma.apiUsage.findMany({
      where: {
        apiKey: { userId: session.user.id },
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        createdAt: true,
        status: true,
        bytesOut: true,
        latencyMs: true
      }
    });

    // Calculate stats
    const dailyCounts = {};
    const statusCounts = { success: 0, error: 0 };
    let totalBytes = 0;
    let totalLatency = 0;
    let latencyCount = 0;

    usage.forEach(u => {
      const date = u.createdAt.toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;

      if (u.status >= 200 && u.status < 400) {
        statusCounts.success++;
      } else {
        statusCounts.error++;
      }

      if (u.bytesOut) totalBytes += u.bytesOut;
      if (u.latencyMs) {
        totalLatency += u.latencyMs;
        latencyCount++;
      }
    });

    const usageStats = {
      totalRequests: usage.length,
      successRate: usage.length > 0 
        ? ((statusCounts.success / usage.length) * 100).toFixed(2) 
        : 0,
      totalBytes,
      avgLatencyMs: latencyCount > 0 
        ? Math.round(totalLatency / latencyCount) 
        : 0,
      dailyCounts,
      statusCounts
    };

    return {
      props: {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
          stats: {
            totalApiKeys: user._count.apiKeys,
            activeApiKeys,
            totalBanners: user._count.banners,
            totalRequests
          }
        },
        apiKeys: keysWithStats,
        usageStats,
        templates: templatesWithUrls,
        recentBanners: [] // TODO: Add banner history if needed
      }
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      props: {
        error: 'Failed to load dashboard data'
      }
    };
  }
}
