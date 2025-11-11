// Generate a test URL with raw binary data for the aesthetic design

// Create a simple 100x100 test image as base64
function generateTestImage() {
  // This is a small 100x100 red square as base64 (PNG format)
  const redSquareBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA0ElEQVR4nO3QQQqDMBiF4QdNY9t7eFfvYQ9hO3sLe48uuoEuJCEJ+b83EBAREQEREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREQEREREREREREREREREREREREREREREREREREQEREREREREREREREREREREREREREREQEREREREREREREREREREREREQEREREREREREREREREQEREREREQEREQ/wGq8gAYizYqrQAAAABJRU5ErkJggg==';
  
  return redSquareBase64;
}

// Generate test URLs with different methods
const testImageData = generateTestImage();

console.log('🔬 Raw Binary Data Test URLs Generated:\n');

// Method 1: URL Parameter (GET) - for small data
const getUrl = `http://localhost:3000/api/bundled-font-overlay.jpg?imageData=${encodeURIComponent(testImageData)}&title=${encodeURIComponent('Raw Binary Test')}&website=${encodeURIComponent('BINARY DATA')}&design=aesthetic`;

console.log('📋 Method 1 - GET with URL Parameter:');
console.log(getUrl);
console.log('\n');

// Method 2: Data URI format
const dataUriImage = `data:image/png;base64,${testImageData}`;
const dataUriUrl = `http://localhost:3000/api/bundled-font-overlay.jpg?imageData=${encodeURIComponent(dataUriImage)}&title=${encodeURIComponent('Data URI Test')}&website=${encodeURIComponent('DATA URI')}&design=aesthetic`;

console.log('📋 Method 2 - GET with Data URI:');
console.log(dataUriUrl);
console.log('\n');

// Method 3: POST method example (for larger data)
console.log('📋 Method 3 - POST with JSON Body (recommended for larger data):');
console.log('URL: http://localhost:3000/api/bundled-font-overlay.jpg');
console.log('Method: POST');
console.log('Headers: Content-Type: application/json');
console.log('Body:');
console.log(JSON.stringify({
  imageData: dataUriImage,
  title: 'POST Binary Test',
  website: 'POST METHOD',
  design: 'aesthetic'
}, null, 2));
console.log('\n');

// Method 4: cURL command for testing
console.log('📋 Method 4 - cURL Command:');
console.log(`curl -X POST "http://localhost:3000/api/bundled-font-overlay.jpg" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    imageData: dataUriImage,
    title: 'cURL Binary Test',
    website: 'CURL TEST',
    design: 'aesthetic'
  })}' \\
  --output aesthetic-binary-test.jpg`);
console.log('\n');

// Generate JavaScript fetch examples
console.log('📋 Method 5 - JavaScript Fetch:');
console.log(`// Copy and paste this into browser console
fetch('http://localhost:3000/api/bundled-font-overlay.jpg', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: '${dataUriImage}',
    title: 'JS Fetch Test',
    website: 'JAVASCRIPT',
    design: 'aesthetic'
  })
})
.then(response => response.blob())
.then(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aesthetic-binary-test.jpg';
  a.click();
});`);

console.log('\n✅ Test URLs and examples generated!');
console.log('\n💡 Tips:');
console.log('- Method 1 & 2 (GET): Copy URL and paste in browser');
console.log('- Method 3 & 4: Use for larger binary data');
console.log('- Method 5: Run in browser console for download');
console.log('- Visit http://localhost:3000/binary-test for interactive testing');