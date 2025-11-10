const text = "Baha'y dumating, puso'y nalunod, alaala'y sumasabit sa bawat debris. Lululutang ang pag-asa, kahit anong lakas ng agos, may darating na araw. Sa gitna ng delubyo, ang yakap mo'y santuwaryo, panangga sa lahat. Ang bawat patak ng ulan, alaala ng kahapon, paalala ng kinabukasan. Nawala ang lahat, ngunit ang puso'y nananatiling matatag, handang muling bumangon.";

console.log('Original text length:', text.length);
console.log('URL encoded:', encodeURIComponent(text));
console.log('URL encoded length:', encodeURIComponent(text).length);

// Test URL construction
const encodedTitle = encodeURIComponent(text);
const testUrl = `http://localhost:3000/api/bundled-font-overlay?image=&title=${encodedTitle}&design=quote3&w=1080&h=1350`;
console.log('\nURL length:', testUrl.length);
console.log('URL (truncated):', testUrl.substring(0, 200) + '...');