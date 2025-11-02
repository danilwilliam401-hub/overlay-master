import { fetchImageWithBuiltins } from "../../lib/fetchUtils";

// API route for pure JSON response
export default async function handler(req, res) {
  // Force JSON response and set CORS headers immediately
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { image, title } = req.query;

  // Validate image parameter
  if (!image) {
    return res.status(400).json({
      error: "Missing 'image' parameter",
      usage: "?image=IMAGE_URL&title=TITLE_TEXT",
      example: "?image=https://images.unsplash.com/photo-1506905925346-21bda4d32df4&title=Adventure%20Awaits",
      apiEndpoint: "/api/image",
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Validate URL
    let imageUrl;
    try {
      imageUrl = new URL(image);
    } catch (urlError) {
      throw new Error(`Invalid image URL: ${image}`);
    }

    console.log(`API: Fetching image from: ${imageUrl.href}`);

    // Use Node.js built-in modules for more reliable fetching
    const response = await fetchImageWithBuiltins(imageUrl.href);

    console.log(`API: Response status: ${response.status}`);

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

    // Create hex preview (first 50 characters)
    const hexPreview = buffer.toString('hex').substring(0, 100);

    // Create response data structure matching your example
    const responseData = [{
      statusCode: response.status,
      headers: headers,
      cookieHeaders: [],
      data: `IMTBuffer(${buffer.length}, binary, ${hexPreview.substring(0, 32)}): ${hexPreview}`,
      fileSize: buffer.length,
      fileName: `file.${fileExtension}`
    }];

    // Add a marker to confirm this is the API endpoint
    responseData[0].apiEndpoint = "/api/image";
    responseData[0].timestamp = new Date().toISOString();

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('API Error fetching image:', error);
    
    // Provide detailed error information
    let errorDetails = {
      error: "Failed to fetch image",
      message: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      originalUrl: image,
      errorCode: error.code,
      errorName: error.name
    };
    
    if (error.code === 'ENOTFOUND') {
      errorDetails.suggestion = 'Invalid domain name or DNS resolution failed';
    } else if (error.code === 'ECONNREFUSED') {
      errorDetails.suggestion = 'Connection refused by the server';
    } else if (error.code === 'ETIMEDOUT') {
      errorDetails.suggestion = 'Request timed out - server took too long to respond';
    } else if (error.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
      errorDetails.suggestion = 'SSL certificate issue - automatically trying HTTP fallback';
    } else if (error.cause?.code === 'CERT_HAS_EXPIRED') {
      errorDetails.suggestion = 'SSL certificate expired - trying alternative connection';
    } else if (error.cause?.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      errorDetails.suggestion = 'Self-signed SSL certificate detected - handling automatically';
    }
    
    return res.status(500).json(errorDetails);
  }
}