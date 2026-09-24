import {
  embedImage,
  embedTypedImage,
  embedFile,
  embedText,
  extractAny,
  decodeImageFile,
  imageDataToBlob,
  resizeImageData,
} from '../src/browser.js';
import { capacityBytes, typedHeaderBytes } from '../src/core.js';
import { PAYLOAD_TYPE_IMAGE, PAYLOAD_TYPE_FILE, PAYLOAD_TYPE_TEXT } from '../src/constants.js';
import { t, getLang, setLang, applyI18n } from './i18n.js';
import { buildZip } from './zip.js';

const MAX_LONG = 4096;

const state = {
  coverFile: null,
  secretFile: null,
  secretKind: 'image', // image | file | text
  cover: null,
  secretImage: null,
  secretBytes: null,
  secretName: '',
  secretText: '',
  stego: null,
  extractStego: null,
  extracted: null, // { type, name, body, imageData?, text? }
  customMode: false,
  batchCovers: [],
  batchSecrets: [], // { file, kind }
  batchEmbedResults: [], // { name, blob }
  batchStegos: [],
  batchExtractResults: [], // { name, blob }
};

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------------ *
 * i18n
 * ------------------------------------------------------------------ */
function bindLang() {
  $('langBtn').addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
  document.addEventListener('stegobox:langchange', () => {
    refreshAll();
    updateTierUI();
    updateSecretPane();
    updateExtractResultUI();
    updateBatchHints();
  });
  applyI18n();
}

/* ------------------------------------------------------------------ *
 * Operating point
 * ------------------------------------------------------------------ */
function sliderToTier(value) {
  if (value <= 50) {
    const v = value / 50;
    return { ppb: Math.round(6 - v * 4), repeat: 1, nsym: Math.round(32 + v * 16) };
  }
  const v = (value - 50) / 50;
  return { ppb: Math.round(2 - v), repeat: v < 0.5 ? 1 : 3, nsym: 48 };
}

function customOptions() {
  return {
    ppb: parseInt($('paramPPB').value, 10) || 2,
    repeat: parseInt($('paramRepeat').value, 10) || 1,
    nsym: parseInt($('paramNsym').value, 10) || 48,
    marginMin: parseInt($('paramMarginMin').value, 10) || 40,
    marginGain: (parseInt($('paramMarginGain').value, 10) || 14) / 10,
    marginMax: parseInt($('paramMarginMax').value, 10) || 200,
    secretMax: parseInt($('paramSecretMax').value, 10) || 1280,
  };
}

function currentOptions() {
  if (state.customMode) return customOptions();
  const tier = sliderToTier(parseInt($('tierSlider').value, 10));
  return { ...tier, marginMin: 40, marginGain: 1.4, marginMax: 200, secretMax: 1280 };
}

