import Head from "next/head";
import { fetchImageWithBuiltins } from "../lib/fetchUtils";

export default function Home({ imageData, error, image, title, preview, imageBase64, website, showDocs }) {
  // If preview mode is enabled, show the actual image with overlay
  if (preview && imageBase64) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh", 
        backgroundColor: "#0a0a0a", 
        fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif", 
        padding: "20px",
        gap: "20px"
      }}>
        <Head>
          <title>{title ? decodeURIComponent(title) : "Image Preview"}</title>
          <link 
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" 
            rel="stylesheet" 
          />
        </Head>
        
        {/* Hidden Canvas for rendering combined image at high resolution */}
        <canvas 
          id="downloadCanvas"
          width="2160" 
          height="2700"
          style={{ display: "none" }}
        />
        
        <div style={{
          position: "relative",
          width: "1080px",
          height: "1350px",
          maxWidth: "90vw",
          maxHeight: "70vh",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
          border: "2px solid rgba(255, 255, 255, 0.1)"
        }}>
          <img
            id="previewImage"
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block"
            }}
          />
          
          {title && (
            <div style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              background: "linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 20%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.7) 60%, rgba(0, 0, 0, 0.9) 80%, rgba(0, 0, 0, 0.98) 100%)",
              padding: "100px 40px 20px 40px",
              color: "white",
              textAlign: "center"
            }}>
              <h1 style={{
                fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: "900",
                lineHeight: "1.1",
                margin: "0 0 20px 0",
                textShadow: "3px 6px 15px rgba(0, 0, 0, 0.9)",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.03em",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto",
                fontFamily: "'Montserrat', sans-serif",
                textTransform: "uppercase"
              }}>
                {decodeURIComponent(title)}
              </h1>
              
              {website && (
                <div style={{
                  fontSize: "clamp(0.8rem, 2vw, 1.2rem)",
                  fontWeight: "700",
                  fontFamily: "'Inter', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#FFD700",
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                  marginBottom: "30px",
                  opacity: "0.95"
                }}>
                  {decodeURIComponent(website)}
                </div>
              )}
            </div>
          )}
          
          {/* Preview Mode Indicator */}
          <div style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            backgroundColor: "rgba(76, 175, 80, 0.9)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            📖 PREVIEW MODE
          </div>
        </div>
        
        {/* Download Controls */}
        <div style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <button 
            onClick={() => downloadCombinedImage()}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            💾 Download Image
          </button>
          
          <button 
            onClick={() => downloadCombinedImage('png')}
            style={{
              backgroundColor: "#2196F3",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            🖼️ Download PNG
          </button>
          
          <div style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "300px"
          }}>
            Downloads the complete image with text overlay (1080×1350)
          </div>
        </div>
        
        <script dangerouslySetInnerHTML={{
          __html: `
            function downloadCombinedImage(format = 'jpeg') {
              const canvas = document.getElementById('downloadCanvas');
              const ctx = canvas.getContext('2d');
              const img = document.getElementById('previewImage');
            const title = "${title ? decodeURIComponent(title).replace(/"/g, '\\"') : ''}";
            const website = "${website ? decodeURIComponent(website).replace(/"/g, '\\"') : ''}";
            
            console.log('Canvas rendering - Title:', title);
            console.log('Canvas rendering - Website:', website);              // Set canvas size at 2x resolution for better quality
              canvas.width = 2160;
              canvas.height = 2700;
              
              // Scale context to maintain coordinate system
              ctx.scale(2, 2);
              
              // Function to wrap text into multiple lines
              function wrapText(ctx, text, maxWidth) {
                const words = text.split(' ');
                const lines = [];
                let currentLine = words[0];
                
                for (let i = 1; i < words.length; i++) {
                  const word = words[i];
                  const width = ctx.measureText(currentLine + " " + word).width;
                  if (width < maxWidth) {
                    currentLine += " " + word;
                  } else {
                    lines.push(currentLine);
                    currentLine = word;
                  }
                }
                lines.push(currentLine);
                return lines;
              }
              

              
              // When image loads, draw everything
              const drawImage = () => {
                // Enable high-quality image rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Ensure fonts are loaded before rendering
                document.fonts.ready.then(() => {
                
                // Calculate image dimensions for proper cropping/zooming
                const imgAspect = img.naturalWidth / img.naturalHeight;
                const canvasAspect = 1080 / 1350;
                
                let sourceX, sourceY, sourceWidth, sourceHeight;
                
                if (imgAspect > canvasAspect) {
                  // Image is wider - crop from center horizontally
                  sourceHeight = img.naturalHeight;
                  sourceWidth = sourceHeight * canvasAspect;
                  sourceX = (img.naturalWidth - sourceWidth) / 2;
                  sourceY = 0;
                } else {
                  // Image is taller - crop from center vertically
                  sourceWidth = img.naturalWidth;
                  sourceHeight = sourceWidth / canvasAspect;
                  sourceX = 0;
                  sourceY = (img.naturalHeight - sourceHeight) / 2;
                }
                
                // Draw using source cropping instead of destination scaling for better quality
                ctx.drawImage(
                  img, 
                  sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
                  0, 0, 1080, 1350                              // Destination rectangle
                );
                
                if (title) {
                // Create improved gradient overlay (starts higher and more black at bottom)
                const gradient = ctx.createLinearGradient(0, 950, 0, 1350);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.1)');
                gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.4)');
                gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.7)');
                gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.9)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 950, 1080, 400);                  // Set up text properties
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  
                // Start with a good font size
                let fontSize = 120;
                ctx.font = '900 ' + fontSize + 'px Montserrat, Arial, sans-serif';                  const maxWidth = 1000;
                  const maxLines = 3;
                  let lines = wrapText(ctx, title, maxWidth);
                  
                  // Reduce font size if we have too many lines or lines are still too wide
                  while ((lines.length > maxLines || lines.some(line => ctx.measureText(line).width > maxWidth)) && fontSize > 50) {
                    fontSize -= 8;
                    ctx.font = '900 ' + fontSize + 'px Montserrat, Arial, sans-serif';
                    lines = wrapText(ctx, title, maxWidth);
                  }
                  
                  // Calculate starting Y position to center the text block
                  const lineHeight = fontSize * 1.2;
                  const totalHeight = lines.length * lineHeight;
                  const startY = 1215 - (totalHeight / 2) + (lineHeight / 2);
                  
                  // Draw each line
                  lines.forEach((line, index) => {
                    const y = startY + (index * lineHeight);
                    
                    // Draw text shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                    ctx.fillText(line, 542, y + 3);
                    
                    // Draw main text
                    ctx.fillStyle = 'white';
                    ctx.fillText(line, 540, y);
                  });
                  
                  // Draw website name if provided
                  if (website) {
                    const websiteFontSize = Math.min(36, fontSize * 0.3);
                    ctx.font = '700 ' + websiteFontSize + 'px Inter, Arial, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const websiteY = startY + (lines.length * lineHeight) + 40;
                    
                    // Draw website shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.fillText(website.toUpperCase(), 542, websiteY + 2);
                    
                    // Draw website text in gold
                    ctx.fillStyle = '#FFD700';
                    ctx.fillText(website.toUpperCase(), 540, websiteY);
                  }
                }
                
                // Download the canvas as image with high quality
                const link = document.createElement('a');
                const fileName = title ? title.replace(/[^a-z0-9]/gi, '_') : 'banner';
                link.download = fileName + '.' + format;
                // Use maximum quality for JPEG (1.0) and PNG (lossless)
                const quality = format === 'jpeg' ? 1.0 : undefined;
                link.href = canvas.toDataURL('image/' + format, quality);
                link.click();
              });
              };
              
              if (img.complete) {
                drawImage();
              } else {
                img.onload = drawImage;
              }
            }
          `
        }} />
      </div>
    );
  }

  // If we have image data, return JSON response
  if (imageData) {
    return (
      <div style={{ padding: "20px", fontFamily: "monospace", backgroundColor: "#1a1a1a", color: "#00ff00", minHeight: "100vh" }}>
        <Head>
          <title>Image Data API Response</title>
        </Head>
        <h2>Image Data Response:</h2>
        <div style={{ 
          backgroundColor: "#2a2a2a", 
          padding: "10px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          border: "1px solid #4CAF50"
        }}>
          <p style={{ margin: "0", color: "#4CAF50" }}>
            💡 <strong>Tip:</strong> Add <code>&preview=true</code> to see the actual image output!
          </p>
        </div>
        <pre style={{ 
          backgroundColor: "#2a2a2a", 
          padding: "20px", 
          borderRadius: "8px", 
          overflow: "auto",
          fontSize: "12px",
          border: "1px solid #444"
        }}>
          {JSON.stringify(imageData, null, 2)}
        </pre>
      </div>
    );
  }

  // Show error if there's an issue fetching image
  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "monospace", backgroundColor: "#1a1a1a", color: "#ff4444", minHeight: "100vh" }}>
        <Head>
          <title>Error - Image Data API</title>
        </Head>
        <h2>Error fetching image:</h2>
        <pre style={{ 
          backgroundColor: "#2a2a2a", 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid #ff4444"
        }}>
          {error}
        </pre>
      </div>
    );
  }

  // Show documentation only if admin parameter is provided
  if (showDocs) {
    const containerStyle = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#0a0a0a",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      padding: "20px"
    };

    const apiDocStyle = {
      maxWidth: "800px",
      backgroundColor: "#1a1a1a",
      borderRadius: "20px",
      padding: "40px",
      color: "white",
      border: "2px solid rgba(255, 255, 255, 0.1)"
    };

    const codeStyle = {
      backgroundColor: "#2a2a2a",
      padding: "15px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "14px",
      margin: "10px 0",
      border: "1px solid #444"
    };

    return (
      <>
        <Head>
          <title>Image Data API - Technical Documentation</title>
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" 
            rel="stylesheet" 
          />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="API to fetch image data with headers and binary content" />
          <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖼️</text></svg>" />
        </Head>

        <div style={containerStyle} className="banner-container">
          <div style={apiDocStyle}>
            <h1 style={{ marginBottom: "20px", color: "#4CAF50" }}>
              📡 Image Data API - Technical Documentation
            </h1>
            
            <p style={{ lineHeight: "1.6", marginBottom: "30px", opacity: "0.9" }}>
              This API fetches images and returns detailed metadata including headers, binary data, and file information in JSON format.
            </p>

            <h3 style={{ color: "#2196F3", marginBottom: "15px" }}>Usage:</h3>
            <div style={codeStyle}>
              ?image=IMAGE_URL&title=TITLE_TEXT
            </div>
            <div style={codeStyle}>
              ?image=IMAGE_URL&title=TITLE_TEXT&website=WEBSITE_NAME&preview=true  {/* Preview Mode */}
            </div>

            <h3 style={{ color: "#2196F3", marginBottom: "15px", marginTop: "25px" }}>Examples:</h3>
            
            <h4 style={{ color: "#FF9800", marginBottom: "10px", marginTop: "20px" }}>📊 JSON Data Mode:</h4>
            <div style={codeStyle}>
              ?image=https://picsum.photos/800/600&title=Test%20Image
            </div>
            <div style={codeStyle}>
              ?image=https://httpbin.org/image/jpeg&title=Simple%20Test
            </div>
            
            <h4 style={{ color: "#FF9800", marginBottom: "10px", marginTop: "20px" }}>🖼️ Preview Mode:</h4>
            <div style={codeStyle}>
              ?image=https://picsum.photos/800/600&title=Test%20Image&website=MyBrand.com&preview=true
            </div>
            <div style={codeStyle}>
              ?image=https://images.unsplash.com/photo-1506905925346-21bda4d32df4&title=Adventure%20Awaits&website=TravelCorp.com&preview=true
            </div>

            <h4 style={{ color: "#E91E63", marginBottom: "10px", marginTop: "20px" }}>🔗 Direct Image URL (like wsrv.nl):</h4>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=Breaking%20News&website=YourSite.com
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://images.unsplash.com/photo-1506905925346-21bda4d32df4&title=Adventure%20Awaits&website=TravelCorp.com&format=png
            </div>
            
            <h4 style={{ color: "#FF9800", marginBottom: "10px", marginTop: "20px" }}>🎨 Design Variants:</h4>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=BREAKING%20NEWS&website=CNN.com&design=design1
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=TECH%20UPDATE&website=TechCrunch.com&design=design2
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=VIRAL%20NOW&website=BuzzFeed.com&design=design3
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=HOT%20TOPIC&website=YouTube.com&design=design4
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=OFFICIAL%20STATEMENT&website=Reuters.com&design=design5
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=CYBER%20ALERT&website=Wired.com&design=design6
            </div>
            
            <h4 style={{ color: "#9C27B0", marginBottom: "10px", marginTop: "20px" }}>🆕 New Design Variants (7-12):</h4>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=FLASH%20UPDATE&website=NewsAlert.com&design=design7
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=FUTURE%20TECH&website=CyberNews.com&design=design8
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=ENERGY%20PULSE&website=PowerNews.com&design=design9
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=AMBER%20WARNING&website=AlertSystem.com&design=design10
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=CORPORATE%20NEWS&website=BusinessDaily.com&design=design11
            </div>
            <div style={codeStyle}>
              /api/direct-image?image=https://picsum.photos/800/600&title=METALLIC%20SIGNAL&website=ModernNews.com&design=design12
            </div>

            <h3 style={{ color: "#FF5722", marginBottom: "15px", marginTop: "25px" }}>🎨 All Design Variants (1-12):</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px", fontSize: "12px", lineHeight: "1.6", opacity: "0.9" }}>
              <div>
                <strong>Original Designs (1-6):</strong>
                <ul style={{ marginTop: "5px", paddingLeft: "15px" }}>
                  <li><strong>default</strong> - Modern gradient with clean typography</li>
                  <li><strong>design1</strong> - 🚨 Classic Red Alert (Breaking news with red gradient)</li>
                  <li><strong>design2</strong> - ⚡ Blue Pulse (Modern tech-news with electric blue)</li>
                  <li><strong>design3</strong> - 🟡 Yellow Flash (Social-media viral with yellow stripe)</li>
                  <li><strong>design4</strong> - 🟥 Gradient Burst (Red-orange YouTube-style)</li>
                  <li><strong>design5</strong> - 📰 White Noise (Professional newsroom look)</li>
                  <li><strong>design6</strong> - 🧨 Cyber Alert (Futuristic neon & glitch effects)</li>
                </ul>
              </div>
              <div>
                <strong>New Designs (7-12):</strong>
                <ul style={{ marginTop: "5px", paddingLeft: "15px" }}>
                  <li><strong>design7</strong> - 🔥 Red Flash Impact (Urgent viral alert with Impact font)</li>
                  <li><strong>design8</strong> - ⚡ Electric Cyan Pop (Fresh futuristic tech vibe)</li>
                  <li><strong>design9</strong> - 🖤 Black + Red Pulse (Energetic attention-grabber)</li>
                  <li><strong>design10</strong> - 🟠 Amber Alert (Authoritative newsroom alert)</li>
                  <li><strong>design11</strong> - 🔵 Blue Ribbon News (Reliable corporate news)</li>
                  <li><strong>design12</strong> - 🔴 Metallic Red Signal (Modern polished update)</li>
                </ul>
              </div>
            </div>

            <h3 style={{ color: "#2196F3", marginBottom: "15px", marginTop: "25px" }}>Parameters:</h3>
            <ul style={{ lineHeight: "2", opacity: "0.9" }}>
              <li><code>image</code> - Image URL to fetch (required)</li>
              <li><code>title</code> - Text overlay for preview mode</li>
              <li><code>website</code> - Website name for branding (optional)</li>
              <li><code>preview</code> - Set to 'true' to see image output instead of JSON</li>
              <li><code>design</code> - Design variant: 'default', 'design1-12' (various styles: red alert, blue pulse, yellow flash, red burst, professional, cyber, red impact, cyan pop, black+red, amber alert, blue ribbon, metallic red)</li>
              <li><code>format</code> - Output format: 'jpeg' or 'png' (for direct image API)</li>
              <li><code>w</code> - Width in pixels (for direct image API, default: 1080)</li>
              <li><code>h</code> - Height in pixels (for direct image API, default: 1350)</li>
            </ul>

            <h3 style={{ color: "#2196F3", marginBottom: "15px", marginTop: "25px" }}>Response includes:</h3>
            <ul style={{ lineHeight: "2", opacity: "0.9" }}>
              <li>✅ HTTP Status Code</li>
              <li>✅ Response Headers</li>
              <li>✅ Binary Image Data (Base64)</li>
              <li>✅ File Size Information</li>
              <li>✅ Content Type Detection</li>
              <li>✅ 🖼️ Preview Mode Available</li>
              <li>✅ 🔗 Direct Image URLs (like wsrv.nl)</li>
            </ul>

            <div style={{ 
              marginTop: "30px", 
              padding: "20px", 
              backgroundColor: "#2a2a2a", 
              borderRadius: "10px",
              border: "1px solid #4CAF50"
            }}>
              <p style={{ margin: "0", color: "#4CAF50" }}>
                💡 <strong>Tip:</strong> Add image and title parameters to get started!
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Default public homepage
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    padding: "20px"
  };

  const heroStyle = {
    maxWidth: "900px",
    textAlign: "center",
    color: "white"
  };

  return (
    <>
      <Head>
        <title>Banner Generator - Create Professional Image Overlays</title>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Professional banner generator service - Add custom text overlays to images instantly" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖼️</text></svg>" />
      </Head>

      <div style={containerStyle}>
        <div style={heroStyle}>
          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: "900",
            marginBottom: "20px",
            background: "linear-gradient(135deg, #4CAF50, #2196F3, #9C27B0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            🖼️ Banner Generator
          </h1>

          <p style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            lineHeight: "1.6",
            marginBottom: "40px",
            opacity: "0.9",
            maxWidth: "600px",
            margin: "0 auto 40px"
          }}>
            Create professional image banners with custom text overlays. 
            Perfect for social media, news articles, and marketing content.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
            marginBottom: "50px"
          }}>
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "30px",
              borderRadius: "15px",
              border: "2px solid rgba(76, 175, 80, 0.3)"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>⚡</div>
              <h3 style={{ color: "#4CAF50", marginBottom: "10px" }}>Fast & Simple</h3>
              <p style={{ opacity: "0.8", lineHeight: "1.5" }}>
                Generate professional banners instantly. Just provide an image URL and your text.
              </p>
            </div>

            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "30px",
              borderRadius: "15px",
              border: "2px solid rgba(33, 150, 243, 0.3)"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🎨</div>
              <h3 style={{ color: "#2196F3", marginBottom: "10px" }}>12 Design Styles</h3>
              <p style={{ opacity: "0.8", lineHeight: "1.5" }}>
                Choose from professional designs including news alerts, tech themes, and corporate styles.
              </p>
            </div>

            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "30px",
              borderRadius: "15px",
              border: "2px solid rgba(156, 39, 176, 0.3)"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🔗</div>
              <h3 style={{ color: "#9C27B0", marginBottom: "10px" }}>Direct URLs</h3>
              <p style={{ opacity: "0.8", lineHeight: "1.5" }}>
                Get direct image URLs that work anywhere - perfect for embedding and sharing.
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            <a
              href="mailto:contact@yourdomain.com"
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "15px 30px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              📧 Contact Us
            </a>
          </div>

          <div style={{
            marginTop: "50px",
            padding: "20px",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            borderRadius: "10px",
            border: "1px solid rgba(76, 175, 80, 0.3)"
          }}>
            <p style={{ margin: "0", fontSize: "14px", opacity: "0.8" }}>
              Professional image processing service for businesses and developers.
              <br />
              High-quality outputs with customizable designs and branding options.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Server-side rendering to fetch image data
