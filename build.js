const fs = require('fs');
const path = require('path');

function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }

    const files = fs.readdirSync(src);

    for (let i = 0; i < files.length; i++) {
        const currPath = path.join(src, files[i]);
        const destPath = path.join(dest, files[i]);

        if (fs.lstatSync(currPath).isFile()) {
            fs.copyFileSync(currPath, destPath);
        } else {
            copyFolder(currPath, destPath);
        }
    }
}

fs.copyFile(
    path.join(__dirname, 'index.css'),
    path.join(__dirname, 'dist/index.css'),
    (err) => {
        if (err) throw err;
    }
);

fs.copyFile(
    path.join(__dirname, 'extension/manifest.json'),
    path.join(__dirname, 'dist/manifest.json'),
    (err) => {
        if (err) throw err;
    }
);

copyFolder('assets', 'dist/assets');