function tierText(options) {
  if (options.ppb >= 5) {
    return { name: t('tier.capacity'), desc: t('tier.capacityDesc') };
  }
  if (options.ppb <= 1 && options.repeat >= 3) {
    return { name: t('tier.antiCompressionName'), desc: t('tier.antiCompressionDesc') };
  }
  if (options.ppb <= 2 && options.nsym >= 48) {
    return { name: t('tier.balanced'), desc: t('tier.balancedDesc') };
  }
  return { name: t('tier.custom'), desc: `ppb=${options.ppb} repeat=${options.repeat} nsym=${options.nsym}` };
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
function render(canvas, imageData) {
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas
    .getContext('2d')
    .putImageData(new ImageData(imageData.data, imageData.width, imageData.height), 0, 0);
}

function clearCanvas(id) {
  const canvas = $(id);
  canvas.width = canvas.height = 0;
}

function setStatus(id, message, kind) {
  const el = $(id);
  el.textContent = message || '';
  el.className = 'status' + (kind ? ' ' + kind : '');
}

function showProgress(id) {
  $(id).classList.add('active');
}
function hideProgress(id) {
  $(id).classList.remove('active');
}
function nextFrame() {
  return new Promise((resolve) => setTimeout(resolve, 30));
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function downloadImageData(imageData, filename) {
  const blob = await imageDataToBlob(imageData, 'image/png');
  downloadBlob(blob, filename);
}

function mimeFromName(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    txt: 'text/plain',
    json: 'application/json',
    pdf: 'application/pdf',
    zip: 'application/zip',
    md: 'text/markdown',
  };
  return map[ext] || 'application/octet-stream';
}

function baseName(name) {
  return (name || 'file').replace(/[\\/]/g, '_');
}

function capLongEdge(imageData) {
  const long = Math.max(imageData.width, imageData.height);
  if (long <= MAX_LONG) return imageData;
  const scale = MAX_LONG / long;
  return resizeImageData(
    imageData,
    Math.max(1, Math.round(imageData.width * scale)),
    Math.max(1, Math.round(imageData.height * scale)),
  );
}

/* ------------------------------------------------------------------ *
 * Capacity / tier UI
 * ------------------------------------------------------------------ */
function activeHeaderBytes() {
  if (state.secretKind === 'file') return typedHeaderBytes(state.secretName || 'file.bin');
  if (state.secretKind === 'text') return typedHeaderBytes('message.txt');
  return typedHeaderBytes(state.secretName || 'secret.jpg');
}

function hasSecret() {
  if (state.secretKind === 'image') return !!state.secretImage;
  if (state.secretKind === 'file') return !!state.secretBytes;
  if (state.secretKind === 'text') return state.secretText.trim().length > 0;
  return false;
}

function updateCapacity() {
  const options = currentOptions();
  if (state.cover) {
    const bytes = capacityBytes(state.cover.width, state.cover.height, options, activeHeaderBytes());
    $('capacityInfo').textContent = `≈ ${formatBytes(Math.max(0, bytes))}`;
  } else {
    $('capacityInfo').textContent = '—';
  }
  $('embedBtn').disabled = !(state.cover && hasSecret());

  if (state.batchCovers[0]) {
    const b = capacityBytes(state.batchCovers[0].width, state.batchCovers[0].height, options);
    $('batchCapacityInfo').textContent = `≈ ${formatBytes(Math.max(0, b))} / ${t('preview.cover')}`;
  } else {
    $('batchCapacityInfo').textContent = '—';
  }
  $('batchEmbedBtn').disabled = !(state.batchCovers.length && state.batchSecrets.length);
}

function updateTierUI() {
  if (state.customMode) {
    $('tierName').textContent = t('tier.custom');
    $('tierDesc').textContent = t('tier.customDesc');
  } else {
    const label = tierText(currentOptions());
    $('tierName').textContent = label.name;
    $('tierDesc').textContent = label.desc;
  }
  $('tierSlider').disabled = state.customMode;
  $('tierSliderWrap').style.opacity = state.customMode ? '0.4' : '1';
  $('tierSliderWrap').style.pointerEvents = state.customMode ? 'none' : '';
  $('racCustomPanel').classList.toggle('open', state.customMode);
}

function refreshAll() {
  updateTierUI();
  updateCapacity();
}

function updateSecretPane() {
  const kind = state.secretKind;
  $('secretPaneImage').classList.toggle('hidden', kind !== 'image');
  $('secretPaneFile').classList.toggle('hidden', kind !== 'file');
  $('secretPaneText').classList.toggle('hidden', kind !== 'text');
  $('secretTypeSeg').querySelectorAll('.seg-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.type === kind);
  });
  updateCapacity();
}

function updateSecretPreviewUI() {
  const showCanvas = state.secretKind === 'image';
  $('secretCanvas').style.display = showCanvas ? '' : 'none';
  $('secretPayloadBox').classList.toggle('hidden', showCanvas);
  if (!showCanvas) {
    clearCanvas('secretCanvas');
    if (state.secretKind === 'file') {
      $('secretPayloadLabel').textContent = state.secretName
        ? `${t('result.fileName')}: ${state.secretName}`
        : t('secret.fileTitle');
      $('secretPayloadText').textContent = state.secretBytes
        ? `${formatBytes(state.secretBytes.length)} · ${t('result.bytes')}`
        : '';
      $('secretMeta').textContent = state.secretBytes ? formatBytes(state.secretBytes.length) : '';
    } else {
      $('secretPayloadLabel').textContent = t('result.text');
      const text = state.secretText;
      $('secretPayloadText').textContent = text.length > 400 ? `${text.slice(0, 400)}…` : text;
      $('secretMeta').textContent = text ? `${new TextEncoder().encode(text).length} B` : '';
    }
  }
}

