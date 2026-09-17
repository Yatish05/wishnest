// NOTE: public/blog.css must be manually regenerated whenever theme.css, index.css, or App.css change.
import fs from 'fs';

fs.writeFileSync('public/blog.css',
  fs.readFileSync('src/styles/theme.css', 'utf8') + '\n' +
  fs.readFileSync('src/index.css', 'utf8') + '\n' +
  fs.readFileSync('src/App.css', 'utf8')
);
