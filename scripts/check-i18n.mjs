import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const en = JSON.parse(readFileSync('i18n/en.json','utf8'))
const es = JSON.parse(readFileSync('i18n/es.json','utf8'))
const de = JSON.parse(readFileSync('i18n/de.json','utf8'))
const hu = JSON.parse(readFileSync('i18n/hu.json','utf8'))

function flatten(obj, prefix = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key))
    else out[key] = v
  }
  return out
}

const enFlat = flatten(en)
const esFlat = flatten(es)
const deFlat = flatten(de)
const huFlat = flatten(hu)

function listFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...listFiles(p))
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

const files = listFiles('src')

const missing = new Set()
const keyRe = /\bt\(\s*['"]([\w.-]+)['"]/g

for (const f of files) {
  const src = readFileSync(f,'utf8')
  let m
  while ((m = keyRe.exec(src))) {
    const key = m[1]
    if (!(key in enFlat)) missing.add(key)
  }
}

if (missing.size) {
  console.error('Missing i18n keys in i18n/en.json:')
  for (const k of missing) console.error(' -', k)
  process.exit(1)
} else {
  console.log('en keys OK')
}

// Warn for missing keys in other locales but do not fail the build
const locales = [ ['es', esFlat], ['de', deFlat], ['hu', huFlat] ]
for (const [name, flat] of locales) {
  const miss = []
  for (const k of Object.keys(enFlat)) {
    if (!(k in flat)) miss.push(k)
  }
  if (miss.length) {
    console.warn(`[i18n] ${name} missing ${miss.length} keys (showing up to 20):`)
    for (const k of miss.slice(0,20)) console.warn(' -', k)
  } else {
    console.log(`${name} keys OK`)
  }
}
