const fs = require('fs');
const glob = require('glob');
const path = require('path');

module.exports = (config) => {
  return {
    name: 'copy-file',
    setup(build) {
      const fromPath = config.from;
      const toPath = config.to;
      const exclude = config.exclude || [];

      build.onEnd((result) => {
        if (result.errors.length > 0) {
          return;
        }

        if (fromPath.includes('*')) {
          glob.sync(fromPath).forEach((file) => {
            if (exclude.includes(file)) return;
            const destPath = path.join(toPath, path.basename(file));
            if (! fs.existsSync(toPath)) fs.mkdirSync(toPath);
            fs.copyFileSync(file, destPath);

            if (config.hasOwnProperty('move') && config.move) {
              fs.unlinkSync(fromPath);
            }
          });
        } else {
          if (!fs.existsSync(fromPath)) {
            console.warn('ESBuild Copy: From path doesn\'t exist! Ignoring..');
          }

          fs.copyFileSync(fromPath, toPath);

          if (config.hasOwnProperty('move') && config.move) {
            fs.unlinkSync(fromPath);
          }
        }
      });
    },
  }
}
