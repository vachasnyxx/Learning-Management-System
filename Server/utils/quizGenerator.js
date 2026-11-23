/**
 * Quiz generation utilities.
 *
 * The LMS works out of the box with a smart offline generator that builds
 * multiple-choice questions from the course metadata (title, description,
 * category, instructor, modules and lectures).
 *
 * If a `GEMINI_API_KEY` or `OPENAI_API_KEY` is configured in the server
 * environment, the generator automatically uses that AI provider instead.
 * When the API call fails for any reason we gracefully fall back to the
 * offline generator so the feature never breaks a demo.
 */

const CATEGORY_POOL = [
    "Programming",
    "Business",
    "Design",
    "Data Science",
    "Marketing",
    "Self Improvement",
    "Finance",
    "Communication",
    "Mathematics",
];

const INSTRUCTOR_POOL = [
    "Prof. A. Sharma",
    "Dr. R. Mehta",
    "Ms. K. Verma",
    "Mr. S. Kapoor",
    "Dr. N. Iyer",
    "Prof. M. Singh",
];

const MODULE_POOL = [
    "Introduction and Setup",
    "Core Concepts",
    "Hands-on Practice",
    "Advanced Topics",
    "Final Project and Review",
    "Assessment and Feedback",
];

const LECTURE_POOL = [
    "Course Overview",
    "Key Terminology",
    "Practical Demonstration",
    "Common Mistakes",
    "Summary and Next Steps",
    "Case Study Walkthrough",
];

const DESCRIPTION_POOL = [
    "A practical guide to cooking healthy meals at home",
    "An introduction to ancient Roman architecture",
    "A beginner's guide to gardening and plant care",
    "A travel journal covering major European cities",
    "A short history of medieval European art",
];

const FILE_POOL = [
    "Lecture notes.pdf",
    "Module slides.pptx",
    "Reference sheet.pdf",
    "Practice worksheet.pdf",
];

