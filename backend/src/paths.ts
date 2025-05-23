import { addAliases } from 'module-alias';
import { join } from 'path';

const root = join(__dirname, '..');

addAliases({
  '@app': join(root, 'src'),
  '@modules': join(root, 'src/modules'),
  '@shared': join(root, 'src/shared'),
  '@auth': join(root, 'src/modules/auth'),
  '@users': join(root, 'src/modules/users'),
});
