const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUDIO_BASE_URL = 'https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev';
const AUDIO_VERSION = 'v1';

// Read your JS files
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

// Read and bundle JS files
let jsContent = '';
const jsFiles = ['utils.js', 'data-loader.js', 'search.js', 'templates.js', 'display.js', 'ui.js', 'main.js'];

jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(srcDir, 'js', file), 'utf8');
    jsContent += content + '\n';
});

// Replace the audio path
jsContent = jsContent.replace(
    /const audio = new Audio\(`\.\.\/audio\/\${filename}`\);/g,
    `const audio = new Audio(\`${AUDIO_BASE_URL}/\${filename}?v=${AUDIO_VERSION}\`);`
);

// Write bundled JS
const bundlePath = path.join(publicDir, 'bundle.js');
fs.writeFileSync(bundlePath, jsContent);

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