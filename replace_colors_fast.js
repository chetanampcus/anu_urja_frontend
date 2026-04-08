const fs = require('fs');

const files = [
    './app/page.tsx',
    './app/dashboard/page.tsx',
];

const regexes = [
    // Replace indigo texts
    [/text-indigo-950/g, 'text-gray-800'],
    [/text-indigo-900/g, 'text-gray-800'],
    [/text-indigo-800/g, 'text-gray-700'],
    [/text-indigo-700/g, 'text-gray-600'],
    [/text-indigo-600/g, 'text-gray-600'],
    [/text-indigo-500/g, 'text-gray-500'],
    [/text-indigo-400/g, 'text-gray-400'],
    [/text-indigo-300/g, 'text-gray-400'],
    [/text-indigo-200/g, 'text-gray-300'],
    [/text-indigo-100/g, 'text-gray-200'],
    
    // Replace blue texts
    [/text-blue-900/g, 'text-gray-800'],
    [/text-blue-800/g, 'text-gray-700'],
    [/text-blue-700/g, 'text-gray-600'],
    [/text-blue-600/g, 'text-gray-600'],
    [/text-blue-500/g, 'text-gray-500'],
    [/text-blue-400/g, 'text-gray-400'],
    [/text-blue-300/g, 'text-gray-400'],
    [/text-blue-200/g, 'text-gray-300'],
    [/text-blue-100/g, 'text-gray-200'],

    // Replace strict dark texts
    [/text-slate-900/g, 'text-slate-700'],
    [/text-black/g, 'text-slate-700']
];

files.forEach(file => {
    if(fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        regexes.forEach(([reg, rep]) => {
            content = content.replace(reg, rep);
        });
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
