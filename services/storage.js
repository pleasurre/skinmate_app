const SkinmateStorage=(()=>{
 const initial={schemaVersion:3,activeConcern:null,activeConcernCategory:null,recommendation:null,userReviews:[],bookings:[],payments:[],community:{likes:[],helpful:[],comments:{}},onboarded:false,profile:{concerns:[],fields:[],region:'강남',regions:['강남'],skinType:''},draft:{category:'',concern:'',custom:'',priorities:[],budget:'unknown',region:'강남'},saved:[],savedTreatments:{},savedEvents:[],compare:[],selectedTreatment:'',history:[],recentHospitals:[],recentTreatments:[],checklists:{},notifications:false};
 function clean(raw,D){
  const s=structuredClone(initial);if(!raw||typeof raw!=='object')return s;
  const unique=(v,allowed,max=100)=>[...new Set(Array.isArray(v)?v.filter(x=>allowed.includes(x)):[])].slice(0,max);
  s.onboarded=raw.onboarded===true;s.auth={loggedIn:raw.auth?.loggedIn===true,email:typeof raw.auth?.email==='string'?raw.auth.email.slice(0,120):''};
  const p=raw.profile||{};s.profile={concerns:unique(p.concerns,D.concerns.flatMap(c=>c.items)),fields:unique(p.fields,D.treatments.map(t=>t.id)),region:D.regions.includes(p.region)?p.region:'강남',regions:unique(p.regions,D.regions,D.regions.length)};if(!s.profile.regions.length)s.profile.regions=[s.profile.region];s.profile.region=s.profile.regions[0];
  const d=raw.draft||{};const cat=D.concerns.find(c=>c.id===d.category);s.draft={category:cat?.id||'',concern:cat?.items.includes(d.concern)?d.concern:'',custom:typeof d.custom==='string'?d.custom.slice(0,100):'',priorities:unique(d.priorities,D.criteria.map(c=>c.id),3),budget:D.budgets.some(b=>b.id===d.budget)?d.budget:'unknown',region:D.regions.includes(d.region)?d.region:'강남'};
  const hids=D.hospitals.map(h=>h.id),tids=D.treatments.map(t=>t.id);
  for(const k of ['saved','compare','recentHospitals'])s[k]=unique(raw[k],hids,k==='compare'?3:20);
  s.savedTreatments=Object.fromEntries(s.saved.map(id=>{const h=D.hospitals.find(h=>h.id===id);return [id,h.treatments.includes(raw.savedTreatments?.[id])?raw.savedTreatments[id]:h.treatments.includes(raw.selectedTreatment)?raw.selectedTreatment:h.treatments[0]];}));
  s.savedEvents=unique(raw.savedEvents,D.promotions.map(p=>p.id));s.recentTreatments=unique(raw.recentTreatments,tids,20);s.selectedTreatment=tids.includes(raw.selectedTreatment)?raw.selectedTreatment:'';
  for(const key of ['bookings','payments'])s[key]=(Array.isArray(raw[key])?raw[key]:[]).filter(x=>x&&D.hospitalTreatments.some(o=>o.hospitalId===x.hospitalId&&o.treatmentId===x.treatmentId&&o.isAvailable)).slice(0,20).map(x=>({hospitalId:x.hospitalId,treatmentId:x.treatmentId,createdAt:typeof x.createdAt==='string'?x.createdAt.slice(0,30):'',...(key==='bookings'?{date:typeof x.date==='string'?x.date.slice(0,10):'',time:typeof x.time==='string'?x.time.slice(0,5):'',type:x.type==='online'?'online':'visit'}:{price:Number.isFinite(x.price)?x.price:0})}));
  s.history=(Array.isArray(raw.history)?raw.history:[]).filter(x=>x&&D.concerns.some(c=>c.id===x.category&&c.items.includes(x.concern))).slice(0,10).map(x=>({...clean({draft:x},D).draft,date:typeof x.date==='string'?x.date.slice(0,30):''}));
  for(const [id,list] of Object.entries(raw.checklists&&typeof raw.checklists==='object'?raw.checklists:{})){if(!hids.includes(id)||!Array.isArray(list?.questions))continue;s.checklists[id]={saved:list.saved===true,questions:list.questions.filter(q=>typeof q?.text==='string'&&q.text.trim()).slice(0,100).map(q=>({text:q.text.slice(0,200),done:q.done===true}))};}
  const ids=[...D.reviews.map(r=>r.id),...Object.values(D.boards).flat().map(p=>p.id)];s.community.likes=unique(raw.community?.likes,ids);s.community.helpful=unique(raw.community?.helpful,ids);for(const id of ids){const cs=raw.community?.comments?.[id];if(Array.isArray(cs))s.community.comments[id]=cs.filter(x=>typeof x==='string').slice(0,100).map(x=>x.slice(0,500));}
  s.profile.skinType=['건성','지성','복합성','중성','민감성','잘 모르겠어요'].includes(p.skinType)?p.skinType:'';
  const active=D.subConcerns.find(c=>c.id===raw.activeConcern);
  const legacy=raw.history?.[0];const migrated=!active&&legacy?D.subConcerns.find(c=>c.name===legacy.concern&&c.categoryId===legacy.category):null;
  const c=active||migrated;
  if(c){s.activeConcern=c.id;s.activeConcernCategory=c.categoryId;const r=raw.recommendation||legacy||{};s.recommendation={category:c.categoryId,concern:c.name,concernId:c.id,priorities:unique(r.priorities,D.criteria.map(x=>x.id),3),budget:D.budgets.some(b=>b.id===r.budget)?r.budget:'unknown',region:D.regions.includes(r.region)?r.region:s.profile.region};}
  s.userReviews=(Array.isArray(raw.userReviews)?raw.userReviews:[]).filter(r=>r&&typeof r.id==='string'&&r.id.startsWith('local-')&&typeof r.content==='string'&&D.hospitalTreatments.some(o=>o.hospitalId===r.hospitalId&&o.treatmentId===r.treatmentId&&o.isAvailable)&&['overallRating','effectRating','recoveryRating','priceRating','painRating','doctorTrustRating','distanceRating'].every(k=>Number.isFinite(r[k])&&r[k]>=1&&r[k]<=5)).slice(0,300).map(r=>({...r,content:r.content.slice(0,1500),text:r.content.slice(0,1500),mock:true}));
  s.notifications=raw.notifications===true;return s;
 }
 function load(storage,D){try{const raw=storage.getItem('skinmate-v2');if(raw)return clean(JSON.parse(raw),D);const old=JSON.parse(storage.getItem('skinmate-v1')||'null');return clean(old?{saved:old.saved,checklists:old.checklists}:null,D);}catch{return structuredClone(initial);}}
 return {initial,clean,load};
})();
if(typeof module!=='undefined')module.exports=SkinmateStorage;
