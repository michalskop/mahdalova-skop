// Ověří, že stažená binárka ffmpeg je přesně ta, kterou zveřejnil projekt
// eugeneware/ffmpeg-static (release b6.1.1). Instalátor balíčku otisk sám
// nekontroluje, proto to děláme tady. Při neshodě binárku smaže a skončí chybou.
// Otisky z GitHub API: repos/eugeneware/ffmpeg-static/releases/tags/b6.1.1
'use strict'
const fs = require('fs')
const crypto = require('crypto')

const EXPECTED = {
  'win32-x64': '04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00',
  // Další platformy (Michal) doplnit ze stejného releasu, než je někdo použije.
}

const key = `${process.platform}-${process.arch}`
const binaryPath = require('ffmpeg-static')
const expected = EXPECTED[key]

if (!binaryPath || !fs.existsSync(binaryPath)) {
  console.error(`ffmpeg nenalezen (${binaryPath}).`)
  process.exit(1)
}
if (!expected) {
  console.error(`Pro platformu ${key} není v verify-ffmpeg.cjs zapsaný otisk. ffmpeg nepoužívej, dokud ho nedoplníš z GitHub releasu b6.1.1.`)
  process.exit(1)
}

const actual = crypto.createHash('sha256').update(fs.readFileSync(binaryPath)).digest('hex')
if (actual !== expected) {
  fs.unlinkSync(binaryPath)
  console.error(`Otisk ffmpeg NESEDÍ – binárka smazána.\n  čekáno:   ${expected}\n  staženo:  ${actual}`)
  process.exit(1)
}
console.log(`ffmpeg ověřen (SHA256 sedí): ${binaryPath}`)