function updateExtractResultUI() {
  const result = state.extracted;
  const showImage = result && result.imageData;
  $('extractedCanvas').style.display = showImage ? '' : 'none';
  $('extractedPayloadBox').classList.toggle('hidden', !result || !!showImage);
  if (!result) {
    clearCanvas('extractedCanvas');
    $('extractMeta').textContent = '';
    return;
  }
  if (showImage) {
    render($('extractedCanvas'), result.imageData);
    $('extractMeta').textContent = `${result.imageData.width} × ${result.imageData.height} px · ${
      PAYLOAD_TYPE_IMAGE === result.type ? t('result.image') : t('result.file')
    } · ppb=${result.ppb} repeat=${result.repeat} nsym=${result.nsym}`;
  } else if (result.type === PAYLOAD_TYPE_TEXT) {
    $('extractedPayloadLabel').textContent = t('result.text');
    const text = result.text || '';
    $('extractedPayloadText').textContent = text.length > 800 ? `${text.slice(0, 800)}…` : text;
    $('extractMeta').textContent = `${t('result.text')} · ${formatBytes(result.body.length)} · ppb=${result.ppb}`;
  } else {
    $('extractedPayloadLabel').textContent = `${t('result.file')}: ${result.name || '?'}`;
    $('extractedPayloadText').textContent = formatBytes(result.body.length);
    $('extractMeta').textContent = `${result.name || '?'} · ${formatBytes(result.body.length)} · ppb=${result.ppb}`;
  }
}

/* ------------------------------------------------------------------ *
 * Cover loading
 * ------------------------------------------------------------------ */
function coverTargetLong() {
  const value = $('coverUpscale').value;
  if (value === 'custom') return parseInt($('coverCustomLong').value, 10) || 0;
  return parseInt(value, 10) || 0;
}

async function loadCover() {
  if (!state.coverFile) return;
  const target = coverTargetLong();
  state.cover = await decodeImageFile(state.coverFile, target);
  if (!target) state.cover = capLongEdge(state.cover);
  $('coverHint').textContent = `${state.coverFile.name} · ${state.cover.width}×${state.cover.height}`;
  render($('coverCanvas'), state.cover);
  $('coverMeta').textContent = `${state.cover.width} × ${state.cover.height} px`;
  updateCapacity();
}

/* ------------------------------------------------------------------ *
 * Tabs
 * ------------------------------------------------------------------ */
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === tab));
    document
      .querySelectorAll('.panel')
      .forEach((panel) => panel.classList.toggle('hidden', panel.id !== tab.dataset.tab));
  });
});

/* ------------------------------------------------------------------ *
 * Inputs — single embed
 * ------------------------------------------------------------------ */
$('coverInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state.coverFile = file;
  await loadCover();
});

$('secretTypeSeg').addEventListener('click', (event) => {
  const btn = event.target.closest('.seg-btn');
  if (!btn) return;
  state.secretKind = btn.dataset.type;
  updateSecretPane();
  updateSecretPreviewUI();
});

$('secretInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state.secretFile = file;
  state.secretName = file.name;
  state.secretImage = capLongEdge(await decodeImageFile(file));
  $('secretHint').textContent = `${file.name} · ${state.secretImage.width}×${state.secretImage.height}`;
  render($('secretCanvas'), state.secretImage);
  $('secretMeta').textContent = `${state.secretImage.width} × ${state.secretImage.height} px`;
  updateSecretPreviewUI();
  updateCapacity();
});

$('secretFileInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state.secretFile = file;
  state.secretName = file.name;
  state.secretBytes = new Uint8Array(await file.arrayBuffer());
  $('secretFileHint').textContent = `${file.name} · ${formatBytes(file.size)}`;
  updateSecretPreviewUI();
  updateCapacity();
});

