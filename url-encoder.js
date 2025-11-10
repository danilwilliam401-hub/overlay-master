// URL Encoding Test for Long Tagalog Text
const text = "Baha'y dumating, puso'y nalunod, alaala'y sumasabit sa bawat debris. Lululutang ang pag-asa, kahit anong lakas ng agos, may darating na araw. Sa gitna ng delubyo, ang yakap mo'y santuwaryo, panangga sa lahat. Ang bawat patak ng ulan, alaala ng kahapon, paalala ng kinabukasan. Nawala ang lahat, ngunit ang puso'y nananatiling matatag, handang muling bumangon.";

console.log('=== LONG TAGALOG TEXT ENCODING RESULTS ===\n');
console.log('Original text length:', text.length);
console.log('\nProperly encoded title:');
console.log(encodeURIComponent(text));

// Create the full URL
const encodedTitle = encodeURIComponent(text);
const fullUrl = `https://overlay-master.vercel.app/api/bundled-font-overlay?image=&title=${encodedTitle}&website=${encodeURIComponent('- Lalake Po Ako')}&design=quote3&w=1080&h=1350`;

console.log('\n=== WORKING URLS FOR YOUR MAKE MODULE ===\n');

console.log('1. QUOTE1 (Pure Black Background):');
const quote1Url = `https://overlay-master.vercel.app/api/bundled-font-overlay?image=&title=${encodedTitle}&website=${encodeURIComponent('- Lalake Po Ako')}&design=quote1&w=1080&h=1350`;
console.log(quote1Url);

console.log('\n2. QUOTE2 (Dark Charcoal Background):');
const quote2Url = `https://overlay-master.vercel.app/api/bundled-font-overlay?image=&title=${encodedTitle}&website=${encodeURIComponent('- Lalake Po Ako')}&design=quote2&w=1080&h=1350`;
console.log(quote2Url);

console.log('\n3. QUOTE3 (Gradient Black Background):');
const quote3Url = `https://overlay-master.vercel.app/api/bundled-font-overlay?image=&title=${encodedTitle}&website=${encodeURIComponent('- Lalake Po Ako')}&design=quote3&w=1080&h=1350`;
console.log(quote3Url);

console.log('\n=== URL LENGTHS ===');
console.log('Quote1 URL length:', quote1Url.length);
console.log('Quote2 URL length:', quote2Url.length);
console.log('Quote3 URL length:', quote3Url.length);

console.log('\n=== FOR MAKE MODULE CONFIGURATION ===');
console.log('Use this as your title parameter (properly encoded):');
console.log(encodedTitle);