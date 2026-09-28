const fs = require('fs');
const path = require('path');

const petJsPath = path.join('D:', '存储', 'LLMPET-main', 'renderer', 'pet.js');
let code = fs.readFileSync(petJsPath, 'utf8');

const targetOld = `  if (s.waitingCount > 0) {
    setState('waiting');`;

const targetNew = `  const activeList = (s.sessions || []).filter(isVisibleSession);
  const activeWorking = activeList.some((x) => x.state === 'working' || x.state === 'juggling');

  if (activeWorking) {
    setState(activeList.some((x) => x.state === 'juggling') ? 'juggling' : 'working');
  } else if (s.waitingCount > 0) {
    setState('waiting');`;

if (code.includes(targetOld) && !code.includes('const activeWorking = activeList.some')) {
  code = code.replace(targetOld, targetNew);
  fs.writeFileSync(petJsPath, code, 'utf8');
  console.log('Successfully updated state ladder to prioritize active working sessions.');
} else {
  console.log('State ladder already updated or target pattern not matched.');
}