$('secretTextInput').addEventListener('input', () => {
  state.secretText = $('secretTextInput').value;
  updateSecretPreviewUI();
  updateCapacity();
});

$('coverUpscale').addEventListener('change', () => {
  if ($('coverUpscale').value !== 'custom') $('coverCustomLong').value = '';
  loadCover();
});

$('coverCustomLong').addEventListener('input', () => {
  const input = $('coverCustomLong');
  let value = parseInt(input.value, 10) || 0;
  if (value > 8192) {
    value = 8192;
    input.value = '8192';
  }
  $('coverUpscale').value = 'custom';
  loadCover();
});

$('tierSlider').addEventListener('input', refreshAll);

const paramIds = [
  'paramPPB',
  'paramRepeat',
  'paramNsym',
  'paramMarginMin',
  'paramMarginGain',
  'paramMarginMax',
  'paramSecretMax',
];
paramIds.forEach((id) => {
  $(id).addEventListener('input', () => {
    const value =
      id === 'paramMarginGain' ? (parseInt($(id).value, 10) / 10).toFixed(1) : $(id).value;
    $(id + '_v').textContent = value;
    if (state.customMode) refreshAll();
  });
});

$('customBtn').addEventListener('click', () => {
  state.customMode = !state.customMode;
  refreshAll();
});

/* ------------------------------------------------------------------ *
 * Embed (single)
 * ------------------------------------------------------------------ */
async function runEmbed() {
  const button = $('embedBtn');
  button.disabled = true;
  setStatus('embedStatus', t('status.embedding'));
  showProgress('embedProgress');
  await nextFrame();
  try {
    const options = currentOptions();
    if (state.secretKind === 'image') {
      const result = await embedTypedImage(state.cover, state.secretImage, {
        ...options,
        name: state.secretName || 'secret.jpg',
      });
      state.stego = result.stego;
      render($('stegoCanvas'), state.stego);
      $('stegoMeta').textContent =
        `${state.stego.width} × ${state.stego.height} px · secret ${result.secretSize[0]}×${result.secretSize[1]} · JPEG q${Math.round(result.quality * 100)}`;
    } else if (state.secretKind === 'file') {
      const result = embedFile(state.cover, state.secretBytes, state.secretName, options);
      state.stego = result.stego;
      render($('stegoCanvas'), state.stego);
      $('stegoMeta').textContent =
        `${state.stego.width} × ${state.stego.height} px · ${state.secretName} · ${formatBytes(result.used)}/${formatBytes(result.capacity)}`;
    } else {
      const result = embedText(state.cover, state.secretText, options);
      state.stego = result.stego;
      render($('stegoCanvas'), state.stego);
      $('stegoMeta').textContent =
        `${state.stego.width} × ${state.stego.height} px · ${formatBytes(result.used)}`;
    }
    $('downloadStegoBtn').disabled = false;
    setStatus('embedStatus', t('status.embedDone'), 'success');
  } catch (error) {
    setStatus('embedStatus', error.message, 'error');
  }
  hideProgress('embedProgress');
  button.disabled = !(state.cover && hasSecret());
}

$('embedBtn').addEventListener('click', runEmbed);

$('downloadStegoBtn').addEventListener('click', () => {
  if (state.stego) downloadImageData(state.stego, 'stego-image.png');
});

$('resetEmbedBtn').addEventListener('click', () => {
  state.coverFile = state.secretFile = state.cover = state.secretImage = state.stego = null;
  state.secretBytes = null;
  state.secretName = '';
  state.secretText = '';
  state.secretKind = 'image';
  state.customMode = false;
  $('coverInput').value = '';
  $('secretInput').value = '';
  $('secretFileInput').value = '';
  $('secretTextInput').value = '';
  $('coverUpscale').value = '0';
  $('coverCustomLong').value = '';
  $('tierSlider').value = '50';
  $('coverHint').textContent = t('cover.hint');
  $('secretHint').textContent = t('secret.hint');
  $('secretFileHint').textContent = t('secret.fileHint');
  ['coverCanvas', 'secretCanvas', 'stegoCanvas'].forEach(clearCanvas);
  $('coverMeta').textContent = '';
  $('secretMeta').textContent = '';
  $('stegoMeta').textContent = '';
  $('downloadStegoBtn').disabled = true;
  setStatus('embedStatus', '');
  hideProgress('embedProgress');
  updateSecretPane();
  updateSecretPreviewUI();
  refreshAll();
});

