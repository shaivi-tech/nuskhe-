const fs = require('fs');
const path = require('path');

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        case '.webp': return 'image/webp';
        default: return 'application/octet-stream';
    }
}

function getBase64DataUri(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found - ${filePath}`);
        return null;
    }
    const mimeType = getMimeType(filePath);
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mimeType};base64,${data}`;
}

function main() {
    let htmlContent = fs.readFileSync('index.html', 'utf8');

    // Replace src="images/..."
    htmlContent = htmlContent.replace(/src="([^"]+)"/g, (match, urlPath) => {
        if (urlPath.startsWith('images/')) {
            const dataUri = getBase64DataUri(path.normalize(urlPath));
            if (dataUri) return `src="${dataUri}"`;
        }
        return match;
    });

    // Replace src='images/...'
    htmlContent = htmlContent.replace(/src='([^']+)'/g, (match, urlPath) => {
        if (urlPath.startsWith('images/')) {
            const dataUri = getBase64DataUri(path.normalize(urlPath));
            if (dataUri) return `src='${dataUri}'`;
        }
        return match;
    });

    // Replace url("images/...") or url('images/...') or url(images/...)
    htmlContent = htmlContent.replace(/url\((["']?)([^)"']+)\1\)/g, (match, quote, urlPath) => {
        if (urlPath.startsWith('images/')) {
            const dataUri = getBase64DataUri(path.normalize(urlPath));
            if (dataUri) return `url(${quote}${dataUri}${quote})`;
        }
        return match;
    });

    fs.writeFileSync('index_embed.html', htmlContent, 'utf8');
    console.log('Successfully created index_embed.html');
}

main();
