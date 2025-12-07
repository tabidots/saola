const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUDIO_BASE_URL = 'https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev';
const AUDIO_VERSION = 'v1';
const JS_VERSION = 'v3';
const CSS_VERSION = 'v2';

// Read your JS files
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');
const tempDir = path.join(__dirname, '__temp_build__');

console.log('Creating temporary build directory...');

// Copy entire src to temp
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
}
fs.cpSync(srcDir, tempDir, { recursive: true });

// Patch all JS files in temp
console.log('Patching paths...');
const jsDir = path.join(tempDir, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

jsFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace audio URLs
    content = content.replace(
        /`\.\.\/audio\/\${filename}`/g,
        `\`${AUDIO_BASE_URL}/\${filename}?v=${AUDIO_VERSION}\``
    );

    content = content.replace(/(['"`])\.\.\/data\//g, '$1./data/');
    content = content.replace(/(['"`])\.\.\/md\//g, '$1./md/');

    fs.writeFileSync(filePath, content);
});

// Patch CSS
console.log('Patching CSS...');
const cssPath = path.join(tempDir, 'main.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Replace ../img/ with ./img/
cssContent = cssContent.replace(/url\((['"])?\.\.\/img\//g, 'url($1./img/');

fs.writeFileSync(cssPath, cssContent);

// Bundle and minify JS from temp
console.log('Bundling and minifying JavaScript...');
const bundlePath = path.join(publicDir, 'bundle.js');
execSync(
    `npx esbuild ${path.join(tempDir, 'js', 'main.js')} \
        --bundle \
        --minify \
        --format=esm \
        --outfile=${bundlePath}`,
    { stdio: 'inherit' }
);

// Minify CSS
console.log('Minifying CSS...');
const cssOutput = path.join(publicDir, 'main.min.css');
execSync(`npx cleancss -o ${cssOutput} ${cssPath}`);

// Update HTML to reference bundle.js
console.log('Updating HTML...');
const htmlInputPath = path.join(srcDir, 'index.html');  // Read from src
const htmlOutputPath = path.join(publicDir, 'index.html');  // Write to public
let htmlContent = fs.readFileSync(htmlInputPath, 'utf8');

// Replace main.js reference with bundle.js
htmlContent = htmlContent.replace(/src="js\/[^"]*main\.js"/, `src="bundle.js?v=${JS_VERSION}"`);

// Replace CSS reference with minified version
htmlContent = htmlContent.replace(/href="[^"]*main\.css"/, `href="main.min.css?v=${CSS_VERSION}"`);

fs.writeFileSync(htmlOutputPath, htmlContent);

// At the end of build.js, after the HTML update:

console.log('Copying assets...');

// Copy data folder
const dataSource = path.join(__dirname, 'data');
const dataTarget = path.join(publicDir, 'data');
if (fs.existsSync(dataTarget)) fs.rmSync(dataTarget, { recursive: true });
fs.cpSync(dataSource, dataTarget, { recursive: true });

// Copy img folder
const imgSource = path.join(__dirname, 'img');
const imgTarget = path.join(publicDir, 'img');
if (fs.existsSync(imgTarget)) fs.rmSync(imgTarget, { recursive: true });
fs.cpSync(imgSource, imgTarget, { recursive: true });

// Copy md folder
const mdSource = path.join(__dirname, 'md');
const mdTarget = path.join(publicDir, 'md');
if (fs.existsSync(mdTarget)) fs.rmSync(mdTarget, { recursive: true });
fs.cpSync(mdSource, mdTarget, { recursive: true });

// Clean up temp
console.log('Cleaning up...');
fs.rmSync(tempDir, { recursive: true });

console.log('Build complete!');