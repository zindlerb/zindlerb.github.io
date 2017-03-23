// DELETE ALL UNPROTECTED IN ROOT
const protectedPaths = [
  '.DS_Store',
  '.git',
  '.gitignore',
  'README.md',
  'build_site.js',
  'dist',
  'node_modules',
  'officeHours',
  'package.json',
  'rain',
  'squiggle',
  'src',
  'svgTransforms',
  'webpack.config.js',
  'clean.js',
  'writing'
];

fs.readdir('.', (err, files) => {
  files.forEach((file) => {
    if (protectedPaths.indexOf(file) === -1) {
      rimraf(file, {
        disableGlob: true
      }, (err) => {
        if (err) {
          throw err;
        }
      });
    }
  });
});
