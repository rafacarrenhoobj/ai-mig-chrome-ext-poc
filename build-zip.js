const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream('extension.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Archive créée : ${archive.pointer()} bytes`);
});

archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();
