const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
  userInput: $("#userInput"),
  charCount: $("#charCount"),
  modeStatus: $("#modeStatus"),
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
  clearInput: $("#clearInput"),
  copyPrompt: $("#copyPrompt"),
  copyBlueprint: $("#copyBlueprint"),
  saveHistory: $("#saveHistory"),
  resultPrompt: $("#resultPrompt"),
  resultBlueprint: $("#resultBlueprint"),
  resultImage: $("#resultImage"),
  historyList: $("#historyList"),
  scoreValue: $("#scoreValue"),
  barClarity: $("#barClarity"),
  barConstraint: $("#barConstraint"),
  barAction: $("#barAction"),
  themeToggle: $("#themeToggle"),
  toast: $("#toast"),
  canvas: $("#ambientCanvas")
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

let selectedMode = "auto";
let currentResult = {
  prompt: "",
  blueprint: "",
  image: "",
  mode: "auto",
  score: 0
};

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function detectMode(text) {
  const value = text.toLowerCase();
  const checks = [
    { mode: "image", score: /(生成图片|画一张|画一个|插画|海报|头像|logo|视觉|封面|摄影|镜头|光线|图片|midjourney|stable diffusion|image|photo|poster)/i.test(value) },
    { mode: "code", score: /(创建|开发|搭建|实现|写一个|做一个|网站|系统|程序|应用|小程序|app|页面|组件|前端|后端|接口|数据库|代码|bug|修复|部署|测试)/i.test(value) },
    { mode: "analysis", score: /(分析|诊断|原因|指标|数据|增长|转化率|留存|收入|成本|复盘|策略|决策|竞品|市场|归因)/i.test(value) },
    { mode: "writing", score: /(写|改写|润色|文案|标题|脚本|邮件|简历|总结|报告|公众号|小红书|演讲稿|文章|故事)/i.test(value) },
    { mode: "qa", score: /(为什么|如何|怎么|是否|什么是|请问|解释|区别|原理|\?|\？)/i.test(value) }
  ];
  const found = checks.find((item) => item.score);
  return found ? found.mode : "qa";
}

function getActiveMode(text) {
  if (selectedMode !== "auto") return selectedMode;
  return text ? detectMode(text) : "auto";
}

