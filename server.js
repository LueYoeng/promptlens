const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = __dirname;
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "db.json");
const port = Number(process.env.PORT || 8787);
const databaseUrl = process.env.DATABASE_URL || "";
let dbReady = null;
let pgPool = null;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const defaultTemplates = [
  {
    id: "saas-dashboard",
    title: "网站系统开发",
    category: "开发",
    mode: "code",
    targetAI: "code",
    tone: "professional",
    format: "structured",
    prompt: "创建一个面向中小企业的 SaaS 数据看板网站，需要登录、角色权限、指标卡片、趋势图、筛选器、导出报表和移动端适配，UI 要克制高级。"
  },
  {
    id: "business-diagnosis",
    title: "业务诊断",
    category: "分析",
    mode: "analysis",
    targetAI: "chat",
    tone: "strict",
    format: "table",
    prompt: "分析一个线上课程平台近三个月付费转化率下降的可能原因，给出指标拆解、排查路径、数据需求和优先级行动建议。"
  },
  {
    id: "image-hero",
    title: "网页首屏图片",
    category: "图片",
    mode: "image",
    targetAI: "image",
    tone: "creative",
    format: "structured",
    prompt: "生成一张适合科技产品官网首屏的视觉图片，主体是透明玻璃质感的 AI 工作台，清晨自然光，干净高级，画面可留出标题空间。"
  }
];

function createDefaultDb() {
  return {
    users: [],
    sessions: [],
    prompts: [],
    favorites: [],
    templates: defaultTemplates,
    exports: [],
    events: []
  };
}

function normalizeDb(db) {
  const base = createDefaultDb();
  const next = { ...base, ...(db || {}) };
  next.users = Array.isArray(next.users) ? next.users : [];
  next.sessions = Array.isArray(next.sessions) ? next.sessions : [];
  next.prompts = Array.isArray(next.prompts) ? next.prompts : [];
  next.favorites = Array.isArray(next.favorites) ? next.favorites : [];
  next.templates = Array.isArray(next.templates) && next.templates.length ? next.templates : defaultTemplates;
  next.exports = Array.isArray(next.exports) ? next.exports : [];
  next.events = Array.isArray(next.events) ? next.events : [];
  return next;
}

async function ensureDb() {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    if (databaseUrl) {
      const { Pool } = require("pg");
      pgPool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
      });
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS promptlens_store (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pgPool.query(
        "INSERT INTO promptlens_store (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING",
        ["main", JSON.stringify(createDefaultDb())]
      );
      return;
    }

    fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(dbPath)) {
      await writeDb(createDefaultDb());
    }
  })();
  return dbReady;
}

async function readDb() {
  await ensureDb();
  if (pgPool) {
    const result = await pgPool.query("SELECT data FROM promptlens_store WHERE id = $1", ["main"]);
    return normalizeDb(result.rows[0]?.data);
  }
  return normalizeDb(JSON.parse(fs.readFileSync(dbPath, "utf8")));
}

