/* All records are fictional portfolio fixtures, not clinical evidence. Prices: 만원. */
const SkinmateData = (() => {
 const concerns = [
  {id:'contour',name:'윤곽·지방',icon:'wave',items:['볼살','이중턱','사각턱','턱선','얼굴 윤곽']},
  {id:'aging',name:'탄력·노화',icon:'spark',items:['피부 처짐','얼굴 탄력','잔주름','깊은 주름','눈가 주름']},
  {id:'trouble',name:'트러블·흉터',icon:'dots',items:['여드름','여드름 흉터','붉은 자국','흉터']},
  {id:'texture',name:'모공·피부결',icon:'pore',items:['넓은 모공','피지','블랙헤드','피부결']},
  {id:'tone',name:'색소·톤',icon:'sun',items:['기미','잡티','주근깨','색소침착','홍조','피부톤']},
  {id:'hair',name:'제모',icon:'wave',items:['얼굴','겨드랑이','팔','다리','기타']},
  {id:'other',name:'기타',icon:'list',items:['기타 고민']}
 ];
 const criteria=[{id:'effect',name:'효과',icon:'sun',desc:'기대하는 변화 관련 정보'},{id:'price',name:'가격',icon:'coin',desc:'내 예산과 가까운 비용'},{id:'pain',name:'통증',icon:'bolt',desc:'부담이 적은 통증 경험'},{id:'recovery',name:'회복기간',icon:'clock',desc:'일상으로 돌아가는 시간'},{id:'trust',name:'의료진·신뢰',icon:'shield',desc:'의료진과 설명의 충분함'},{id:'distance',name:'거리',icon:'pin',desc:'선호 지역에서의 접근성'}];
 const regions=['강남','잠실','홍대','성수'];
 const budgets=[{id:'10',label:'10만원 이하',max:10},{id:'30',label:'10~30만원',max:30},{id:'50',label:'30~50만원',max:50},{id:'plus',label:'50만원 이상',max:null},{id:'unknown',label:'잘 모르겠어요',max:null}];
 const definitions=[
 ['onda','온다리프팅','contour',['볼살','이중턱','턱선','얼굴 윤곽'],[19,35],'중간','1~3일', [90,72,85,95,78],'윤곽 관련 상담에서 비교하는 에너지 기반 시술'],
 ['inmode','인모드 FX','contour',['볼살','이중턱','턱선','얼굴 윤곽'],[12,24],'중간','3~7일',[85,85,70,78,82],'비용과 회복 경험을 함께 확인할 후보'],
 ['botox','보툴리눔 시술','contour',['사각턱','턱선'],[7,16],'낮음','1~3일',[83,90,88,92,80],'근육과 관련된 고민인지 상담이 필요한 후보'],
 ['ultrasound','초음파 리프팅','aging',['피부 처짐','얼굴 탄력','깊은 주름'],[35,65],'높음','1~3일',[91,60,55,88,86],'에너지 방식과 시술 범위를 비교해요'],
 ['rf','고주파 리프팅','aging',['피부 처짐','얼굴 탄력','잔주름','깊은 주름','눈가 주름'],[25,55],'중간','1~3일',[88,68,72,90,85],'부위별 주의사항과 비용 포함 항목을 확인해요'],
 ['care','트러블 관리','trouble',['여드름','붉은 자국'],[6,12],'낮음','1~2일',[75,92,90,93,83],'현재 피부 상태를 먼저 상담하는 관리 후보'],
 ['fractional','프락셔널 레이저','trouble',['여드름 흉터','흉터','붉은 자국'],[15,30],'높음','5~7일',[88,78,58,58,84],'회복 중 관리와 시술 간격을 꼭 확인해요'],
 ['potenza','포텐자','texture',['넓은 모공','피부결','피지'],[18,35],'중간','3~5일',[88,75,68,75,83],'시술 방식과 추가 비용을 함께 살펴봐요'],
 ['aqua','모공 클렌징 관리','texture',['넓은 모공','피지','블랙헤드','피부결'],[5,10],'낮음','당일~1일',[70,96,95,98,78],'관리 범위와 지속적인 관리 계획을 확인해요'],
 ['toning','레이저 토닝','tone',['기미','잡티','주근깨','색소침착','피부톤'],[8,18],'낮음','1~2일',[82,88,85,90,85],'색소 원인에 따라 상담이 필요한 후보'],
 ['vascular','홍조 레이저 상담','tone',['홍조','붉은 자국'],[15,28],'중간','3~5일',[83,78,73,77,88],'홍조의 원인과 관리 방법부터 확인해요'],
 ['hairlaser','레이저 제모','hair',['얼굴','겨드랑이','팔','다리','기타'],[5,20],'중간','1~2일',[87,89,73,90,82],'부위와 회차별 비용 차이를 확인해요'],
 ['consult','피부 고민 상담','other',['기타 고민'],[1,5],'해당 없음','해당 없음',[60,98,100,100,95],'고민을 정리하고 가능한 방법을 상담해요']
 ];
 const treatments=definitions.map(([id,name,category,concerns,priceRange,painLevel,recoveryTime,s,description])=>({id,name,category,concerns,priceRange,painLevel,recoveryTime,description,scores:{effect:s[0],price:s[1],pain:s[2],recovery:s[3],trust:s[4],distance:80},features:['1회 기준 예시','개인별 상담 필요'],source:'학습용 가상 정보'}));
 const hospitalDefs=[['h1','메이트 피부과','강남',0.32,4.8,326,0,[88,84,88,94,91]],['h2','온유 클리닉','강남',0.45,4.7,213,3,[85,90,81,82,94]],['h3','라움 피부과','잠실',1.2,4.6,156,-2,[83,92,84,87,86]],['h4','모먼트 클리닉','성수',0.6,4.8,287,5,[91,78,92,95,89]],['h5','하루 피부과','홍대',0.25,4.7,194,-3,[82,93,85,89,87]],['h6','소담 클리닉','강남',2.1,4.6,132,-1,[84,88,86,76,88]]];
 const hospitals=hospitalDefs.map(([id,name,location,distance,rating,reviewCount,offset,s],index)=>({id,name,location,distance,rating,reviewCount,doctor:`피부과 전문의 ${index%2+1}명 (예시)`,treatments:treatments.filter((t,i)=>index<3||i%3!==index%3).map(t=>t.id),offers:Object.fromEntries(treatments.map(t=>[t.id,t.priceRange.map(p=>Math.max(1,p+offset))])),priceRange:[Math.max(1,19+offset),35+offset],scores:{effect:s[0],price:s[1],pain:s[2],recovery:s[3],trust:s[4],distance:Math.round(100-distance*15)},recoveryReview:s[3]>=90?'매우 좋음':s[3]>=80?'좋음':'보통',recentReview:'비용과 회복 과정에 대해 차근차근 설명해 주었어요.',mock:true}));
 const promotions=[{id:'p1',hospitalId:'h1',treatmentId:'onda',title:'윤곽 상담과 온다 첫 방문 혜택',category:'contour',region:'강남',price:19,detail:'온다리프팅 1회 예시 · 부위와 샷 수는 상담 시 확인',ends:'2026.12.31'},{id:'p2',hospitalId:'h3',treatmentId:'potenza',title:'모공 고민을 위한 상담 프로모션',category:'texture',region:'잠실',price:16,detail:'포텐자 1회 예시 · 팁과 마취 비용은 별도 확인',ends:'2026.12.31'},{id:'p3',hospitalId:'h5',treatmentId:'toning',title:'피부 톤 관리 시작 혜택',category:'tone',region:'홍대',price:5,detail:'레이저 토닝 1회 예시 · 적용 부위 확인 필요',ends:'2026.12.31'},{id:'p4',hospitalId:'h4',treatmentId:'rf',title:'탄력 고민 상담 패키지',category:'aging',region:'성수',price:30,detail:'고주파 1회 예시 · 범위 및 포함 항목 확인 필요',ends:'2026.12.31'}];
 // Fixed fictional one-session prices, shared by cards, saved items and comparison.
 hospitals.forEach(h=>{h.exactOffers=Object.fromEntries(h.treatments.map(id=>{const range=h.offers[id];const originalPrice=Math.round((range[0]+range[1])/2);const promotion=promotions.find(p=>p.hospitalId===h.id&&p.treatmentId===id);return [id,{originalPrice,price:promotion?promotion.price:originalPrice,unit:'1회 · 예시 구성'}];}));});
 hospitals.forEach(h=>Object.entries(h.exactOffers).forEach(([id,o])=>{h.offers[id]=[o.price,o.price];}));
 promotions.forEach(p=>{p.originalPrice=hospitals.find(h=>h.id===p.hospitalId).exactOffers[p.treatmentId].originalPrice;});
 const reviews=treatments.flatMap((t,i)=>[0,1].map(n=>({id:`r${i}-${n}`,treatmentId:t.id,hospitalId:n?'h2':'h1',concern:t.concerns[0],category:t.category,price:t.priceRange[n],pain:n?'생각보다 부담이 있었어요':t.painLevel,recovery:t.recoveryTime,date:`2026.09.${String(15-i).padStart(2,'0')}`,satisfaction:n?4:5,text:n?'회복 일정과 추가 비용을 미리 물어보면 좋겠어요.':'제가 중요하게 생각한 조건을 메모해 상담에 가져갔어요.',mock:true})));
 const boards={qa:[{id:'q1',author:'피부고민중',title:'첫 상담에서 어떤 질문을 하면 좋을까요?',body:'가격과 회복기간 외에 확인할 항목이 궁금해요.'},{id:'q2',author:'맑은하늘',title:'시술 가격 비교할 때 포함 비용도 보나요?',body:'마취와 사후 관리 포함 여부를 어떻게 확인하세요?'},{id:'q3',author:'나의기준',title:'중요한 일정 전에 상담을 받으려고 해요',body:'회복 일정에 대해 어떤 내용을 물어보면 좋을까요?'}],free:[{id:'f1',author:'봄날메이트',title:'상담 전에 질문을 적어봤어요',body:'내 예산과 가능한 방문 날짜를 적으니 고민 정리가 되네요.'},{id:'f2',author:'하루한걸음',title:'오늘은 피부 고민 노트를 시작했어요',body:'급하게 결정하지 않고 천천히 정보를 비교해보려고 해요.'}]};
 return {concerns,criteria,regions,budgets,treatments,hospitals,promotions,reviews,boards};
})();
if(typeof module!=='undefined')module.exports=SkinmateData;
