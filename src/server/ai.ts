import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const PRIMARY_MODEL = "groq/compound";
const FALLBACK_MODELS = ["groq/compound-mini", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"];

if (!process.env.GROQ_API_KEY) {
  console.warn(
    "[ai.ts] WARNING: GROQ_API_KEY is not set. All AI calls will fail and fallback data will be used."
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SHARED TYPES
// ───────────────────────────────────────────────────────────────────────────

export interface RoadmapConcept {
  title: string;
  description: string;
}

export interface RoadmapResult {
  difficulty: string;
  estimatedTime: string;
  concepts: RoadmapConcept[];
}

export interface DiagnosticQuestion {
  concept: string;
  difficulty: "Easy" | "Medium";
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface DiagnosticQuizResult {
  questions: DiagnosticQuestion[];
}

export interface ConceptContentResult {
  simpleExplanation: string;
  detailedExplanation: string;
  analogy: string;
  example: string;
  formulas: string[];
  commonMistakes: string[];
  summary: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ConceptQuizResult {
  questions: QuizQuestion[];
}

async function callAI(prompt: string): Promise<string> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (let mIndex = 0; mIndex < modelsToTry.length; mIndex++) {
    const currentModel = modelsToTry[mIndex];

    const executeCall = async () => {
      const response = await client.chat.completions.create({
        model: currentModel,
        messages: [
          {
            role: "system",
            content:
              "You are an expert STEM educator. Always return ONLY valid JSON. Never use markdown or code blocks.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
        response_format: {
          type: "json_object",
        },
      });
      return response.choices[0]?.message?.content;
    };

    // Retry helper with backoff for the current model
    const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
      try {
        return await fn();
      } catch (error: any) {
        const isRateLimit =
          error.status === 429 ||
          error.statusCode === 429 ||
          (error.message && (error.message.includes("Rate limit") || error.message.includes("429"))) ||
          error.code === "rate_limit_exceeded";

        if (isRateLimit) {
          if (retries > 0) {
            console.warn(`[Groq AI.ts Rate Limit] ${currentModel} hit 429. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 1.5);
          }
        }
        throw error;
      }
    };

    try {
      const text = await retryWithBackoff(executeCall);
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      const isRateLimit =
        err.status === 429 ||
        err.statusCode === 429 ||
        (err.message && (err.message.includes("Rate limit") || err.message.includes("429"))) ||
        err.code === "rate_limit_exceeded";

      if (isRateLimit && mIndex < modelsToTry.length - 1) {
        console.warn(`[Groq AI.ts Switch] Rate limit reached on ${currentModel}. Switching to fallback model: ${modelsToTry[mIndex + 1]}`);
        continue;
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error("Groq returned an empty response.");
}
/**
 * Safely extracts a JSON object/array from a raw Gemini text response.
 *
 * Handles the common failure modes:
 *   - Response wrapped in ```json ... ``` or ``` ... ``` fences.
 *   - Leading/trailing prose around the JSON payload.
 *   - Stray whitespace.
 *
 * Throws if no valid JSON can be recovered, so callers can fall back to
 * their default payload.
 */
function extractJson<T>(rawText: string): T {
  let cleaned = rawText.trim();

  // Strip ```json ... ``` or ``` ... ``` markdown code fences, if present.
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  }

  // If there's still leading/trailing prose, isolate the outermost
  // JSON object or array by locating the first opening brace/bracket
  // and the last matching closing brace/bracket.
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const startsWithObject =
    firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket);

  const start = startsWithObject ? firstBrace : firstBracket;
  const end = startsWithObject ? cleaned.lastIndexOf("}") : cleaned.lastIndexOf("]");

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse JSON from Gemini response: ${(err as Error).message}`
    );
  }
}

/**
 * Runs a full "call Gemini -> extract JSON -> validate" pipeline.
 *
 * @param prompt    The prompt to send to Gemini.
 * @param validate  A type guard that confirms the parsed JSON matches the
 *                  expected shape. If validation fails, we treat it the
 *                  same as a parsing failure and fall back.
 * @param fallback  The value to return if generation, parsing, or
 *                  validation fails for any reason.
 */
async function generateValidatedJson<T>(
  prompt: string,
  validate: (data: unknown) => data is T,
  fallback: T
): Promise<T> {
  try {
    const rawText = await callAI(prompt);

    const parsed = extractJson<unknown>(rawText);


    const isValid = validate(parsed);

    if (!isValid) {
      console.error("[ai.ts] Response failed validation.");
      return fallback;
    }

    return parsed;
  } catch (err) {
    console.error("[ai.ts] AI generation failed:", err);
    return fallback;
  }
}
/** Basic runtime check: is this value a non-null, non-array object? */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ───────────────────────────────────────────────────────────────────────────
// VALIDATORS
// ───────────────────────────────────────────────────────────────────────────

function isRoadmapResult(data: unknown): data is RoadmapResult {
  if (!isPlainObject(data)) return false;
  if (typeof data.difficulty !== "string") return false;
  if (typeof data.estimatedTime !== "string") return false;
  if (!Array.isArray(data.concepts)) return false;

  return data.concepts.every(
    (c) =>
      isPlainObject(c) &&
      typeof c.title === "string" &&
      typeof c.description === "string"
  );
}

function isDiagnosticQuizResult(data: unknown): data is DiagnosticQuizResult {
  if (!isPlainObject(data)) return false;
  if (!Array.isArray(data.questions)) return false;

  return data.questions.every(
    (q) =>
      isPlainObject(q) &&
      typeof q.concept === "string" &&
      typeof q.questionText === "string" &&
      Array.isArray(q.options) &&
      q.options.every((o) => typeof o === "string") &&
      typeof q.correctAnswer === "number" &&
      typeof q.difficulty === "string" &&
      typeof q.explanation === "string"
  );
}

function isConceptContentResult(
    data: unknown
): data is ConceptContentResult {

    if (!isPlainObject(data))
        return false;

    return (

        typeof data.simpleExplanation === "string" &&
        typeof data.detailedExplanation === "string" &&
        typeof data.analogy === "string" &&
        typeof data.example === "string" &&
        Array.isArray(data.formulas) &&
        Array.isArray(data.commonMistakes) &&
        typeof data.summary === "string"

    );

}

function isConceptQuizResult(
    data: unknown
): data is ConceptQuizResult {
    if (!isPlainObject(data))
        return false;

    if (!Array.isArray(data.questions))
        return false;

    return data.questions.every(question =>

        typeof question.question === "string" &&

        Array.isArray(question.options) &&

        question.options.length === 4 &&

        question.options.every(option => typeof option === "string") &&

        typeof question.correctAnswer === "number" &&

        typeof question.explanation === "string"

    );

}



// ───────────────────────────────────────────────────────────────────────────
// FALLBACK PAYLOADS
// ───────────────────────────────────────────────────────────────────────────
// Used whenever Gemini is unreachable, returns malformed JSON, or the
// response fails shape validation. These keep the app usable (and honest
// about the failure) instead of crashing the request.

function buildRoadmapFallback(topicTitle: string): RoadmapResult {
  return {
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    concepts: [
      {
        title: `Introduction to ${topicTitle}`,
        description: `Foundational overview of ${topicTitle} and why it matters.`,
      },
      {
        title: `Core Principles of ${topicTitle}`,
        description: `The essential building-block ideas behind ${topicTitle}.`,
      },
      {
        title: `Applying ${topicTitle}`,
        description: `Practical, worked examples that use ${topicTitle} to solve problems.`,
      },
    ],
  };
}

function buildDiagnosticQuizFallback(roadmap: RoadmapConcept[]): DiagnosticQuizResult {
  const concepts = roadmap.length > 0 ? roadmap : [{ title: "General Concept", description: "" }];

  const questions: DiagnosticQuestion[] = Array.from({ length: 8 }, (_, i) => {
    const concept = concepts[i % concepts.length];
    return {
      concept: concept.title,
      questionText: `Which statement best relates to "${concept.title}"?`,
      options: [
        `A core idea within ${concept.title}`,
        "An unrelated concept",
        "A common misconception",
        "None of the above",
      ],
      correctAnswer: 0,
      explanation: `This checks basic understanding of ${concept.title}.`,
      difficulty: "Medium",
    };
  });

  return { questions };
}

function buildConceptContentFallback(
  conceptTitle: string
): ConceptContentResult {
  return {
    simpleExplanation: `${conceptTitle} is a foundational idea we'll break down step by step.`,
    detailedExplanation:
      `A deeper explanation for ${conceptTitle} is temporarily unavailable.`,
    analogy:
      `Think of ${conceptTitle} like learning to ride a bicycle. Practice makes understanding easier.`,
    example:
      `Example generation is temporarily unavailable.`,
    formulas: [],
    commonMistakes: [],
    summary:
      `${conceptTitle} is an important concept worth revisiting.`
  };
}
function buildConceptQuizFallback(): ConceptQuizResult {
  return {
    questions: [
      {
        question: "Unable to generate quiz.",
        options: [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        correctAnswer: 0,
        explanation: "Please try again."
      }
    ]
  };
}

export async function aiGenerateRoadmap(
  topicTitle: string,
  userNotes?: string
): Promise<RoadmapResult> {
  // Limit to ~12 000 chars (~8-10 pages) to stay within token budgets while
  // still giving the AI enough context to build a high-quality roadmap.
  const notesSnippet = userNotes ? userNotes.slice(0, 12000) : "";
  const notesSection = notesSnippet
    ? `The learner has also provided their own notes below. PRIORITIZE these notes when deciding which concepts to include and how to order them — treat them as the primary source of truth, and use your general knowledge only to fill gaps or provide structure.
---
USER NOTES:
${notesSnippet}
---`
    : "The learner has not provided any notes, so build the roadmap from general best-practice knowledge of this topic.";

  const prompt = `You are an expert curriculum designer for an adaptive STEM learning platform called LearnFlow AI.

Analyze the topic "${topicTitle}" and build a logical, beginner-friendly learning roadmap.

${notesSection}

Requirements:
- Start with prerequisite / foundational concepts.
- Progress step by step toward more advanced concepts, ending with the most advanced ones.
- Each concept should be a distinct, teachable unit (not too broad, not too narrow).
- Include between 4 and 8 concepts, depending on the natural scope of the topic.
- Assign an overall "difficulty" level for the topic: one of "Beginner", "Intermediate", or "Advanced".
- Estimate a realistic total "estimatedTime" to complete the roadmap, formatted like "45 mins" or "2 hours".

Return ONLY valid JSON with this exact shape and no additional keys:
{
  "difficulty": string,
  "estimatedTime": string,
  "concepts": [
    { "title": string, "description": string }
  ]
}

Do not include markdown formatting, code fences, comments, or any text outside the JSON object.`;

  return generateValidatedJson<RoadmapResult>(
    prompt,
    isRoadmapResult,
    buildRoadmapFallback(topicTitle)
  );
}

/**
 * Identifies the main STEM topic title and key concepts from extracted notes text.
 */
export async function aiIdentifyTopicFromNotes(
  notesText: string
): Promise<{ topic: string; keyConcepts: string[] }> {
  const prompt = `You are an expert STEM curriculum analyzer for LearnFlow AI.
Analyze the following student study notes or document text:

---
${notesText.slice(0, 12000)}
---

Your task:
1. Identify the single primary STEM topic title (e.g., "Linear Algebra", "Cellular Respiration", "Newton's Laws", "Operating Systems", "Organic Chemistry").
2. Extract between 3 and 7 key concepts covered in the text.

Return ONLY valid JSON with this exact shape and no additional text:
{
  "topic": string,
  "keyConcepts": [string]
}`;

  try {
    const rawText = await callAI(prompt);
    const parsed = extractJson<{ topic?: string; keyConcepts?: string[] }>(rawText);
    if (parsed && typeof parsed.topic === "string" && parsed.topic.trim().length > 0) {
      return {
        topic: parsed.topic.trim(),
        keyConcepts: Array.isArray(parsed.keyConcepts)
          ? parsed.keyConcepts.filter((c) => typeof c === "string")
          : [],
      };
    }
  } catch (err) {
    console.error("[ai.ts] Topic identification failed:", err);
  }

  return {
    topic: "STEM Topic Notes",
    keyConcepts: ["Foundational Concept"],
  };
}



// ───────────────────────────────────────────────────────────────────────────
// 2. DIAGNOSTIC QUIZ GENERATION
// ───────────────────────────────────────────────────────────────────────────

/**
 * Generates an 8-question diagnostic multiple-choice quiz covering every
 * concept in the given roadmap, at Easy-to-Medium difficulty.
 */
export async function aiGenerateDiagnosticQuiz(
  topicTitle: string,
  roadmap: RoadmapConcept[]
): Promise<DiagnosticQuizResult> {
  const conceptList = (roadmap || [])
    .map((c, idx) => `${idx + 1}. ${c.title} — ${c.description}`)
    .join("\n");

  const prompt = `You are an expert STEM assessment designer for LearnFlow AI.

Topic:
${topicTitle}

Roadmap Concepts:
${conceptList}

Your task is to generate a diagnostic quiz that evaluates the student's knowledge for EVERY roadmap concept.

Requirements:

- Generate EXACTLY TWO questions for EACH roadmap concept.
- Total questions = roadmap.length × 2.
- Question 1 for every concept should be EASY.
- Question 2 for every concept should be MEDIUM.
- Every question must belong to exactly one concept.
- Every question must contain exactly 4 options.
- "correctAnswer" must be the zero-based index (0-3).
- Include a short explanation.
- The "concept" field MUST exactly match the roadmap concept title.
- Include a new field called "difficulty" with values "Easy" or "Medium".

Return ONLY valid JSON.

{
  "questions":[
    {
      "concept":"Vectors",
      "difficulty":"Easy",
      "questionText":"...",
      "options":[
        "...",
        "...",
        "...",
        "..."
      ],
      "correctAnswer":0,
      "explanation":"..."
    }
  ]
}

Do not return markdown.
Do not return code blocks.
Return only JSON.`;

  return generateValidatedJson<DiagnosticQuizResult>(
    prompt,
    isDiagnosticQuizResult,
    buildDiagnosticQuizFallback(roadmap)
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 3. CONCEPT LESSON CONTENT GENERATION
// ───────────────────────────────────────────────────────────────────────────

/**
 * Generates a full, beginner-friendly micro-lesson for a single concept.
 * If the learner's own notes are supplied, the lesson is taught according
 * to those notes rather than generic textbook material.
 */
export async function aiGenerateConceptContent(
  topicTitle: string,
  conceptTitle: string,
  conceptDescription: string,
  userNotes?: string
): Promise<ConceptContentResult> {
  const notesSection = userNotes
    ? `The learner has provided their own notes/materials for this concept below. TEACH ACCORDING TO THESE NOTES — align your terminology, examples, and depth with what's written here, rather than a generic textbook treatment.
---
USER NOTES:
${userNotes}
---`
    : "No user notes were provided for this concept, so teach it using clear, generally-accepted explanations.";

  const prompt = `You are a friendly, patient STEM tutor for an adaptive learning platform called LearnFlow AI.

Write a beginner-friendly micro-lesson for the following concept:

Topic: "${topicTitle}"
Concept: "${conceptTitle}"
Concept description: "${conceptDescription}"

${notesSection}

Requirements:
- "simpleExplanation": a short, plain-language explanation (2-4 sentences) a total beginner could understand.
- "detailedExplanation": a deeper, more thorough explanation (a few paragraphs) building on the simple explanation.
- "analogy": a relatable real-world analogy that makes the concept intuitive.
- "example": one concrete worked example demonstrating the concept in action.
- "formulas": an array of any relevant formulas or key expressions as plain strings (return an empty array if the concept has no formulas).
- "commonMistakes": an array of common misconceptions or mistakes learners make with this concept.
- "summary": a concise closing summary (1-3 sentences) reinforcing the key takeaway.

Return ONLY valid JSON with this exact shape and no additional keys:
{
  "simpleExplanation": string,
  "detailedExplanation": string,
  "analogy": string,
  "example": string,
  "formulas": string[],
  "commonMistakes": string[],
  "summary": string
}

Do not include markdown formatting, code fences, comments, or any text outside the JSON object.`;

  return generateValidatedJson<ConceptContentResult>(
    prompt,
    isConceptContentResult,
    buildConceptContentFallback(conceptTitle)
  );
}

export async function aiGenerateConceptQuiz(
  topicTitle: string,
  conceptTitle: string,
  conceptDescription: string
): Promise<ConceptQuizResult> {

  const prompt = `
You are an expert STEM teacher for LearnFlow AI.

Generate EXACTLY FIVE multiple-choice questions.

Topic:
${topicTitle}

Concept:
${conceptTitle}

Description:
${conceptDescription}

Rules:

1. Beginner to Intermediate difficulty.

2. Exactly FOUR options.

3. Exactly ONE correct answer.

4. correctAnswer is the index (0-3).

5. Include explanation.

Return ONLY JSON.

{
  "questions":[
    {
      "question":"",
      "options":[
        "",
        "",
        "",
        ""
      ],
      "correctAnswer":0,
      "explanation":""
    }
  ]
}
`;

  return generateValidatedJson<ConceptQuizResult>(
    prompt,
    isConceptQuizResult,
    buildConceptQuizFallback()
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOADED NOTES ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export interface StudyNoteQuestion {
  question: string;
  options: string[]; // exactly 4
  correctAnswer: number; // 0-indexed
  explanation: string;
}

export interface StudyNoteAnalysisResult {
  subject: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  explanation: string;
  keyPoints: string[];
  commonMistakes: string[];
  questions: StudyNoteQuestion[];
  nextTopics: string[];
}

/**
 * Takes raw text extracted from a student's uploaded study notes document (1 or more pages)
 * and returns a structured, student-friendly analysis with a quiz.
 */
export async function aiAnalyzeStudyNotes(
  extractedText: string
): Promise<StudyNoteAnalysisResult> {
  // Allow up to ~20 000 chars (~12-15 pages of typed notes) — stays well within Groq's context window
  const snippet = extractedText.slice(0, 20000);

  const prompt = `You are an expert, friendly STEM tutor inside LearnFlow AI.
A student has uploaded a study notes document (may be one or more pages). Read ALL of it carefully and return a detailed JSON analysis.

NOTE TEXT:
---
${snippet}
---

Return ONLY a single valid JSON object with EXACTLY this structure (no markdown, no code fences):
{
  "subject": "<broad academic subject — e.g. Physics, Mathematics, Biology>",
  "topic": "<specific topic name identified from the note>",
  "difficulty": "<one of: Beginner, Intermediate, Advanced>",
  "summary": "<3-5 sentence concise summary of the entire note>",
  "explanation": "<explain the full content in simple, student-friendly language — use analogies and everyday examples, 150-250 words>",
  "keyPoints": [
    "<key point or important concept from the note — write 4-7 short bullet-style items>"
  ],
  "commonMistakes": [
    "<common mistake students make on this topic — write 3-5 items>"
  ],
  "questions": [
    {
      "question": "<question text based strictly on the note>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "correctAnswer": <0-indexed integer 0-3>,
      "explanation": "<brief explanation of why the answer is correct>"
    }
  ],
  "nextTopics": ["<follow-on topic to study next — 3-5 items>"]
}

Strict rules:
- questions: generate between 5 and 15 questions covering the breadth of the document. ALL derived strictly from the uploaded text. Do NOT invent questions about topics not present in the document.
- Each question must have EXACTLY 4 options.
- correctAnswer is 0-based (0=A, 1=B, 2=C, 3=D).
- difficulty reflects complexity of the source material, not your explanation.
- keyPoints: 4-10 short items (more pages = more key points).
- commonMistakes: 3-5 items.
- nextTopics: 3-5 items.`;

  const fallback: StudyNoteAnalysisResult = {
    subject: "General",
    topic: "Uploaded Study Note",
    difficulty: "Intermediate",
    summary: "This note covers key academic concepts. Review the breakdown below.",
    explanation:
      "The uploaded note contains important study material. Our AI has prepared a student-friendly breakdown to help you understand and retain the content.",
    keyPoints: ["Review the core concepts covered in this note."],
    commonMistakes: ["Skipping foundational concepts before moving to advanced topics."],
    questions: [
      {
        question: "What is the primary focus of this study note?",
        options: [
          "A general academic overview",
          "Advanced theoretical concepts",
          "Practical engineering applications",
          "Historical context only",
        ],
        correctAnswer: 0,
        explanation: "The note provides a general academic overview of the topic.",
      },
    ],
    nextTopics: ["Explore related prerequisite concepts", "Practice problems on this topic"],
  };

  try {
    const rawText = await callAI(prompt);
    const parsed = extractJson<Partial<StudyNoteAnalysisResult>>(rawText);

    if (
      parsed &&
      typeof parsed.subject === "string" &&
      typeof parsed.topic === "string" &&
      typeof parsed.summary === "string" &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length > 0
    ) {
      const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
      return {
        subject: parsed.subject.trim(),
        topic: parsed.topic.trim(),
        difficulty: validDifficulties.includes(parsed.difficulty as string)
          ? (parsed.difficulty as StudyNoteAnalysisResult["difficulty"])
          : "Intermediate",
        summary: parsed.summary.trim(),
        explanation:
          typeof parsed.explanation === "string"
            ? parsed.explanation.trim()
            : fallback.explanation,
        keyPoints: Array.isArray(parsed.keyPoints)
          ? (parsed.keyPoints as string[]).filter((s) => typeof s === "string")
          : fallback.keyPoints,
        commonMistakes: Array.isArray(parsed.commonMistakes)
          ? (parsed.commonMistakes as string[]).filter((s) => typeof s === "string")
          : fallback.commonMistakes,
        questions: (parsed.questions as StudyNoteQuestion[]).filter(
          (q) =>
            q.question &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correctAnswer === "number"
        ),
        nextTopics: Array.isArray(parsed.nextTopics)
          ? (parsed.nextTopics as string[]).filter((s) => typeof s === "string")
          : fallback.nextTopics,
      };
    }
  } catch (err) {
    console.error("[ai.ts] aiAnalyzeStudyNotes failed:", err);
  }

  return fallback;
}
