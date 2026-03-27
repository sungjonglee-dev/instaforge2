import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic();

const MODEL_FAST = 'claude-4-sonnet-20250514';
const MODEL_CREATIVE = 'claude-4-opus-20250514';

// ─── Step 1: Content Analysis Schema ───
const ContentAnalysisSchema = z.object({
  coreArgument: z.string(),
  supportingPoints: z.array(z.string()),
  targetAudience: z.string(),
  emotionalTone: z.string(),
  keywords: z.array(z.string()),
});

export type ContentAnalysis = z.infer<typeof ContentAnalysisSchema>;

// ─── Step 2: AIDA Structure Schema ───
const SlideRoleSchema = z.object({
  slideIndex: z.number(),
  aidaPhase: z.enum(['attention', 'interest', 'desire', 'action']),
  keyPoint: z.string(),
  narrativeFlow: z.string(),
});

const AIDAStructureSchema = z.object({
  slideRoles: z.array(SlideRoleSchema),
  overallNarrative: z.string(),
});

export type AIDAStructure = z.infer<typeof AIDAStructureSchema>;

// ─── Step 3: Slide Contents Schema ───
const SlideContentSchema = z.object({
  title: z.string(),
  body: z.string(),
  cta: z.string(),
});

const SlideContentsSchema = z.object({
  topic: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  slides: z.array(SlideContentSchema),
  templateId: z.enum(['photo', 'typo', 'editorial']),
});

export type SlideContents = z.infer<typeof SlideContentsSchema>;

// ─── Step 4: Image Queries Schema ───
const ImageQueryItemSchema = z.object({
  slideIndex: z.number(),
  primaryQuery: z.string(),
  fallbackQuery: z.string(),
});

const ImageQueriesSchema = z.object({
  queries: z.array(ImageQueryItemSchema),
});

export type ImageQueries = z.infer<typeof ImageQueriesSchema>;

// ─── Final Output (for backwards compat with existing pipeline) ───
export interface CarouselOutput {
  topic: string;
  caption: string;
  hashtags: string[];
  slides: { title: string; body: string; imageQuery: string; fallbackQuery?: string; cta: string }[];
  templateId: 'photo' | 'typo' | 'editorial';
}

// ─── Retry Wrapper ───
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

// ─── Helper: call Claude with tool_use for structured output ───
async function callClaude<T>(
  systemPrompt: string,
  userMessage: string,
  schema: Record<string, unknown>,
  zodSchema: z.ZodType<T>,
  maxTokens: number = 2048,
  model: string = MODEL_FAST,
): Promise<T> {
  const toolName = 'structured_output';

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userMessage }],
    tools: [
      {
        name: toolName,
        description: 'Output the structured result',
        input_schema: schema as Anthropic.Tool['input_schema'],
      },
    ],
    tool_choice: { type: 'tool', name: toolName },
  });

  const toolBlock = response.content.find((b) => b.type === 'tool_use');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error('AI 응답에서 구조화된 출력을 찾을 수 없습니다');
  }

  const parsed = zodSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    throw new Error('AI 출력 파싱 실패: ' + parsed.error.message);
  }

  return parsed.data;
}

// ─── Step 1: Content Analysis ───
const STEP1_SYSTEM = `당신은 콘텐츠 분석 전문가입니다.
주어진 텍스트의 핵심 주장, 지원 근거, 타겟 오디언스, 감정적 톤, 핵심 키워드를 추출하세요.

규칙:
- coreArgument: 핵심 주장을 1문장으로 압축
- supportingPoints: 구체적 사실/데이터/사례로 3-5개
- targetAudience: 구체적으로 (예: "20대 직장인 중 생산성 도구에 관심 있는 사람")
- emotionalTone: 콘텐츠가 유발하는 감정 (예: 호기심, 공감, 경각심, 기대감)
- keywords: 콘텐츠의 핵심 키워드 3-8개 (한국어)`;

