/* Preference score only. Mock criterion values are not medical suitability. */
const SkinmateLogic=(()=>{
 const weights=[.5,.3,.2];
 function calculateMatchScore(scores,priorities){
  const keys=[...new Set(priorities)].filter(k=>Number.isFinite(scores[k])).slice(0,3);
  const total=keys.reduce((s,_,i)=>s+weights[i],0);
  if(!total)return null;
  return Math.round(keys.reduce((s,k,i)=>s+Math.max(0,Math.min(100,scores[k]))*weights[i],0)/total);
 }
 function budgetMax(id){return ({'10':10,'30':30,'50':50})[id]??null;}
 function budgetInfo(range,budget){const max=budgetMax(budget);return {exceeded:max!==null&&range[0]>max,partial:max!==null&&range[0]<=max&&range[1]>max,minOver:max===null?0:Math.max(0,range[0]-max),maxOver:max===null?0:Math.max(0,range[1]-max)};}
 function priceScore(range,budget,base){const max=budgetMax(budget);return max===null?base:Math.max(0,Math.round(100-Math.max(0,(range[0]+range[1])/2-max)/max*70));}
 function filterTreatmentsByConcern(treatments,selection){return treatments.filter(t=>t.category===selection.category&&(t.concerns.includes(selection.concern)||selection.category==='other'));}
 function hospitalScores(h,treatmentId,prefs){const range=h.offers[treatmentId]||h.priceRange;return {...h.scores,price:priceScore(range,prefs.budget,h.scores.price),distance:h.location===prefs.region?Math.max(0,Math.round(100-h.distance*15)):35};}
 function rankTreatments(treatments,hospitals,prefs){return filterTreatmentsByConcern(treatments,prefs).map(t=>{const available=hospitals.filter(h=>h.treatments.includes(t.id));const nearby=available.filter(h=>h.location===prefs.region).length;const scores={...t.scores,price:priceScore(t.priceRange,prefs.budget,t.scores.price),distance:nearby>=2?95:nearby?80:35};return {...t,scores,matchScore:calculateMatchScore(scores,prefs.priorities),budget:budgetInfo(t.priceRange,prefs.budget)};}).sort((a,b)=>(b.matchScore??-1)-(a.matchScore??-1)||a.id.localeCompare(b.id));}
 function rankHospitals(hospitals,treatmentId,prefs){return hospitals.filter(h=>h.treatments.includes(treatmentId)).map(h=>{const scores=hospitalScores(h,treatmentId,prefs);const priceRange=h.offers[treatmentId];return {...h,scores,priceRange,matchScore:calculateMatchScore(scores,prefs.priorities),budget:budgetInfo(priceRange,prefs.budget)};}).sort((a,b)=>(b.matchScore??-1)-(a.matchScore??-1)||a.id.localeCompare(b.id));}
 function compareHospitals(hospitals,ids,treatmentId,prefs){const rows=[...new Set([...prefs.priorities,'price','distance','trust','recovery','pain','effect'])];const candidates=ids.map(id=>hospitals.find(h=>h.id===id)).filter(Boolean).map(h=>({...h,comparable:h.treatments.includes(treatmentId),scores:hospitalScores(h,treatmentId,prefs),priceRange:h.offers[treatmentId]||h.priceRange}));return {candidates,rows:rows.map(key=>{const eligible=candidates.filter(h=>h.comparable);const best=Math.max(...eligible.map(h=>h.scores[key]));return {key,bestIds:eligible.filter(h=>h.scores[key]===best).map(h=>h.id)};})};}
 return {calculateMatchScore,budgetMax,budgetInfo,filterTreatmentsByConcern,rankTreatments,rankHospitals,compareHospitals,hospitalScores};
})();
if(typeof module!=='undefined')module.exports=SkinmateLogic;
