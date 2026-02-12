const fs = require('fs');
const path = 'c:/Users/nhaxh/Downloads/Medi-Mart-main/frontend/src/Pages/Home/BestSeller.jsx';
let content = fs.readFileSync(path, 'utf8');

// The block we want to replace, including the mapping logic
const oldPart = /return \(\s+<div\s+key={p\._id}\s+className={`swipe-hint-animation \${delayClass} flex-shrink-0 md:w-\[227px\] md:px-0 \${window\.innerWidth < 768\s+\? \(index === products\.length - 1 && index % 2 === 0\s+\? 'w-\[calc\(50vw-32px\)\] mx-\[calc\(25vw\+16px\)\] snap-center'\s+: \(index % 2 === 0 \? 'w-\[calc\(50vw-32px\)\] ml-6 snap-start' : 'w-\[calc\(50vw-32px\)\] mr-6 snap-none'\)\)\s+: ''\s+}\`}\s+>/g;

const newPart = `return (
                            <div
                              key={p._id}
                              className={\`swipe-hint-animation \${delayClass} flex-shrink-0 md:w-[227px] md:px-0 \${window.innerWidth < 768
                                  ? \\\`w-[calc(50vw-32px)] \${index % 2 === 0 ? 'snap-start' : 'snap-none'} \${index === products.length - 1 && index % 2 === 0 ? 'snap-center' : ''}\\\`
                                  : ''
                                }\`}
                            >`;

// Re-evaluate using a simpler regex since the multi-line one is fragile
const simplerRegex = /className={`swipe-hint-animation \${delayClass} flex-shrink-0 md:w-\[227px\] md:px-0 \${window\.innerWidth < 768[^}]+?}`/g;

content = content.replace(simplerRegex, 'className={`swipe-hint-animation ${delayClass} flex-shrink-0 md:w-[227px] md:px-0 ${window.innerWidth < 768 ? \\`w-[calc(50vw-32px)] ${index % 2 === 0 ? \'snap-start\' : \'snap-none\'} ${index === products.length - 1 && index % 2 === 0 ? \'snap-center\' : \'\'}\\` : \'\'}`}');

fs.writeFileSync(path, content);
console.log('Successfully updated BestSeller.jsx');