/* ------------------------------------------------------------------ *
 * Extract (single)
 * ------------------------------------------------------------------ */
$('stegoInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state.extractStego = capLongEdge(await decodeImageFile(file));
  $('stegoHint').textContent = `${file.name} · ${state.extractStego.width}×${state.extractStego.height}`;
  render($('extractStegoCanvas'), state.extractStego);
  $('extractStegoMeta').textContent = `${state.extractStego.width} × ${state.extractStego.height} px`;
  $('extractBtn').disabled = false;
});

$('extractBtn').addEventListener('click', async () => {
  const button = $('extractBtn');
  button.disabled = true;
  setStatus('extractStatus', t('status.extracting'));
  showProgress('extractProgress');
  await nextFrame();
  try {
    const manualW = parseInt($('manualW').value, 10) || 0;
    const manualH = parseInt($('manualH').value, 10) || 0;
    const manual = manualW >= 16 && manualH >= 16 ? [manualW, manualH] : null;
    const result = await extractAny(state.extractStego, manual);
    if (!result) {
      state.extracted = null;
      updateExtractResultUI();
      $('downloadSecretBtn').disabled = true;
      setStatus('extractStatus', t('status.extractNone'), 'error');
    } else {
      state.extracted = result;
      updateExtractResultUI();
      $('downloadSecretBtn').disabled = false;
      setStatus('extractStatus', t('status.extractDone'), 'success');
    }
  } catch (error) {
    setStatus('extractStatus', error.message, 'error');
  }
  hideProgress('extractProgress');
  button.disabled = false;
});

$('downloadSecretBtn').addEventListener('click', () => {
  const result = state.extracted;
  if (!result) return;
  if (result.imageData) {
    downloadImageData(result.imageData, result.name || 'recovered-secret.png');
  } else if (result.type === PAYLOAD_TYPE_TEXT) {
    downloadBlob(new Blob([result.body], { type: 'text/plain;charset=utf-8' }), result.name || 'message.txt');
  } else {
    downloadBlob(
      new Blob([result.body], { type: mimeFromName(result.name) }),
      result.name || 'recovered-file.bin',
    );
  }
});

$('resetExtractBtn').addEventListener('click', () => {
  state.extractStego = state.extracted = null;
  $('stegoInput').value = '';
  $('manualW').value = '';
  $('manualH').value = '';
  $('stegoHint').textContent = t('extract.stegoHint');
  ['extractStegoCanvas', 'extractedCanvas'].forEach(clearCanvas);
  $('extractStegoMeta').textContent = '';
  updateExtractResultUI();
  $('extractBtn').disabled = true;
  $('downloadSecretBtn').disabled = true;
  setStatus('extractStatus', '');
  hideProgress('extractProgress');
});

/* ------------------------------------------------------------------ *
 * Batch embed
 * ------------------------------------------------------------------ */
function renderBatchList(listId, items, renderRow) {
  const ul = $(listId);
  ul.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'batch-item';
    renderRow(li, item, index);
    ul.appendChild(li);
  });
}

function updateBatchHints() {
  if (state.batchCovers.length) {
    $('batchCoverHint').textContent = state.batchCovers
      .map((f) => f.name)
      .join(', ');
  }
  if (state.batchSecrets.length) {
    $('batchSecretHint').textContent = state.batchSecrets.map((s) => s.file.name).join(', ');
  }
  if (state.batchStegos.length) {
    $('batchStegoHint').textContent = state.batchStegos.map((f) => f.name).join(', ');
  }
  updateCapacity();
}

