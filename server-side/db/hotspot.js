const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'hotspot.json');

function getDefaultData() {
  return {
    blockSets: [],
    footer: {
      icons: [], // max 4
      styles: {
        footerBackground: 'rgba(33, 37, 41, 1)',
        iconColor: 'rgba(0, 0, 0, 0)',
        textColor: 'rgba(0, 0, 0, 0)'
      }
    },
    editorsPicks: [], // 2-3 items
    discovery: [], // 2-3 items
    quickFun: {
      bannerImage: null,
      titleBosnian: '',
      titleEnglish: '',
      subtitleBosnian: '',
      subtitleEnglish: '',
      link: ''
    },
    utilities: {
      cityName: '',
      baseCurrency: '',
      timezone: '',
      latitude: '',
      longitude: '',
      targetCurrencies: ''
    }
  };
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(getDefaultData(), null, 2));
  }
}

function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Merge defaults for backward compat
    return { ...getDefaultData(), ...parsed };
  } catch (err) {
    return getDefaultData();
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getBlockSets() {
  return readData().blockSets || [];
}

function saveBlockSets(sets) {
  const data = readData();
  const sanitized = Array.isArray(sets) ? sets.map(set => ({
    id: set.id || Date.now().toString(),
    styles: {
      blockBackground: set.styles?.blockBackground || 'rgba(31, 31, 31, 1)',
      titleColor: set.styles?.titleColor || 'rgba(255, 255, 255, 1)',
      descriptionColor: set.styles?.descriptionColor || 'rgba(196, 196, 196, 1)',
      buttonBackground: set.styles?.buttonBackground || 'rgba(122, 73, 240, 1)',
      buttonTextColor: set.styles?.buttonTextColor || 'rgba(255, 255, 255, 1)'
    },
    blocks: Array.isArray(set.blocks) ? set.blocks.map(b => ({
      id: b.id || Math.random().toString(36).slice(2),
      image: b.image || null,
      title: b.title || '',
      description: b.description || '',
      buttonText: b.buttonText || '',
      buttonLink: b.buttonLink || ''
    })) : []
  })) : [];
  data.blockSets = sanitized;
  writeData(data);
  return sanitized;
}

function getFooter() {
  return readData().footer || getDefaultData().footer;
}

function saveFooter(footer) {
  const data = readData();
  data.footer = footer;
  writeData(data);
  return footer;
}

function getEditorsPicks() {
  return readData().editorsPicks || [];
}

function saveEditorsPicks(picks) {
  const data = readData();
  data.editorsPicks = picks;
  writeData(data);
  return picks;
}

function getDiscovery() {
  return readData().discovery || [];
}

function saveDiscovery(discovery) {
  const data = readData();
  data.discovery = discovery;
  writeData(data);
  return discovery;
}

function getQuickFun() {
  return readData().quickFun || getDefaultData().quickFun;
}

function saveQuickFun(quickFun) {
  const data = readData();
  data.quickFun = quickFun;
  writeData(data);
  return quickFun;
}

function getUtilities() {
  return readData().utilities || getDefaultData().utilities;
}

function saveUtilities(utilities) {
  const data = readData();
  data.utilities = utilities;
  writeData(data);
  return utilities;
}

module.exports = {
  getBlockSets,
  saveBlockSets,
  getFooter,
  saveFooter,
  getEditorsPicks,
  saveEditorsPicks,
  getDiscovery,
  saveDiscovery,
  getQuickFun,
  saveQuickFun,
  getUtilities,
  saveUtilities
};
