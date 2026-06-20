const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Error: SUPABASE_URL dan SUPABASE_ANON_KEY harus diset di environment variables.');
  process.exit(1);
}

const content = `export const SUPABASE_URL = '${url}';\nexport const SUPABASE_ANON_KEY = '${key}';\n`;

const outPath = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(outPath, content);
console.log('js/config.js berhasil dibuat.');