$('batchCoverInput').addEventListener('change', async (event) => {
  state.batchCovers = Array.from(event.target.files || []);
  state.batchEmbedResults = [];
  $('batchEmbedZipBtn').disabled = true;
  renderBatchList('batchEmbedList', [], () => {});
  updateBatchHints();
});

$('batchSecretInput').addEventListener('change', (event) => {
  const files = Array.from(event.target.files || []);
  state.batchSecrets = files.map((file) => ({
    file,
    kind: file.type.startsWith('image/') ? 'image' : 'file',
  }));
  state.batchEmbedResults = [];
  $('batchEmbedZipBtn').disabled = true;
  renderBatchList('batchEmbedList', [], () => {});
  updateBatchHints();
});

$('batchEmbedBtn').addEventListener('click', async () => {
  if (!state.batchCovers.length || !state.batchSecrets.length) {
    setStatus('batchEmbedStatus', t('batch.empty'), 'error');
    return;
  }
  const button = $('batchEmbedBtn');
  button.disabled = true;
  setStatus('batchEmbedStatus', t('status.batchRunning'));
  showProgress('batchEmbedProgress');
  await nextFrame();

  const options = currentOptions();
  const results = [];
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < state.batchSecrets.length; i++) {
    const entry = state.batchSecrets[i];
    const coverFile = state.batchCovers[i] || state.batchCovers[0];
    try {
      const cover = capLongEdge(await decodeImageFile(coverFile));
      let stego;
      let note = '';
      if (entry.kind === 'image') {
        const secret = capLongEdge(await decodeImageFile(entry.file));
        const r = await embedTypedImage(cover, secret, { ...options, name: entry.file.name });
        stego = r.stego;
        note = `${r.secretSize[0]}×${r.secretSize[1]}`;
      } else {
        const bytes = new Uint8Array(await entry.file.arrayBuffer());
        const r = embedFile(cover, bytes, entry.file.name, options);
        stego = r.stego;
        note = formatBytes(r.used);
      }
      const blob = await imageDataToBlob(stego, 'image/png');
      const outName = `stego-${baseName(entry.file.name)}.png`;
      results.push({ name: outName, blob, ok: true, note });
      ok += 1;
    } catch (error) {
      results.push({ name: entry.file.name, ok: false, note: error.message });
      fail += 1;
    }
    renderBatchList('batchEmbedList', results, (li, item) => {
      li.innerHTML = `<span class="batch-name"></span><span class="batch-note"></span><span class="badge ${item.ok ? 'ok' : 'fail'}"></span>`;
      li.querySelector('.batch-name').textContent = item.name;
      li.querySelector('.batch-note').textContent = item.note;
      li.querySelector('.badge').textContent = item.ok ? t('batch.itemOk') : t('batch.itemFail');
    });
    setStatus('batchEmbedStatus', `${t('status.batchRunning')} ${i + 1}/${state.batchSecrets.length}`);
    await nextFrame();
  }

  state.batchEmbedResults = results.filter((r) => r.ok && r.blob);
  $('batchEmbedZipBtn').disabled = state.batchEmbedResults.length === 0;
  setStatus('batchEmbedStatus', t('status.batchDone', { ok, fail }), fail ? 'error' : 'success');
  hideProgress('batchEmbedProgress');
  button.disabled = false;
});

$('batchEmbedZipBtn').addEventListener('click', async () => {
  const items = state.batchEmbedResults;
  if (items.length === 0) return;
  if (items.length === 1) {
    downloadBlob(items[0].blob, items[0].name);
    return;
  }
  const entries = [];
  for (const item of items) {
    entries.push({ name: item.name, data: new Uint8Array(await item.blob.arrayBuffer()) });
  }
  downloadBlob(new Blob([buildZip(entries)], { type: 'application/zip' }), 'stego-batch.zip');
});

$('batchEmbedResetBtn').addEventListener('click', () => {
  state.batchCovers = [];
  state.batchSecrets = [];
  state.batchEmbedResults = [];
  $('batchCoverInput').value = '';
  $('batchSecretInput').value = '';
  $('batchEmbedZipBtn').disabled = true;
  renderBatchList('batchEmbedList', [], () => {});
  setStatus('batchEmbedStatus', '');
  hideProgress('batchEmbedProgress');
  updateBatchHints();
});

