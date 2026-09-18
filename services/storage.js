const SkinmateStorage=(()=>{
 const initial={onboarded:false,profile:{concerns:[],fields:[],region:'강남'},draft:{category:'',concern:'',custom:'',priorities:[],budget:'unknown',region:'강남'},saved:[],savedEvents:[],compare:[],selectedTreatment:'',history:[],recentHospitals:[],recentTreatments:[],checklists:{},notifications:false};
 function clean(raw,D){
  const s=structuredClone(initial);if(!raw||typeof raw!=='object')return s;
  const unique=(v,allowed,max=100)=>[...new Set(Array.isArray(v)?v.filter(x=>allowed.includes(x)):[])].slice(0,max);
  s.onboarded=raw.onboarded===true;s.auth={loggedIn:raw.auth?.loggedIn===true,email:typeof raw.auth?.email==='string'?raw.auth.email.slice(0,120):''};
  const p=raw.profile||{};s.profile={concerns:unique(p.concerns,D.concerns.flatMap(c=>c.items)),fields:unique(p.fields,D.treatments.map(t=>t.id)),region:D.regions.includes(p.region)?p.region:'강남'};
  const d=raw.draft||{};const cat=D.concerns.find(c=>c.id===d.category);s.draft={category:cat?.id||'',concern:cat?.items.includes(d.concern)?d.concern:'',custom:typeof d.custom==='string'?d.custom.slice(0,100):'',priorities:unique(d.priorities,D.criteria.map(c=>c.id),3),budget:D.budgets.some(b=>b.id===d.budget)?d.budget:'unknown',region:D.regions.includes(d.region)?d.region:'강남'};
  const hids=D.hospitals.map(h=>h.id),tids=D.treatments.map(t=>t.id);
  for(const k of ['saved','compare','recentHospitals'])s[k]=unique(raw[k],hids,k==='compare'?3:20);
  s.savedEvents=unique(raw.savedEvents,D.promotions.map(p=>p.id));s.recentTreatments=unique(raw.recentTreatments,tids,20);s.selectedTreatment=tids.includes(raw.selectedTreatment)?raw.selectedTreatment:'';
  s.history=(Array.isArray(raw.history)?raw.history:[]).filter(x=>x&&D.concerns.some(c=>c.id===x.category&&c.items.includes(x.concern))).slice(0,10).map(x=>({...clean({draft:x},D).draft,date:typeof x.date==='string'?x.date.slice(0,30):''}));
  for(const [id,list] of Object.entries(raw.checklists&&typeof raw.checklists==='object'?raw.checklists:{})){if(!hids.includes(id)||!Array.isArray(list?.questions))continue;s.checklists[id]={saved:list.saved===true,questions:list.questions.filter(q=>typeof q?.text==='string'&&q.text.trim()).slice(0,100).map(q=>({text:q.text.slice(0,200),done:q.done===true}))};}
  s.notifications=raw.notifications===true;return s;
 }
 function load(storage,D){try{const raw=storage.getItem('skinmate-v2');if(raw)return clean(JSON.parse(raw),D);const old=JSON.parse(storage.getItem('skinmate-v1')||'null');return clean(old?{saved:old.saved,checklists:old.checklists}:null,D);}catch{return structuredClone(initial);}}
 return {initial,clean,load};
})();
if(typeof module!=='undefined')module.exports=SkinmateStorage;