const STEP1_SCHEMA = {
  type: 'object',
  properties: {
    coreArgument: { type: 'string' },
    supportingPoints: { type: 'array', items: { type: 'string' } },
    targetAudience: { type: 'string' },
    emotionalTone: { type: 'string' },
    keywords: { type: 'array', items: { type: 'string' } },
  },
  required: ['coreArgument', 'supportingPoints', 'targetAudience', 'emotionalTone', 'keywords'],
  additionalProperties: false,
};

export async function analyzeContent(
  content: { title: string; description: string; text: string },
  brandInfo?: { tone?: string; mainColor?: string; styleKeywords?: string[] },
): Promise<ContentAnalysis> {
  const brandContext = brandInfo
    ? `\n브랜드 톤: ${brandInfo.tone || '자동 판단'}\n스타일 키워드: ${brandInfo.styleKeywords?.join(', ') || '없음'}`
    : '';

  const userMessage = `다음 콘텐츠를 분석하세요.

<content>
제목: ${content.title}
설명: ${content.description}
본문: ${content.text.slice(0, 8000)}
</content>
${brandContext}`;

  return withRetry(() => callClaude(STEP1_SYSTEM, userMessage, STEP1_SCHEMA, ContentAnalysisSchema, 1024));
}

// ─── Step 2: AIDA Structure Design ───
const STEP2_SYSTEM = `당신은 인스타그램 캐러셀 구조 설계 전문가입니다.
AIDA 프레임워크를 적용하여 슬라이드 구조를 설계하세요.

AIDA 매핑:
- attention (슬라이드 0): 스크롤을 멈추게 하는 강력한 Hook. 충격적 숫자, 도발적 질문, 또는 공감 자극.
- interest (슬라이드 1-2): 관심을 끄는 핵심 정보, 놀라운 사실, 문제 인식 심화.
- desire (슬라이드 3~N-2): 구체적 가치 제시, 실행 가능한 인사이트, 해결책.
- action (마지막 슬라이드): 저장/공유 유도.

각 슬라이드의:
- aidaPhase: 해당 AIDA 단계
- keyPoint: 이 슬라이드에서 전달할 핵심 포인트 (1문장)
- narrativeFlow: 이전 슬라이드와의 논리적 연결 (왜 이 순서인지)

overallNarrative: 전체 캐러셀의 스토리 아크 요약 (1-2문장)`;

const STEP2_SCHEMA = {
  type: 'object',
  properties: {
    slideRoles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slideIndex: { type: 'number' },
          aidaPhase: { type: 'string', enum: ['attention', 'interest', 'desire', 'action'] },
          keyPoint: { type: 'string' },
          narrativeFlow: { type: 'string' },
        },
        required: ['slideIndex', 'aidaPhase', 'keyPoint', 'narrativeFlow'],
        additionalProperties: false,
      },
    },
    overallNarrative: { type: 'string' },
  },
  required: ['slideRoles', 'overallNarrative'],
  additionalProperties: false,
};

export async function designStructure(
  analysis: ContentAnalysis,
  slideCount: number = 8,
): Promise<AIDAStructure> {
  const userMessage = `다음 분석 결과를 바탕으로 ${slideCount}장 캐러셀의 AIDA 구조를 설계하세요.

<analysis>
핵심 주장: ${analysis.coreArgument}
지원 근거: ${analysis.supportingPoints.join('\n- ')}
타겟 오디언스: ${analysis.targetAudience}
감정적 톤: ${analysis.emotionalTone}
키워드: ${analysis.keywords.join(', ')}
</analysis>

정확히 ${slideCount}장의 슬라이드 구조를 설계하세요. slideIndex는 0부터 ${slideCount - 1}까지.`;

  return withRetry(() => callClaude(STEP2_SYSTEM, userMessage, STEP2_SCHEMA, AIDAStructureSchema, 2048));
}