function shuffleArray(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * Builds 4 unique options and returns the index of the correct one.
 */
function buildOptions(correct, distractors) {
    if (!correct) return null;

    const uniqueDistractors = [...new Set(distractors)]
        .filter((option) => option && option !== correct);

    const options = [correct];

    for (const distractor of uniqueDistractors) {
        if (options.length === 4) break;
        if (!options.includes(distractor)) options.push(distractor);
    }

    // Guarantee exactly 4 options even when the course has very little content.
    const fillers = [
        "None of these options",
        "Not covered in this course",
        "A completely unrelated topic",
        "All of the above",
    ];

    for (const filler of fillers) {
        if (options.length === 4) break;
        if (!options.includes(filler)) options.push(filler);
    }

    const shuffled = shuffleArray(options);

    return {
        options: shuffled,
        correctOption: shuffled.indexOf(correct),
    };
}

function makeQuestion(question, correct, distractors, explanation) {
    const built = buildOptions(correct, distractors);
    if (!built) return null;

    return {
        question,
        options: built.options,
        correctOption: built.correctOption,
        explanation: explanation || "",
    };
}

/**
 * Smart offline quiz generator. Builds questions only from the real course
 * content so the quiz always feels relevant.
 */
export function generateOfflineQuiz(course, count = 5) {
    const title = course?.title || "this course";
    const description = course?.description || "";
    const category = course?.category || "";
    const instructor = course?.createdBy || "";
    const modules = Array.isArray(course?.modules) ? course.modules : [];
    const lectures = Array.isArray(course?.lectures) ? course.lectures : [];

    const questions = [];

    // 1. Category
    questions.push(makeQuestion(
        `Which category does the course "${title}" belong to?`,
        category,
        CATEGORY_POOL.filter((item) => item !== category),
        `The course is listed under the "${category}" category.`
    ));

    // 2. Instructor
    questions.push(makeQuestion(
        `Who is the instructor of the course "${title}"?`,
        instructor,
        INSTRUCTOR_POOL.filter((item) => item !== instructor),
        `"${title}" is taught by ${instructor}.`
    ));

    // 3. Course description
    if (description) {
        questions.push(makeQuestion(
            `Which statement best describes the course "${title}"?`,
            description,
            DESCRIPTION_POOL,
            `The course description states: "${description}".`
        ));
    }

    // 4. Module belonging to the course
    if (modules.length > 0) {
        const moduleTitles = modules.map((module) => module.title).filter(Boolean);
        questions.push(makeQuestion(
            `Which of the following is a module in the course "${title}"?`,
            moduleTitles[0],
            MODULE_POOL.filter((item) => !moduleTitles.includes(item)),
            `"${moduleTitles[0]}" is one of the modules of this course.`
        ));

        // 5. A lecture inside each module (if the module has lectures)
        for (const module of modules) {
            const moduleLectures = lectures.filter(
                (lecture) => lecture.moduleId && module._id && lecture.moduleId.toString() === module._id.toString()
            );

            if (moduleLectures.length > 0) {
                const lectureTitle = moduleLectures[0].title;
                const otherLectures = lectures
                    .filter((lecture) => lecture.title !== lectureTitle)
                    .map((lecture) => lecture.title);

                questions.push(makeQuestion(
                    `Which lecture belongs to the module "${module.title}"?`,
                    lectureTitle,
                    [...otherLectures, ...LECTURE_POOL],
                    `"${lectureTitle}" is part of the module "${module.title}".`
                ));
            }
        }

        // 6. Study material
        const moduleWithFile = modules.find((module) => module.files && module.files.length > 0);
        if (moduleWithFile) {
            const fileName = moduleWithFile.files[0].title;
            const otherFiles = modules
                .flatMap((module) => (module.files || []).map((file) => file.title))
                .filter((name) => name !== fileName);

            questions.push(makeQuestion(
                `Which study material is available in the module "${moduleWithFile.title}"?`,
                fileName,
                [...otherFiles, ...FILE_POOL],
                `The module "${moduleWithFile.title}" includes the file "${fileName}".`
            ));
        }
    }

    // 7. A lecture in the course
    if (lectures.length > 0) {
        const lectureTitles = lectures.map((lecture) => lecture.title).filter(Boolean);
        questions.push(makeQuestion(
            `Which of the following is a lecture in the course "${title}"?`,
            lectureTitles[0],
            LECTURE_POOL.filter((item) => !lectureTitles.includes(item)),
            `"${lectureTitles[0]}" is one of the lectures of this course.`
        ));
    }

    // 8. Getting started
    questions.push(makeQuestion(
        `What is the best first step when starting the course "${title}"?`,
        "Watch the introductory lecture and review the course modules",
        [
            "Skip the lectures and attempt the quiz directly",
            "Delete the course and choose a different one",
            "Only read the course title and wait for the certificate",
            "Ask for the certificate without completing anything",
        ],
        "Start with the introductory lecture, then work through each module in order."
    ));

    // 9. Progress tracking
    questions.push(makeQuestion(
        `How does a learner track progress in "${title}"?`,
        "By marking each lecture as completed",
        [
            "By refreshing the page repeatedly",
            "By changing the profile picture",
            "By logging out and logging back in",
            "By deleting the lecture list",
        ],
        "Each lecture has a completion toggle, and the progress bar updates automatically."
    ));

    // 10. Certificate
    questions.push(makeQuestion(
        `What must a learner do to earn the certificate for "${title}"?`,
        "Complete all lectures and pass the course quiz",
        [
            "Only open the course page once",
            "Subscribe and never watch any lecture",
            "Ask the instructor to print a certificate manually",
            "Complete half of the lectures",
        ],
        "Certificates unlock after all lectures are completed and the quiz is passed."
    ));

    // 11. Study material location
    questions.push(makeQuestion(
        `Where can learners find downloadable study material for "${title}"?`,
        "Inside the course modules",
        [
            "In the browser settings",
            "On the login page",
            "In the footer of the website",
            "In the certificate page",
        ],
        "Teachers attach notes and slides to each course module."
    ));

    // 12. Quiz purpose
    questions.push(makeQuestion(
        `What is the purpose of the quiz in "${title}"?`,
        "To check understanding and unlock the certificate",
        [
            "To replace all lecture videos",
            "To delete the course automatically",
            "To change the instructor of the course",
            "To reset the learner's password",
        ],
        "The quiz verifies learning outcomes and is required before the certificate unlocks."
    ));

    // 13. Roles
    questions.push(makeQuestion(
        `Which role can add modules, lectures and quizzes to "${title}"?`,
        "A teacher or an admin",
        [
            "Any visitor without an account",
            "Only a student who is subscribed",
            "Only the certificate page",
            "The website footer",
        ],
        "Teachers and admins manage course content; students consume it."
    ));

    const uniqueQuestions = [];
    const seen = new Set();

    for (const question of shuffleArray(questions.filter(Boolean))) {
        if (!question || seen.has(question.question)) continue;
        seen.add(question.question);
        uniqueQuestions.push(question);
    }

    return uniqueQuestions.slice(0, Math.max(3, count));
}

function parseJsonSafely(text) {
    if (!text || typeof text !== "string") return null;

    let cleaned = text.trim();

    // Remove markdown code fences such as ```json ... ```
    cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");

    let candidate = cleaned;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        const lastBrace = cleaned.lastIndexOf("}");
        candidate = cleaned.slice(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1) {
        const lastBracket = cleaned.lastIndexOf("]");
        candidate = cleaned.slice(firstBracket, lastBracket + 1);
    }

    try {
        return JSON.parse(candidate);
    } catch {
        return null;
    }
}

function normaliseQuestions(rawQuestions) {
    if (!Array.isArray(rawQuestions)) return [];

    const normalised = [];

    for (const raw of rawQuestions) {
        if (!raw || typeof raw.question !== "string") continue;

        let options = Array.isArray(raw.options)
            ? raw.options.map((option) => String(option).trim()).filter(Boolean)
            : [];

        options = [...new Set(options)];

        if (options.length < 2) continue;

        while (options.length < 4) {
            const filler = `Option ${options.length + 1}`;
            if (!options.includes(filler)) options.push(filler);
        }

        options = options.slice(0, 4);

        let correctOption = raw.correctOption;

        if (typeof correctOption === "string") {
            const letter = correctOption.trim().toUpperCase();
            if (/^[A-D]$/.test(letter)) {
                correctOption = letter.charCodeAt(0) - 65;
            } else {
                const index = options.findIndex((option) => option === correctOption.trim());
                correctOption = index;
            }
        }

        correctOption = Number(correctOption);

        if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) continue;

        normalised.push({
            question: raw.question.trim(),
            options,
            correctOption,
            explanation: typeof raw.explanation === "string" ? raw.explanation.trim() : "",
        });
    }

    return normalised;
}