async function writeDb(db) {
  const normalized = normalizeDb(db);
  if (pgPool) {
    await pgPool.query(
      "UPDATE promptlens_store SET data = $2::jsonb, updated_at = NOW() WHERE id = $1",
      ["main", JSON.stringify(normalized)]
    );
    return;
  }
  fs.mkdirSync(dataDir, { recursive: true });
  const tmpPath = `${dbPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(normalized, null, 2), "utf8");
  fs.renameSync(tmpPath, dbPath);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const next = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
}

function createId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan || "free",
    createdAt: user.createdAt
  };
}

function getAuth(req, db) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const session = db.sessions.find((item) => item.token === token && item.expiresAt > Date.now());
  if (!session) return null;
  const user = db.users.find((item) => item.id === session.userId);
  return user ? { user, session } : null;
}

function requireAuth(req, res, db) {
  const auth = getAuth(req, db);
  if (!auth) {
    sendError(res, 401, "Please sign in first");
    return null;
  }
  return auth;
}

function track(db, type, data = {}) {
  db.events.unshift({
    id: createId("evt"),
    type,
    data,
    createdAt: new Date().toISOString()
  });
  db.events = db.events.slice(0, 500);
}

async function handleApi(req, res, url) {
  const db = await readDb();
  const method = req.method || "GET";

  if (method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      dynamic: true,
      database: pgPool ? "postgres" : "json",
      ai: Boolean(process.env.OPENAI_API_KEY),
      time: new Date().toISOString()
    });
    return;
  }

  if (method === "GET" && url.pathname === "/api/templates") {
    const auth = getAuth(req, db);
    const templates = db.templates.filter((item) => !item.userId || item.userId === auth?.user.id);
    sendJson(res, 200, { templates });
    return;
  }

  if (method === "GET" && url.pathname === "/api/stats") {
    sendJson(res, 200, {
      users: db.users.length,
      prompts: db.prompts.length,
      favorites: db.favorites.length,
      templates: db.templates.length,
      generated: db.events.filter((event) => event.type === "generated").length
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim() || email.split("@")[0];
    if (!email.includes("@") || password.length < 6) {
      sendError(res, 400, "Use a valid email and at least 6 password characters");
      return;
    }
    if (db.users.some((user) => user.email === email)) {
      sendError(res, 409, "Email already registered");
      return;
    }
    const user = {
      id: createId("usr"),
      name,
      email,
      passwordHash: hashPassword(password),
      plan: "free",
      createdAt: new Date().toISOString()
    };
    const token = createId("ses");
    db.users.push(user);
    db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14 });
    track(db, "registered", { userId: user.id });
    await writeDb(db);
    sendJson(res, 201, { user: publicUser(user), token });
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = db.users.find((item) => item.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendError(res, 401, "Invalid email or password");
      return;
    }
    const token = createId("ses");
    db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14 });
    track(db, "login", { userId: user.id });
    await writeDb(db);
    sendJson(res, 200, { user: publicUser(user), token });
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/logout") {
    const auth = getAuth(req, db);
    if (auth) {
      db.sessions = db.sessions.filter((session) => session.token !== auth.session.token);
      await writeDb(db);
    }
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === "GET" && url.pathname === "/api/me") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    sendJson(res, 200, { user: publicUser(auth.user) });
    return;
  }

  if (method === "GET" && url.pathname === "/api/prompts") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    sendJson(res, 200, { prompts: db.prompts.filter((item) => item.userId === auth.user.id).slice(0, 50) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/prompts") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    const body = await readBody(req);
    const item = {
      id: createId("prm"),
      userId: auth.user.id,
      source: String(body.source || "").slice(0, 8000),
      prompt: String(body.prompt || "").slice(0, 20000),
      blueprint: String(body.blueprint || "").slice(0, 12000),
      image: String(body.image || "").slice(0, 12000),
      variants: Array.isArray(body.variants) ? body.variants.slice(0, 8) : [],
      structureScore: Number(body.structureScore || body.score || 0),
      aiScore: Number.isFinite(Number(body.aiScore)) ? Number(body.aiScore) : null,
      compositeScore: Number(body.compositeScore || body.score || 0),
      scoreExplanation: String(body.scoreExplanation || "").slice(0, 12000),
      questions: Array.isArray(body.questions) ? body.questions.slice(0, 8) : [],
      mode: String(body.mode || "qa"),
      score: Number(body.score || 0),
      createdAt: new Date().toISOString()
    };
    db.prompts.unshift(item);
    track(db, "generated", { userId: auth.user.id, promptId: item.id });
    await writeDb(db);
    sendJson(res, 201, { prompt: item });
    return;
  }

  if (method === "GET" && url.pathname === "/api/favorites") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    sendJson(res, 200, { favorites: db.favorites.filter((item) => item.userId === auth.user.id).slice(0, 50) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/favorites") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    const body = await readBody(req);
    const item = {
      id: createId("fav"),
      userId: auth.user.id,
      source: String(body.source || "").slice(0, 8000),
      prompt: String(body.prompt || "").slice(0, 20000),
      blueprint: String(body.blueprint || "").slice(0, 12000),
      image: String(body.image || "").slice(0, 12000),
      variants: Array.isArray(body.variants) ? body.variants.slice(0, 8) : [],
      structureScore: Number(body.structureScore || body.score || 0),
      aiScore: Number.isFinite(Number(body.aiScore)) ? Number(body.aiScore) : null,
      compositeScore: Number(body.compositeScore || body.score || 0),
      scoreExplanation: String(body.scoreExplanation || "").slice(0, 12000),
      questions: Array.isArray(body.questions) ? body.questions.slice(0, 8) : [],
      mode: String(body.mode || "qa"),
      score: Number(body.score || 0),
      createdAt: new Date().toISOString()
    };
    db.favorites.unshift(item);
    track(db, "favorite", { userId: auth.user.id, favoriteId: item.id });
    await writeDb(db);
    sendJson(res, 201, { favorite: item });
    return;
  }

  if (method === "POST" && url.pathname === "/api/templates") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    const body = await readBody(req);
    const title = String(body.title || "").trim();
    const prompt = String(body.prompt || "").trim();
    if (!title || !prompt) {
      sendError(res, 400, "Template title and prompt are required");
      return;
    }
    const template = {
      id: createId("tpl"),
      userId: auth.user.id,
      title: title.slice(0, 80),
      category: String(body.category || "自定义").trim().slice(0, 24) || "自定义",
      mode: String(body.mode || "qa"),
      targetAI: String(body.targetAI || "chat"),
      tone: String(body.tone || "professional"),
      format: String(body.format || "structured"),
      prompt: prompt.slice(0, 8000),
      custom: true,
      createdAt: new Date().toISOString()
    };
    db.templates.unshift(template);
    track(db, "template_created", { userId: auth.user.id, templateId: template.id });
    await writeDb(db);
    sendJson(res, 201, { template });
    return;
  }

  if (method === "GET" && url.pathname === "/api/dashboard") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    const userId = auth.user.id;
    const prompts = db.prompts.filter((item) => item.userId === userId);
    const favorites = db.favorites.filter((item) => item.userId === userId);
    const customTemplates = db.templates.filter((item) => item.userId === userId);
    const exports = db.exports.filter((item) => item.userId === userId);
    sendJson(res, 200, {
      user: publicUser(auth.user),
      counts: {
        prompts: prompts.length,
        favorites: favorites.length,
        templates: customTemplates.length,
        exports: exports.length
      },
      recent: prompts.slice(0, 6),
      templates: customTemplates.slice(0, 12),
      exports: exports.slice(0, 12)
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/exports") {
    const auth = requireAuth(req, res, db);
    if (!auth) return;
    const body = await readBody(req);
    const item = {
      id: createId("exp"),
      userId: auth.user.id,
      extension: String(body.extension || "txt").slice(0, 12),
      source: String(body.source || "").slice(0, 1000),
      score: Number(body.score || 0),
      createdAt: new Date().toISOString()
    };
    db.exports.unshift(item);
    db.exports = db.exports.slice(0, 500);
    track(db, "exported", { userId: auth.user.id, extension: item.extension });
    await writeDb(db);
    sendJson(res, 201, { export: item });
    return;
  }

  if (method === "POST" && url.pathname === "/api/optimize") {
    const body = await readBody(req);
    const input = String(body.input || "").trim();
    if (!input) {
      sendError(res, 400, "Missing input");
      return;
    }
    const result = await optimizeWithAi(input, body);
    track(db, "ai_optimize", { mode: body.mode || "auto", ai: result.ai });
    await writeDb(db);
    sendJson(res, 200, result);
    return;
  }

  sendError(res, 404, "API route not found");
}

async function optimizeWithAi(input, body) {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = buildFallbackPrompt(input, body);
  const fallbackScore = scorePrompt(input, body);
  const fallbackQuestions = buildClarifyingQuestions(input, body.mode || "auto");
  const fallbackExplanation = buildScoreExplanation(fallbackScore.metrics, input, body.options || {});
  if (!apiKey) {
    return {
      ai: false,
      prompt,
      blueprint: "后端已启用，但未配置 OPENAI_API_KEY，因此返回服务端规则增强结果。",
      score: fallbackScore.score,
      metrics: fallbackScore.metrics,
      scoreExplanation: fallbackExplanation,
      questions: fallbackQuestions,
      variants: [
        { title: "商用专业版", note: "服务端规则增强", content: prompt },
        { title: "追问优先版", note: "适合需求不完整时", content: `${prompt}\n\n如果信息不足，请先提出 3 个最关键的澄清问题。` }
      ]
    };
  }

  const modelLabel = String(body.model || "auto");
  const modelMap = {
    auto: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    fast: process.env.OPENAI_FAST_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini",
    pro: process.env.OPENAI_PRO_MODEL || process.env.OPENAI_MODEL || "gpt-4.1",
    creative: process.env.OPENAI_CREATIVE_MODEL || process.env.OPENAI_MODEL || "gpt-4.1"
  };
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const payload = {
    model: modelMap[modelLabel] || modelMap.auto,
    messages: [
      { role: "system", content: "You refine user requests into precise production-grade AI prompts. Return JSON only. Use plain text in all user-facing fields, not Markdown. Do not use # headings, Markdown bullets, code fences, or table syntax." },
      {
        role: "user",
        content: JSON.stringify({
          input,
          mode: body.mode || "auto",
          options: body.options || {},
          conversation: Array.isArray(body.conversation) ? body.conversation.slice(-12) : [],
          formattingRule: "所有面向用户的内容都使用普通文本。小标题使用“标题：”，列表使用中文编号“（1）（2）（3）”，不要使用 Markdown。",
          requestedShape: {
            prompt: "完整优化提示词，普通文本格式",
            blueprint: "结构拆解，普通文本格式",
            score: "0-100",
            scoreExplanation: "评分解释，说明为什么是这个分数以及如何提高",
            questions: ["需要追问用户的关键问题，最多 5 个"],
            variants: [{ title: "版本名", note: "适用场景", content: "提示词内容，普通文本格式" }]
          }
        })
      }
    ],
    temperature: 0.4,
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`OpenAI API ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return {
      ai: true,
      prompt: parsed.prompt || prompt,
      blueprint: parsed.blueprint || "AI 已生成优化结果。",
      score: Number(parsed.score || fallbackScore.score),
      metrics: fallbackScore.metrics,
      scoreExplanation: parsed.scoreExplanation || fallbackExplanation,
      questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : fallbackQuestions,
      variants: Array.isArray(parsed.variants) ? parsed.variants : []
    };
  } catch (error) {
    return {
      ai: false,
      prompt,
      blueprint: `AI 调用失败，已返回服务端规则增强结果：${error.message}`,
      score: fallbackScore.score,
      metrics: fallbackScore.metrics,
      scoreExplanation: fallbackExplanation,
      questions: fallbackQuestions,
      variants: [{ title: "备用版", note: "AI 不可用时返回", content: prompt }]
    };
  }
}

