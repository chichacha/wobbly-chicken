const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const {DATA_URLS, LOCAL_URLS, loadData, normalizeDate, jaDate, currentEdition} = require('../js/site.js');
const mockCSV = name => fs.readFileSync(path.join(root, 'data', name), 'utf8');
const originals = {fetch: globalThis.fetch, warn: console.warn};
let activeRemote = 'ok';
let calls = [];
globalThis.fetch = async (url) => {
  calls.push(url);
  if (url === DATA_URLS.editions || url === DATA_URLS.menu) {
    if (activeRemote === 'reject') throw new Error('cross-origin/network failure');
    if (activeRemote === 'invalid') return { ok: true, text: async () => '<html>Google sign-in</html>' };
  }
  let which;
  if ([DATA_URLS.editions, LOCAL_URLS.editions].includes(url)) which = 'editions.csv';
  else if ([DATA_URLS.menu, LOCAL_URLS.menu].includes(url)) which = 'menu.csv';
  else throw new Error(`unexpected URL ${url}`);
  return { ok: true, text: async () => mockCSV(which) };
};
console.warn = () => {};
(async () => {
  assert.match(DATA_URLS.editions, /gid=0&single=true&output=csv$/);
  assert.match(DATA_URLS.menu, /gid=581424739&single=true&output=csv$/);
  const live = await loadData();
  assert.equal(live.source, 'sheets');
  assert.equal(live.fallback, false);
  assert.equal(live.items.filter(x=>x.edition_id===currentEdition(live.editions).edition_id).length, 17);
  assert.deepEqual(calls, [DATA_URLS.editions, DATA_URLS.menu]);
  activeRemote = 'reject'; calls = [];
  const fallback = await loadData();
  assert.equal(fallback.source, 'local');
  assert.equal(fallback.fallback, true);
  assert.match(fallback.sheetError, /failure/);
  assert.deepEqual(calls.slice(2), [LOCAL_URLS.editions, LOCAL_URLS.menu]);
  activeRemote = 'invalid';
  assert.equal((await loadData()).fallback, true, 'HTML error pages must not count as CSV');
  calls = [];
  const explicitLocal = await loadData('local');
  assert.equal(explicitLocal.localMode, true);
  assert.equal(explicitLocal.fallback, false);
  assert.deepEqual(calls, [LOCAL_URLS.editions, LOCAL_URLS.menu]);
  assert.equal(normalizeDate('2026/11/7'),'2026-11-07');
  assert.match(jaDate('2026/11/7'),/11月7日/);
  console.log('✅ PASS: Google Sheets URLs, live feed, sample fallback warning state, invalid headers, offline override, date formatting');
})().catch(e => { console.error(e); process.exitCode=1; }).finally(() => { globalThis.fetch = originals.fetch; console.warn=originals.warn; });
