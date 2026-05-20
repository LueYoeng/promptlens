const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = __dirname;
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "db.json");
const port = Number(process.env.PORT || 8787);

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

function ensureDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    writeDb({
      users: [],
      sessions: [],
      prompts: [],
      favorites: [],
      templates: defaultTemplates,
      events: []
    });
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  fs.mkdirSync(dataDir, { recursive: true });
  const tmpPath = `${dbPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf8");
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
  const db = readDb();
  const method = req.method || "GET";

  if (method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, dynamic: true, time: new Date().toISOString() });
    return;
  }

  if (method === "GET" && url.pathname === "/api/templates") {
    sendJson(res, 200, { templates: db.templates });
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
    writeDb(db);
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
    writeDb(db);
    sendJson(res, 200, { user: publicUser(user), token });
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/logout") {
    const auth = getAuth(req, db);
    if (auth) {
      db.sessions = db.sessions.filter((session) => session.token !== auth.session.token);
      writeDb(db);
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
      mode: String(body.mode || "qa"),
      score: Number(body.score || 0),
      createdAt: new Date().toISOString()
    };
    db.prompts.unshift(item);
    track(db, "generated", { userId: auth.user.id, promptId: item.id });
    writeDb(db);
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
      mode: String(body.mode || "qa"),
      score: Number(body.score || 0),
      createdAt: new Date().toISOString()
    };
    db.favorites.unshift(item);
    track(db, "favorite", { userId: auth.user.id, favoriteId: item.id });
    writeDb(db);
    sendJson(res, 201, { favorite: item });
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
    writeDb(db);
    sendJson(res, 200, result);
    return;
  }

  sendError(res, 404, "API route not found");
}

async function optimizeWithAi(input, body) {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = buildFallbackPrompt(input, body);
  if (!apiKey) {
    return {
      ai: false,
      prompt,
      blueprint: "后端已启用，但未配置 OPENAI_API_KEY，因此返回服务端规则增强结果。",
      score: 88,
      variants: [
        { title: "商用专业版", note: "服务端规则增强", content: prompt },
        { title: "追问优先版", note: "适合需求不完整时", content: `${prompt}\n\n如果信息不足，请先提出 3 个最关键的澄清问题。` }
      ]
    };
  }

  const payload = {
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You refine user requests into precise production-grade AI prompts. Return JSON only. Use plain text in all user-facing fields, not Markdown. Do not use # headings, Markdown bullets, code fences, or table syntax." },
      {
        role: "user",
        content: JSON.stringify({
          input,
          mode: body.mode || "auto",
          options: body.options || {},
          formattingRule: "所有面向用户的内容都使用普通文本。小标题使用“标题：”，列表使用中文编号“（1）（2）（3）”，不要使用 Markdown。",
          requestedShape: {
            prompt: "完整优化提示词，普通文本格式",
            blueprint: "结构拆解，普通文本格式",
            score: "0-100",
            variants: [{ title: "版本名", note: "适用场景", content: "提示词内容，普通文本格式" }]
          }
        })
      }
    ],
    temperature: 0.4,
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      score: Number(parsed.score || 92),
      variants: Array.isArray(parsed.variants) ? parsed.variants : []
    };
  } catch (error) {
    return {
      ai: false,
      prompt,
      blueprint: `AI 调用失败，已返回服务端规则增强结果：${error.message}`,
      score: 84,
      variants: [{ title: "备用版", note: "AI 不可用时返回", content: prompt }]
    };
  }
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

server.listen(port, () => {
  ensureDb();
  console.log(`PromptLens dynamic server running at http://localhost:${port}`);
});
