/**
 * Lightweight i18n for StegoBox demo — Chinese / English.
 * Static nodes use data-i18n / data-i18n-placeholder; dynamic strings call t().
 */
const dict = {
  zh: {
    'brand.name': '隐匣 StegoBox',
    'brand.mark': '隐',
    'nav.github': 'GitHub',
    'nav.algorithm': '算法',
    'nav.lang': 'EN',
    'hero.eyebrow': '鲁棒 DCT 图像隐写',
    'hero.title': '把秘密藏进另一张图里。',
    'hero.lead':
      '把秘密图片、任意文件或文本嵌入载体图的 DCT 系数，抵抗 JPEG/WebP 重压缩与等比缩放。全部在浏览器本地运行——不上传、不经过服务器。',
    'badge.zero': '零依赖',
    'badge.blind': '盲提取',
    'badge.rescale': '抗缩放',
    'badge.gpl': 'GPL-3.0',
    'tab.embed': '嵌入',
    'tab.extract': '提取',
    'tab.batchEmbed': '批量嵌入',
    'tab.batchExtract': '批量提取',
    'mode.single': '单张',
    'mode.batch': '批量',
    'cover.title': '载体图',
    'cover.hint': '点击选择或拖入文件。建议 ≥ 512×512。',
    'secret.type': '秘密类型',
    'secret.image': '图片',
    'secret.file': '文件',
    'secret.text': '文本',
    'secret.title': '秘密图片',
    'secret.hint': '隐藏在载体中。',
    'secret.fileTitle': '秘密文件',
    'secret.fileHint': '任意文件，受载体容量限制。',
    'secret.textTitle': '秘密文本',
    'secret.textPlaceholder': '输入要隐藏的文本…',
    'row.capacity': '容量',
    'row.enhance': '载体增强',
    'enhance.0': '不放大',
    'enhance.2048': '长边 2048',
    'enhance.2560': '长边 2560',
    'enhance.3072': '长边 3072',
    'enhance.4096': '长边 4096',
    'enhance.custom': '自定义',
    'enhance.ph': '自定义长边',
    'tier.highQuality': '高质量',
    'tier.antiCompression': '抗压缩',
    'tier.capacity': '大容量',
    'tier.capacityDesc': '秘密最大最清晰——抗攻击最弱',
    'tier.balanced': '均衡',
    'tier.balancedDesc': '视觉隐蔽与压缩抗性平衡',
    'tier.antiCompressionName': '抗压缩',
    'tier.antiCompressionDesc': '对压缩与缩放最强',
    'tier.custom': '自定义',
    'tier.customDesc': '全部参数手动设置',
    'tier.customBtn': '自定义参数',
    'param.ppb': '每块系数对',
    'param.repeat': '重复次数',
    'param.nsym': '纠错强度',
    'param.marginMin': '最小边际',
    'param.marginGain': '边际增益',
    'param.marginMax': '最大边际',
    'param.secretMax': '秘密长边',
    'btn.embed': '嵌入',
    'btn.downloadStego': '下载隐写图',
    'btn.reset': '重置',
    'btn.extract': '提取',
    'btn.downloadSecret': '下载秘密',
    'btn.downloadAll': '全部下载 (ZIP)',
    'btn.runBatch': '开始批量处理',
    'status.embedding': '嵌入中…',
    'status.embedDone': '完成。请以 PNG 下载隐写图。',
    'status.extracting': '提取中…',
    'status.extractNone': '未找到有效载荷。',
    'status.extractDone': '完成。',
    'status.batchRunning': '批量处理中…',
    'status.batchDone': '批量完成：{ok} 成功，{fail} 失败。',
    'status.tooLarge': '文件 {size} 超出容量 {cap}，无法嵌入。',
    'preview.cover': '载体',
    'preview.secret': '秘密',
    'preview.stego': '隐写结果',
    'preview.stegoIn': '隐写图',
    'preview.recovered': '恢复的秘密',
    'preview.none': '（无）',
    'extract.stegoHint': '嵌入步骤生成的图片。',
    'extract.manual': '原始尺寸（可选）',
    'extract.manualW': '宽',
    'extract.manualH': '高',
    'extract.manualHint': '仅当空间标尺无法自动读取时使用。',
    'result.image': '图片',
    'result.file': '文件',
    'result.text': '文本',
    'result.fileName': '文件名',
    'result.bytes': '字节',
    'batch.covers': '载体图（多选）',
    'batch.coversHint': '为每个秘密生成一张隐写图（依次配对，不足则循环使用第一张）。',
    'batch.secrets': '秘密文件（多选，图片/任意文件）',
    'batch.secretsHint': '每个秘密单独嵌入一张载体。',
    'batch.stegos': '隐写图（多选）',
    'batch.stegosHint': '批量提取每个文件中的秘密。',
    'batch.empty': '请先选择文件。',
    'batch.itemOk': '成功',
    'batch.itemFail': '失败',
    'footer.license': 'GPL-3.0-or-later · 用于研究、版权保护与合法隐蔽通信。',
    'footer.notice': '隐写只隐藏载荷，不加密。需要保密请先自行加密。',
    'footer.derived': '基于 RAC-Hide 改制 · 保留原作者版权声明。',
    'loading': '加载中…',
  },
  en: {
    'brand.name': 'StegoBox',
    'brand.mark': 'S',
    'nav.github': 'GitHub',
    'nav.algorithm': 'Algorithm',
    'nav.lang': '中文',
    'hero.eyebrow': 'Robust DCT steganography',
    'hero.title': 'Hide one image inside another.',
    'hero.lead':
      'Embed a secret image, any file, or text into the DCT coefficients of a cover image so it survives JPEG/WebP re-compression and proportional rescaling. Everything runs locally in your browser — no uploads, no server.',
    'badge.zero': 'Zero dependencies',
    'badge.blind': 'Blind extraction',
    'badge.rescale': 'Anti-rescale',
    'badge.gpl': 'GPL-3.0',
    'tab.embed': 'Embed',
    'tab.extract': 'Extract',
    'tab.batchEmbed': 'Batch Embed',
    'tab.batchExtract': 'Batch Extract',
    'mode.single': 'Single',
    'mode.batch': 'Batch',
    'cover.title': 'Cover image',
    'cover.hint': 'Click to choose, or drop a file. Recommended ≥ 512×512.',
    'secret.type': 'Secret type',
    'secret.image': 'Image',
    'secret.file': 'File',
    'secret.text': 'Text',
    'secret.title': 'Secret image',
    'secret.hint': 'Hidden inside the cover.',
    'secret.fileTitle': 'Secret file',
    'secret.fileHint': 'Any file, limited by cover capacity.',
    'secret.textTitle': 'Secret text',
    'secret.textPlaceholder': 'Type the text to hide…',
    'row.capacity': 'Capacity',
    'row.enhance': 'Cover enhance',
    'enhance.0': 'Do not upscale',
    'enhance.2048': 'Long edge 2048',
    'enhance.2560': 'Long edge 2560',
    'enhance.3072': 'Long edge 3072',
    'enhance.4096': 'Long edge 4096',
    'enhance.custom': 'Custom',
    'enhance.ph': 'custom long edge',
    'tier.highQuality': 'High quality',
    'tier.antiCompression': 'Anti-compression',
    'tier.capacity': 'Capacity',
    'tier.capacityDesc': 'Largest, sharpest secret — weakest against attacks',
    'tier.balanced': 'Balanced',
    'tier.balancedDesc': 'Visual subtlety and compression resistance',
    'tier.antiCompressionName': 'Anti-compression',
    'tier.antiCompressionDesc': 'Strongest against compression and rescaling',
    'tier.custom': 'Custom',
    'tier.customDesc': 'All parameters set manually',
    'tier.customBtn': 'Custom parameters',
    'param.ppb': 'Pairs / block',
    'param.repeat': 'Repeat',
    'param.nsym': 'ECC strength',
    'param.marginMin': 'Min margin',
    'param.marginGain': 'Margin gain',
    'param.marginMax': 'Max margin',
    'param.secretMax': 'Secret long edge',
    'btn.embed': 'Embed',
    'btn.downloadStego': 'Download stego',
    'btn.reset': 'Reset',
    'btn.extract': 'Extract',
    'btn.downloadSecret': 'Download secret',
    'btn.downloadAll': 'Download all (ZIP)',
    'btn.runBatch': 'Run batch',
    'status.embedding': 'Embedding…',
    'status.embedDone': 'Done. Download the stego image as PNG.',
    'status.extracting': 'Extracting…',
    'status.extractNone': 'No valid payload found.',
    'status.extractDone': 'Done.',
    'status.batchRunning': 'Batch processing…',
    'status.batchDone': 'Batch done: {ok} succeeded, {fail} failed.',
    'status.tooLarge': 'File {size} exceeds capacity {cap}; cannot embed.',
    'preview.cover': 'Cover',
    'preview.secret': 'Secret',
    'preview.stego': 'Stego result',
    'preview.stegoIn': 'Stego image',
    'preview.recovered': 'Recovered secret',
    'preview.none': '(none)',
    'extract.stegoHint': 'The image produced by the embed step.',
    'extract.manual': 'Original size (optional)',
    'extract.manualW': 'width',
    'extract.manualH': 'height',
    'extract.manualHint': 'Used only if the spatial ruler cannot be read automatically.',
    'result.image': 'Image',
    'result.file': 'File',
    'result.text': 'Text',
    'result.fileName': 'File name',
    'result.bytes': 'bytes',
    'batch.covers': 'Cover images (multi-select)',
    'batch.coversHint': 'One stego image per secret (paired in order; first cover reused if fewer).',
    'batch.secrets': 'Secret files (multi-select: images or any file)',
    'batch.secretsHint': 'Each secret is embedded into its own cover.',
    'batch.stegos': 'Stego images (multi-select)',
    'batch.stegosHint': 'Extract the secret from each file.',
    'batch.empty': 'Please select files first.',
    'batch.itemOk': 'OK',
    'batch.itemFail': 'Fail',
    'footer.license': 'GPL-3.0-or-later · for research, copyright protection and lawful covert communication.',
    'footer.notice': 'Steganography hides the payload; it does not encrypt it. Encrypt first if confidentiality matters.',
    'footer.derived': 'Derived from RAC-Hide · original author notices retained.',
    'loading': 'Loading…',
  },
};

const STORAGE_KEY = 'stegobox.lang';

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().startsWith('zh')
    ? 'zh'
    : 'en';
}

let lang = detectLang();

/** @param {string} key @param {Record<string, string|number>} [vars] */
export function t(key, vars) {
  let s = dict[lang][key] ?? dict.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export function getLang() {
  return lang;
}

/** Apply translations to every [data-i18n] / [data-i18n-placeholder] node. */
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = t('nav.lang');
}

export function setLang(next) {
  lang = next === 'zh' ? 'zh' : 'en';
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  applyI18n();
  document.dispatchEvent(new CustomEvent('stegobox:langchange', { detail: { lang } }));
}
