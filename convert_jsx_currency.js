const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace >${ with >₹{ (e.g. >${product.price} -> >₹{product.price})
    let newContent = content.replace(/>\$\{/g, '>₹{');
    
    // Replace " ${" with " ₹{" (e.g. " ${product.price}" -> " ₹{product.price}")
    newContent = newContent.replace(/ \$\{/g, ' ₹{');
    
    // Replace (${ with (₹{ (e.g. (${product.price}) -> (₹{product.price})
    newContent = newContent.replace(/\(\$\{/g, '(₹{');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log('Updated JSX interpolation in:', file);
    }
});

console.log('Total files updated:', changedCount);
