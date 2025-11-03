// Robust image fetching using Node.js built-in modules
export async function fetchImageWithBuiltins(url) {
  const { URL } = await import('url');
  const parsedUrl = new URL(url);
  
  return new Promise(async (resolve, reject) => {
    // Choose the appropriate module based on protocol
    const isHttps = parsedUrl.protocol === 'https:';
    
    // Use dynamic imports for ES modules compatibility
    const requestModule = isHttps ? 
      (await import('https')).default : 
      (await import('http')).default;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'close'
      },
      timeout: 30000
    };

    // For HTTPS, disable SSL verification to handle certificate issues
    if (isHttps) {
      options.rejectUnauthorized = false;
      options.secureProtocol = 'TLSv1_2_method';
    }

    console.log(`Using ${isHttps ? 'HTTPS' : 'HTTP'} request to: ${parsedUrl.hostname}${parsedUrl.pathname}`);

    const req = requestModule.request(options, (res) => {
      console.log(`Response status: ${res.statusCode}`);

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Redirecting to: ${res.headers.location}`);
        return fetchImageWithBuiltins(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }

      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Create a response-like object compatible with our existing code
        const mockResponse = {
          ok: true,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: {
            get: (name) => res.headers[name.toLowerCase()],
            forEach: (callback) => {
              Object.entries(res.headers).forEach(([key, value]) => {
                callback(value, key);
              });
            }
          },
          arrayBuffer: () => Promise.resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
        };

        resolve(mockResponse);
      });
    });

    req.on('error', (error) => {
      console.log(`Request error: ${error.message}`);
      
      // If HTTPS fails with SSL error, try HTTP
      if (isHttps && (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                      error.code === 'CERT_HAS_EXPIRED' || 
                      error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
                      error.code === 'ERR_TLS_CERT_ALTNAME_INVALID')) {
        
        const httpUrl = url.replace('https://', 'http://');
        console.log(`SSL error, trying HTTP fallback: ${httpUrl}`);
        
        fetchImageWithBuiltins(httpUrl).then(resolve).catch((httpError) => {
          reject(new Error(`HTTPS failed (${error.message}), HTTP fallback also failed (${httpError.message})`));
        });
      } else {
        reject(error);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 30 seconds'));
    });

    req.end();
  });
}