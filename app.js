const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
  canvas: $("#ambientCanvas"),
  themeToggle: $("#themeToggle"),
  openHelpTop: $("#openHelpTop"),
  openHelpGuide: $("#openHelpGuide"),
  helpDialog: $("#helpDialog"),
  closeHelp: $("#closeHelp"),
  closeHelpFooter: $("#closeHelpFooter"),
  authName: $("#authName"),
  authEmail: $("#authEmail"),
  authFields: $("#authFields"),
  authNameInput: $("#authNameInput"),
  authEmailInput: $("#authEmailInput"),
  authPasswordInput: $("#authPasswordInput"),
  loginBtn: $("#loginBtn"),
  registerBtn: $("#registerBtn"),
  logoutBtn: $("#logoutBtn"),
  modeStatus: $("#modeStatus"),
  statGenerated: $("#statGenerated"),
  statFavorites: $("#statFavorites"),
  statTemplates: $("#statTemplates"),
  templateSearch: $("#templateSearch"),
  categoryFilters: $("#categoryFilters"),
  templateList: $("#templateList"),
  workspaceName: $("#workspaceName"),
  syncEndpoint: $("#syncEndpoint"),
  saveWorkspace: $("#saveWorkspace"),
  syncHistory: $("#syncHistory"),
  syncStatus: $("#syncStatus"),
  enableAI: $("#enableAI"),
  aiEndpoint: $("#aiEndpoint"),
  aiModel: $("#aiModel"),
  saveAIConfig: $("#saveAIConfig"),
  testAI: $("#testAI"),
  aiStatus: $("#aiStatus"),
  toolModeButtons: $("#toolModeButtons"),
  inputTitle: $("#inputTitle"),
  userInput: $("#userInput"),
  charCount: $("#charCount"),
  clearInput: $("#clearInput"),
  refreshQuestions: $("#refreshQuestions"),
  clarificationList: $("#clarificationList"),
  applyClarifications: $("#applyClarifications"),
  modeButtons: $("#modeButtons"),
  targetAI: $("#targetAI"),
  language: $("#language"),
  tone: $("#tone"),
  format: $("#format"),
  detailRange: $("#detailRange"),
  detailLabel: $("#detailLabel"),
  includeRole: $("#includeRole"),
  includeConstraints: $("#includeConstraints"),
  includeFormat: $("#includeFormat"),
  includeChecklist: $("#includeChecklist"),
  generateBtn: $("#generateBtn"),
  aiEnhanceBtn: $("#aiEnhanceBtn"),
  scoreValue: $("#scoreValue"),
  barClarity: $("#barClarity"),
  barContext: $("#barContext"),
  barConstraint: $("#barConstraint"),
  barFormat: $("#barFormat"),
  barAction: $("#barAction"),
  resultPrompt: $("#resultPrompt"),
  variantList: $("#variantList"),
  resultBlueprint: $("#resultBlueprint"),
  resultImage: $("#resultImage"),
  historyList: $("#historyList"),
  favoriteList: $("#favoriteList"),
  favoritePrompt: $("#favoritePrompt"),
  saveHistory: $("#saveHistory"),
  sharePrompt: $("#sharePrompt"),
  exportTxt: $("#exportTxt"),
  exportMd: $("#exportMd"),
  copyPrompt: $("#copyPrompt"),
  toast: $("#toast")
};

const store = {
  history: "promptLensHistory",
  favorites: "promptLensFavorites",
  settings: "promptLensSettings",
  stats: "promptLensStats",
  theme: "promptLensTheme",
  auth: "promptLensAuth"
};

const detailLabels = ["极简", "简洁", "标准", "精细", "专家级"];
const modeNames = {
  auto: "自动识别",
  qa: "问答推理",
  code: "开发创建",
  image: "图像生成",
  writing: "写作表达",
  analysis: "分析决策"
};

const profiles = {
  qa: {
    role: "你是一名善于拆解复杂问题的高级研究助理，能够先澄清问题边界，再给出清晰、可靠、可执行的回答。",
    goal: "围绕原始问题给出准确回答，同时解释关键依据、必要背景和可落地建议。",
    focus: ["明确问题的真实意图", "区分事实、推断和建议", "先给结论，再给推理过程", "在信息不足时列出需要补充的问题"],
    deliverable: "结论摘要、原因分析、可执行建议、必要的后续问题"
  },
  code: {
    role: "你是一名资深全栈工程师、产品设计师和代码审查者，擅长把模糊需求转化为可运行、可维护、体验精良的实现。",
    goal: "基于原始需求完成系统设计或代码实现，并确保交付物可运行、易验证、界面符合目标用户场景。",
    focus: ["先识别现有项目结构和技术栈", "给出必要的数据结构、页面状态和交互流程", "实现核心功能，不停留在建议层", "说明验证方式和剩余风险"],
    deliverable: "实现方案、关键文件、核心代码、运行方式、测试或验证结果"
  },
  image: {
    role: "你是一名图像提示词导演，擅长把概念拆成主体、环境、镜头、光线、材质、风格和负面约束。",
    goal: "将原始画面想法转化为可直接用于图像模型的高质量提示词。",
    focus: ["明确主体和主体动作", "补齐场景、构图、镜头和光照", "指定材质、色彩、质感和风格", "加入负面提示词避免常见瑕疵"],
    deliverable: "正向提示词、负面提示词、画幅比例、风格关键词、可选变体"
  },
  writing: {
    role: "你是一名资深编辑和内容策略师，能够按照受众、目的、语气和发布渠道组织表达。",
    goal: "把原始写作需求转化为结构清楚、语气准确、有明确交付标准的写作提示词。",
    focus: ["明确读者和使用场景", "给出结构、篇幅和语气要求", "保留关键信息并减少空泛表达", "让输出具备可直接发布或继续修改的质量"],
    deliverable: "标题方向、正文结构、语气要求、改写规则、验收标准"
  },
  analysis: {
    role: "你是一名商业分析师和问题诊断顾问，擅长建立假设、拆分变量、设计验证路径并输出决策建议。",
    goal: "把原始分析需求转化为可执行的分析框架，帮助 AI 输出有证据链、有优先级的结论。",
    focus: ["明确分析对象、指标和时间范围", "列出关键假设和影响因素", "设计排查顺序和数据需求", "输出优先级、行动建议和风险"],
    deliverable: "分析框架、关键假设、数据需求、结论模板、行动清单"
  }
};

