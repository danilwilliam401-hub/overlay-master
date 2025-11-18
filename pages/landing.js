/*
  OVERLAY BANNER API SPEC (Next.js API Route)
  POST /api/bundled-font-overlay
  Body: multipart/form-data
    - image (File)
    - title: string (optional)
    - website: string (optional)
    - design: string (entertainment | antonBlack | antonTransparent | antonTransparent2 | antonWhite | tech | sports | etc.)
  Processing:
    - Uses Sharp 0.34.4 for high-performance image processing
    - Applies chosen design theme overlay with professional fonts (Anton, Bebas Neue, Impact, etc.)
    - Returns processed JPEG/PNG buffer
  Response (Success):
    Binary image data (JPEG/PNG) with appropriate Content-Type header
  Response (Error):
    { "status": "error", "message": "Error description" }
*/

import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Landing.module.css';

// SEO Metadata
const SEO_META = {
  title: "Generate High-Impact Overlay Banners Instantly — Powered by Sharp",
  description: "Upload any image and automatically generate stunning marketing visuals in seconds. Perfect for content creators, marketers, and developers.",
  ogImage: "/og-image.jpg"
};

export default function LandingPage() {
  // State management for overlay banner upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('entertainment');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const uploadBoxRef = useRef(null);

  // Available themes
  const themes = [
    { value: 'entertainment', label: 'Viral & Loud (Orange)' },
    { value: 'antonBlack', label: 'Anton Black (Dramatic)' },
    { value: 'antonTransparent', label: 'Transparent Overlay' },
    { value: 'antonTransparent2', label: 'White Background' },
    { value: 'antonWhite', label: 'Minimalist Black on White' },
    { value: 'tech', label: 'Professional Editorial (Blue)' },
    { value: 'sports', label: 'Impact Headlines (Teal)' },
    { value: 'breaking', label: 'Breaking News (Red)' },
    { value: 'cinematic', label: 'Cinematic Drama' },
    { value: 'neon', label: 'Neon Futuristic' }
  ];

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload and process image
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (since fetch doesn't support upload progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare form data
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (title) formData.append('title', title);
      if (website) formData.append('website', website);
      formData.append('design', selectedTheme);

      // Call the API
      const response = await fetch('/api/bundled-font-overlay', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Get the processed image as blob
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      setProcessedImageUrl(imageUrl);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to process image. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Download processed image
  const handleDownload = () => {
    if (!processedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = `banner-${selectedTheme}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    if (!processedImageUrl) return;
    
    try {
      await navigator.clipboard.writeText(processedImageUrl);
      alert('Image URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedImageUrl(null);
    setTitle('');
    setWebsite('');
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Smooth scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <Head>
        <title>{SEO_META.title}</title>
        <meta name="description" content={SEO_META.description} />
        <meta property="og:title" content={SEO_META.title} />
        <meta property="og:description" content={SEO_META.description} />
        <meta property="og:image" content={SEO_META.ogImage} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Success Toast */}
        {showSuccessToast && (
          <div className={styles.toast}>
            <span className={styles.toastIcon}>✓</span>
            <span>Banner generated successfully!</span>
          </div>
        )}

        {/* Sticky Navbar */}
        <nav className={styles.navbar}>
          <div className={styles.navContent}>
            <div className={styles.navLogo}>
              <span className={styles.logoIcon}>🎨</span>
              <span className={styles.logoText}>BannerGen</span>
            </div>

            {/* Mobile menu button */}
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Nav Links */}
            <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ''}`}>
              <button onClick={() => scrollToSection('features')} className={styles.navLink}>
                Features
              </button>
              <button onClick={() => scrollToSection('pricing')} className={styles.navLink}>
                Pricing
              </button>
              <button onClick={() => scrollToSection('faq')} className={styles.navLink}>
                FAQ
              </button>
              <a href="/designs" className={styles.navLink}>
                API Docs
              </a>
            </div>

            <button 
              onClick={() => scrollToSection('hero')}
              className={styles.navCta}
            >
              Try Now
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="hero" className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Generate High-Impact Overlay Banners <span className={styles.highlight}>Instantly</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Upload any image and automatically generate stunning marketing visuals in seconds. 
                Powered by Sharp for lightning-fast processing.
              </p>
              <p className={styles.socialProof}>
                ⭐ Trusted by 1,900+ content creators and marketers worldwide
              </p>

              <div className={styles.heroCtas}>
                <button 
                  onClick={() => scrollToSection('upload')}
                  className={styles.ctaPrimary}
                >
                  Generate Banner
                </button>
                <a href="/designs" className={styles.ctaSecondary}>
                  View API Docs →
                </a>
              </div>
            </div>

            {/* Overlay Banner Upload Component */}
            <div id="upload" className={styles.uploadSection}>
              <div className={styles.uploadCard}>
                <h3 className={styles.uploadTitle}>Try It Now — Free</h3>
                
                {/* File Drop Zone */}
                <div
                  ref={uploadBoxRef}
                  className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragging : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload image"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className={styles.fileInput}
                    aria-label="File input"
                  />

                  {!previewUrl ? (
                    <div className={styles.dropzoneContent}>
                      <div className={styles.uploadIcon}>📤</div>
                      <p className={styles.dropzoneText}>
                        <strong>Click to upload</strong> or drag and drop
                      </p>
                      <p className={styles.dropzoneHint}>
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  ) : (
                    <div className={styles.previewContainer}>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className={styles.previewImage}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        className={styles.removeBtn}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Fields */}
                <div className={styles.inputGroup}>
                  <label htmlFor="title" className={styles.label}>
                    Banner Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your headline text..."
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="website" className={styles.label}>
                    Website/Brand Name (Optional)
                  </label>
                  <input
                    id="website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="YourBrand.com"
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="theme" className={styles.label}>
                    Choose Theme
                  </label>
                  <select
                    id="theme"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className={styles.select}
                  >
                    {themes.map(theme => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className={styles.progressText}>Processing... {uploadProgress}%</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className={styles.errorMessage}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className={styles.generateBtn}
                >
                  {isUploading ? 'Processing...' : 'Generate Banner'}
                </button>

                {/* Processed Image Result */}
                {processedImageUrl && (
                  <div className={styles.resultSection}>
                    <h4 className={styles.resultTitle}>Your Banner is Ready! 🎉</h4>
                    <div className={styles.resultPreview}>
                      <img 
                        src={processedImageUrl} 
                        alt="Processed banner" 
                        className={styles.resultImage}
                      />
                    </div>
                    <div className={styles.resultActions}>
                      <button onClick={handleDownload} className={styles.downloadBtn}>
                        ⬇️ Download Image
                      </button>
                      <button onClick={handleCopyUrl} className={styles.copyBtn}>
                        📋 Copy URL
                      </button>
                      <button onClick={handleReset} className={styles.resetBtn}>
                        🔄 Create Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className={styles.partners}>
          <div className={styles.sectionContent}>
            <p className={styles.partnersLabel}>Trusted by leading brands</p>
            <div className={styles.partnerLogos}>
              <div className={styles.partnerLogo}>TechCorp</div>
              <div className={styles.partnerLogo}>CreativeStudio</div>
              <div className={styles.partnerLogo}>MarketPro</div>
              <div className={styles.partnerLogo}>DesignHub</div>
              <div className={styles.partnerLogo}>MediaFlow</div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="features" className={styles.benefits}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Why Choose BannerGen?</h2>
            <p className={styles.sectionSubtitle}>
              Built for speed, designed for impact
            </p>

            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>⚡</div>
                <h3 className={styles.benefitTitle}>Lightning Fast</h3>
                <p className={styles.benefitText}>
                  Generate professional banners in under 2 seconds using Sharp's optimized image processing engine.
                </p>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>🎨</div>
                <h3 className={styles.benefitTitle}>32+ Design Themes</h3>
                <p className={styles.benefitText}>
                  From viral entertainment to minimalist designs, choose the perfect style for your brand.
                </p>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>🔧</div>
                <h3 className={styles.benefitTitle}>Developer-Friendly API</h3>
                <p className={styles.benefitText}>
                  Simple REST API with multipart/form-data support. Integrate in minutes, not hours.
                </p>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>🔒</div>
                <h3 className={styles.benefitTitle}>Secure by Default</h3>
                <p className={styles.benefitText}>
                  Built-in image validation, size limits, and secure processing. Your data stays safe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.howItWorks}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              Three simple steps to stunning banners
            </p>

            <div className={styles.stepsContainer}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Upload Your Image</h3>
                  <p className={styles.stepText}>
                    Drag and drop or click to select any image from your device. Supports PNG, JPG, and GIF.
                  </p>
                </div>
              </div>

              <div className={styles.stepArrow}>→</div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Choose Your Theme</h3>
                  <p className={styles.stepText}>
                    Select from 32+ professional design themes and add your custom text and branding.
                  </p>
                </div>
              </div>

              <div className={styles.stepArrow}>→</div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Download & Share</h3>
                  <p className={styles.stepText}>
                    Get your processed banner instantly. Download or copy the URL to use anywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className={styles.pricing}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
            <p className={styles.sectionSubtitle}>
              Choose the plan that fits your needs
            </p>

            <div className={styles.pricingGrid}>
              {/* Starter Plan */}
              <div className={styles.pricingCard}>
                <h3 className={styles.pricingTitle}>Starter</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.priceCurrency}>$</span>
                  <span className={styles.priceAmount}>0</span>
                  <span className={styles.pricePeriod}>/month</span>
                </div>
                <p className={styles.pricingDescription}>Perfect for trying out</p>
                <ul className={styles.pricingFeatures}>
                  <li>✓ 50 banners per month</li>
                  <li>✓ All design themes</li>
                  <li>✓ 1080x1350 resolution</li>
                  <li>✓ Community support</li>
                  <li>✗ API access</li>
                  <li>✗ Custom branding</li>
                </ul>
                <button className={styles.pricingBtn}>Get Started</button>
              </div>

              {/* Pro Plan (Highlighted) */}
              <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
                <div className={styles.popularBadge}>Most Popular</div>
                <h3 className={styles.pricingTitle}>Pro</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.priceCurrency}>$</span>
                  <span className={styles.priceAmount}>29</span>
                  <span className={styles.pricePeriod}>/month</span>
                </div>
                <p className={styles.pricingDescription}>For professionals</p>
                <ul className={styles.pricingFeatures}>
                  <li>✓ Unlimited banners</li>
                  <li>✓ All design themes</li>
                  <li>✓ Up to 4K resolution</li>
                  <li>✓ Priority support</li>
                  <li>✓ Full API access</li>
                  <li>✓ Custom branding</li>
                </ul>
                <button className={styles.pricingBtnFeatured}>Start Pro Trial</button>
              </div>

              {/* Enterprise Plan */}
              <div className={styles.pricingCard}>
                <h3 className={styles.pricingTitle}>Enterprise</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.priceAmount}>Custom</span>
                </div>
                <p className={styles.pricingDescription}>For large teams</p>
                <ul className={styles.pricingFeatures}>
                  <li>✓ Everything in Pro</li>
                  <li>✓ Dedicated account manager</li>
                  <li>✓ Custom themes</li>
                  <li>✓ SLA guarantee</li>
                  <li>✓ White-label options</li>
                  <li>✓ Volume discounts</li>
                </ul>
                <button className={styles.pricingBtn}>Contact Sales</button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={styles.testimonials}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Loved by Content Creators</h2>
            <p className={styles.sectionSubtitle}>
              Here's what our users have to say
            </p>

            <div className={styles.testimonialsGrid}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
                <p className={styles.testimonialText}>
                  "BannerGen saved me hours every week. The API integration was seamless and the output quality is outstanding!"
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>SM</div>
                  <div>
                    <div className={styles.authorName}>Sarah Martinez</div>
                    <div className={styles.authorTitle}>Content Manager @ TechCorp</div>
                  </div>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
                <p className={styles.testimonialText}>
                  "The variety of themes is incredible. I can create professional banners for any campaign in seconds."
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>JC</div>
                  <div>
                    <div className={styles.authorName}>James Chen</div>
                    <div className={styles.authorTitle}>Marketing Director @ CreativeStudio</div>
                  </div>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
                <p className={styles.testimonialText}>
                  "Fast, reliable, and easy to use. The Sharp processing makes a huge difference in image quality."
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>EJ</div>
                  <div>
                    <div className={styles.authorName}>Emily Johnson</div>
                    <div className={styles.authorTitle}>Founder @ DesignHub</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className={styles.faq}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to know
            </p>

            <div className={styles.faqContainer}>
              {[
                {
                  question: "What image formats are supported?",
                  answer: "We support all common image formats including PNG, JPG, JPEG, GIF, and WebP. Maximum file size is 10MB."
                },
                {
                  question: "How does the API work?",
                  answer: "Simply send a POST request to /api/bundled-font-overlay with your image and design parameters. The API returns a processed banner in under 2 seconds using Sharp's optimized processing."
                },
                {
                  question: "Can I use custom fonts?",
                  answer: "Pro and Enterprise plans include 14 professional fonts (Anton, Bebas Neue, Impact, Oswald, Montserrat, and more). Enterprise customers can request custom font integration."
                },
                {
                  question: "What's your refund policy?",
                  answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund."
                },
                {
                  question: "Is there a rate limit?",
                  answer: "Free tier: 50 requests/month. Pro: unlimited requests with fair use. Enterprise: custom limits based on your needs."
                },
                {
                  question: "Do you offer support?",
                  answer: "Free users get community support. Pro users get priority email support with 24-hour response time. Enterprise customers get dedicated account management."
                }
              ].map((item, index) => (
                <div key={index} className={styles.faqItem}>
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className={styles.faqQuestion}
                    aria-expanded={activeFaq === index}
                  >
                    <span>{item.question}</span>
                    <span className={styles.faqIcon}>
                      {activeFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {activeFaq === index && (
                    <div className={styles.faqAnswer}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to Create Stunning Banners?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join 1,900+ creators using BannerGen to supercharge their content workflow
            </p>
            <div className={styles.ctaButtons}>
              <button 
                onClick={() => scrollToSection('upload')}
                className={styles.ctaPrimaryLarge}
              >
                Get Started Free
              </button>
              <a href="/designs" className={styles.ctaSecondaryLarge}>
                View Documentation
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerTop}>
              <div className={styles.footerBrand}>
                <div className={styles.footerLogo}>
                  <span className={styles.logoIcon}>🎨</span>
                  <span className={styles.logoText}>BannerGen</span>
                </div>
                <p className={styles.footerTagline}>
                  Generate high-impact overlay banners instantly
                </p>
              </div>

              <div className={styles.footerLinks}>
                <div className={styles.footerColumn}>
                  <h4 className={styles.footerColumnTitle}>Product</h4>
                  <a href="/designs" className={styles.footerLink}>Features</a>
                  <a href="/designs" className={styles.footerLink}>API Documentation</a>
                  <button onClick={() => scrollToSection('pricing')} className={styles.footerLink}>
                    Pricing
                  </button>
                  <a href="/designs" className={styles.footerLink}>Design Themes</a>
                </div>

                <div className={styles.footerColumn}>
                  <h4 className={styles.footerColumnTitle}>Company</h4>
                  <a href="/about" className={styles.footerLink}>About Us</a>
                  <a href="/blog" className={styles.footerLink}>Blog</a>
                  <a href="/careers" className={styles.footerLink}>Careers</a>
                  <a href="/contact" className={styles.footerLink}>Contact</a>
                </div>

                <div className={styles.footerColumn}>
                  <h4 className={styles.footerColumnTitle}>Legal</h4>
                  <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
                  <a href="/terms" className={styles.footerLink}>Terms of Service</a>
                  <a href="/cookies" className={styles.footerLink}>Cookie Policy</a>
                </div>

                <div className={styles.footerColumn}>
                  <h4 className={styles.footerColumnTitle}>Newsletter</h4>
                  <p className={styles.newsletterText}>
                    Get updates on new themes and features
                  </p>
                  <div className={styles.newsletterForm}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className={styles.newsletterInput}
                      aria-label="Email address"
                    />
                    <button className={styles.newsletterBtn}>
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p className={styles.footerCopyright}>
                © 2025 BannerGen. All rights reserved.
              </p>
              <div className={styles.footerSocial}>
                <a href="#" className={styles.socialLink} aria-label="Twitter">𝕏</a>
                <a href="#" className={styles.socialLink} aria-label="GitHub">GitHub</a>
                <a href="#" className={styles.socialLink} aria-label="LinkedIn">in</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
