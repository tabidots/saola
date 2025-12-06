const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUDIO_BASE_URL = 'https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev';
const AUDIO_VERSION = 'v1';

// Read your JS files
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

// Do the audio URL replacement in ui.js
const uiJsPath = path.join(srcDir, 'js', 'ui.js');
let uiJsContent = fs.readFileSync(uiJsPath, 'utf8');
const originalContent = uiJsContent;

uiJsContent = uiJsContent.replace(
    /const audio = new Audio\(`\.\.\/audio\/\${filename}`\);/g,
    `const audio = new Audio(\`${AUDIO_BASE_URL}/\${filename}?v=${AUDIO_VERSION}\`);`
);

// Write the modified version temporarily
fs.writeFileSync(uiJsPath, uiJsContent);

// Bundle and minify JS with esbuild (still use main.js as entry point)
console.log('Bundling and minifying JavaScript...');
const bundlePath = path.join(publicDir, 'bundle.js');
execSync(`npx esbuild ${path.join(srcDir, 'js', 'main.js')} --bundle --format=esm --outfile=${bundlePath}`);
// execSync(`npx esbuild ${path.join(srcDir, 'js', 'main.js')} --bundle --minify --format=esm --outfile=${bundlePath}`);

// Restore original main.js
fs.writeFileSync(uiJsPath, originalContent);

// Minify JS with terser
console.log('Minifying JavaScript...');
execSync(`npx terser ${bundlePath} -o ${bundlePath} --compress --mangle`);

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
htmlContent = htmlContent.replace(/src="js\/[^"]*main\.js"/, 'src="bundle.js"');

// Replace CSS reference with minified version
htmlContent = htmlContent.replace(/href="[^"]*main\.css"/, 'href="main.min.css"');

fs.writeFileSync(htmlOutputPath, htmlContent);

console.log('Build complete!');