let templates = [
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
    id: "image-hero",
    title: "网页首屏图片",
    category: "图片",
    mode: "image",
    targetAI: "image",
    tone: "creative",
    format: "structured",
    prompt: "生成一张适合科技产品官网首屏的视觉图片，主体是透明玻璃质感的 AI 工作台，清晨自然光，干净高级，画面可留出标题空间。"
  },
  {
    id: "xhs-post",
    title: "小红书文案",
    category: "写作",
    mode: "writing",
    targetAI: "chat",
    tone: "friendly",
    format: "steps",
    prompt: "帮我写一篇小红书笔记，主题是普通人如何开始使用 AI 提升工作效率，要有标题、开头钩子、正文结构和结尾互动。"
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
    id: "paper-outline",
    title: "论文报告",
    category: "写作",
    mode: "writing",
    targetAI: "chat",
    tone: "strict",
    format: "structured",
    prompt: "围绕人工智能对现代教育评价体系的影响，生成一份论文大纲，需要研究问题、文献方向、章节结构和论证重点。"
  },
  {
    id: "video-script",
    title: "视频脚本",
    category: "写作",
    mode: "writing",
    targetAI: "chat",
    tone: "creative",
    format: "steps",
    prompt: "写一个 60 秒短视频脚本，主题是 AI 工具如何帮自由职业者节省时间，需要分镜、台词、画面和节奏建议。"
  },
  {
    id: "resume-upgrade",
    title: "简历优化",
    category: "个人",
    mode: "writing",
    targetAI: "chat",
    tone: "professional",
    format: "structured",
    prompt: "帮我优化一段产品经理简历经历，突出数据结果、项目复杂度、跨团队协作和业务影响，避免空泛词。"
  },
  {
    id: "translation-polish",
    title: "翻译润色",
    category: "写作",
    mode: "writing",
    targetAI: "chat",
    tone: "professional",
    format: "table",
    prompt: "把一段中文商业介绍翻译成自然地道的英文，并给出直译版、商务版和更适合官网展示的润色版。"
  },
  {
    id: "product-research",
    title: "产品调研",
    category: "商业",
    mode: "analysis",
    targetAI: "chat",
    tone: "strict",
    format: "table",
    prompt: "调研一款 AI 提示词优化工具的目标用户、核心场景、竞品功能、商业模式和 MVP 优先级。"
  },
  {
    id: "prompt-rewrite",
    title: "提示词改写",
    category: "个人",
    mode: "qa",
    targetAI: "chat",
    tone: "professional",
    format: "structured",
    toolMode: "rewrite",
    prompt: "你是AI，请帮我写一篇关于效率的文章。"
  }
];

let state = {
  selectedMode: "auto",
  selectedCategory: "全部",
  toolMode: "create",
  currentResult: emptyResult(),
  activeTab: "prompt"
};

function emptyResult() {
  return {
    prompt: "",
    blueprint: "",
    image: "",
    variants: [],
    mode: "auto",
    score: 0,
    metrics: { clarity: 0, context: 0, constraint: 0, format: 0, action: 0 }
  };
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getAuthState() {
  return readJSON(store.auth, { token: "", user: null });
}

function setAuthState(next) {
  writeJSON(store.auth, next);
  renderAuth();
}

function apiRequest(path, options = {}) {
  const auth = getAuthState();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  return fetch(path, { ...options, headers }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  });
}

function normalizeServerItem(item) {
  return {
    id: item.id || Date.now(),
    mode: item.mode || "qa",
    source: item.source || "",
    prompt: item.prompt || "",
    blueprint: item.blueprint || "",
    image: item.image || "",
    variants: item.variants || [],
    score: item.score || 0,
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false }) : new Date().toLocaleString("zh-CN", { hour12: false })
  };
}

function detectMode(text) {
  const value = text.toLowerCase();
  const checks = [
    { mode: "image", hit: /(生成图片|画一张|画一个|插画|海报|头像|logo|视觉|封面|摄影|镜头|光线|图片|midjourney|stable diffusion|image|photo|poster)/i.test(value) },
    { mode: "code", hit: /(创建|开发|搭建|实现|写一个|做一个|网站|系统|程序|应用|小程序|app|页面|组件|前端|后端|接口|数据库|代码|bug|修复|部署|测试)/i.test(value) },
    { mode: "analysis", hit: /(分析|诊断|原因|指标|数据|增长|转化率|留存|收入|成本|复盘|策略|决策|竞品|市场|归因)/i.test(value) },
    { mode: "writing", hit: /(写|改写|润色|文案|标题|脚本|邮件|简历|总结|报告|公众号|小红书|演讲稿|文章|故事|翻译)/i.test(value) },
    { mode: "qa", hit: /(为什么|如何|怎么|是否|什么是|请问|解释|区别|原理|\?|\？)/i.test(value) }
  ];
  const found = checks.find((item) => item.hit);
  return found ? found.mode : "qa";
}

function getActiveMode(text) {
  if (state.selectedMode !== "auto") return state.selectedMode;
  return text ? detectMode(text) : "auto";
}

function collectOptions() {
  return {
    targetAI: elements.targetAI.value,
    language: elements.language.value,
    tone: elements.tone.value,
    format: elements.format.value,
    detail: Number(elements.detailRange.value),
    includeRole: elements.includeRole.checked,
    includeConstraints: elements.includeConstraints.checked,
    includeFormat: elements.includeFormat.checked,
    includeChecklist: elements.includeChecklist.checked,
    toolMode: state.toolMode
  };
}

function getLanguageInstruction(language) {
  if (language === "en") return "Please answer in English. Keep terminology precise and avoid vague wording.";
  if (language === "bilingual") return "请使用中英双语输出：中文负责解释，英文保留关键术语和可直接复制的专业表达。";
  return "请使用简体中文输出，必要的专业术语可以保留英文。";
}

function getToneInstruction(tone) {
  const map = {
    professional: "语气专业清晰，避免空泛和夸张。",
    creative: "语气有创造力，允许提出有辨识度的表达和方案。",
    strict: "语气严格精确，明确边界、条件和验收标准。",
    friendly: "语气自然友好，但不要牺牲信息密度。"
  };
  return map[tone] || map.professional;
}

function getFormatInstruction(format) {
  const map = {
    structured: "请使用清晰标题和分段结构输出。",
    steps: "请用步骤清单输出，每一步包含目的、动作和结果。",
    table: "请优先使用表格整理关键信息，并在表格后补充必要说明。",
    plain: "请用自然段输出，保持逻辑递进和段落清楚。"
  };
  return map[format] || map.structured;
}

