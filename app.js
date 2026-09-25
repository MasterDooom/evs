const files=['topic1.js','topic2.js','topic3.js','topic4.js','topic5.js','questions1.js','questions2.js','app-ui.js'];
function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
files.reduce((p,src)=>p.then(()=>load(src)),Promise.resolve()).catch(console.error);