function getLanguageInstruction(language) {
  if (language === "en") return "Please answer in English. Keep proper nouns and technical terms precise.";
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

function buildModeRequirements(mode, detail) {
  const base = profiles[mode] || profiles.qa;
  const lines = base.focus.map((item) => `- ${item}`);
  if (mode === "code") {
    lines.push("- 如果需要创建界面，请直接给出可运行的页面、组件、样式和交互逻辑");
    lines.push("- 如果存在现有代码库，请先阅读项目结构并遵循已有技术栈、命名和样式约定");
    if (detail >= 4) lines.push("- 明确说明如何运行、如何验证、有哪些边界情况尚未覆盖");
  }
  if (mode === "image") {
    lines.push("- 正向提示词需要包含主体、环境、构图、镜头、光线、材质、色彩、风格、质量词");
    lines.push("- 负面提示词需要覆盖畸形、低清晰度、错误文字、过度噪点和不自然结构");
    if (detail >= 4) lines.push("- 给出 2 个风格变体，方便继续迭代");
  }
  if (mode === "analysis" && detail >= 4) {
    lines.push("- 把结论分为高可信、中可信、待验证三类");
  }
  if (mode === "qa" && detail >= 4) {
    lines.push("- 对不确定内容标注“推断”，不要把假设写成事实");
  }
  return lines.join("\n");
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
  return [...common, ...(extra[mode] || extra.qa)].map((item) => `- ${item}`).join("\n");
}

function buildOutputFormat(format, mode) {
  const profile = profiles[mode] || profiles.qa;
  const parts = [
    getFormatInstruction(format),
    `必须包含：${profile.deliverable}。`
  ];
  if (format === "table") {
    parts.push("表格字段需要有明确列名，避免只给泛泛描述。");
  }
  if (format === "steps") {
    parts.push("每个步骤都要写清楚输入、动作和预期输出。");
  }
  return parts.join("\n");
}

function buildPrompt(text, options) {
  const mode = getActiveMode(text);
  if (!text) {
    return {
      mode,
      prompt: "",
      blueprint: "",
      image: "",
      score: 0,
      metrics: { clarity: 0, constraint: 0, action: 0 }
    };
  }

  const profile = profiles[mode] || profiles.qa;
  const detail = Number(options.detail);
  const sections = [];

  if (options.includeRole) {
    sections.push(`## 角色\n${profile.role}`);
  }

  sections.push(`## 原始需求\n${text}`);
  sections.push(`## 目标\n${profile.goal}`);
  sections.push(`## 适配对象\n${getTargetInstruction(options.targetAI)}`);
  sections.push(`## 语言与语气\n${getLanguageInstruction(options.language)}\n${getToneInstruction(options.tone)}`);

  if (options.includeConstraints) {
    sections.push(`## 执行要求\n${buildModeRequirements(mode, detail)}`);
    sections.push(`## 细节密度\n${detailInstruction(detail)}`);
  }

  if (options.includeFormat) {
    sections.push(`## 输出格式\n${buildOutputFormat(options.format, mode)}`);
  }

  if (options.includeChecklist) {
    sections.push(`## 自检清单\n在最终回答前检查：\n${buildChecklist(mode)}`);
  }

  if (detail >= 4) {
    sections.push("## 信息不足时的处理\n如果缺少关键上下文，请先列出最多 5 个澄清问题；若用户希望你直接继续，请明确写出你的合理假设再执行。");
  }

  const prompt = sections.join("\n\n");
  const blueprint = buildBlueprint(text, mode, options);
  const image = buildImagePanel(text, mode, options);
  const metrics = calculateMetrics(text, options, mode);
  const score = Math.round((metrics.clarity + metrics.constraint + metrics.action) / 3);

  return { mode, prompt, blueprint, image, score, metrics };
}

function buildBlueprint(text, mode, options) {
  const profile = profiles[mode] || profiles.qa;
  const detail = Number(options.detail);
  const riskLine = detail >= 4
    ? "需要识别缺失信息、边界条件、质量标准和可能误解。"
    : "需要避免偏离原始需求。";

  return [
    `场景：${modeNames[mode] || modeNames.qa}`,
    `核心意图：把“${shorten(text, 68)}”转成更清晰、可执行的 AI 指令。`,
    `推荐角色：${profile.role}`,
    "",
    "关键槽位：",
    `- 任务目标：${profile.goal}`,
    `- 输出要求：${profile.deliverable}`,
    `- 语气：${getToneInstruction(options.tone)}`,
    `- 语言：${getLanguageInstruction(options.language)}`,
    `- 格式：${getFormatInstruction(options.format)}`,
    "",
    "约束重点：",
    buildModeRequirements(mode, detail),
    "",
    `风险提醒：${riskLine}`
  ].join("\n");
}

function buildImagePanel(text, mode, options) {
  if (mode !== "image") {
    return [
      "当前场景不是图片生成。",
      "",
      "如果要把这条需求改造成图片提示词，可以切换到“图片”场景，再补充：主体、场景、风格、构图、镜头、光线、画幅比例。"
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
    "- 画幅：16:9 用于网站首屏，1:1 用于头像或社媒，4:5 用于海报",
    "- 风格强度：中等，避免风格盖过主体",
    `- 语言：${languageLine}`,
    "",
    "可选变体：",
    "- 更商业：干净背景、产品级光线、留白充足",
    "- 更叙事：加入人物动作、环境细节、时间和天气"
  ].join("\n");
}

function calculateMetrics(text, options, mode) {
  const lengthScore = Math.min(100, 38 + Math.round(text.length / 2.8));
  const toggleScore = [
    options.includeRole,
    options.includeConstraints,
    options.includeFormat,
    options.includeChecklist
  ].filter(Boolean).length * 11;
  const detail = Number(options.detail);
  const clarity = clamp(lengthScore + detail * 7, 0, 100);
  const constraint = clamp(34 + toggleScore + detail * 8 + (options.format !== "plain" ? 8 : 0), 0, 100);
  const action = clamp(42 + detail * 8 + (mode === "code" || mode === "analysis" ? 10 : 4) + (text.length > 18 ? 12 : 0), 0, 100);
  return { clarity, constraint, action };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shorten(text, max) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function collectOptions() {
  return {
    targetAI: elements.targetAI.value,
    language: elements.language.value,
    tone: elements.tone.value,
    format: elements.format.value,
    detail: elements.detailRange.value,
    includeRole: elements.includeRole.checked,
    includeConstraints: elements.includeConstraints.checked,
    includeFormat: elements.includeFormat.checked,
    includeChecklist: elements.includeChecklist.checked
  };
}

function renderResult(result) {
  currentResult = result;
  elements.resultPrompt.textContent = result.prompt;
  elements.resultBlueprint.textContent = result.blueprint;
  elements.resultImage.textContent = result.image;
  elements.scoreValue.textContent = result.score;
  elements.barClarity.style.width = `${result.metrics.clarity || 0}%`;
  elements.barConstraint.style.width = `${result.metrics.constraint || 0}%`;
  elements.barAction.style.width = `${result.metrics.action || 0}%`;
  elements.modeStatus.textContent = modeNames[result.mode] || modeNames.auto;
}

function generate() {
  const text = normalizeText(elements.userInput.value);
  elements.charCount.textContent = elements.userInput.value.length;
  const result = buildPrompt(text, collectOptions());
  renderResult(result);
  return result;
}

function setMode(mode) {
  selectedMode = mode;
  $$(".seg-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  generate();
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

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("promptLensHistory") || "[]");
  } catch (error) {
    return [];
  }
}

function setHistory(items) {
  localStorage.setItem("promptLensHistory", JSON.stringify(items.slice(0, 12)));
  renderHistory();
}

function saveCurrentHistory() {
  const source = normalizeText(elements.userInput.value);
  if (!source || !currentResult.prompt) {
    showToast("先生成一条提示词");
    return;
  }
  const item = {
    id: Date.now(),
    mode: currentResult.mode,
    source,
    prompt: currentResult.prompt,
    blueprint: currentResult.blueprint,
    image: currentResult.image,
    score: currentResult.score,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
  };
  const next = [item, ...getHistory().filter((old) => old.source !== source)];
  setHistory(next);
  showToast("已保存历史");
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    elements.historyList.innerHTML = `<div class="history-card"><strong>暂无历史</strong><p>生成并保存后会显示在这里。</p></div>`;
    return;
  }

  elements.historyList.innerHTML = history.map((item) => `
    <button class="history-card" type="button" data-id="${item.id}">
      <strong>${modeNames[item.mode] || "提示词"} · ${item.score} 分</strong>
      <span>${item.createdAt}</span>
      <p>${escapeHtml(shorten(item.source, 96))}</p>
    </button>
  `).join("");
}

function restoreHistory(id) {
  const item = getHistory().find((entry) => String(entry.id) === String(id));
  if (!item) return;
  elements.userInput.value = item.source;
  elements.charCount.textContent = item.source.length;
  currentResult = {
    prompt: item.prompt,
    blueprint: item.blueprint,
    image: item.image,
    mode: item.mode,
    score: item.score,
    metrics: calculateMetrics(item.source, collectOptions(), item.mode)
  };
  renderResult(currentResult);
  activateTab("prompt");
  showToast("已载入历史");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let toastTimer = null;
function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function activateTab(tabName) {
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
  const stored = localStorage.getItem("promptLensTheme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = stored || (prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("promptLensTheme", next);
}

function bindEvents() {
  elements.userInput.addEventListener("input", () => {
    elements.charCount.textContent = elements.userInput.value.length;
    window.clearTimeout(elements.userInput.generateTimer);
    elements.userInput.generateTimer = window.setTimeout(generate, 180);
  });

  elements.modeButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (button) setMode(button.dataset.mode);
  });

  $$(".examples button").forEach((button) => {
    button.addEventListener("click", () => {
      elements.userInput.value = button.dataset.example;
      elements.charCount.textContent = elements.userInput.value.length;
      generate();
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
      generate();
    });
    control.addEventListener("change", () => {
      updateDetailLabel();
      generate();
    });
  });

  elements.generateBtn.addEventListener("click", () => {
    const result = generate();
    showToast(result.prompt ? "已生成" : "请输入需求");
  });

  elements.clearInput.addEventListener("click", () => {
    elements.userInput.value = "";
    generate();
    elements.userInput.focus();
  });

  elements.copyPrompt.addEventListener("click", () => copyText(currentResult.prompt, "提示词已复制"));
  elements.copyBlueprint.addEventListener("click", () => copyText(currentResult.blueprint, "结构已复制"));
  elements.saveHistory.addEventListener("click", saveCurrentHistory);
  elements.themeToggle.addEventListener("click", toggleTheme);

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab));
  });

  elements.historyList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (card) restoreHistory(card.dataset.id);
  });
}

function initAmbientCanvas() {
  const canvas = elements.canvas;
  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = Array.from({ length: 48 }, (_, index) => ({
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

function init() {
  initTheme();
  bindEvents();
  updateDetailLabel();
  renderHistory();
  generate();
  initAmbientCanvas();
}

init();
