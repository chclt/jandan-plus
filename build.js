const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');


const ignore = [
    '.DS_Store', '.idea',
    '.git', '.gitignore',
    'node_modules',
    'package.json', 'package-lock.json',

    'LICENSE', 'README.md',
    'rollup.config.js',
    'dist',
    'build.js',

    'index.js',
];

const dist = 'dist';


console.log('Building...');

fs.readdirSync(__dirname).forEach(file => {
    if (ignore.includes(file)) return;
    if (fs.lstatSync(file).isDirectory()) {
        copyFolder(file, path.join(__dirname, dist, file));
        return;
    } else {
        fs.copyFileSync(file, path.join(__dirname, dist, file));
    }

    
});

execSync('rollup -c --bundleConfigAsCjs');

console.log('Done.');

function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }

    const files = fs.readdirSync(src);

    for (let i = 0; i < files.length; i++) {
        if (files[i] === '.DS_Store') continue;

        const currPath = path.join(src, files[i]);
        const destPath = path.join(dest, files[i]);

        if (fs.lstatSync(currPath).isFile()) {
            fs.copyFileSync(currPath, destPath);
        } else {
            copyFolder(currPath, destPath);
        }
    }
}