function getTargetInstruction(target) {
  const map = {
    general: "适用于通用 AI 助手。",
    chat: "适用于 ChatGPT、Claude、DeepSeek 等对话模型。",
    code: "适用于代码助手或具备文件编辑能力的 AI 编程环境。",
    image: "适用于图像生成模型；如果模型不支持某些参数，请保留语义并移除参数标记。"
  };
  return map[target] || map.general;
}

function detailInstruction(level) {
  const map = {
    1: "保持简短，只保留任务目标和最关键的输出要求。",
    2: "加入必要背景、输出格式和一组核心约束。",
    3: "补齐角色、任务、步骤、约束和验收标准。",
    4: "加入上下文假设、边界条件、质量标准和检查清单。",
    5: "加入完整工作流、优先级、风险、反例、验收标准和可追问项。"
  };
  return map[level] || map[4];
}

function textSection(title, body) {
  return `${title}：\n${body}`;
}

function textList(items) {
  return items.map((item, index) => `（${index + 1}）${item}`).join("\n");
}

function buildModeRequirements(mode, detail) {
  const base = profiles[mode] || profiles.qa;
  const lines = [...base.focus];
  if (mode === "code") {
    lines.push("如果需要创建界面，请直接给出可运行的页面、组件、样式和交互逻辑");
    lines.push("如果存在现有代码库，请先阅读项目结构并遵循已有技术栈、命名和样式约定");
    if (detail >= 4) lines.push("明确说明如何运行、如何验证、有哪些边界情况尚未覆盖");
  }
  if (mode === "image") {
    lines.push("正向提示词需要包含主体、环境、构图、镜头、光线、材质、色彩、风格、质量词");
    lines.push("负面提示词需要覆盖畸形、低清晰度、错误文字、过度噪点和不自然结构");
    if (detail >= 4) lines.push("给出 2 个风格变体，方便继续迭代");
  }
  if (mode === "analysis" && detail >= 4) {
    lines.push("把结论分为高可信、中可信、待验证三类");
  }
  if (mode === "qa" && detail >= 4) {
    lines.push("对不确定内容标注“推断”，不要把假设写成事实");
  }
  return textList(lines);
}

function buildChecklist(mode) {
  const common = [
    "是否准确回应原始需求",
    "是否补齐了必要背景和约束",
    "是否给出可直接执行或复制的结果",
    "是否说明了不确定信息和下一步"
  ];
  const extra = {
    code: ["是否包含运行方式", "是否覆盖主要交互状态", "是否考虑错误处理和验证"],
    image: ["是否能直接粘贴到图像模型", "是否包含负面提示词", "是否说明画幅和风格"],
    analysis: ["是否列出数据需求", "是否区分假设和结论", "是否给出优先级"],
    writing: ["是否符合受众和渠道", "是否有标题或结构", "是否避免空泛表达"],
    qa: ["是否先给结论", "是否解释关键原因", "是否包含可操作建议"]
  };
  return textList([...common, ...(extra[mode] || extra.qa)]);
}

function buildOutputFormat(format, mode) {
  const profile = profiles[mode] || profiles.qa;
  const parts = [
    getFormatInstruction(format),
    `必须包含：${profile.deliverable}。`
  ];
  if (format === "table") parts.push("表格字段需要有明确列名，避免只给泛泛描述。");
  if (format === "steps") parts.push("每个步骤都要写清楚输入、动作和预期输出。");
  return parts.join("\n");
}

function buildPrompt(text, options) {
  const mode = getActiveMode(text);
  if (!text) return emptyResult();

  const profile = profiles[mode] || profiles.qa;
  const sections = [];
  const sourceLabel = options.toolMode === "rewrite" ? "待改写提示词" : "原始需求";

  if (options.includeRole) {
    sections.push(textSection("角色", profile.role));
  }

  if (options.toolMode === "rewrite") {
    sections.push(textSection("任务", "请把下面这段提示词升级为更精准、上下文更完整、输出标准更明确的版本。不要直接回答原提示词中的任务。"));
  }

  sections.push(textSection(sourceLabel, text));
  sections.push(textSection("目标", options.toolMode === "rewrite" ? "优化提示词本身，让它更适合交给 AI 使用。" : profile.goal));
  sections.push(textSection("适配对象", getTargetInstruction(options.targetAI)));
  sections.push(textSection("语言与语气", `${getLanguageInstruction(options.language)}\n${getToneInstruction(options.tone)}`));

  if (options.includeConstraints) {
    sections.push(textSection("执行要求", buildModeRequirements(mode, options.detail)));
    sections.push(textSection("细节密度", detailInstruction(options.detail)));
  }

  if (options.includeFormat) {
    sections.push(textSection("输出格式", buildOutputFormat(options.format, mode)));
  }

  if (options.includeChecklist) {
    sections.push(textSection("自检清单", `在最终回答前检查：\n${buildChecklist(mode)}`));
  }

  if (options.detail >= 4) {
    sections.push(textSection("信息不足时的处理", "如果缺少关键上下文，请先列出最多 5 个澄清问题；若用户希望你直接继续，请明确写出你的合理假设再执行。"));
  }

  const prompt = sections.join("\n\n");
  const metrics = calculateMetrics(text, options, mode);
  const score = Math.round(Object.values(metrics).reduce((sum, value) => sum + value, 0) / 5);
  return {
    mode,
    prompt,
    blueprint: buildBlueprint(text, mode, options),
    image: buildImagePanel(text, mode, options),
    variants: buildVariants(text, mode, options),
    score,
    metrics
  };
}

function buildBlueprint(text, mode, options) {
  const profile = profiles[mode] || profiles.qa;
  const riskLine = options.detail >= 4
    ? "需要识别缺失信息、边界条件、质量标准和可能误解。"
    : "需要避免偏离原始需求。";

  return [
    `场景：${modeNames[mode] || modeNames.qa}`,
    `核心意图：把“${shorten(text, 76)}”转成更清晰、可执行的 AI 指令。`,
    `推荐角色：${profile.role}`,
    "",
    "关键槽位：",
    textList([
      `任务目标：${profile.goal}`,
      `输出要求：${profile.deliverable}`,
      `目标 AI：${getTargetInstruction(options.targetAI)}`,
      `语气：${getToneInstruction(options.tone)}`,
      `语言：${getLanguageInstruction(options.language)}`,
      `格式：${getFormatInstruction(options.format)}`
    ]),
    "",
    "约束重点：",
    buildModeRequirements(mode, options.detail),
    "",
    "改进建议：",
    textList(buildImprovementTips(text, options, mode)),
    "",
    `风险提醒：${riskLine}`
  ].join("\n");
}

