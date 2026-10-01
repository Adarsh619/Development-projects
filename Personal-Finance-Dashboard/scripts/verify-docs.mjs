import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const files=['README.md',...fs.readdirSync('docs').filter(f=>f.endsWith('.md')).map(f=>`docs/${f}`)];
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));let refs=0;let commands=0;
for(const file of files){
 const text=fs.readFileSync(file,'utf8');
 for(const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
  const target=match[1];if(/^(https?:|mailto:|#)/.test(target))continue;
  const resolved=path.resolve(path.dirname(file),decodeURIComponent(target.split('#')[0]));
  assert.ok(resolved.startsWith(root+path.sep),`${file}: link escapes project: ${target}`);
  assert.ok(fs.existsSync(resolved),`${file}: missing ${target}`);refs++;
 }
 for(const match of text.matchAll(/npm run ([a-z][a-z\d:-]*)/g)){assert.ok(pkg.scripts[match[1]],`${file}: unknown npm script ${match[1]}`);commands++;}
}
const env=fs.readFileSync('.env.example','utf8');const vars=[...env.matchAll(/^([A-Z][A-Z_]+)=/gm)].map(m=>m[1]);
const readme=fs.readFileSync('README.md','utf8');for(const name of vars)assert.ok(readme.includes(name),`Undocumented env variable ${name}`);
for(const line of env.split(/\r?\n/).filter(line=>/^[A-Z_]+KEY=|^[A-Z_]+TOKEN=/.test(line)))assert.equal(line.split('=').slice(1).join('='),'','Nonempty credential example');
const workflow=fs.readFileSync('.github/workflows/checks.yml','utf8');assert.ok(!workflow.includes('Personal-Finance-Dashboard/'),'Standalone workflow has monorepo paths');assert.ok(workflow.includes('cache-dependency-path: package-lock.json'));
for(const script of ['scripts/verify-api.mjs','scripts/verify-browser.mjs','scripts/verify-navigation.mjs','scripts/capture-screenshots.mjs'])assert.ok(fs.existsSync(script));
for(const file of ['supabase/schema.sql','netlify/functions/api.ts','analytics/analyze.py','analytics/sample.csv','analytics/sample-output.json','automation/docker-compose.yml','automation/weekly-report.json','netlify.toml','package-lock.json'])assert.ok(fs.existsSync(file));
console.log(`Documentation verified: ${files.length} guides, ${refs} local links/assets, ${commands} npm command references, ${vars.length} environment variables and standalone CI paths.`);