export async function getServerSideProps(context) {
  const { image = "", title = "", preview = "", website = "", admin = "" } = context.query;
  
  // If no image parameter, show the appropriate homepage
  if (!image) {
    return { 
      props: { 
        image: "", 
        title: "", 
        preview: "", 
        website: "",
        showDocs: admin === "true" || admin === "docs" || admin === "1"
      } 
    };
  }

  try {
    // Validate URL
    let imageUrl;
    try {
      imageUrl = new URL(image);
    } catch (urlError) {
      throw new Error(`Invalid image URL: ${image}`);
    }

    console.log(`Fetching image from: ${imageUrl.href}`);

    // Use Node.js built-in modules for more reliable fetching
    const response = await fetchImageWithBuiltins(imageUrl.href);

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get response headers
    const headers = [];
    response.headers.forEach((value, name) => {
      headers.push({ name, value });
    });

    // Get binary data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to base64 for JSON serialization
    const base64Data = buffer.toString('base64');
    
    // Determine file extension from content-type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    let fileExtension = 'bin';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      fileExtension = 'jpeg';
    } else if (contentType.includes('png')) {
      fileExtension = 'png';
    } else if (contentType.includes('gif')) {
      fileExtension = 'gif';
    } else if (contentType.includes('webp')) {
      fileExtension = 'webp';
    }

    // Create response data structure
    const imageData = [{
      statusCode: response.status,
      headers: headers,
      cookieHeaders: [], // Could be populated if needed
      data: `IMTBuffer(${buffer.length}, binary, ${buffer.toString('hex').substring(0, 32)}...): ${base64Data.substring(0, 100)}...`, // Truncated for display
      fileSize: buffer.length,
      fileName: `file.${fileExtension}`,
      // Additional metadata
      contentType: contentType,
      url: image,
      title: title ? decodeURIComponent(title) : "",
      timestamp: new Date().toISOString()
    }];

    // If preview mode, also include base64 data for direct display
    const shouldPreview = preview === 'true' || preview === '1';
    let imageBase64 = null;
    
    if (shouldPreview) {
      imageBase64 = base64Data;
    }

    return {
      props: {
        imageData: shouldPreview ? null : imageData, // Don't send JSON data in preview mode
        image,
        title,
        preview: shouldPreview,
        imageBase64,
        website,
        showDocs: false
      }
    };

  } catch (error) {
    console.error('Error fetching image:', error);
    
    // Provide more detailed error information
    let errorMessage = `Failed to fetch image: ${error.message}`;
    
    if (error.code === 'ENOTFOUND') {
      errorMessage += '\n\nPossible causes:\n- Invalid domain name\n- Network connectivity issues\n- DNS resolution failed';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage += '\n\nConnection refused by the server';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage += '\n\nRequest timed out';
    } else if (error.name === 'AbortError') {
      errorMessage += '\n\nRequest was aborted (timeout)';
    } else if (error.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
      errorMessage += '\n\nSSL Certificate Issue:\n- The server has an invalid or expired SSL certificate\n- This is automatically handled by trying HTTP fallback';
    } else if (error.cause?.code === 'CERT_HAS_EXPIRED') {
      errorMessage += '\n\nSSL Certificate Expired:\n- The server certificate has expired\n- Trying alternative connection methods';
    } else if (error.cause?.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      errorMessage += '\n\nSelf-signed SSL Certificate:\n- The server uses a self-signed certificate\n- This is handled automatically';
    }
    
    errorMessage += `\n\nOriginal URL: ${image}`;
    errorMessage += `\nError details: ${JSON.stringify({ name: error.name, code: error.code, cause: error.cause }, null, 2)}`;
    
    return {
      props: {
        error: errorMessage,
        image,
        title,
        preview: preview === 'true' || preview === '1',
        website,
        showDocs: false
      }
    };
  }
}