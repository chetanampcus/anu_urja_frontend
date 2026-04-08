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

            // Remove bg-white and use #FAFAFA
            content = content.replace(/\bbg-white\b/g, 'bg-[#FAFAFA]');
            content = content.replace(/\bhover:bg-white\b/g, 'hover:bg-[#FAFAFA]');
            content = content.replace(/\bfocus:bg-white\b/g, 'focus:bg-[#FAFAFA]');
            content = content.replace(/\bfocus-within:bg-white\b/g, 'focus-within:bg-[#FAFAFA]');
            content = content.replace(/\bfrom-white\b/g, 'from-[#FAFAFA]');
            content = content.replace(/\bvia-white\b/g, 'via-[#FAFAFA]');
            content = content.replace(/\bto-white\b/g, 'to-[#FAFAFA]');
            
            // Adjust surrounding light slate colors to be explicit FAFAFA shades
            // #F5F5F5 and #EEEEEE etc. 
            content = content.replace(/\bbg-slate-50\b/g, 'bg-[#F7F7F7]');
            content = content.replace(/\bhover:bg-slate-50\b/g, 'hover:bg-[#F7F7F7]');
            content = content.replace(/\bfrom-slate-50\b/g, 'from-[#F7F7F7]');
            content = content.replace(/\bto-slate-50\b/g, 'to-[#F7F7F7]');
            content = content.replace(/\bvia-slate-50\b/g, 'via-[#F7F7F7]');

            content = content.replace(/\bbg-slate-100\b/g, 'bg-[#F0F0F0]');
            content = content.replace(/\bhover:bg-slate-100\b/g, 'hover:bg-[#F0F0F0]');
            content = content.replace(/\bfrom-slate-100\b/g, 'from-[#F0F0F0]');
            content = content.replace(/\bto-slate-100\b/g, 'to-[#F0F0F0]');
            content = content.replace(/\bvia-slate-100\b/g, 'via-[#F0F0F0]');

            if (content !== original) {
                fs.writeFileSync(p, content);
                console.log('Fixed', p);
            }
        }
    });
}
walk(dir);
