const fs = require('fs');
const path = require('path');

const replacements = {
    'text-slate-900': 'text-slate-700',
    'text-slate-800': 'text-slate-600',
    'text-gray-900': 'text-gray-700',
    'text-gray-800': 'text-gray-600',
    'text-indigo-950': 'text-indigo-800',
    'text-indigo-900': 'text-indigo-700',
    'text-black': 'text-slate-700'
};

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const targetDir = path.join(__dirname, 'app');

walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = content;
        
        for (const [oldClass, newClass] of Object.entries(replacements)) {
            // Regex to match exact class name and not match dark:text-... where we might not want to
            // Actually replacing dark:text-slate-900 with dark:text-slate-700 is fine as well.
            const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
            modified = modified.replace(regex, newClass);
        }
        
        if (modified !== content) {
            fs.writeFileSync(filePath, modified, 'utf-8');
            console.log(`Updated ${filePath}`);
        }
    }
});
