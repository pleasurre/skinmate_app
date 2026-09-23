const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const listeners={},els={app:{innerHTML:'',setAttribute(){}},main:{scrollTop:0,focus(){}},toast:{classList:{add(){},remove(){}}}},stored={};
const c={structuredClone,console,setTimeout(){},clearTimeout(){},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},document:{getElementById:id=>els[id],addEventListener:(n,f,opt)=>(listeners[n]??=[]).push({f,capture:opt===true}),querySelector(){return null}},window:{addEventListener(){}},history:{state:null,replaceState(){},pushState(){}},location:{hash:''}};
stored['skinmate-v2']=JSON.stringify({auth:{loggedIn:true},onboarded:true});
vm.createContext(c);const run=s=>vm.runInContext(s,c);
const files=['data/catalog.js','data/relations.js','services/recommendations.js','services/storage.js','components.js','views.js','redesign.js','decision-ui.js','reference-ui.js','app.js'];for(const f of files)run(fs.readFileSync(f,'utf8'));
assert.equal(run('screen'),'home'); // a returning signed-in user stays on the saved route
const click=(a,v='')=>{let stop=false;const el={dataset:{action:a,value:v}};for(const {f} of [...listeners.click].sort((a,b)=>Number(b.capture)-Number(a.capture))){if(stop)break;f({target:{closest:selector=>selector==='[data-action]'?el:null},preventDefault(){},stopImmediatePropagation(){stop=true;}});}};
run("state.auth.loggedIn=true;state.onboarded=true;state.profile.concerns=['여드름 흉터'];state.profile.region='강남';screen='home';render()");
assert(els.app.innerHTML.includes('여드름 흉터,'));const fallback=els.app.innerHTML;
click('start');assert(els.app.innerHTML.includes('decision-category-grid'));assert(!els.app.innerHTML.includes('subconcern-grid'));
click('reference-category','contour');assert.equal(run('screen'),'concern');assert(els.app.innerHTML.includes('사각턱'));assert(!els.app.innerHTML.includes('여드름 흉터'));
click('reference-concern','squareJaw');click('to-priority');for(const k of ['trust','recovery','price'])click('priority',k);click('priority','effect');assert.equal(run('state.draft.priorities.length'),3);click('find');assert.equal(run('state.activeConcern'),'squareJaw');assert.equal(run('screen'),'treatments');assert(els.app.innerHTML.includes('사각턱 보톡스'));assert(!els.app.innerHTML.includes('프락셔널 레이저'));assert(!/일치도|50%|30%|20%/.test(els.app.innerHTML));
click('decision-hospitals','botox');assert.equal(run('screen'),'hospitals');assert.equal(run('state.selectedTreatment'),'botox');assert(els.app.innerHTML.includes('decision-reason'));assert((els.app.innerHTML.match(/connected-hospital/g)||[]).length>=4);
const before=run("L.aggregateReviews('h1','botox').count");const reason=run("ReasonSheetContent('h1','botox')");assert(reason.includes('8건 중'));assert.notEqual(reason,run("ReasonSheetContent('h2','botox')"));
click('save-offer','h1:botox');assert.equal(run('screen'),'hospitals');assert(run("state.saved.includes('h1')"));click('offer-detail','h1:botox');assert.equal(run('screen'),'detail');assert(els.app.innerHTML.includes('hospital-treatment-row'));assert(!els.app.innerHTML.includes('병원 상세</span>'));assert(!els.app.innerHTML.includes('회복 관련 후기'));click('decision-reviews','h1:botox');assert.equal(run('screen'),'hospital-reviews');assert(els.app.innerHTML.includes('추천에 반영된 평가 보기'));
assert(run("saveReviewRecord('h1','botox',{overallRating:5,effectRating:5,recoveryRating:5,priceRating:5,painRating:5,doctorTrustRating:5,distanceRating:5,content:'새로운 체험 후기입니다.'})"));assert.equal(run("L.aggregateReviews('h1','botox').count"),before+1);assert(run("SkinmateStorage.clean(JSON.parse(localStorage.getItem('skinmate-v2')),D).userReviews.length===1"));
click('navigate','home');const jaw=els.app.innerHTML;assert(jaw.includes('사각턱,'));assert(!jaw.includes('패인 여드름 흉터란?'));assert(jaw.includes('event-botox'));assert(!jaw.includes('event-fractional'));
click('start');click('reference-category','trouble');click('reference-concern','acneScar');click('navigate','home');assert(els.app.innerHTML.includes('사각턱,')); // unfinished draft cannot change Home
click('personalized-home');assert.equal(run('screen'),'concern');assert.equal(run('state.draft.category'),'');assert.equal(run('state.draft.concern'),'');assert.equal(run('state.draft.priorities.length'),0);assert(!els.app.innerHTML.includes('subconcern-grid'));
click('start');click('reference-category','trouble');click('reference-concern','acneScar');click('to-priority');for(const k of ['recovery','trust','price'])click('priority',k);click('find');assert.equal(run('state.activeConcern'),'acneScar');assert.equal((els.app.innerHTML.match(/connected-treatment/g)||[]).length,4);click('treatments-more');assert((els.app.innerHTML.match(/connected-treatment/g)||[]).length>4);click('navigate','home');const scar=els.app.innerHTML;assert.notEqual(jaw,scar);assert(scar.includes('패인 여드름 흉터란?'));assert(!scar.split('찜한 병원 다시보기')[0].includes('사각턱 보톡스')); assert(scar.includes('프락셔널'));assert(scar.includes('흉터 치료는 한 가지'));
// State round trip, relational integrity and image completeness.
assert.equal(run('SkinmateStorage.clean(state,D).activeConcern'),'acneScar');assert.deepEqual([...run('SkinmateStorage.clean(state,D).recommendation.priorities')],['recovery','trust','price']);
assert(run("D.treatments.every(t=>t.concernIds.every(id=>D.subConcerns.some(c=>c.id===id))&&t.hospitalIds.length>0)"));assert(run("D.reviews.every(r=>D.hospitalTreatments.some(o=>o.hospitalId===r.hospitalId&&o.treatmentId===r.treatmentId))"));
for(const cat of run('D.concerns')){const count=run(`D.treatments.filter(t=>t.categoryIds.includes('${cat.id}')).length`);assert(count>=(cat.id==='other'?1:8),cat.id);}
for(const t of run('D.treatments'))assert(fs.existsSync(t.image),t.image);for(const f of ['skin','clinic','pigment','texture'])assert(fs.existsSync('assets/photos/'+f+'.webp'));
const prefs="{category:'contour',concern:'사각턱',priorities:['trust','recovery','price'],budget:'unknown',region:'강남'}";
const rank1=run(`L.rankHospitals(D.hospitals,'botox',${prefs}).map(h=>h.id)`);const rank2=run(`L.rankHospitals(D.hospitals,'botox',{...${prefs},priorities:['price','recovery','trust']}).map(h=>h.id)`);assert.notDeepEqual([...rank1],[...rank2]);assert.notEqual(rank1[0],'h6');
const rs=run('structuredClone(D.reviews)');for(const r of rs)if(r.hospitalId==='h2'&&r.treatmentId==='botox')r.doctorTrustRating=1;c.changedReviews=rs;
assert.notDeepEqual([...run(`L.rankHospitals(D.hospitals,'botox',${prefs},changedReviews).map(h=>h.id)`)], [...rank1]);
// Unrelated treatment reviews never affect a hospital/treatment aggregate.
assert.equal(run("L.aggregateReviews('h1','botox',D.reviews.filter(r=>r.treatmentId==='botox')).count"),run("L.aggregateReviews('h1','botox').count"));
run("exploreCategory='aging';screen='explore';render()");assert(els.app.innerHTML.includes('함께 많이 받는 시술'));assert(els.app.innerHTML.includes('후기 많은 시술'));assert(els.app.innerHTML.includes('explore-treatment-rail'));assert(!els.app.innerHTML.includes('전체보기'));
for(const screenName of ['home','explore','community','saved','my','settings','treatments','hospitals']){run(`screen='${screenName}';render()`);assert(!/선호 조건 일치도|Match Score|50%|30%|20%/.test(els.app.innerHTML),screenName);}
console.log('PASS: concern→treatment→hospital→review→recommendation→Home; priorities, counts, bookmarks, persistence, all pools and images');
console.log(JSON.stringify(run("({treatments:D.treatments.length,concerns:D.subConcerns.length,hospitalTreatments:D.hospitalTreatments.length,reviews:D.reviews.filter(r=>!r.id.startsWith('local-')).length,categoryCounts:Object.fromEntries(D.concerns.map(c=>[c.name,D.treatments.filter(t=>t.categoryIds.includes(c.id)).length]))})")));

// Entry replay keeps bookmarks/reviews and forces the full onboarding flow.
const savedBefore=JSON.stringify(run('state.saved')), reviewsBefore=run('state.userReviews.length');
click('replay-entry');assert.equal(run('screen'),'login');assert(els.app.innerHTML.includes('로그인 · 회원가입'));assert.equal(JSON.stringify(run('state.saved')),savedBefore);assert.equal(run('state.userReviews.length'),reviewsBefore);
click('login-provider','이메일');assert.equal(run('screen'),'onboarding');assert.equal(run('onboardingStep'),0);
click('onboard-next');assert.equal(run('onboardCategories.length'),0);click('onboard-category','contour');click('onboard-next');click('onboard-concern','squareJaw');
// Onboarding values use display names.
run("profileDraft.concerns=['사각턱']");click('onboard-next');click('onboard-region','강남');click('onboard-next');click('onboard-next');assert.equal(run('screen'),'home');
run('restore()');assert.equal(run('screen'),'home');click('logout');assert.equal(run('screen'),'login');click('login-provider','이메일');assert.equal(run('screen'),'onboarding');
console.log('PASS: replay preserves saved data; signed-in refresh, onboarding, in-app navigation, logout/relogin');