// ─── Step 3: Slide Content Writing ───
const STEP3_SYSTEM = `당신은 인스타그램 캐러셀 카피라이터입니다.
AIDA 구조에 따라 각 슬라이드의 제목, 본문, CTA를 작성하세요.

[필수 규칙]
1. 톤 통일: 모든 슬라이드에서 "해요체"만 사용.
   - OK: "~예요", "~있어요", "~해보세요", "~거예요"
   - FAIL: "~합니다", "~됩니다" (합니다체 금지)
   - FAIL: "~한다", "~쓴다?" (반말 금지)
2. 해시태그: 정확히 4개. # 기호 없이 단어만.
3. 캡션: 200-400자. 이모지 2-3개만 사용. 첫 문장이 핵심 메시지.
4. CTA 규칙:
   - 첫 슬라이드 (Hook): 짧은 유도 문구 ("스크롤해서 확인해보세요")
   - 중간 슬라이드: CTA 없음! cta 필드를 빈 문자열 ""로.
   - 마지막 슬라이드: "이 게시물을 저장해두세요" 한 줄만.
5. 제목: 8-15자 (짧을수록 좋음)
6. 본문: 슬라이드당 40-70자. 줄바꿈으로 가독성 확보.

[콘텐츠 원칙]
- Hook 슬라이드: 충격적 숫자 / 도발적 질문 / 공감 자극 중 하나. 제목 10자 이내.
- Value 슬라이드: 각각 하나의 핵심 포인트만 전달. 본문 2-3줄.
- CTA 슬라이드: "이 게시물을 저장해두세요" 한 줄이면 충분.

[디자인 원칙]
- templateId 선택 기준:
  * photo: 사진 중심, 풀블리드 이미지+하단 텍스트. 대부분의 콘텐츠에 적합. **기본값으로 photo를 선택하세요.**
  * editorial: 잡지풍, 좌측 텍스트+우측 이미지. 정보 전달형 콘텐츠에 적합.
  * typo: 타이포 중심, 이미지 없음. 텍스트만으로 충분한 추상적/철학적 콘텐츠에만 사용.
  **주의: typo 템플릿은 이미지를 전혀 표시하지 않습니다. 이미지가 있는 캐러셀을 원하면 반드시 photo 또는 editorial을 선택하세요.**`;

const STEP3_SCHEMA = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    caption: { type: 'string' },
    hashtags: { type: 'array', items: { type: 'string' } },
    slides: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
          cta: { type: 'string' },
        },
        required: ['title', 'body', 'cta'],
        additionalProperties: false,
      },
    },
    templateId: { type: 'string', enum: ['photo', 'typo', 'editorial'] },
  },
  required: ['topic', 'caption', 'hashtags', 'slides', 'templateId'],
  additionalProperties: false,
};

export async function writeSlides(
  structure: AIDAStructure,
  content: { title: string; description: string; text: string },
  brandInfo?: { tone?: string; mainColor?: string; styleKeywords?: string[] },
): Promise<SlideContents> {
  const brandContext = brandInfo
    ? `\n브랜드 톤: ${brandInfo.tone || '자동 판단'}\n메인 컬러: ${brandInfo.mainColor || '자동 판단'}`
    : '';

  const structureText = structure.slideRoles
    .map((r) => `슬라이드 ${r.slideIndex + 1} [${r.aidaPhase}]: ${r.keyPoint}`)
    .join('\n');

  const userMessage = `다음 구조에 맞춰 슬라이드 콘텐츠를 작성하세요.

<structure>
전체 스토리: ${structure.overallNarrative}
${structureText}
</structure>

<source_content>
제목: ${content.title}
본문 요약: ${content.text.slice(0, 3000)}
</source_content>
${brandContext}

정확히 ${structure.slideRoles.length}장의 슬라이드를 작성하세요.`;

  return withRetry(() => callClaude(STEP3_SYSTEM, userMessage, STEP3_SCHEMA, SlideContentsSchema, 6144, MODEL_CREATIVE));
}

