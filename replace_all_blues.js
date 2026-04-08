const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/vishwajeet.malusare/Downloads/anu_urja_frontend/app';

function walk(directory) {
    fs.readdirSync(directory).forEach(f => {
        let p = path.join(directory, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
            let content = fs.readFileSync(p, 'utf-8');
            let original = content;

            // Globals
            content = content.replace(/text-(indigo|blue)-(\d+)/g, (match, color, number) => {
                let n = parseInt(number);
                if (n >= 900) return 'text-slate-800';
                if (n >= 800) return 'text-slate-700';
                if (n >= 600) return 'text-slate-600';
                if (n >= 500) return 'text-slate-500';
                if (n >= 300) return 'text-slate-400';
                if (n >= 200) return 'text-slate-300';
                return 'text-slate-200';
            });

            if (content !== original) {
                fs.writeFileSync(p, content);
                console.log('Fixed', p);
            }
        }
    });
}
walk(dir);
