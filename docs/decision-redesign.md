# Skinmate 연결형 개인화 개편 보고

## 구현 범위와 상태
기존 vanilla JavaScript, hash router, 전역 state + localStorage, CSS 구조를 유지했다. 로그인·온보딩·프로필·찜·비교·상담 체크리스트를 재사용한다. 병원/가격/후기는 모두 포트폴리오용 합성 데이터이며 실제 의료기관·환자 경험·시장 가격을 나타내지 않는다.

## 1. 수정한 파일
- `index.html`: 관계 데이터와 연결형 UI/CSS 로드
- `app.js`: activeConcern 확정, 라우팅, 이전 점수 기반 화면 제거, 후기 복원, 피부 타입 저장
- `components.js`, `views.js`: 이전 추천 점수·병원 UI 제거, 공통 기능 유지
- `services/storage.js`: v3 상태 정리와 기존 localStorage 마이그레이션
- `services/recommendations.js`: 후기 집계·순차 정렬로 교체
- `data/relations.js`: 신규 관계 데이터 확장 (기존 catalog의 기본 ID 유지)
- `decision-ui.js`, `decision.css`: 재사용 UI와 다크/라이트 토큰
- `assets/concerns/*.svg`, `assets/photos/{pigment,texture,clinic}.webp`: 주제별 이미지
- `tests/decision-flow.cjs`: 핵심 회귀 검사
- 기존 `tests/{flows,home,recommendation-ui}.cjs`: 현재 흐름 검사 진입점으로 교체
- `tests/{onboarding,personalization}.cjs`: 확장 데이터와 화면 로딩 반영

## 2–3. 재사용 컴포넌트 및 route
ConcernCategoryCard, SubConcernCard, PriorityCard, TreatmentRecommendationCard, HospitalRecommendationCard, HospitalTreatmentRow, ReviewCard, KnowledgeCard, ReasonSheetContent를 분리했다. 기존 `button`, `icon`, `shell`, `nav`, `offerPrice`, `tags`를 재사용한다.

새 route: `#/subconcern`, `#/hospital-reviews/{hospitalId}:{treatmentId}`.
수정 route: home, concern, priority, treatments, treatment/{id}, hospitals, detail/{id}, explore, community, article/{concernId}, compare. 기존 my/saved/profile/checklist/settings 경로를 유지한다.

## 4. activeConcern 상태
- `activeConcern`: 확정한 세부 고민 ID (예: squareJaw, acneScar)
- `activeConcernCategory`: 대분류 ID
- `recommendation`: 완료 시점의 category/concern/concernId/priorities/budget/region 스냅샷
- `draft`: 진행 중인 입력. 홈의 확정된 추천을 덮어쓰지 않는다.
- `profile`: 장기 관심 고민, 관심 시술, 지역, 피부 타입
- `userReviews`: 이 기기에 작성한 6개 평가 및 본문

홈 우선순위는 확정 activeConcern → 온보딩 관심사 중 첫 관련 고민 → 일반 홈이다. 재진입 CTA는 완료 스냅샷을 복원한다. 새로고침 시 localStorage로 유지한다. 과거 추천 history가 있는 사용자는 최근 완료 고민으로 마이그레이션한다.

## 5–6. 고민·시술 관계 및 개수
세부 고민 41개, 고유 시술/관리/상담 후보 44개 (기존 13개 ID 유지, 31개 추가).

| 대분류 | 연결된 후보 수 |
|---|---:|
| 윤곽·지방 | 10 |
| 탄력·리프팅 | 15 |
| 트러블·흉터 | 19 |
| 모공·피부결 | 11 |
| 색소·톤 | 11 |
| 제모 | 8 |
| 기타 | 1 |

한 시술이 여러 대분류·세부 고민에 연결되므로 합계는 44보다 크다. 관련 없는 시술로 기타 항목을 채우지 않았다. 사각턱은 저작근 관련 보톡스만 직접 연결한다. 다른 원인의 윤곽 고민에는 별도 후보를 연결한다. 모든 고민에 3~4개를 억지로 채우지 않는다.

Treatment 필드: id, name, categoryIds, concernIds, summary, description, priceRange, painLevel, downtime, treatmentTime, tags, image, imageCategory, hospitalIds, relatedTreatmentIds, modality, targetArea, cautions, sourceUrl. 구형 UI 호환용 category/concerns 필드도 제공한다.