// ─── Step 4: Image Query Generation ───
const STEP4_SYSTEM = `당신은 스톡 이미지 검색 쿼리 전문가입니다.
각 슬라이드의 콘텐츠를 읽고, Unsplash/Pexels에서 검색할 구체적 영어 키워드를 생성하세요.

각 슬라이드에 대해 2개의 쿼리를 생성:
1. primaryQuery: 구체적 시각 장면 (3-4단어, 영어)
2. fallbackQuery: 더 넓은 범위의 대체 쿼리 (2-3단어, 영어)

핵심 규칙:
- 촬영 가능한 실제 장면만 (차트, 그래프, 통계, 아이콘 금지)
- 추상 개념은 시각적 사물로 변환:
  * "생산성 향상" → primaryQuery: "organized desk planner coffee", fallbackQuery: "workspace productivity"
  * "앱 설치" → primaryQuery: "smartphone colorful app icons screen", fallbackQuery: "phone apps"
  * "간편 결제" → primaryQuery: "hand tapping phone payment terminal", fallbackQuery: "mobile payment"
- [주체] + [상태/행동] + [장소/맥락] 패턴 사용
- 브랜드명 금지 (Apple, Samsung 등)
- 한국어 금지 — 영어 키워드만
- primaryQuery와 fallbackQuery는 서로 다른 시각적 접근
- 마지막 CTA 슬라이드는 따뜻하고 긍정적인 이미지 (예: "friends sharing phone smiling")`;

const STEP4_SCHEMA = {
  type: 'object',
  properties: {
    queries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slideIndex: { type: 'number' },
          primaryQuery: { type: 'string' },
          fallbackQuery: { type: 'string' },
        },
        required: ['slideIndex', 'primaryQuery', 'fallbackQuery'],
        additionalProperties: false,
      },
    },
  },
  required: ['queries'],
  additionalProperties: false,
};

export async function generateImageQueries(
  slides: { title: string; body: string; cta: string }[],
): Promise<ImageQueries> {
  const slidesText = slides
    .map((s, i) => `슬라이드 ${i + 1}: 제목="${s.title}" 본문="${s.body}" CTA="${s.cta}"`)
    .join('\n');

  const userMessage = `다음 슬라이드들에 어울리는 이미지 검색 키워드를 생성하세요.

${slidesText}

정확히 ${slides.length}개의 쿼리를 생성하세요. slideIndex는 0부터 ${slides.length - 1}까지.`;

  return withRetry(() => callClaude(STEP4_SYSTEM, userMessage, STEP4_SCHEMA, ImageQueriesSchema, 2048));
}

// ─── Orchestrator: Multi-step pipeline ───
export type StepCallback = (step: string) => void;

export async function generateCarouselMultiStep(
  content: { title: string; description: string; text: string },
  brandInfo?: { tone?: string; mainColor?: string; styleKeywords?: string[] },
  slideCount: number = 8,
  onStep?: StepCallback,
): Promise<CarouselOutput> {
  // Step 1: Content Analysis
  onStep?.('analyzing');
  const analysis = await analyzeContent(content, brandInfo);

  // Step 2: AIDA Structure Design
  onStep?.('structuring');
  const structure = await designStructure(analysis, slideCount);

  // Step 3: Slide Content Writing
  onStep?.('writing');
  const slideContents = await writeSlides(structure, content, brandInfo);

  // Step 4: Image Query Generation
  onStep?.('querying');
  const imageQueries = await generateImageQueries(slideContents.slides);

  // Merge into final CarouselOutput
  const slides = slideContents.slides.map((slide, i) => {
    const queryItem = imageQueries.queries.find((q) => q.slideIndex === i);
    return {
      title: slide.title,
      body: slide.body,
      imageQuery: queryItem?.primaryQuery || 'abstract colorful background',
      fallbackQuery: queryItem?.fallbackQuery,
      cta: slide.cta,
    };
  });

  return {
    topic: slideContents.topic,
    caption: slideContents.caption,
    hashtags: slideContents.hashtags,
    slides,
    templateId: slideContents.templateId,
  };
}
