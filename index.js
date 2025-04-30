const fs = require('fs')
const os = require('os')
const path = require('path')
const { execSync } = require('child_process')

module.exports = function pack (opts = {}) {
  const {
    cwd = path.resolve('.')
  } = opts

  const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'))

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-pack'))
  const tgz = pkg.name + '-' + pkg.version + '.tgz'

  const files = pkg.files || ['package.json']

  // Not following the NPM standard, so be explicit on files
  if (!files.includes('package.json')) {
    files.push('package.json')
  }

  let count = 0

  for (const name of files) {
    const src = path.join(cwd, name)
    const dst = path.join(path.join(tmp, 'package'), name)

    count += copy(src, dst)
  }

  execSync('tar -czf ' + tgz + ' -C ' + tmp + ' package')

  fs.rmSync(tmp, { recursive: true, force: true })

  console.log('Tarball Details')
  console.log('name:', pkg.name)
  console.log('version:', pkg.version)
  console.log('files:', count)
  console.log('✅', tgz)
}

function copy (src, dst) {
  const st = fs.statSync(src)

  let count = 0

  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true })

    for (const entry of fs.readdirSync(src)) {
      copy(path.join(src, entry), path.join(dst, entry))
    }
  } else {
    fs.copyFileSync(src, dst)

    count++
  }

  return count
}
