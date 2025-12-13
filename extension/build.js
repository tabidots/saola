const { execSync } = require('child_process');

execSync(
    `handlebars popup.handlebars -f popup.precompiled.js`,
    { stdio: 'inherit', cwd: __dirname }
);

// Bundle content.js with all dependencies
execSync(
    `npx esbuild content.js \
        --bundle \
        --outfile=bundle.js`,
    { stdio: 'inherit', cwd: __dirname }
);

console.log('Extension bundled!');