## 7. HospitalTreatment
병원 6곳 × 제공 시술을 나타내는 205개 연결 행. `id`, `hospitalId`, `treatmentId`, `price`, `eventPrice`, `isAvailable`, `reviewCount`, `equipment`, `targetAreas`, `areaPrices`, `unit`을 사용한다. 저장 단위는 기존과 동일한 만원이고 UI는 원으로 변환한다. 제모는 선택 부위별 가격을 조회한다. 장비 이름은 실제 보유 현황이 아닌 가상 설정이다.

## 8. Review
기본 합성 후기 1,583개. 각 행에 reviewId, hospitalId, treatmentId, userId, overallRating, effectRating, recoveryRating, priceRating, painRating, doctorTrustRating, distanceRating, content, createdAt을 저장한다. 각 평가는 1~5이며 높을수록 만족도가 높다. 통증·회복은 부담이 적을수록 높은 평가다.

후기는 병원×시술별 명시적인 합성 평가 패턴으로 구성된다. 추천 결과에서 임의 점수를 생성하지 않는다. 체험 후기 작성 결과도 같은 구조에 추가되어 집계에 반영된다. 최대 300건의 사용자 작성 후기를 기기에 저장한다.

## 9–12. 집계와 추천 알고리즘
1. concernId에 실제 연결된 treatment만 필터링한다.
2. hospitalTreatment에서 해당 시술 제공 병원만 조회한다.
3. hospitalId + treatmentId에 속한 후기만 집계한다.
4. 평균 별점, 후기 수, 항목별 평균, 4점 이상 건수를 계산한다.
5. 후기 없음 / 1~2건 / 3건 이상을 구분해 극소수 평가가 지원되는 표본보다 앞서지 않도록 한다.
6. 각 항목의 정렬용 평균은 중립값 3점짜리 5건을 더한 보수적 보정 평균을 사용한다: `(평가 합계 + 15) / (평가 수 + 5)`.
7. 선택한 1→2→3순위 항목을 차례대로 비교한다. 항목별 0.25점 구간이 같으면 다음 기준으로 넘긴다. 50/30/20 가중 합산은 없다.
8. 항목이 유사하면 선호 지역 → 예산 초과 여부 → 해당 시술 후기 수 → 전체 별점 → 고정 ID 순으로 정렬한다.

병원 결과는 기본적으로 선택 지역만 보여주며 ‘다른 지역도 보기’를 제공한다. 가격/거리의 후기 만족도와 실제 가격/지역 정보를 별도로 다룬다. 알고리즘 값은 UI에 노출하지 않는다. 시술 초기 후보는 최대 4개, 추가 후보는 더보기로 노출한다.

## 13. 왜 추천됐나요?
네이티브 dialog를 하단 Bottom Sheet로 표시한다. 제목, 해당 시술의 별점·후기 수, 사용자가 선택한 항목의 실제 집계(총 n건 중 4점 이상 m건), 표본 부족·지역·예산 안내를 표시한다. 병원마다 집계 결과가 다르고 고정 추천 문장만 반복하지 않는다. Escape/닫기/배경 클릭을 지원한다.

## 14–15. 홈 개인화
Hero 사진은 고정하고 문구, 병원, 이벤트, 지식, 시술, Q&A를 현재 고민으로 변경한다. 사각턱은 원인 구분/저작근 질문, 여드름 흉터는 흉터 모양/복합 상담 질문으로 다르게 제공한다. 이벤트는 고민과 연결된 시술 및 지역에 일치하는 것만 표시한다.
순서: Hero 및 단일 CTA → 관련 병원/이벤트 → 피부지식 → 관련 시술 → Q&A. 기존 찜한 병원 다시보기는 아래쪽에 유지한다. 큰 관심사 칩 영역은 제거했다.

## 16–17. 상세 및 북마크
병원 상세 제목과 큰 저장·비교 버튼을 없앴다. 병원명/해당 시술 별점/위치/대표 의료진을 상단에 요약한다. 제공 시술은 이미지·설명·가격의 세로 행으로 표시하며 처음 5개 이후 더보기를 제공한다. 최근 후기 3개에서 전체 후기 페이지로 이동한다.
병원 카드 전체 클릭과 키보드 Enter/Space는 상세로 이동한다. 북마크·추천 이유는 별도 버튼으로 가장 가까운 action을 처리하므로 상세 이동과 충돌하지 않는다. 찜의 병원/이벤트 두 탭 및 비교 기능을 유지한다.

## 18. 디자인 토큰
`decision.css`의 :root가 최종 토큰의 단일 수정 지점이다.
- 앱 #101820, 배경 #0E171D, surface #152229, elevated #1B2B32
- 정보 카드 #FFFFFF, soft #F5F7F7, chip #EFF3F3
- 본문 #142A33, 보조 #6F7F86, dark 본문 #EDF4F4
- Primary #008E98, 제한적 coral #E78366