function buildImagePanel(text, mode, options) {
  if (mode !== "image") {
    return [
      "当前场景不是图片生成。",
      "",
      "切换到“图片”场景后，可以补充：主体、场景、风格、构图、镜头、光线、画幅比例。"
    ].join("\n");
  }

  const languageLine = options.language === "en"
    ? "Use English prompt wording."
    : "优先使用中文；如目标图像模型更适合英文，可保留英文关键词。";

  return [
    "正向提示词：",
    `${text}。主体清晰，场景完整，构图有层次，真实材质细节，协调配色，电影级光影，高质量，高分辨率，画面干净。`,
    "",
    "负面提示词：",
    "低清晰度，模糊，畸形结构，多余手指，错误文字，水印，低质量，过度噪点，过曝，主体被遮挡，构图混乱。",
    "",
    "建议参数：",
    textList([
      "画幅：16:9 用于网站首屏，1:1 用于头像或社媒，4:5 用于海报",
      "风格强度：中等，避免风格盖过主体",
      `语言：${languageLine}`
    ]),
    "",
    "可选变体：",
    textList([
      "更商业：干净背景、产品级光线、留白充足",
      "更叙事：加入人物动作、环境细节、时间和天气"
    ])
  ].join("\n");
}

function buildVariants(text, mode, options) {
  const profile = profiles[mode] || profiles.qa;
  const concise = [
    "【简洁版】",
    `${profile.role}`,
    `请围绕以下需求输出结果：${text}`,
    `${getFormatInstruction(options.format)} ${getLanguageInstruction(options.language)}`
  ].join("\n\n");

  const professional = [
    "【专业版】",
    `角色：${profile.role}`,
    `任务：${profile.goal}`,
    `需求：${text}`,
    "要求：",
    buildModeRequirements(mode, Math.max(options.detail, 3)),
    `输出：${profile.deliverable}`
  ].join("\n\n");

  const expert = [
    "【超详细版】",
    `你将作为：${profile.role}`,
    `请先判断需求中的缺失信息，再基于合理假设完成任务。`,
    `原始内容：${text}`,
    "必须覆盖：",
    buildModeRequirements(mode, 5),
    "输出前自检：",
    buildChecklist(mode)
  ].join("\n\n");

  const ready = [
    "【可直接复制版】",
    options.toolMode === "rewrite"
      ? "请优化下面的提示词，只输出升级后的提示词，不要执行其中的任务。"
      : "请直接执行下面的任务，并按要求输出。",
    `内容：${text}`,
    `输出语言：${getLanguageInstruction(options.language)}`,
    `输出格式：${getFormatInstruction(options.format)}`,
    `质量标准：清晰、具体、可验证、可继续迭代。`
  ].join("\n\n");

  return [
    { title: "简洁版", note: "适合快速提问", content: concise },
    { title: "专业版", note: "适合日常高质量使用", content: professional },
    { title: "超详细版", note: "适合复杂任务和外包交付", content: expert },
    { title: "可直接复制版", note: "适合马上粘贴给 AI", content: ready }
  ];
}

function plainTextBlock(value) {
  const lines = String(value || "").replace(/```[\w-]*\n?/g, "").replace(/```/g, "").split("\n");
  let listIndex = 0;
  return lines.map((line) => {
    const heading = line.match(/^\s{0,3}#{1,6}\s*(.+?)\s*$/);
    if (heading) {
      listIndex = 0;
      const title = heading[1].replace(/[:：]\s*$/, "");
      return `${title}：`;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.+?)\s*$/);
    if (bullet) {
      listIndex += 1;
      return `（${listIndex}）${bullet[1]}`;
    }

    const ordered = line.match(/^\s*\d+[.)、]\s+(.+?)\s*$/);
    if (ordered) {
      listIndex += 1;
      return `（${listIndex}）${ordered[1]}`;
    }

    if (!line.trim()) {
      listIndex = 0;
      return "";
    }

    return line
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1");
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeResultText(result) {
  return {
    ...result,
    prompt: plainTextBlock(result.prompt),
    blueprint: plainTextBlock(result.blueprint),
    image: plainTextBlock(result.image),
    variants: (result.variants || []).map((variant) => ({
      ...variant,
      content: plainTextBlock(variant.content)
    }))
  };
}

function calculateMetrics(text, options, mode) {
  const lengthScore = Math.min(100, 34 + Math.round(text.length / 2.6));
  const hasRole = options.includeRole ? 12 : 0;
  const hasConstraints = options.includeConstraints ? 18 : 0;
  const hasFormat = options.includeFormat ? 18 : 0;
  const hasChecklist = options.includeChecklist ? 10 : 0;
  const modeBonus = mode === "code" || mode === "analysis" ? 8 : 5;
  return {
    clarity: clamp(lengthScore + options.detail * 6, 0, 100),
    context: clamp(34 + hasRole + options.detail * 10 + (text.length > 36 ? 16 : 0), 0, 100),
    constraint: clamp(34 + hasConstraints + options.detail * 9 + hasChecklist, 0, 100),
    format: clamp(38 + hasFormat + (options.format !== "plain" ? 18 : 6) + options.detail * 6, 0, 100),
    action: clamp(40 + modeBonus + options.detail * 8 + (text.length > 18 ? 14 : 0), 0, 100)
  };
}

function buildImprovementTips(text, options, mode) {
  const tips = [];
  if (text.length < 28) tips.push("补充目标用户、使用场景和成功标准");
  if (!/[0-9一二三四五六七八九十]/.test(text)) tips.push("加入数量、时间、篇幅、尺寸或验收指标");
  if (mode === "code") tips.push("明确技术栈、页面清单、数据结构和部署方式");
  if (mode === "image") tips.push("明确主体、构图、镜头、光线、材质和画幅");
  if (mode === "analysis") tips.push("明确指标口径、时间范围、数据来源和决策目标");
  if (options.format === "plain") tips.push("复杂任务建议改为结构化或步骤清单");
  return tips.length ? tips : ["当前需求已经具备较好的结构，可以继续增加反例或验收标准"];
}

function generateClarifyingQuestions(text, mode) {
  const base = [
    "这个结果主要给谁使用？",
    "你希望输出最终长什么样？",
    "有没有必须避免的内容或限制？"
  ];
  const byMode = {
    code: ["需要哪些页面或模块？", "有没有指定技术栈或部署平台？"],
    image: ["画面主体是什么？", "希望什么风格、镜头和画幅？"],
    writing: ["目标读者是谁？", "发布渠道和篇幅要求是什么？"],
    analysis: ["要分析的时间范围和核心指标是什么？", "你已有的数据有哪些？"],
    qa: ["你更想要结论、原因还是行动方案？", "需要多深入的解释？"]
  };
  const questions = [...base, ...(byMode[mode] || byMode.qa)];
  return questions.slice(0, text.length < 40 ? 5 : 4);
}

function renderClarifications() {
  const text = normalizeText(elements.userInput.value);
  const mode = getActiveMode(text);
  const questions = generateClarifyingQuestions(text, mode);
  elements.clarificationList.innerHTML = questions.map((question, index) => `
    <div class="clarify-item">
      <label for="clarify-${index}">${escapeHtml(question)}</label>
      <input id="clarify-${index}" type="text" data-question="${escapeHtml(question)}" placeholder="可选填写">
    </div>
  `).join("");
}

function applyClarifications() {
  const answers = $$(".clarify-item input")
    .map((input) => ({ question: input.dataset.question, answer: normalizeText(input.value) }))
    .filter((item) => item.answer);

  if (!answers.length) {
    showToast("先填写至少一条补充信息");
    return;
  }

  const addition = [
    "",
    "补充信息：",
    ...answers.map((item, index) => `（${index + 1}）${item.question} ${item.answer}`)
  ].join("\n");

  elements.userInput.value = `${elements.userInput.value.trim()}${addition}`;
  elements.charCount.textContent = elements.userInput.value.length;
  renderClarifications();
  generate({ count: false });
  showToast("已应用补充信息");
}

function renderAuth() {
  const auth = getAuthState();
  if (auth.user) {
    elements.authName.textContent = auth.user.name || "已登录用户";
    elements.authEmail.textContent = `${auth.user.email} · ${auth.user.plan || "free"}`;
    elements.authFields.classList.add("hidden");
    elements.loginBtn.classList.add("hidden");
    elements.registerBtn.classList.add("hidden");
    elements.logoutBtn.classList.remove("hidden");
  } else {
    elements.authName.textContent = "访客模式";
    elements.authEmail.textContent = "登录后可云端保存历史和收藏";
    elements.authFields.classList.remove("hidden");
    elements.loginBtn.classList.remove("hidden");
    elements.registerBtn.classList.remove("hidden");
    elements.logoutBtn.classList.add("hidden");
  }
}

async function registerAccount() {
  try {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: elements.authNameInput.value.trim(),
        email: elements.authEmailInput.value.trim(),
        password: elements.authPasswordInput.value
      })
    });
    setAuthState({ token: data.token, user: data.user });
    await loadCloudData();
    showToast("注册并登录成功");
  } catch (error) {
    showToast(error.message || "注册失败");
  }
}

