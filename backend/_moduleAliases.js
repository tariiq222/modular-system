const path = require('path');

const basePath = __dirname;

module.exports = {
  '@app': path.join(basePath, 'src'),
  '@modules': path.join(basePath, 'src/modules'),
  '@shared': path.join(basePath, 'src/shared'),
  '@auth': path.join(basePath, 'src/modules/auth'),
  '@users': path.join(basePath, 'src/modules/users'),
};