function scorePrompt(input, body) {
  const options = body.options || {};
  const text = String(input || "");
  const metrics = {
    clarity: clamp(38 + Math.min(38, Math.round(text.length / 3)) + (/[。,.，；;]/.test(text) ? 8 : 0), 0, 100),
    context: clamp(34 + (text.length > 48 ? 24 : 8) + (options.detail || 3) * 7, 0, 100),
    constraint: clamp(36 + (options.includeConstraints === false ? 0 : 22) + (/[0-9一二三四五六七八九十]/.test(text) ? 12 : 0), 0, 100),
    format: clamp(40 + (options.includeFormat === false ? 0 : 24) + (options.format && options.format !== "plain" ? 14 : 4), 0, 100),
    action: clamp(42 + (text.length > 24 ? 18 : 8) + (options.includeChecklist === false ? 0 : 14), 0, 100)
  };
  const score = Math.round(Object.values(metrics).reduce((sum, value) => sum + value, 0) / 5);
  return { score, metrics };
}

function buildScoreExplanation(metrics, input, options) {
  const weakest = Object.entries(metrics).sort((a, b) => a[1] - b[1]).slice(0, 2);
  const tips = [];
  if (String(input).length < 40) tips.push("原始需求偏短，建议补充目标用户、使用场景和成功标准。");
  if (!/[0-9一二三四五六七八九十]/.test(input)) tips.push("缺少数量、时间、尺寸、篇幅或验收指标，建议加入可衡量约束。");
  if (options.format === "plain") tips.push("当前输出格式偏自然段，复杂任务建议改成结构化或步骤清单。");
  if (!tips.length) tips.push("当前需求结构较完整，下一步可以补充反例、边界条件或交付验收标准。");
  return [
    "评分解释：",
    `当前短板：${weakest.map(([key, value]) => `${metricLabel(key)} ${value} 分`).join("，")}。`,
    "改进建议：",
    ...tips.map((item, index) => `（${index + 1}）${item}`)
  ].join("\n");
}