async function loginAccount() {
  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: elements.authEmailInput.value.trim(),
        password: elements.authPasswordInput.value
      })
    });
    setAuthState({ token: data.token, user: data.user });
    await loadCloudData();
    showToast("登录成功");
  } catch (error) {
    showToast(error.message || "登录失败");
  }
}

async function logoutAccount() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
  } catch (error) {
    // Local logout still matters if the session is already expired.
  }
  setAuthState({ token: "", user: null });
  showToast("已退出登录");
}

async function restoreSession() {
  const auth = getAuthState();
  renderAuth();
  if (!auth.token) return;
  try {
    const data = await apiRequest("/api/me");
    setAuthState({ token: auth.token, user: data.user });
    await loadCloudData();
  } catch (error) {
    setAuthState({ token: "", user: null });
  }
}

async function loadCloudData() {
  const auth = getAuthState();
  if (!auth.token) return;
  try {
    const [prompts, favorites] = await Promise.all([
      apiRequest("/api/prompts"),
      apiRequest("/api/favorites")
    ]);
    setHistory((prompts.prompts || []).map(normalizeServerItem));
    setFavorites((favorites.favorites || []).map(normalizeServerItem));
  } catch (error) {
    showToast("云端数据加载失败");
  }
}

function renderResult(result) {
  const normalized = normalizeResultText(result);
  state.currentResult = normalized;
  elements.resultPrompt.textContent = normalized.prompt;
  elements.resultBlueprint.textContent = normalized.blueprint;
  elements.resultImage.textContent = normalized.image;
  elements.scoreValue.textContent = normalized.score;
  elements.barClarity.style.width = `${normalized.metrics.clarity || 0}%`;
  elements.barContext.style.width = `${normalized.metrics.context || 0}%`;
  elements.barConstraint.style.width = `${normalized.metrics.constraint || 0}%`;
  elements.barFormat.style.width = `${normalized.metrics.format || 0}%`;
  elements.barAction.style.width = `${normalized.metrics.action || 0}%`;
  elements.modeStatus.textContent = modeNames[normalized.mode] || modeNames.auto;
  renderVariants(normalized.variants);
}

function renderVariants(variants) {
  if (!variants.length) {
    elements.variantList.innerHTML = `<div class="variant-card"><strong>等待输入</strong><span>生成后显示多个版本。</span></div>`;
    return;
  }

  elements.variantList.innerHTML = variants.map((variant, index) => `
    <button class="variant-card" type="button" data-variant-index="${index}">
      <strong>${escapeHtml(variant.title)}</strong>
      <span>${escapeHtml(variant.note)}</span>
      <pre>${escapeHtml(variant.content)}</pre>
    </button>
  `).join("");
}

function generate(options = {}) {
  const text = normalizeText(elements.userInput.value);
  elements.charCount.textContent = elements.userInput.value.length;
  const result = buildPrompt(text, collectOptions());
  renderResult(result);
  renderClarifications();
  if (options.count && result.prompt) incrementGenerated();
  return result;
}

async function runAIEnhance() {
  const text = normalizeText(elements.userInput.value);
  const settings = getSettings();
  if (!text) {
    showToast("请输入需求");
    return;
  }
  const endpoint = settings.aiEndpoint || "/api/optimize";

  elements.aiStatus.textContent = "AI 增强中";
  elements.aiEnhanceBtn.disabled = true;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: text,
        options: collectOptions(),
        mode: getActiveMode(text),
        model: settings.aiModel,
        workspace: settings.workspaceName || ""
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const fallback = buildPrompt(text, collectOptions());
    const result = {
      ...fallback,
      prompt: data.prompt || data.result || fallback.prompt,
      blueprint: data.blueprint || fallback.blueprint,
      image: data.image || fallback.image,
      variants: Array.isArray(data.variants) ? data.variants : fallback.variants,
      score: data.score || fallback.score
    };
    renderResult(result);
    incrementGenerated();
    elements.aiStatus.textContent = "AI 已增强";
    showToast("AI 增强完成");
  } catch (error) {
    elements.aiStatus.textContent = "连接失败，已保留本地结果";
    showToast("AI 后端暂不可用");
  } finally {
    elements.aiEnhanceBtn.disabled = false;
  }
}

