const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const listeners={},els={app:{innerHTML:''},main:{scrollTop:0,focus(){}},toast:{classList:{add(){},remove(){}}}},stored={};
const c={structuredClone,console,setTimeout(){},clearTimeout(){},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},document:{getElementById:id=>els[id],addEventListener:(n,f)=>(listeners[n]??=[]).push(f)},window:{addEventListener(){}},history:{state:null,replaceState(){},pushState(){}},location:{hash:''}};
vm.createContext(c);const run=s=>vm.runInContext(s,c);
for(const f of ['data/catalog.js','services/recommendations.js','services/storage.js','components.js','views.js','redesign.js','app.js'])run(fs.readFileSync(f,'utf8'));
run("state.auth.loggedIn=true;state.onboarded=true;state.profile.region='강남';state.profile.concerns=['겨드랑이'];screen='home';render()");
assert(els.app.innerHTML.includes('맞춤 시술 추천받기'));assert(!els.app.innerHTML.includes('추천 이어보기'));assert(els.app.innerHTML.includes('제모 시술 모음'));assert(els.app.innerHTML.includes('브라질리언왁싱'));assert(els.app.innerHTML.includes('레이저 제모'));assert(els.app.innerHTML.includes('assets/photos/'));assert(!els.app.innerHTML.includes('피부 고민 노트'));
run("homeFilters.hair='브라질리언왁싱';render()");assert(els.app.innerHTML.includes('시술 정보가 아직 없어요'));run("state.profile.concerns=['여드름 흉터','피지'];render()");assert(els.app.innerHTML.includes('패인 여드름 흉터란?'));assert(els.app.innerHTML.includes('프락셔널 레이저'));assert(els.app.innerHTML.includes('포텐자'));assert(els.app.innerHTML.includes('Q&A'));
run("state.saved=['h1'];state.savedTreatments.h1='onda';render()");assert(els.app.innerHTML.includes('찜한 병원 다시보기'));assert(els.app.innerHTML.includes('190,000원'));assert(els.app.innerHTML.includes('온다리프팅'));
console.log('PASS: new hero, multi-interest sections, hair tabs, missing-data state, knowledge, Q&A, exact saved prices and image sources');
for(const h of run('D.hospitals')){
 const photo=run(`hospitalPhoto(hospital('${h.id}'))`);assert(fs.existsSync(photo),photo);
 run(`routeId='${h.id}';screen='detail';render()`);assert(els.app.innerHTML.includes(photo));assert(els.app.innerHTML.includes('hospital-photo-panel is-detail'));
}
console.log('PASS: every hospital detail has a bundled photo matching its card');
