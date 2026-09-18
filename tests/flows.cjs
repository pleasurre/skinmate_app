const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const listeners={},els={app:{innerHTML:''},main:{scrollTop:0,focus(){}},toast:{classList:{add(){},remove(){}}}},stored={};
const c={structuredClone,console,setTimeout(){},clearTimeout(){},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},document:{getElementById:id=>els[id],addEventListener:(n,f)=>(listeners[n]??=[]).push(f)},window:{addEventListener(){}},history:{state:null,replaceState(){},pushState(){}},location:{hash:''}};
vm.createContext(c);const run=s=>vm.runInContext(s,c);
for(const f of ['data/catalog.js','services/recommendations.js','services/storage.js','components.js','views.js','redesign.js','app.js'])run(fs.readFileSync(f,'utf8'));
const click=(a,v='')=>listeners.click.forEach(f=>f({target:{closest:()=>({dataset:{action:a,value:v}})}}));
assert.equal((els.app.innerHTML.match(/login-provider/g)||[]).length,4);
for(const provider of ['Apple','카카오','네이버','이메일']){run("state.auth.loggedIn=false;state.onboarded=false;onboardingStep=0;render()");click('login-provider',provider);assert(els.app.innerHTML.includes('1/4'));}
click('onboard-next');click('profile-category','contour');click('profile-concern','볼살');
run("profileTreatmentQuery='온다리'");assert(run('profileTreatmentResults()').includes('온다리프팅'));
click('onboard-next');click('onboard-region','강남');click('onboard-next');click('onboard-next');assert(els.app.innerHTML.includes('내 관심사 이벤트'));
click('start');click('category','contour');click('concern','볼살');click('to-priority');for(const k of ['recovery','distance','price'])click('priority',k);run("state.draft.budget='30'");click('find');assert(els.app.innerHTML.includes('온다리프팅'));click('select-treatment','onda');click('compare-toggle','h1');click('compare-toggle','h2');click('compare');assert(els.app.innerHTML.includes('가상 병원 비교'));assert(run("L.calculateMatchScore({recovery:100,distance:80,price:60},['recovery','distance','price'])")===86);
click('navigate','explore');assert(els.app.innerHTML.includes('offer-rail'));click('save-offer','h1:onda');click('navigate','saved');assert(els.app.innerHTML.includes('190,000원'));assert(els.app.innerHTML.includes('270,000원'));run("state.selectedTreatment='potenza'");click('navigate','saved');assert(els.app.innerHTML.includes('온다리프팅'));
click('save-event','p1');click('save-tab','이벤트');assert(els.app.innerHTML.includes('190,000원'));
click('navigate','explore');click('beauty-category','contour');click('beauty-sub','볼살');run("exploreRegion='잠실';render()");assert(!els.app.innerHTML.includes('메이트 피부과'));assert(els.app.innerHTML.includes('라움 피부과'));
click('navigate','community');click('story-like','r0-0');click('story-help','r0-0');click('story-tab','qa');assert(els.app.innerHTML.includes('첫 상담'));click('story-tab','free');assert(els.app.innerHTML.includes('피부 고민 노트'));run("state.community.comments['r0-0']=['테스트 댓글'];const restored=SkinmateStorage.clean(state,D);if(restored.community.comments['r0-0'][0]!=='테스트 댓글'||!restored.community.likes.includes('r0-0')||restored.savedTreatments.h1!=='onda')throw Error('Persistence failure');");
run("state=structuredClone(SkinmateStorage.initial);render()");assert(els.app.innerHTML.includes('Apple로 로그인'));
console.log('PASS: 4 login providers, 4-step onboarding, concern selection, autocomplete, recommendation, weighted score, 2-hospital comparison, saved exact pricing, events, filters, community tabs/reactions and persistence, reset.');
