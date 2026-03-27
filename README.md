# InstaForge - AI Carousel Studio

실시간 트렌드 뉴스를 기반으로 전문가급 인스타그램 캐러셀 이미지를 자동 생성하는 AI 서비스

## 해결하는 문제

인스타그램 캐러셀 콘텐츠를 만들려면 트렌드 리서치, 카피라이팅, 이미지 소싱, 디자인까지 최소 2-3시간이 필요합니다.
InstaForge는 이 전 과정을 AI로 자동화하여 **2분 만에** 전문가 수준의 캐러셀을 완성합니다.

## 주요 기능

### 1. 트렌드 탐색
- Google Trends API(SerpAPI)를 활용한 실시간 한국 트렌드 키워드 수집
- 트렌드 키워드별 관련 뉴스 기사 자동 검색 (Google News)
- 클릭 한 번으로 뉴스 기사를 캐러셀 소스로 선택

### 2. AI 콘텐츠 생성 파이프라인 (4단계 Claude API)
| 단계 | 설명 | 모델 |
|------|------|------|
| Step 1 | 콘텐츠 분석 (핵심 주장, 타겟, 감정 톤 추출) | Claude Sonnet |
| Step 2 | AIDA 구조 설계 (Attention-Interest-Desire-Action) | Claude Sonnet |
| Step 3 | 슬라이드 카피라이팅 (해요체, 8-15자 제목, CTA) | Claude Opus |
| Step 4 | 이미지 검색 쿼리 생성 (슬라이드별 맞춤 영어 키워드) | Claude Sonnet |

### 3. 멀티소스 이미지 매칭
- Unsplash, Pexels, Pixabay, SerpAPI(Google Images) 4개 소스 병렬 검색
- 기사 원문 이미지 자동 추출 및 첫 슬라이드 우선 배치
- 슬라이드별 관련성 스코어링으로 최적 이미지 자동 할당
- 슬라이드 간 중복 이미지 방지 (globalUsed)
- 이미지 부족 시 typo 템플릿으로 자동 전환 (graceful degradation)

### 4. 3종 디자인 템플릿
| 템플릿 | 스타일 | 레퍼런스 |
|--------|--------|----------|
| **photo** | 풀블리드 사진 + 하단 그라디언트 + 대형 타이포 | @toss.place |
| **editorial** | off-white 배경 + 우측 크롭 사진 + 좌측 텍스트 + 그리드 | 잡지 레이아웃 |
| **typo** | 단색 배경 + 거대 타이포그래피 + 미니멀 | @visualizevalue |

### 5. 인터랙티브 미리보기 & 다운로드
- 슬라이드 네비게이션 (좌우 화살표 + 썸네일 스트립)
- 슬라이드별 이미지 변경 (후보 이미지 중 선택)
- 캡션 & 해시태그 원클릭 복사
- ZIP 다운로드 (html-to-image로 1080x1350 PNG 렌더링)

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **State**: Zustand
- **AI**: Claude API (Anthropic SDK) - Structured Output via tool_use
- **Image**: Unsplash API, Pexels API, Pixabay API, SerpAPI
- **Trends**: SerpAPI (Google Trends + Google News)
- **Rendering**: html-to-image, JSZip
- **Validation**: Zod 4
- **Deploy**: Vercel

## 동작 방식

```
[사용자]
  ├─ 트렌드 탐색 → 트렌드 선택 → 뉴스 선택
  └─ URL 직접 입력
         │
         ▼
[API: /api/analyze] ── SSE Stream ──
  │
  ├─ URL 파싱 (cheerio) → 제목/본문/이미지 추출
  ├─ Step 1: Claude → 콘텐츠 분석
  ├─ Step 2: Claude → AIDA 구조 설계
  ├─ Step 3: Claude (Opus) → 슬라이드 카피
  └─ Step 4: Claude → 이미지 검색 키워드
         │
         ▼
[API: /api/search-images]
  ├─ Unsplash / Pexels / Pixabay / SerpAPI 병렬 검색
  └─ 슬라이드별 관련성 스코어링 & 자동 할당
         │
         ▼
[결과 화면]
  ├─ 캐러셀 미리보기 (1080x1350 비율)
  ├─ 이미지 변경
  ├─ 캡션/해시태그 복사
  └─ ZIP 다운로드
```

## 실행 방법

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env)
ANTHROPIC_API_KEY=your_key
SERPAPI_API_KEY=your_key
UNSPLASH_ACCESS_KEY=your_key
PEXELS_API_KEY=your_key
PIXABAY_API_KEY=your_key

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

## 배포

https://instaforge-gamma.vercel.app
