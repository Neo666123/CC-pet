const fs = require('fs');
const fp = 'D:/存储/LLMPET-main/shared/pet-geometry.js';
let code = fs.readFileSync(fp, 'utf8');

const s1 = 'function chooseDragVerticalLayout({';
const idx1 = code.indexOf(s1);
const s2 = 'function windowFitsWorkArea';
const idx2 = code.indexOf(s2);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = unction chooseDragVerticalLayout() {
    return 'above';
  }

  function chooseDragHorizontalLayout() {
    return 'center';
  }

  ;
  code = code.slice(0, idx1) + replacement + code.slice(idx2);
  fs.writeFileSync(fp, code, 'utf8');
  console.log('Successfully updated chooseDragVerticalLayout and chooseDragHorizontalLayout');
} else {
  console.error('Markers not found', idx1, idx2);
}
