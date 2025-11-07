const fs = require('fs');
const path = require('path');

// Simple TTF font name extractor
function extractFontName(fontPath) {
  try {
    const buffer = fs.readFileSync(fontPath);
    
    // TTF fonts have a 'name' table that contains font family names
    // This is a simplified parser to find the family name
    
    // Look for TTF signature
    const signature = buffer.toString('ascii', 0, 4);
    if (signature !== '\x00\x01\x00\x00' && signature !== 'OTTO') {
      console.log('Not a valid TTF/OTF font');
      return null;
    }
    
    // Find the 'name' table
    const numTables = buffer.readUInt16BE(4);
    let nameTableOffset = 0;
    
    for (let i = 0; i < numTables; i++) {
      const tableOffset = 12 + i * 16;
      const tag = buffer.toString('ascii', tableOffset, tableOffset + 4);
      if (tag === 'name') {
        nameTableOffset = buffer.readUInt32BE(tableOffset + 8);
        break;
      }
    }
    
    if (nameTableOffset === 0) {
      console.log('No name table found');
      return null;
    }
    
    // Read name table header
    const nameCount = buffer.readUInt16BE(nameTableOffset + 2);
    const stringStorageOffset = nameTableOffset + buffer.readUInt16BE(nameTableOffset + 4);
    
    // Look for family name (nameID = 1)
    for (let i = 0; i < nameCount; i++) {
      const recordOffset = nameTableOffset + 6 + i * 12;
      const nameID = buffer.readUInt16BE(recordOffset + 6);
      
      if (nameID === 1) { // Family name
        const length = buffer.readUInt16BE(recordOffset + 8);
        const offset = buffer.readUInt16BE(recordOffset + 10);
        const encodingID = buffer.readUInt16BE(recordOffset + 2);
        
        try {
          let familyName;
          if (encodingID === 1) { // Unicode
            familyName = buffer.toString('utf16be', stringStorageOffset + offset, stringStorageOffset + offset + length);
          } else {
            familyName = buffer.toString('ascii', stringStorageOffset + offset, stringStorageOffset + offset + length);
          }
          
          if (familyName && familyName.trim()) {
            return familyName.trim();
          }
        } catch (e) {
          // Try next record
          continue;
        }
      }
    }
    
    return 'Unknown';
  } catch (error) {
    console.log('Error reading font:', error.message);
    return null;
  }
}

// Check all our font files
const fontsDir = path.join(__dirname, 'fonts');
const fontFiles = {
  'NotoSans-Regular.ttf': 'Noto Sans Regular',
  'NotoSans-Bold.ttf': 'Noto Sans Bold', 
  'Inter-Regular.ttf': 'Inter Regular',
  'Inter-Bold.ttf': 'Inter Bold'
};

console.log('🔍 Font Family Name Inspection:');
console.log('=' * 50);

for (const [filename, description] of Object.entries(fontFiles)) {
  const fontPath = path.join(fontsDir, filename);
  const internalName = extractFontName(fontPath);
  
  console.log(`${description}:`);
  console.log(`  File: ${filename}`);
  console.log(`  Internal Family Name: "${internalName}"`);
  console.log(`  Exists: ${fs.existsSync(fontPath)}`);
  console.log('');
}