function buildPrompt(course, count, difficulty) {
    const modules = (course?.modules || []).map((module) => module.title).join(", ");
    const lectures = (course?.lectures || []).map((lecture) => lecture.title).join(", ");

    return `You are an expert teacher creating a multiple-choice quiz for an online course.

Course title: ${course?.title}
Course category: ${course?.category}
Instructor: ${course?.createdBy}
Course description: ${course?.description}
Modules: ${modules || "Not specified"}
Lectures: ${lectures || "Not specified"}

Create exactly ${count} ${difficulty} difficulty multiple-choice questions that test understanding of this course.
Return ONLY valid JSON in this exact shape:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}
Rules:
- Each question must have exactly 4 options.
- correctOption must be an integer from 0 to 3.
- Questions must be unique and relevant to the course.
- Do not include markdown, code fences or any extra text.`;
}

async function callGemini(course, count, difficulty) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.5-flash"}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: buildPrompt(course, count, difficulty) }] }],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json",
                    },
                }),
                signal: controller.signal,
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API responded with ${response.status}`);
        }

        const data = await response.json();
        const text = (data?.candidates?.[0]?.content?.parts || [])
            .map((part) => part.text || "")
            .join("");

        const parsed = parseJsonSafely(text);
        return normaliseQuestions(parsed?.questions || parsed);
    } finally {
        clearTimeout(timer);
    }
}

async function callOpenAI(course, count, difficulty) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                temperature: 0.7,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: "You generate multiple-choice quizzes and reply with valid JSON only.",
                    },
                    { role: "user", content: buildPrompt(course, count, difficulty) },
                ],
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`OpenAI API responded with ${response.status}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || "";
        const parsed = parseJsonSafely(text);
        return normaliseQuestions(parsed?.questions || parsed);
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Generates a quiz using the configured AI provider, falling back to the
 * offline generator when no key is present or the request fails.
 */
export async function generateQuiz(course, count = 5, difficulty = "medium") {
    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 10);

    if (process.env.GEMINI_API_KEY) {
        try {
            const questions = await callGemini(course, safeCount, difficulty);
            if (questions && questions.length > 0) {
                return { questions: questions.slice(0, safeCount), source: "gemini" };
            }
        } catch (error) {
            console.warn("Gemini quiz generation failed, using offline generator:", error.message);
        }
    }

    if (process.env.OPENAI_API_KEY) {
        try {
            const questions = await callOpenAI(course, safeCount, difficulty);
            if (questions && questions.length > 0) {
                return { questions: questions.slice(0, safeCount), source: "openai" };
            }
        } catch (error) {
            console.warn("OpenAI quiz generation failed, using offline generator:", error.message);
        }
    }

    return {
        questions: generateOfflineQuiz(course, safeCount),
        source: "offline",
    };
}