function setMode(mode) {
  state.selectedMode = mode;
  $$(".seg-button[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  generate({ count: false });
}

function setToolMode(mode) {
  state.toolMode = mode;
  $$(".seg-button[data-tool-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.toolMode === mode);
  });
  elements.inputTitle.textContent = mode === "rewrite" ? "提示词改写器" : "需求工作台";
  generate({ count: false });
}

function getSettings() {
  return readJSON(store.settings, {
    workspaceName: "",
    syncEndpoint: "",
    enableAI: false,
    aiEndpoint: "",
    aiModel: "auto"
  });
}

function saveSettings(partial = {}) {
  const next = {
    ...getSettings(),
    workspaceName: elements.workspaceName.value.trim(),
    syncEndpoint: elements.syncEndpoint.value.trim(),
    enableAI: elements.enableAI.checked,
    aiEndpoint: elements.aiEndpoint.value.trim(),
    aiModel: elements.aiModel.value,
    ...partial
  };
  writeJSON(store.settings, next);
  renderSettings();
  return next;
}

function renderSettings() {
  const settings = getSettings();
  elements.workspaceName.value = settings.workspaceName || "";
  elements.syncEndpoint.value = settings.syncEndpoint || "";
  elements.enableAI.checked = Boolean(settings.enableAI);
  elements.aiEndpoint.value = settings.aiEndpoint || "";
  elements.aiModel.value = settings.aiModel || "auto";
  elements.syncStatus.textContent = settings.syncEndpoint ? "云端同步已配置" : "本地历史已启用";
  elements.aiStatus.textContent = settings.aiEndpoint ? "自定义 AI 后端已配置" : "动态后端 /api/optimize";
}