function buildClarifyingQuestions(input, mode) {
  const common = ["这个结果主要给谁使用？", "最终输出需要达到什么验收标准？", "有没有必须避免的内容、风格或限制？"];
  const byMode = {
    code: ["需要哪些页面、模块和数据字段？", "准备部署到哪个平台，是否需要移动端适配？"],
    image: ["主体、场景、镜头、光线和画幅分别是什么？", "要偏真实摄影、商业海报还是概念插画？"],
    writing: ["目标读者是谁，发布渠道是什么？", "需要多长篇幅，是否有固定结构或禁用表达？"],
    analysis: ["分析的时间范围、核心指标和数据来源是什么？", "这个分析最终要支持什么决策？"],
    qa: ["你更需要结论、原因、步骤还是方案？", "希望回答到什么深度？"]
  };
  const detected = mode === "auto" ? (/(网站|系统|代码|开发|页面)/.test(input) ? "code" : "qa") : mode;
  return [...common, ...(byMode[detected] || byMode.qa)].slice(0, 5);
}

function metricLabel(key) {
  return {
    clarity: "清晰度",
    context: "上下文",
    constraint: "约束",
    format: "格式",
    action: "可执行"
  }[key] || key;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildFallbackPrompt(input, body) {
  const mode = body.mode || "auto";
  const options = body.options || {};
  return [
    "你是一名资深 AI 提示词架构师，请把下面的原始需求转化为可直接交给 AI 执行的高质量提示词。",
    "请使用普通文本格式，不要使用 Markdown 标题、短横线列表、代码块或表格语法。",
    "",
    `原始需求：${input}`,
    "",
    `场景：${mode}`,
    `输出语言：${options.language || "zh"}`,
    `语气：${options.tone || "professional"}`,
    `输出格式：${options.format || "structured"}`,
    "",
    "请在结果中明确：角色、目标、上下文、执行步骤、约束条件、输出格式、验收标准和信息不足时的追问。"
  ].join("\n");
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(root, pathname));
  if (!filePath.startsWith(root) || filePath.includes(`${path.sep}data${path.sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    const cacheControl = [".html", ".js", ".css"].includes(ext)
      ? "no-cache"
      : "public, max-age=86400";
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": cacheControl
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    sendError(res, 500, error.message || "Server error");
  }
});

ensureDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`PromptLens dynamic server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("PromptLens failed to initialize storage:", error);
    process.exit(1);
  });
