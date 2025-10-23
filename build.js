import * as esbuild from 'esbuild';

const isDev = process.argv.includes('--watch');

// ==========================================
// JavaScript Bundle Config
// ==========================================
const jsConfig = {
  entryPoints: ['src/js/main.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  sourcemap: isDev,
  minify: !isDev,
  target: ['es2020'],
};

// ==========================================
// Check if AOS is installed
// ==========================================
let hasAOS = false;
try {
  await import('aos');
  hasAOS = true;
} catch {
  hasAOS = false;
}

// ==========================================
// CSS Bundle Config (only if AOS installed)
// ==========================================
const cssConfig = hasAOS ? {
  entryPoints: ['node_modules/aos/dist/aos.css'],
  outfile: 'dist/aos.css',
  minify: !isDev,
  loader: { '.css': 'css' }
} : null;

// ==========================================
// Build or Watch
// ==========================================
if (isDev) {
  // Watch mode
  const jsCtx = await esbuild.context(jsConfig);
  await jsCtx.watch();
  
  if (cssConfig) {
    const cssCtx = await esbuild.context(cssConfig);
    await cssCtx.watch();
    console.log('Watching JS and AOS CSS changes...');
  } else {
    console.log('Watching JS changes...');
  }
} else {
  // Build mode
  const builds = [esbuild.build(jsConfig)];
  
  if (cssConfig) {
    builds.push(esbuild.build(cssConfig));
  }
  
  await Promise.all(builds);
  
  console.log('Build complete' + (cssConfig ? ' (with AOS CSS)' : '') + '.');
}