async function testAIConnection() {
  const settings = saveSettings();
  const endpoint = settings.aiEndpoint || "/api/health";
  elements.aiStatus.textContent = "测试连接中";
  try {
    const response = await fetch(endpoint, {
      method: endpoint === "/api/health" ? "GET" : "POST",
      headers: { "Content-Type": "application/json" },
      body: endpoint === "/api/health" ? undefined : JSON.stringify({ ping: true, model: settings.aiModel })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    elements.aiStatus.textContent = "AI 后端可用";
    showToast("连接成功");
  } catch (error) {
    elements.aiStatus.textContent = "AI 后端不可用";
    showToast("连接失败");
  }
}

async function syncHistory() {
  const settings = saveSettings();
  const auth = getAuthState();
  if (!settings.syncEndpoint && auth.token) {
    elements.syncStatus.textContent = "同步到内置后端";
    try {
      for (const item of getHistory().slice(0, 12)) {
        await apiRequest("/api/prompts", { method: "POST", body: JSON.stringify(item) });
      }
      for (const item of getFavorites().slice(0, 12)) {
        await apiRequest("/api/favorites", { method: "POST", body: JSON.stringify(item) });
      }
      await loadCloudData();
      await refreshServerStats();
      elements.syncStatus.textContent = "内置后端同步完成";
      showToast("已同步到商用后端");
    } catch (error) {
      elements.syncStatus.textContent = "内置后端同步失败";
      showToast("同步失败");
    }
    return;
  }
  if (!settings.syncEndpoint) {
    showToast("请先登录，或填写云端同步端点");
    return;
  }
  elements.syncStatus.textContent = "同步中";
  try {
    const response = await fetch(settings.syncEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace: settings.workspaceName || "PromptLens",
        history: getHistory(),
        favorites: getFavorites()
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    elements.syncStatus.textContent = "同步完成";
    showToast("历史已同步");
  } catch (error) {
    elements.syncStatus.textContent = "同步失败，已保留本地数据";
    showToast("同步失败");
  }
}

function renderTemplates() {
  const query = normalizeText(elements.templateSearch.value).toLowerCase();
  const categories = ["全部", ...new Set(templates.map((item) => item.category))];
  elements.categoryFilters.innerHTML = categories.map((category) => `
    <button class="chip ${category === state.selectedCategory ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");

  const filtered = templates.filter((item) => {
    const inCategory = state.selectedCategory === "全部" || item.category === state.selectedCategory;
    const inQuery = !query || `${item.title} ${item.category} ${item.prompt}`.toLowerCase().includes(query);
    return inCategory && inQuery;
  });

  elements.templateList.innerHTML = filtered.map((item) => `
    <button class="template-card" type="button" data-template-id="${item.id}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.category)} · ${modeNames[item.mode]}</span>
      <p>${escapeHtml(shorten(item.prompt, 88))}</p>
    </button>
  `).join("") || `<div class="template-card"><strong>没有匹配模板</strong><p>换个关键词试试。</p></div>`;

  elements.statTemplates.textContent = String(templates.length);
}

async function loadServerTemplates() {
  try {
    const data = await apiRequest("/api/templates");
    if (Array.isArray(data.templates) && data.templates.length) {
      const localIds = new Set(templates.map((item) => item.id));
      const remoteOnly = data.templates.filter((item) => !localIds.has(item.id));
      templates = [...templates, ...remoteOnly];
      renderTemplates();
    }
  } catch (error) {
    // GitHub Pages or offline mode keeps using bundled templates.
  }
}

function applyTemplate(id) {
  const template = templates.find((item) => item.id === id);
  if (!template) return;
  elements.userInput.value = template.prompt;
  elements.targetAI.value = template.targetAI || "general";
  elements.tone.value = template.tone || "professional";
  elements.format.value = template.format || "structured";
  if (template.toolMode) setToolMode(template.toolMode);
  setMode(template.mode || "auto");
  elements.charCount.textContent = elements.userInput.value.length;
  generate({ count: true });
  showToast("模板已应用");
}

function getHistory() {
  return readJSON(store.history, []);
}

function setHistory(items) {
  writeJSON(store.history, items.slice(0, 24));
  renderHistory();
}

async function saveCurrentHistory() {
  const source = normalizeText(elements.userInput.value);
  if (!source || !state.currentResult.prompt) {
    showToast("先生成一条提示词");
    return;
  }
  const item = buildSavedItem(source);
  const next = [item, ...getHistory().filter((old) => old.source !== source)];
  setHistory(next);
  const auth = getAuthState();
  if (auth.token) {
    try {
      await apiRequest("/api/prompts", {
        method: "POST",
        body: JSON.stringify(item)
      });
      await refreshServerStats();
      showToast("已保存到云端历史");
      return;
    } catch (error) {
      showToast("本地已保存，云端保存失败");
      return;
    }
  }
  showToast("已保存本地历史");
}

function buildSavedItem(source) {
  return {
    id: Date.now(),
    mode: state.currentResult.mode,
    source,
    prompt: state.currentResult.prompt,
    blueprint: state.currentResult.blueprint,
    image: state.currentResult.image,
    variants: state.currentResult.variants,
    score: state.currentResult.score,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
  };
}

function renderHistory() {
  renderSavedList(elements.historyList, getHistory(), "暂无历史", "生成并保存后会显示在这里。");
}

function getFavorites() {
  return readJSON(store.favorites, []);
}

function setFavorites(items) {
  writeJSON(store.favorites, items.slice(0, 24));
  renderFavorites();
  renderStats();
}

async function favoriteCurrentPrompt() {
  const source = normalizeText(elements.userInput.value);
  if (!source || !state.currentResult.prompt) {
    showToast("先生成一条提示词");
    return;
  }
  const item = buildSavedItem(source);
  const next = [item, ...getFavorites().filter((old) => old.prompt !== item.prompt)];
  setFavorites(next);
  const auth = getAuthState();
  if (auth.token) {
    try {
      await apiRequest("/api/favorites", {
        method: "POST",
        body: JSON.stringify(item)
      });
      await refreshServerStats();
      showToast("已收藏到云端");
      return;
    } catch (error) {
      showToast("本地已收藏，云端收藏失败");
      return;
    }
  }
  showToast("已收藏到本地");
}

function renderFavorites() {
  renderSavedList(elements.favoriteList, getFavorites(), "暂无收藏", "收藏后的提示词会显示在这里。");
}

function renderSavedList(container, items, emptyTitle, emptyText) {
  if (!items.length) {
    container.innerHTML = `<div class="history-card"><strong>${emptyTitle}</strong><p>${emptyText}</p></div>`;
    return;
  }
  container.innerHTML = items.map((item) => `
    <button class="history-card" type="button" data-saved-id="${item.id}">
      <strong>${modeNames[item.mode] || "提示词"} · ${item.score} 分</strong>
      <span>${item.createdAt}</span>
      <p>${escapeHtml(shorten(item.source, 104))}</p>
    </button>
  `).join("");
}

function restoreSaved(id) {
  const item = [...getHistory(), ...getFavorites()].find((entry) => String(entry.id) === String(id));
  if (!item) return;
  elements.userInput.value = item.source;
  elements.charCount.textContent = item.source.length;
  renderResult({
    prompt: item.prompt,
    blueprint: item.blueprint,
    image: item.image,
    variants: item.variants || [],
    mode: item.mode,
    score: item.score,
    metrics: calculateMetrics(item.source, collectOptions(), item.mode)
  });
  activateTab("prompt");
  showToast("已载入");
}

function getStats() {
  return readJSON(store.stats, { generated: 0 });
}

function incrementGenerated() {
  const stats = getStats();
  stats.generated += 1;
  writeJSON(store.stats, stats);
  renderStats();
}

function renderStats() {
  elements.statGenerated.textContent = String(getStats().generated || 0);
  elements.statFavorites.textContent = String(getFavorites().length);
  elements.statTemplates.textContent = String(templates.length);
}

async function refreshServerStats() {
  try {
    const stats = await apiRequest("/api/stats");
    elements.statGenerated.textContent = String(stats.generated || stats.prompts || getStats().generated || 0);
    elements.statFavorites.textContent = String(stats.favorites || getFavorites().length);
    elements.statTemplates.textContent = String(stats.templates || templates.length);
  } catch (error) {
    renderStats();
  }
}

async function copyText(text, label = "已复制") {
  if (!text) {
    showToast("没有可复制的内容");
    return;
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    showToast(label);
  } catch (error) {
    showToast("复制失败，请手动选择文本");
  }
}

function exportFile(extension) {
  const text = state.currentResult.prompt;
  if (!text) {
    showToast("没有可导出的内容");
    return;
  }
  const isMarkdown = extension === "md";
  const body = isMarkdown
    ? `# PromptLens 提示词\n\n${text}\n\n## 结构拆解\n\n${state.currentResult.blueprint}`
    : `${text}\n\n--- 结构拆解 ---\n\n${state.currentResult.blueprint}`;
  const blob = new Blob([body], { type: isMarkdown ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `promptlens-${Date.now()}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`已导出 ${extension.toUpperCase()}`);
}

function shareCurrentPrompt() {
  const source = normalizeText(elements.userInput.value);
  if (!source) {
    showToast("请输入需求");
    return;
  }
  const payload = {
    input: source,
    mode: state.selectedMode,
    toolMode: state.toolMode,
    options: collectOptions()
  };
  const encoded = encodeState(payload);
  const url = `${location.origin}${location.pathname}#share=${encoded}`;
  copyText(url, "分享链接已复制");
}

function restoreFromShare() {
  if (!location.hash.startsWith("#share=")) return;
  try {
    const payload = decodeState(location.hash.replace("#share=", ""));
    elements.userInput.value = payload.input || "";
    elements.targetAI.value = payload.options?.targetAI || "general";
    elements.language.value = payload.options?.language || "zh";
    elements.tone.value = payload.options?.tone || "professional";
    elements.format.value = payload.options?.format || "structured";
    elements.detailRange.value = payload.options?.detail || 4;
    elements.includeRole.checked = payload.options?.includeRole !== false;
    elements.includeConstraints.checked = payload.options?.includeConstraints !== false;
    elements.includeFormat.checked = payload.options?.includeFormat !== false;
    elements.includeChecklist.checked = payload.options?.includeChecklist !== false;
    setToolMode(payload.toolMode || "create");
    setMode(payload.mode || "auto");
    generate({ count: false });
  } catch (error) {
    showToast("分享链接无法解析");
  }
}

function encodeState(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

function decodeState(value) {
  return JSON.parse(decodeURIComponent(escape(atob(value))));
}

function activateTab(tabName) {
  state.activeTab = tabName;
  $$(".tab").forEach((tab) => {
    const active = tab.dataset.tab === tabName;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  $$(".result-view").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
}

function updateDetailLabel() {
  elements.detailLabel.textContent = detailLabels[Number(elements.detailRange.value) - 1];
}

function initTheme() {
  const stored = localStorage.getItem(store.theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = stored || (prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(store.theme, next);
}

function openHelp() {
  if (typeof elements.helpDialog.showModal === "function") {
    elements.helpDialog.showModal();
  } else {
    elements.helpDialog.setAttribute("open", "");
  }
}

function closeHelp() {
  if (typeof elements.helpDialog.close === "function") {
    elements.helpDialog.close();
  } else {
    elements.helpDialog.removeAttribute("open");
  }
}

function bindEvents() {
  elements.userInput.addEventListener("input", () => {
    elements.charCount.textContent = elements.userInput.value.length;
    window.clearTimeout(elements.userInput.generateTimer);
    elements.userInput.generateTimer = window.setTimeout(() => generate({ count: false }), 180);
  });

  elements.templateSearch.addEventListener("input", renderTemplates);
  elements.categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.selectedCategory = button.dataset.category;
    renderTemplates();
  });
  elements.templateList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-template-id]");
    if (card) applyTemplate(card.dataset.templateId);
  });

  elements.saveWorkspace.addEventListener("click", () => {
    saveSettings();
    showToast("账户已保存");
  });
  elements.loginBtn.addEventListener("click", loginAccount);
  elements.registerBtn.addEventListener("click", registerAccount);
  elements.logoutBtn.addEventListener("click", logoutAccount);
  elements.authPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loginAccount();
  });
  elements.syncHistory.addEventListener("click", syncHistory);
  elements.saveAIConfig.addEventListener("click", () => {
    saveSettings();
    showToast("AI 配置已保存");
  });
  elements.testAI.addEventListener("click", testAIConnection);
  elements.enableAI.addEventListener("change", () => saveSettings());
  elements.aiModel.addEventListener("change", () => saveSettings());

  elements.toolModeButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool-mode]");
    if (button) setToolMode(button.dataset.toolMode);
  });

  elements.modeButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (button) setMode(button.dataset.mode);
  });

  $$(".examples button").forEach((button) => {
    button.addEventListener("click", () => {
      elements.userInput.value = button.dataset.example;
      elements.charCount.textContent = elements.userInput.value.length;
      generate({ count: true });
    });
  });

  [
    elements.targetAI,
    elements.language,
    elements.tone,
    elements.format,
    elements.detailRange,
    elements.includeRole,
    elements.includeConstraints,
    elements.includeFormat,
    elements.includeChecklist
  ].forEach((control) => {
    control.addEventListener("input", () => {
      updateDetailLabel();
      generate({ count: false });
    });
    control.addEventListener("change", () => {
      updateDetailLabel();
      generate({ count: false });
    });
  });

  elements.refreshQuestions.addEventListener("click", () => {
    renderClarifications();
    showToast("追问已刷新");
  });
  elements.applyClarifications.addEventListener("click", applyClarifications);
  elements.generateBtn.addEventListener("click", () => {
    const result = generate({ count: true });
    showToast(result.prompt ? "已生成" : "请输入需求");
  });
  elements.aiEnhanceBtn.addEventListener("click", runAIEnhance);
  elements.clearInput.addEventListener("click", () => {
    elements.userInput.value = "";
    generate({ count: false });
    elements.userInput.focus();
  });

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab));
  });

  elements.variantList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-variant-index]");
    if (!card) return;
    const variant = state.currentResult.variants[Number(card.dataset.variantIndex)];
    if (!variant) return;
    const content = plainTextBlock(variant.content);
    elements.resultPrompt.textContent = content;
    state.currentResult.prompt = content;
    activateTab("prompt");
    showToast("已切换版本");
  });

  elements.historyList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-saved-id]");
    if (card) restoreSaved(card.dataset.savedId);
  });
  elements.favoriteList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-saved-id]");
    if (card) restoreSaved(card.dataset.savedId);
  });

  elements.favoritePrompt.addEventListener("click", favoriteCurrentPrompt);
  elements.saveHistory.addEventListener("click", saveCurrentHistory);
  elements.sharePrompt.addEventListener("click", shareCurrentPrompt);
  elements.exportTxt.addEventListener("click", () => exportFile("txt"));
  elements.exportMd.addEventListener("click", () => exportFile("md"));
  elements.copyPrompt.addEventListener("click", () => copyText(state.currentResult.prompt, "结果已复制"));
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.openHelpTop.addEventListener("click", openHelp);
  elements.openHelpGuide.addEventListener("click", openHelp);
  elements.closeHelp.addEventListener("click", closeHelp);
  elements.closeHelpFooter.addEventListener("click", closeHelp);
  elements.helpDialog.addEventListener("click", (event) => {
    if (event.target === elements.helpDialog) closeHelp();
  });
}

