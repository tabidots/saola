const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUDIO_BASE_URL = 'https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev';
const AUDIO_VERSION = 'v1';
const JS_VERSION = 'v1';

// Read your JS files
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

// ------------------------------
// Load ui.js and inject audio URLs in-memory
// ------------------------------
const uiJsPath = path.join(srcDir, 'js', 'ui.js');
let uiJsContent = fs.readFileSync(uiJsPath, 'utf8');

// Replace only inside the loaded string
uiJsContent = uiJsContent.replace(
    /const audio = new Audio\(`\.\.\/audio\/\${filename}`\);/g,
    `const audio = new Audio(\`${AUDIO_BASE_URL}/\${filename}?v=${AUDIO_VERSION}\`);`
);

// TEMP memory file path for esbuild stdin
const patchedUiPath = path.join(srcDir, 'js', '__ui_patched__.js');
fs.writeFileSync(patchedUiPath, uiJsContent);

// Bundle and minify JS with esbuild (still use main.js as entry point)
console.log('Bundling and minifying JavaScript...');
const bundlePath = path.join(publicDir, 'bundle.js');
execSync(
    `npx esbuild ${path.join(srcDir, 'js', 'main.js')} \
        --bundle \
        --minify \
        --format=esm \
        --outfile=${bundlePath} \
        --inject:${patchedUiPath}`,
    { stdio: 'inherit' }
);

// Remove temporary patched file
fs.unlinkSync(patchedUiPath);

// Minify CSS
console.log('Minifying CSS...');
const cssInput = path.join(srcDir, 'main.css');
const cssOutput = path.join(publicDir, 'main.min.css');
execSync(`npx cleancss -o ${cssOutput} ${cssInput}`);

// Update HTML to reference bundle.js
console.log('Updating HTML...');
const htmlInputPath = path.join(srcDir, 'index.html');  // Read from src
const htmlOutputPath = path.join(publicDir, 'index.html');  // Write to public
let htmlContent = fs.readFileSync(htmlInputPath, 'utf8');

// Replace main.js reference with bundle.js
htmlContent = htmlContent.replace(/src="js\/[^"]*main\.js"/, `src="bundle.js?v=${JS_VERSION}"`);

// Replace CSS reference with minified version
htmlContent = htmlContent.replace(/href="[^"]*main\.css"/, 'href="main.min.css"');

fs.writeFileSync(htmlOutputPath, htmlContent);

console.log('Build complete!');