하단 바는 최대 320px 폭, 약 58px 높이, 44~48px 원형 버튼으로 축소했다. 선택 효과는 절제하고 5개 메뉴를 유지한다. 모바일 안전 영역을 반영한다.

## 19–22. 이미지와 남은 플레이스홀더
- 재사용: `assets/photos/skin.webp` — 볼을 만지는 Cherrydeck 인물 사진. Hero, 윤곽·탄력의 관련 분위기 이미지.
- 신규: `pigment.webp` — Yara Amaral, 주근깨 인물. https://unsplash.com/photos/C08I6jjfnxE
- 신규: `texture.webp` — engin akyurt, 실제 피부결. https://unsplash.com/photos/oSHy8iUzMRk
- 신규: `clinic.webp` — Martha Dominguez de Gouveia, 대기 공간. https://unsplash.com/photos/g0PTp89dumc
- 로고/심볼/광고 시안은 기존 assets를 유지한다.

신규 3개 사진은 Unsplash CDN에서 다운로드 성공했고 로컬 WebP로 포함한다. 런타임 hotlink를 사용하지 않는다. 실제 병원·환자 결과 사진처럼 표시하지 않는다.

임상적으로 정확한 여드름·흉터 및 부위별 제모 사진은 확보하지 않았다. 관련 없는 얼굴 사진 대신 `assets/concerns`의 주제별 벡터 플레이스홀더와 ‘이미지 준비 중’을 사용한다. 필요한 최종 이미지: 여드름, 패인 흉터, 턱/인중/얼굴/겨드랑이/팔/다리/비키니라인/기타 제모, 피부 상담. 일부 확장용 SVG는 사진이 있는 항목의 대체 자산이다.

## 23. 남은 제한
- 실제 로그인·예약·결제·병원 정보 API는 연결하지 않았다.
- 의료정보는 학회/제조사 안내를 참고한 소개이며 개인의 적합성을 확정하지 않는다. 브랜드 제품의 국가별 승인 부위와 실제 병원 제공 여부는 별도 검증이 필요하다.
- 시술 시간/통증/회복 범위를 확인하지 못한 항목은 숫자를 꾸미지 않고 상담 필요로 표기한다.
- ‘브라질리언왁싱’은 기존 관심사 호환을 위해 남아 있지만 레이저 제모로 혼합 추천하지 않으며 후보 없음 안내를 제공한다.
- 지역은 기존 서울 강남·잠실·홍대·성수로 제한된다. 거리는 역 기준 예시다.
- 관련 사진은 일부 플레이스홀더이며 교체 목록은 위에 명시했다.

## 24. 검증
`node tests/decision-flow.cjs`, `node tests/onboarding.cjs`, `node tests/personalization.cjs` 통과.
- 대분류별 세부 목록, 최대 3개 우선순위, 4개 초기 추천/더보기
- 사각턱 → 의료진 신뢰/회복시간/가격 → 사각턱 보톡스 → 제공 병원 → 북마크 → 상세 → 후기 확인/작성
- 후기 작성이 해당 병원×시술 집계에 추가되는지, 다른 시술의 후기가 섞이지 않는지
- 우선순위와 실제 후기 평가 변경 시 병원 순서가 바뀌는지
- 후기 1건의 만점 병원이 다수 표본을 앞서지 않는지
- 여드름 흉터로 변경 시 Hero/병원/이벤트/지식/시술/Q&A가 사각턱과 달라지는지
- 미완료 draft 변경은 확정 홈을 바꾸지 않고 CTA로 완료 스냅샷을 복원하는지
- 북마크 클릭은 상세 이동 없이 저장, 카드 클릭은 상세 이동
- 상태·평가의 새로고침 복원, 모든 관계 ID와 이미지 파일 검사
- 온보딩 다중 관심사·지역, 프로필 보톡스 검색, 마이페이지 기존 항목 유지

브라우저 화면 검증 결과는 배포 후 추가한다.


## 배포 후 확인
- 2026-09-22: 누락된 catalog 및 기존 이미지 디렉터리를 복구하고 Vercel 배포 성공 확인.
- 실제 브라우저에서 체험 로그인 → 사각턱 선택 → 강남 선택 → 홈 → 추천 근거 → 병원 상세 확인.
- 홈 하단 내비게이션 실측 320 × 58px. 홈과 병원 상세에서 로딩 완료 후 깨진 이미지 없음.
- 추천 근거에 병원·시술별 후기 집계 표시 확인. 전체 관계·우선순위·저장 테스트 통과.
- 화면 검증 캡처: home-verified.jpg