function initAmbientCanvas() {
  const canvas = elements.canvas;
  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = Array.from({ length: 52 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00018,
    vy: (Math.random() - 0.5) * 0.00016,
    size: index % 3 === 0 ? 2.2 : 1.35
  }));

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dark = document.documentElement.dataset.theme === "dark";
    context.clearRect(0, 0, width, height);
    context.strokeStyle = dark ? "rgba(120, 215, 206, 0.13)" : "rgba(8, 117, 111, 0.12)";
    context.lineWidth = 1;

    for (let x = 0; x < width; x += 64) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + height * 0.16, height);
      context.stroke();
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (!reduceMotion) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -0.02 || node.x > 1.02) node.vx *= -1;
        if (node.y < -0.02 || node.y > 1.02) node.vy *= -1;
      }
      const px = node.x * width;
      const py = node.y * height;
      context.fillStyle = i % 4 === 0
        ? (dark ? "rgba(240, 120, 109, 0.34)" : "rgba(200, 75, 68, 0.26)")
        : (dark ? "rgba(64, 185, 173, 0.32)" : "rgba(8, 117, 111, 0.22)");
      context.fillRect(px, py, node.size, node.size);

      for (let j = i + 1; j < nodes.length; j += 1) {
        const other = nodes[j];
        const ox = other.x * width;
        const oy = other.y * height;
        const distance = Math.hypot(px - ox, py - oy);
        if (distance < 132) {
          context.globalAlpha = (132 - distance) / 132 * 0.42;
          context.beginPath();
          context.moveTo(px, py);
          context.lineTo(ox, oy);
          context.stroke();
          context.globalAlpha = 1;
        }
      }
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw();
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shorten(text, max) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

let toastTimer = null;
function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function init() {
  initTheme();
  bindEvents();
  renderSettings();
  renderAuth();
  renderTemplates();
  renderHistory();
  renderFavorites();
  renderStats();
  updateDetailLabel();
  renderClarifications();
  restoreFromShare();
  if (!elements.userInput.value) generate({ count: false });
  initAmbientCanvas();
  loadServerTemplates();
  refreshServerStats();
  restoreSession();
}

init();