/* ------------------------------------------------------------------ *
 * Batch extract
 * ------------------------------------------------------------------ */
$('batchStegoInput').addEventListener('change', (event) => {
  state.batchStegos = Array.from(event.target.files || []);
  state.batchExtractResults = [];
  $('batchExtractZipBtn').disabled = true;
  renderBatchList('batchExtractList', [], () => {});
  updateBatchHints();
});

$('batchExtractBtn').addEventListener('click', async () => {
  if (!state.batchStegos.length) {
    setStatus('batchExtractStatus', t('batch.empty'), 'error');
    return;
  }
  const button = $('batchExtractBtn');
  button.disabled = true;
  setStatus('batchExtractStatus', t('status.batchRunning'));
  showProgress('batchExtractProgress');
  await nextFrame();

  const results = [];
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < state.batchStegos.length; i++) {
    const file = state.batchStegos[i];
    try {
      const stego = capLongEdge(await decodeImageFile(file));
      const result = await extractAny(stego);
      if (!result) throw new Error(t('status.extractNone'));
      let blob;
      let outName;
      if (result.imageData) {
        blob = await imageDataToBlob(result.imageData, 'image/png');
        outName = result.name ? `recovered-${baseName(result.name)}.png` : `recovered-${i + 1}.png`;
      } else if (result.type === PAYLOAD_TYPE_TEXT) {
        blob = new Blob([result.body], { type: 'text/plain;charset=utf-8' });
        outName = result.name || `message-${i + 1}.txt`;
      } else {
        blob = new Blob([result.body], { type: mimeFromName(result.name) });
        outName = result.name || `file-${i + 1}.bin`;
      }
      results.push({ name: outName, blob, ok: true, note: formatBytes(result.body.length) });
      ok += 1;
    } catch (error) {
      results.push({ name: file.name, ok: false, note: error.message, blob: null });
      fail += 1;
    }
    renderBatchList('batchExtractList', results, (li, item) => {
      li.innerHTML = `<span class="batch-name"></span><span class="batch-note"></span><span class="badge ${item.ok ? 'ok' : 'fail'}"></span>`;
      li.querySelector('.batch-name').textContent = item.name;
      li.querySelector('.batch-note').textContent = item.note;
      li.querySelector('.badge').textContent = item.ok ? t('batch.itemOk') : t('batch.itemFail');
    });
    setStatus('batchExtractStatus', `${t('status.batchRunning')} ${i + 1}/${state.batchStegos.length}`);
    await nextFrame();
  }

  state.batchExtractResults = results.filter((r) => r.ok && r.blob);
  $('batchExtractZipBtn').disabled = state.batchExtractResults.length === 0;
  setStatus('batchExtractStatus', t('status.batchDone', { ok, fail }), fail ? 'error' : 'success');
  hideProgress('batchExtractProgress');
  button.disabled = false;
});

$('batchExtractZipBtn').addEventListener('click', async () => {
  const items = state.batchExtractResults;
  if (items.length === 0) return;
  if (items.length === 1) {
    downloadBlob(items[0].blob, items[0].name);
    return;
  }
  const entries = [];
  for (const item of items) {
    entries.push({ name: item.name, data: new Uint8Array(await item.blob.arrayBuffer()) });
  }
  downloadBlob(new Blob([buildZip(entries)], { type: 'application/zip' }), 'recovered-batch.zip');
});

$('batchExtractResetBtn').addEventListener('click', () => {
  state.batchStegos = [];
  state.batchExtractResults = [];
  $('batchStegoInput').value = '';
  $('batchExtractZipBtn').disabled = true;
  renderBatchList('batchExtractList', [], () => {});
  setStatus('batchExtractStatus', '');
  hideProgress('batchExtractProgress');
  updateBatchHints();
});

/* ------------------------------------------------------------------ */
bindLang();
updateSecretPane();
updateSecretPreviewUI();
refreshAll();
