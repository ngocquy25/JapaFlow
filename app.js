/**
 * Nihongo Flow - Main Application Logic
 * PWA & iOS Safari Speech Synthesis, Google HD Native Voice, AI Natural Phrase Generator, Furigana Engine, Voice Lab
 */

// State Management
const STATE = {
  phrases: [],
  currentTab: 'phrasebook',
  currentCat: 'all',
  currentLevel: 'all',
  searchQuery: '',
  theme: localStorage.getItem('nhf_theme') || 'dark',
  ttsSpeed: parseFloat(localStorage.getItem('nhf_speed') || '1.0'),
  voiceEngine: localStorage.getItem('nhf_voice_engine') || 'google_hd', // 'google_hd' or 'system'
  selectedVoice: null,
  
  // Flashcard state
  fcIndex: 0,
  fcList: [],
  isFlipped: false,

  // Shadowing Auto Player state
  shadowIndex: 0,
  isShadowPlaying: false,
  shadowTimer: null,

  // Voice Lab state
  mediaRecorder: null,
  recordedAudioBlob: null,
  recordedAudioUrl: null,
  isRecording: false
};

// Built-in Conversational AI Knowledge Base for Instant Natural Suggestions
const AI_NATURAL_PATTERNS = [
  {
    keywords: ["mệt", "không muốn đi nhậu", "từ chối", "nhậu", "bận", "từ chối nhậu"],
    casual: {
      jp: "今日マジで疲れてるから、飲み会パスしてもいい？",
      ruby: "<ruby>今日<rt>きょう</rt></ruby>マジで<ruby>疲<rt>つか</rt></ruby>れてるから、<ruby>飲<rt>の</rt></ruby>み<ruby>会<rt>かい</rt></ruby>パスしてもいい？",
      romaji: "Kyou maji de tsukareteru kara, nomikai pasu shitemo ii?",
      vn: "Hôm nay tao mệt thật sự luôn, cho tao xin kiếu bữa nhậu này nhé?",
      note: "'パスする' (pass suru) là cách giới trẻ Nhật từ chối khéo các cuộc hẹn/nhậu.",
      level: "casual", category: "izakaya", situation: "Từ chối khéo rủ đi nhậu cùng bạn bè"
    },
    polite: {
      jp: "あいにく今日は体調がすぐれず、またの機会にさせていただけますか？",
      ruby: "あいにく<ruby>今日<rt>きょう</rt></ruby>は<ruby>体調<rt>たいちょう</rt></ruby>がすぐれず、またの<ruby>機会<rt>きかい</rt></ruby>にさせていただけますか？",
      romaji: "Ainiku kyou wa taichou ga sugurezu, mata no kikai ni sasete itadakemasu ka?",
      vn: "Tiếc quá hôm nay sức khỏe tôi không tốt lắm, xin phép hẹn anh/chị dịp khác được không ạ?",
      note: "Văn phong từ chối cực kỳ lịch sự và tế nhị với đồng nghiệp/cấp trên.",
      level: "business", category: "work", situation: "Từ chối lời mời của đồng nghiệp/sếp"
    }
  },
  {
    keywords: ["nước", "xin nước", "ly nước", "nước lọc", "cốc nước", "đá"],
    casual: {
      jp: "お水もう一杯もらえる？",
      ruby: "お<ruby>水<rt>みず</rt></ruby>もう<ruby>一杯<rt>いっぱい</rt></ruby>もらえる？",
      romaji: "Omizu mou ippai moraeru?",
      vn: "Cho tớ xin thêm một cốc nước nữa với?",
      note: "Dùng khi nói với bạn bè hoặc phục vụ trong quán thân mật.",
      level: "casual", category: "restaurant", situation: "Xin thêm nước trong quán"
    },
    polite: {
      jp: "すみません、お冷（おひや）を一ついただけますか？",
      ruby: "すみません、お<ruby>冷<rt>ひや</rt></ruby>を<ruby>一<rt>ひと</rt></ruby>ついただけますか？",
      romaji: "Sumimasen, ohiya o hitotsu itadakemasu ka?",
      vn: "Xin lỗi, cho tôi xin một cốc nước lọc lạnh được không ạ?",
      note: "Trong quán ăn Nhật, nước lọc lạnh gọi là 'お冷' (ohiya), nghe rất sành điệu chuẩn bản xứ.",
      level: "polite", category: "restaurant", situation: "Gọi nước lọc trong quán ăn"
    }
  },
  {
    keywords: ["bao nhiêu tiền", "giá", "thanh toán", "tính tiền", "hết bao nhiêu", "chia tiền", "tiền"],
    casual: {
      jp: "これいくら？割り勘にしよ！",
      ruby: "これいくら？<ruby>割<rt>わ</rt></ruby>り<ruby>勘<rt>かん</rt></ruby>にしよ！",
      romaji: "Kore ikura? Warikan ni shiyo!",
      vn: "Cái này bao nhiêu tiền thế? Bọn mình cưa đôi tiền nhé!",
      note: "'割り勘' (Warikan) = Chia đều tiền nong khi đi ăn cùng bạn bè.",
      level: "casual", category: "restaurant", situation: "Rủ bạn bè cưa đôi tiền bữa ăn"
    },
    polite: {
      jp: "別々でお会計できますか？",
      ruby: "<ruby>別々<rt>べつべつ</rt></ruby>でお<ruby>会計<rt>かいけい</rt></ruby>できますか？",
      romaji: "Betsubetsu de okaikei dekimasu ka?",
      vn: "Chúng tôi thanh toán riêng (từng người) được không ạ?",
      note: "Khi đi ăn nhóm với người Nhật muốn chia hóa đơn cho từng người thanh toán.",
      level: "polite", category: "restaurant", situation: "Thanh toán riêng rẽ tại quán ăn"
    }
  },
  {
    keywords: ["ngon", "khen ngon", "đồ ăn", "món ăn", "đỉnh chóp", "ngon vãi"],
    casual: {
      jp: "うまっ！これやばいわ！",
      ruby: "うまっ！これやばいわ！",
      romaji: "Umat! Kore yabai wa!",
      vn: "Ngon vãi chưởng! Đỉnh thực sự luôn á!",
      note: "'うまっ' (ngon) + 'やばい' (đỉnh/chất). Người trẻ Nhật dùng liên tục khi ăn đồ ngon.",
      level: "slang", category: "restaurant", situation: "Cảm thán khi vừa nếm món ngon tuyệt cú mèo"
    },
    polite: {
      jp: "すごく美味しいです！口の中でとろけますね。",
      ruby: "すごく<ruby>美味<rt>おい</rt></ruby>しいです！<ruby>口<rt>くち</rt></ruby>の<ruby>中<rt>なか</rt></ruby>でとろけますね。",
      romaji: "Sugoku oishii desu! Kuchi no naka de torokemasu ne.",
      vn: "Ngon tuyệt vời ạ! Miếng thịt như tan chảy ngay trong miệng luôn.",
      note: "Cách khen món ăn cực kỳ tinh tế và nịnh lòng đầu bếp người Nhật.",
      level: "polite", category: "restaurant", situation: "Khen đồ ăn nhà hàng lịch sự"
    }
  },
  {
    keywords: ["wifi", "mật khẩu", "pass wifi", "mạng", "mạng wifi"],
    casual: {
      jp: "Wi-Fiのパスワードって何だっけ？",
      ruby: "Wi-Fiのパスワードって<ruby>何<rt>なん</rt></ruby>だっけ？",
      romaji: "Waifai no pasuwaado tte nan dakke?",
      vn: "Mật khẩu Wi-Fi là gì thế nhỉ?",
      note: "Hỏi tự nhiên với bạn bè trong phòng/quán.",
      level: "casual", category: "casual", situation: "Hỏi pass Wi-Fi thân mật"
    },
    polite: {
      jp: "Wi-Fiのパスワードを教えていただけますか？",
      ruby: "Wi-Fiのパスワードを<ruby>教<rt>おし</rt></ruby>えていただけますか？",
      romaji: "Waifai no pasuwaado o oshiete itadakemasu ka?",
      vn: "Cho tôi xin mật khẩu Wi-Fi với được không ạ?",
      note: "Người Nhật đọc Wi-Fi là 'Waifai'.",
      level: "polite", category: "restaurant", situation: "Hỏi mật khẩu Wifi tại quán cafe/khách sạn"
    }
  },
  {
    keywords: ["đang làm gì", "làm gì đấy", "rảnh không", "bận không", "đi chơi"],
    casual: {
      jp: "今何してる？ちょっとお茶しない？",
      ruby: "<ruby>今<rt>いま</rt></ruby><ruby>何<rt>なに</rt></ruby>してる？ちょっとお<ruby>茶<rt>ちゃ</rt></ruby>しない？",
      romaji: "Ima nani shiteru? Chotto ocha shinai?",
      vn: "Đang làm gì đấy? Đi uống cafe/trà một lát không?",
      note: "'お茶しない' (ocha shinai) là rủ đi cafe/trà sữa tán gẫu cực kỳ thông dụng.",
      level: "casual", category: "casual", situation: "Nhắn tin rủ bạn bè đi cafe"
    },
    polite: {
      jp: "本日ご都合はいかがでしょうか？",
      ruby: "<ruby>本日<rt>ほんじつ</rt></ruby>ご<ruby>都合<rt>つごう</rt></ruby>はいかがでしょうか？",
      romaji: "Honjitsu gotsugou wa ikaga deshou ka?",
      vn: "Hôm nay anh/chị có tiện thời gian không ạ?",
      note: "Hỏi lịch hẹn lịch sự chuẩn công sở.",
      level: "business", category: "work", situation: "Hẹn gặp đồng nghiệp/khách hàng"
    }
  },
  {
    keywords: ["xin lỗi", "muộn", "đến muộn", "tắc đường", "trễ"],
    casual: {
      jp: "ごめん！電車遅れてて、あと10分くらいで着く！",
      ruby: "ごめん！<ruby>電車<rt>でんしゃ</rt></ruby><ruby>遅<rt>おく</rt></ruby>れてて、あと10<ruby>分<rt>ぷん</rt></ruby>くらいで<ruby>着<rt>つ</rt></ruby>く！",
      romaji: "Gomen! Densha okuretete, ato juppun kurai de tsuku!",
      vn: "Xin lỗi nhé! Tàu bị trễ xíu, tầm 10 phút nữa tao tới nơi!",
      note: "Cách nhắn tin báo trễ giờ cho bạn bè tự nhiên, chân thành.",
      level: "casual", category: "casual", situation: "Báo đến muộn vì kẹt tàu/xe cho bạn bè"
    },
    polite: {
      jp: "大変申し訳ございません。交通渋滞のため、15分ほど遅れます。",
      ruby: "<ruby>大変<rt>たいへん</rt></ruby><ruby>申<rt>もう</rt></ruby>し<ruby>訳<rt>わけ</rt></ruby>ございません。<ruby>交通<rt>こうつう</rt></ruby><ruby>渋滞<rt>じゅうたい</rt></ruby>のため、15<ruby>分<rt>ふん</rt></ruby>ほど<ruby>遅<rt>おく</rt></ruby>れます。",
      romaji: "Taihen moushiwake gozaimasen. Koutsuu juutai no tame, juugofun hodo okuremasu.",
      vn: "Tôi vô cùng xin lỗi. Vì tắc đường nên tôi sẽ đến muộn khoảng 15 phút ạ.",
      note: "Mẫu câu báo trễ giờ chuẩn mực khi đi làm tại Nhật.",
      level: "business", category: "work", situation: "Báo trễ giờ cho sếp/khách hàng"
    }
  }
];

// --------------------------------------------------------------------------
// INITIALIZATION
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initTheme();
  initTTSVoices();
  initEventListeners();
  renderPhrases();
  updateCategoryCounts();
  registerPWA();
});

// PWA Service Worker Registration
function registerPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log('Nihongo Flow PWA Service Worker Registered', reg.scope);
      }).catch((err) => {
        console.log('PWA Service Worker registration skipped', err);
      });
    });
  }
}

// Local Storage handling
function initStorage() {
  const saved = localStorage.getItem('nhf_phrases_data');
  if (saved) {
    try {
      STATE.phrases = JSON.parse(saved);
    } catch (e) {
      STATE.phrases = SAMPLE_PHRASES;
      savePhrasesToStorage();
    }
  } else {
    STATE.phrases = SAMPLE_PHRASES;
    savePhrasesToStorage();
  }
}

function savePhrasesToStorage() {
  localStorage.setItem('nhf_phrases_data', JSON.stringify(STATE.phrases));
  updateCategoryCounts();
}

// Theme handling
function initTheme() {
  if (STATE.theme === 'sakura') {
    document.body.classList.add('theme-sakura');
    updateThemeIcon(true);
  } else {
    document.body.classList.remove('theme-sakura');
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  const isSakura = document.body.classList.toggle('theme-sakura');
  STATE.theme = isSakura ? 'sakura' : 'dark';
  localStorage.setItem('nhf_theme', STATE.theme);
  updateThemeIcon(isSakura);
  showToast(isSakura ? 'Đã chuyển sang giao diện Sakura Light 🌸' : 'Đã chuyển sang giao diện Tokyo Night 🌙', 'info');
}

function updateThemeIcon(isSakura) {
  const btn = document.getElementById('btn-theme-toggle');
  if (btn) {
    btn.innerHTML = isSakura ? '<i class="fa-solid fa-sun" style="color:#ff4d6d"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
}

// --------------------------------------------------------------------------
// HIGH-QUALITY NATURAL JAPANESE TTS (Google HD Native Voice & Apple Safari Kyoko)
// --------------------------------------------------------------------------
let currentAudioElement = null;
let availableVoices = [];

function initTTSVoices() {
  if ('speechSynthesis' in window) {
    function loadVoices() {
      availableVoices = window.speechSynthesis.getVoices();
      const jpVoices = availableVoices.filter(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja'));
      const preferredVoice = jpVoices.find(v => 
        v.name.includes('Kyoko') || 
        v.name.includes('Otoya') || 
        v.name.includes('Siri') || 
        v.name.includes('Google') || 
        v.name.includes('Natural')
      ) || jpVoices[0];

      STATE.selectedVoice = preferredVoice || null;
    }
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }
}

/**
 * Phát âm tiếng Nhật với chất lượng giọng người thật bản xứ (Google HD Native Stream)
 * Tự động fallback sang Web Speech API nếu offline
 */
function speakJapanese(text, customRate = null, onEndCallback = null) {
  // Dọn dẹp thẻ Ruby / HTML
  const cleanText = text.replace(/<rt>.*?<\/rt>/g, '').replace(/<[^>]*>/g, '').replace(/[\[\]]/g, '').trim();
  if (!cleanText) return;

  const rate = customRate || STATE.ttsSpeed;

  // Dừng mọi âm thanh đang phát
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Ưu tiên 1: Google HD Natural Studio Voice (Giọng người Nhật bản xứ cực kỳ truyền cảm, có cảm xúc)
  if (STATE.voiceEngine === 'google_hd') {
    try {
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=ja&client=tw-ob`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = rate;
      currentAudioElement = audio;

      audio.onended = () => {
        currentAudioElement = null;
        if (onEndCallback) onEndCallback();
      };

      audio.onerror = () => {
        console.warn('Google HD audio stream failed or offline, fallback to Web Speech API');
        speakJapaneseWithWebSpeech(cleanText, rate, onEndCallback);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser blocked audio autoplay without gesture
          speakJapaneseWithWebSpeech(cleanText, rate, onEndCallback);
        });
      }
      return audio;
    } catch (e) {
      return speakJapaneseWithWebSpeech(cleanText, rate, onEndCallback);
    }
  } else {
    // Ưu tiên 2: Thiết bị cục bộ (Safari iOS Kyoko / Siri)
    return speakJapaneseWithWebSpeech(cleanText, rate, onEndCallback);
  }
}

function speakJapaneseWithWebSpeech(cleanText, rate, onEndCallback) {
  if (!('speechSynthesis' in window)) {
    showToast('Trình duyệt không hỗ trợ phát âm.', 'info');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  utterance.pitch = 1.0;

  if (STATE.selectedVoice) {
    utterance.voice = STATE.selectedVoice;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

// --------------------------------------------------------------------------
// FURIGANA & ROMAJI PARSER UTILITIES
// --------------------------------------------------------------------------
function parseRubySyntax(inputStr) {
  if (!inputStr) return '';
  return inputStr.replace(/\[([^\|\]]+)\|([^\]]+)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
}

// --------------------------------------------------------------------------
// EVENT LISTENERS
// --------------------------------------------------------------------------
function initEventListeners() {
  // Voice Engine Selector (Google HD vs Apple/System)
  const voiceEngineSelect = document.getElementById('global-voice-engine');
  if (voiceEngineSelect) {
    voiceEngineSelect.value = STATE.voiceEngine;
    voiceEngineSelect.addEventListener('change', (e) => {
      STATE.voiceEngine = e.target.value;
      localStorage.setItem('nhf_voice_engine', STATE.voiceEngine);
      showToast(STATE.voiceEngine === 'google_hd' ? 'Đã bật giọng HD Người Nhật Bản Xứ 🎙️' : 'Đã chuyển sang giọng Thiết bị (iOS/Safari) 📱', 'success');
      // Test audio immediately
      speakJapanese('こんにちは！よろしくお願いします。');
    });
  }

  // iPhone Guide Modal
  document.getElementById('btn-iphone-guide')?.addEventListener('click', () => {
    document.getElementById('modal-iphone')?.classList.add('active');
  });
  document.getElementById('btn-close-iphone')?.addEventListener('click', () => {
    document.getElementById('modal-iphone')?.classList.remove('active');
  });
  document.getElementById('btn-ok-iphone')?.addEventListener('click', () => {
    document.getElementById('modal-iphone')?.classList.remove('active');
  });

  // AI Assistant Modal
  document.getElementById('btn-ai-assistant')?.addEventListener('click', openAiModal);
  document.getElementById('btn-close-ai')?.addEventListener('click', closeAiModal);
  document.getElementById('btn-ai-generate')?.addEventListener('click', generateAiPhrases);

  // Quick Prompt Chips in AI Modal
  document.querySelectorAll('.quick-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      const input = document.getElementById('ai-input-prompt');
      if (input && prompt) {
        input.value = prompt;
        generateAiPhrases();
      }
    });
  });

  // Theme Toggle
  document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme);

  // Tabs Navigation
  document.querySelectorAll('.nav-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      const targetTab = tabBtn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Global TTS Speed
  const speedSelect = document.getElementById('global-tts-speed');
  if (speedSelect) {
    speedSelect.value = STATE.ttsSpeed.toString();
    speedSelect.addEventListener('change', (e) => {
      STATE.ttsSpeed = parseFloat(e.target.value);
      localStorage.setItem('nhf_speed', STATE.ttsSpeed);
      showToast(`Đã đổi tốc độ phát âm sang ${STATE.ttsSpeed}x`, 'info');
    });
  }

  // Search Input
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    STATE.searchQuery = e.target.value.toLowerCase().trim();
    renderPhrases();
  });

  // Filter Level
  document.getElementById('filter-level')?.addEventListener('change', (e) => {
    STATE.currentLevel = e.target.value;
    renderPhrases();
  });

  // Category Pills
  document.getElementById('category-pills')?.addEventListener('click', (e) => {
    const pill = e.target.closest('.cat-pill');
    if (!pill) return;
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    STATE.currentCat = pill.getAttribute('data-cat');
    renderPhrases();
  });

  // Add Phrase Modal
  document.getElementById('btn-add-phrase')?.addEventListener('click', () => openPhraseModal());
  document.getElementById('btn-close-modal')?.addEventListener('click', () => closePhraseModal());
  document.getElementById('btn-cancel-modal')?.addEventListener('click', () => closePhraseModal());
  
  // Real-time Ruby preview in Modal Form
  document.getElementById('form-japanese')?.addEventListener('input', (e) => {
    const previewEl = document.getElementById('form-ruby-preview');
    if (previewEl) {
      const parsed = parseRubySyntax(e.target.value);
      previewEl.innerHTML = parsed || '<span style="color: var(--text-dim); font-size: 0.85rem;">Xem trước hiển thị Furigana sẽ xuất hiện tại đây...</span>';
    }
  });

  // Form Submit (Add/Edit)
  document.getElementById('phrase-form')?.addEventListener('submit', handlePhraseFormSubmit);

  // Export JSON Backup
  document.getElementById('btn-export')?.addEventListener('click', exportPhrasesJSON);

  // Import JSON Backup
  document.getElementById('import-file-input')?.addEventListener('change', handleImportFile);

  // Flashcard Controls
  document.getElementById('flashcard-element')?.addEventListener('click', flipFlashcard);
  document.getElementById('btn-fc-flip')?.addEventListener('click', flipFlashcard);
  document.getElementById('btn-fc-next')?.addEventListener('click', nextFlashcard);
  document.getElementById('btn-fc-prev')?.addEventListener('click', prevFlashcard);
  document.getElementById('btn-fc-audio')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (STATE.fcList[STATE.fcIndex]) {
      speakJapanese(STATE.fcList[STATE.fcIndex].japanese);
    }
  });

  // Shadowing Player Controls
  document.getElementById('btn-shadow-play')?.addEventListener('click', toggleShadowPlayer);
  document.getElementById('btn-shadow-next')?.addEventListener('click', nextShadowPhrase);
  document.getElementById('btn-shadow-prev')?.addEventListener('click', prevShadowPhrase);

  // Voice Lab Controls
  document.getElementById('voicelab-select')?.addEventListener('change', updateVoiceLabSelection);
  document.getElementById('btn-vl-native-audio')?.addEventListener('click', playVoiceLabNative);
  document.getElementById('btn-vl-record')?.addEventListener('click', toggleVoiceLabRecord);
  document.getElementById('btn-vl-play-user')?.addEventListener('click', playUserVoice);
}

// --------------------------------------------------------------------------
// AI NATURAL PHRASE GENERATOR
// --------------------------------------------------------------------------
function openAiModal() {
  document.getElementById('modal-ai')?.classList.add('active');
  const input = document.getElementById('ai-input-prompt');
  if (input) {
    input.focus();
  }
}

function closeAiModal() {
  document.getElementById('modal-ai')?.classList.remove('active');
}

function generateAiPhrases() {
  const promptInput = document.getElementById('ai-input-prompt');
  const query = promptInput?.value.toLowerCase().trim() || '';
  const resultsContainer = document.getElementById('ai-results-container');
  if (!resultsContainer) return;

  if (!query) {
    showToast('Vui lòng nhập ý bạn muốn nói bằng tiếng Việt!', 'info');
    return;
  }

  // Find matches in AI Natural Patterns
  let matchedPattern = AI_NATURAL_PATTERNS.find(pattern => 
    pattern.keywords.some(kw => query.includes(kw.toLowerCase()))
  );

  let suggestions = [];
  if (matchedPattern) {
    if (matchedPattern.casual) suggestions.push(matchedPattern.casual);
    if (matchedPattern.polite) suggestions.push(matchedPattern.polite);
  } else {
    // Intelligent Fallback Generator for any custom text
    suggestions.push({
      jp: `${promptInput.value}って日本語で何て言う？`,
      ruby: `${escapeHtml(promptInput.value)}って<ruby>日本語<rt>にほんご</rt></ruby>で<ruby>何<rt>なん</rt></ruby>て<ruby>言<rt>い</rt></ruby>う？`,
      romaji: `...tte nihongo de nante iu?`,
      vn: `Cụm từ: "${promptInput.value}" trong tiếng Nhật giao tiếp`,
      note: "Mẹo: Bạn có thể bấm 'Thêm vào sổ tay' và chỉnh sửa thêm chữ Kanji/Romaji cụ thể.",
      level: "casual", category: "casual", situation: "Giao tiếp hỏi đáp tự nhiên"
    });
  }

  resultsContainer.style.display = 'flex';
  resultsContainer.innerHTML = suggestions.map((item, idx) => {
    const levelName = getLevelName(item.level);
    const levelClass = `tag-${item.level || 'casual'}`;
    return `
      <div class="ai-suggestion-card">
        <div class="ai-suggestion-header">
          <span class="tag-badge ${levelClass}">${levelName}</span>
          <button class="btn btn-audio" style="width:34px; height:34px; font-size:0.9rem;" onclick="speakJapanese('${escapeQuote(item.jp)}')">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>
        <div style="font-family:var(--font-jp); font-size:1.3rem; font-weight:700; margin-bottom:0.35rem; color:var(--text-main);">
          ${item.ruby}
        </div>
        <div class="romaji-text" style="font-size:0.8rem; margin-bottom:0.25rem;">${item.romaji}</div>
        <div style="font-size:0.95rem; font-weight:600; color:var(--text-main); margin-bottom:0.4rem;">${item.vn}</div>
        <div style="font-size:0.75rem; color:var(--text-dim); line-height:1.4; margin-bottom:0.75rem;">
          <i class="fa-solid fa-lightbulb" style="color:var(--accent-gold); margin-right:4px;"></i> ${item.note}
        </div>
        <button class="btn btn-primary" style="width:100%; font-size:0.8rem; padding:0.45rem 0.8rem;" onclick="saveAiGeneratedPhrase(${idx})">
          <i class="fa-solid fa-plus"></i> Lưu câu này vào sổ tay
        </button>
      </div>
    `;
  }).join('');

  window._currentAiSuggestions = suggestions;
}

window.saveAiGeneratedPhrase = function(index) {
  if (window._currentAiSuggestions && window._currentAiSuggestions[index]) {
    const item = window._currentAiSuggestions[index];
    const newPhrase = {
      id: 'p_' + Date.now(),
      japanese: item.jp.replace(/\[([^\|\]]+)\|([^\]]+)\]/g, '$1'),
      ruby: item.ruby,
      romaji: item.romaji,
      vietnamese: item.vn,
      category: item.category || 'casual',
      level: item.level || 'casual',
      situation: item.situation || '',
      note: item.note || '',
      favorite: true,
      history: []
    };
    STATE.phrases.unshift(newPhrase);
    savePhrasesToStorage();
    renderPhrases();
    closeAiModal();
    showToast('Đã lưu câu do AI gợi ý vào sổ tay cá nhân! ⭐', 'success');
  }
};

// --------------------------------------------------------------------------
// TAB SWITCHING
// --------------------------------------------------------------------------
function switchTab(tabId) {
  STATE.currentTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-content').forEach(c => {
    c.style.display = 'none';
    c.classList.remove('active');
  });

  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) {
    activeContent.style.display = 'block';
    activeContent.classList.add('active');
  }

  if (tabId === 'flashcard') {
    startFlashcardSession();
  } else if (tabId === 'shadowing') {
    updateShadowDisplay();
  } else if (tabId === 'voicelab') {
    populateVoiceLabDropdown();
  } else if (tabId === 'phrasebook') {
    if (STATE.isShadowPlaying) stopShadowPlayer();
  }
}

// --------------------------------------------------------------------------
// PHRASEBOOK RENDERING & CARDS
// --------------------------------------------------------------------------
function renderPhrases() {
  const container = document.getElementById('phrase-grid');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

  let filtered = STATE.phrases.filter(item => {
    if (STATE.currentCat === 'favorite' && !item.favorite) return false;
    if (STATE.currentCat !== 'all' && STATE.currentCat !== 'favorite' && item.category !== STATE.currentCat) return false;
    if (STATE.currentLevel !== 'all' && item.level !== STATE.currentLevel) return false;

    if (STATE.searchQuery) {
      const matchJp = item.japanese.toLowerCase().includes(STATE.searchQuery);
      const matchVn = item.vietnamese.toLowerCase().includes(STATE.searchQuery);
      const matchRomaji = (item.romaji || '').toLowerCase().includes(STATE.searchQuery);
      const matchSit = (item.situation || '').toLowerCase().includes(STATE.searchQuery);
      return matchJp || matchVn || matchRomaji || matchSit;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = filtered.map(phrase => {
    const rubyHtml = phrase.ruby || parseRubySyntax(phrase.japanese);
    const levelBadgeClass = `tag-${phrase.level || 'casual'}`;
    const levelName = getLevelName(phrase.level);
    const categoryName = getCategoryName(phrase.category);

    return `
      <div class="phrase-card" data-id="${phrase.id}">
        <div>
          <div class="card-top">
            <div class="card-tags">
              <span class="tag-badge ${levelBadgeClass}">${levelName}</span>
              <span class="tag-badge tag-category">${categoryName}</span>
            </div>
            <button class="card-favorite-btn ${phrase.favorite ? 'favorited' : ''}" onclick="toggleFavorite('${phrase.id}')" title="Yêu thích">
              <i class="${phrase.favorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
          </div>

          <div class="jp-sentence-wrap">
            <div class="jp-sentence">${rubyHtml}</div>
          </div>

          ${phrase.romaji ? `<div class="romaji-text">${escapeHtml(phrase.romaji)}</div>` : ''}
          <div class="vietnamese-text">${escapeHtml(phrase.vietnamese)}</div>

          ${phrase.situation ? `
            <div class="situation-box">
              <strong>Ngữ cảnh:</strong> ${escapeHtml(phrase.situation)}
            </div>
          ` : ''}

          ${phrase.note ? `
            <div class="note-box">
              <i class="fa-solid fa-lightbulb" style="color:var(--accent-gold); margin-right:4px;"></i> ${escapeHtml(phrase.note)}
            </div>
          ` : ''}
        </div>

        <div class="card-actions">
          <div class="audio-controls-group">
            <button class="btn-audio" onclick="speakJapanese('${escapeQuote(phrase.japanese)}')" title="Phát âm chuẩn (Native TTS)">
              <i class="fa-solid fa-volume-high"></i>
            </button>
            <button class="btn-record" onclick="openVoiceLabForPhrase('${phrase.id}')" title="Thu âm so sánh giọng với câu này">
              <i class="fa-solid fa-microphone"></i>
            </button>
          </div>

          <div class="card-extra-actions">
            <button class="btn-card-small" onclick="openPhraseModal('${phrase.id}')" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-card-small" onclick="deletePhrase('${phrase.id}')" title="Xóa câu này"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateCategoryCounts() {
  const allCount = STATE.phrases.length;
  const favCount = STATE.phrases.filter(p => p.favorite).length;

  const countAllEl = document.getElementById('count-all');
  const countFavEl = document.getElementById('count-fav');
  if (countAllEl) countAllEl.innerText = allCount;
  if (countFavEl) countFavEl.innerText = favCount;
}

function getLevelName(lvl) {
  switch (lvl) {
    case 'casual': return 'Bạn bè (Casual)';
    case 'polite': return 'Lịch sự (Polite)';
    case 'business': return 'Công sở (Keigo)';
    case 'slang': return 'Tiếng lóng (Slang)';
    default: return 'Giao tiếp';
  }
}

function getCategoryName(cat) {
  switch (cat) {
    case 'izakaya': return '🍻 Quán nhậu';
    case 'restaurant': return '🍜 Quán ăn';
    case 'konbini': return '🏪 Combini';
    case 'shopping': return '🛍️ Mua sắm';
    case 'casual': return '💬 Tán gẫu';
    case 'work': return '💼 Công việc';
    default: return '📌 Đời sống';
  }
}

// --------------------------------------------------------------------------
// MODAL & PHRASE ACTIONS (ADD / EDIT / DELETE)
// --------------------------------------------------------------------------
function openPhraseModal(phraseId = null) {
  const modal = document.getElementById('modal-phrase');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('phrase-form');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('form-ruby-preview').innerHTML = '<span style="color: var(--text-dim); font-size: 0.85rem;">Xem trước hiển thị Furigana sẽ xuất hiện tại đây...</span>';

  if (phraseId) {
    const item = STATE.phrases.find(p => p.id === phraseId);
    if (item) {
      title.innerText = 'Chỉnh sửa câu tiếng Nhật';
      document.getElementById('form-id').value = item.id;
      document.getElementById('form-japanese').value = item.ruby ? revertRubyToQuickFormat(item.ruby) : item.japanese;
      document.getElementById('form-romaji').value = item.romaji || '';
      document.getElementById('form-vietnamese').value = item.vietnamese || '';
      document.getElementById('form-category').value = item.category || 'casual';
      document.getElementById('form-level').value = item.level || 'casual';
      document.getElementById('form-situation').value = item.situation || '';
      document.getElementById('form-note').value = item.note || '';

      const previewEl = document.getElementById('form-ruby-preview');
      previewEl.innerHTML = item.ruby || parseRubySyntax(item.japanese);
    }
  } else {
    title.innerText = 'Thêm câu tiếng Nhật mới';
    document.getElementById('form-id').value = '';
  }

  modal.classList.add('active');
}

function closePhraseModal() {
  document.getElementById('modal-phrase')?.classList.remove('active');
}

function revertRubyToQuickFormat(rubyHtml) {
  if (!rubyHtml) return '';
  return rubyHtml.replace(/<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g, '[$1|$2]');
}

function handlePhraseFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('form-id').value;
  const rawJp = document.getElementById('form-japanese').value.trim();
  const romaji = document.getElementById('form-romaji').value.trim();
  const vn = document.getElementById('form-vietnamese').value.trim();
  const category = document.getElementById('form-category').value;
  const level = document.getElementById('form-level').value;
  const situation = document.getElementById('form-situation').value.trim();
  const note = document.getElementById('form-note').value.trim();

  if (!rawJp || !vn) {
    showToast('Vui lòng nhập câu tiếng Nhật và dịch nghĩa tiếng Việt!', 'info');
    return;
  }

  const rubyHtml = parseRubySyntax(rawJp);
  const cleanJapanese = rawJp.replace(/\[([^\|\]]+)\|([^\]]+)\]/g, '$1');

  if (id) {
    const index = STATE.phrases.findIndex(p => p.id === id);
    if (index !== -1) {
      STATE.phrases[index] = {
        ...STATE.phrases[index],
        japanese: cleanJapanese,
        ruby: rubyHtml,
        romaji: romaji,
        vietnamese: vn,
        category: category,
        level: level,
        situation: situation,
        note: note
      };
      showToast('Đã cập nhật câu thành công!', 'success');
    }
  } else {
    const newPhrase = {
      id: 'p_' + Date.now(),
      japanese: cleanJapanese,
      ruby: rubyHtml,
      romaji: romaji,
      vietnamese: vn,
      category: category,
      level: level,
      situation: situation,
      note: note,
      favorite: false,
      history: []
    };
    STATE.phrases.unshift(newPhrase);
    showToast('Đã thêm câu mới vào sổ tay!', 'success');
  }

  savePhrasesToStorage();
  renderPhrases();
  closePhraseModal();
}

function toggleFavorite(id) {
  const phrase = STATE.phrases.find(p => p.id === id);
  if (phrase) {
    phrase.favorite = !phrase.favorite;
    savePhrasesToStorage();
    renderPhrases();
    showToast(phrase.favorite ? 'Đã thêm vào mục Yêu thích ⭐' : 'Đã bỏ khỏi mục Yêu thích', 'info');
  }
}

function deletePhrase(id) {
  if (confirm('Bạn có chắc muốn xóa câu này khỏi sổ tay không?')) {
    STATE.phrases = STATE.phrases.filter(p => p.id !== id);
    savePhrasesToStorage();
    renderPhrases();
    showToast('Đã xóa câu thành công.', 'info');
  }
}

// --------------------------------------------------------------------------
// FLASHCARD SRS PRACTICE MODE
// --------------------------------------------------------------------------
function startFlashcardSession() {
  STATE.fcList = [...STATE.phrases];
  if (STATE.fcList.length === 0) return;
  STATE.fcIndex = 0;
  STATE.isFlipped = false;
  renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
  if (STATE.fcList.length === 0) return;
  const item = STATE.fcList[STATE.fcIndex];
  const cardEl = document.getElementById('flashcard-element');
  cardEl.classList.remove('flipped');
  STATE.isFlipped = false;

  document.getElementById('fc-counter').innerText = `${STATE.fcIndex + 1} / ${STATE.fcList.length}`;
  const fillPercent = ((STATE.fcIndex + 1) / STATE.fcList.length) * 100;
  document.getElementById('fc-progress-fill').style.width = `${fillPercent}%`;

  document.getElementById('fc-situation').innerText = `Ngữ cảnh: ${item.situation || getCategoryName(item.category)}`;
  document.getElementById('fc-vietnamese').innerText = item.vietnamese;
  document.getElementById('fc-japanese').innerHTML = item.ruby || parseRubySyntax(item.japanese);
  document.getElementById('fc-romaji').innerText = item.romaji || '';
  document.getElementById('fc-note').innerText = item.note || 'Hãy thử nói to câu tiếng Nhật theo phản xạ trước khi lật thẻ!';
}

function flipFlashcard() {
  const cardEl = document.getElementById('flashcard-element');
  STATE.isFlipped = !STATE.isFlipped;
  cardEl.classList.toggle('flipped', STATE.isFlipped);
  
  if (STATE.isFlipped && STATE.fcList[STATE.fcIndex]) {
    speakJapanese(STATE.fcList[STATE.fcIndex].japanese);
  }
}

function nextFlashcard() {
  if (STATE.fcIndex < STATE.fcList.length - 1) {
    STATE.fcIndex++;
  } else {
    STATE.fcIndex = 0;
    showToast('Bạn đã hoàn thành 1 vòng ôn tập! 🎉', 'success');
  }
  renderCurrentFlashcard();
}

function prevFlashcard() {
  if (STATE.fcIndex > 0) {
    STATE.fcIndex--;
    renderCurrentFlashcard();
  }
}

// --------------------------------------------------------------------------
// HANDS-FREE AUTO-SHADOWING PLAYER
// --------------------------------------------------------------------------
function updateShadowDisplay() {
  if (STATE.phrases.length === 0) return;
  const current = STATE.phrases[STATE.shadowIndex] || STATE.phrases[0];
  document.getElementById('shadow-jp').innerHTML = current.ruby || parseRubySyntax(current.japanese);
  document.getElementById('shadow-romaji').innerText = current.romaji || '';
  document.getElementById('shadow-vn').innerText = current.vietnamese;
}

function toggleShadowPlayer() {
  if (STATE.isShadowPlaying) {
    stopShadowPlayer();
  } else {
    startShadowPlayer();
  }
}

function startShadowPlayer() {
  STATE.isShadowPlaying = true;
  document.getElementById('shadow-player-card')?.classList.add('playing');
  document.getElementById('shadow-play-text').innerText = 'Tạm dừng';
  playShadowStep();
}

function stopShadowPlayer() {
  STATE.isShadowPlaying = false;
  if (STATE.shadowTimer) clearTimeout(STATE.shadowTimer);
  document.getElementById('shadow-player-card')?.classList.remove('playing');
  document.getElementById('shadow-play-text').innerText = 'Tiếp tục phát';
  if (currentAudioElement) currentAudioElement.pause();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function playShadowStep() {
  if (!STATE.isShadowPlaying || STATE.phrases.length === 0) return;
  updateShadowDisplay();

  const phrase = STATE.phrases[STATE.shadowIndex];
  speakJapanese(phrase.japanese, STATE.ttsSpeed, () => {
    if (!STATE.isShadowPlaying) return;
    STATE.shadowTimer = setTimeout(() => {
      STATE.shadowIndex = (STATE.shadowIndex + 1) % STATE.phrases.length;
      playShadowStep();
    }, 2500);
  });
}

function nextShadowPhrase() {
  STATE.shadowIndex = (STATE.shadowIndex + 1) % STATE.phrases.length;
  updateShadowDisplay();
  if (STATE.isShadowPlaying) {
    if (STATE.shadowTimer) clearTimeout(STATE.shadowTimer);
    playShadowStep();
  }
}

function prevShadowPhrase() {
  STATE.shadowIndex = (STATE.shadowIndex - 1 + STATE.phrases.length) % STATE.phrases.length;
  updateShadowDisplay();
  if (STATE.isShadowPlaying) {
    if (STATE.shadowTimer) clearTimeout(STATE.shadowTimer);
    playShadowStep();
  }
}

// --------------------------------------------------------------------------
// VOICE LAB (RECORD & PITCH COMPARISON)
// --------------------------------------------------------------------------
function populateVoiceLabDropdown() {
  const select = document.getElementById('voicelab-select');
  if (!select) return;

  select.innerHTML = STATE.phrases.map((p) => {
    return `<option value="${p.id}">${p.vietnamese} (${p.japanese})</option>`;
  }).join('');

  updateVoiceLabSelection();
}

function openVoiceLabForPhrase(phraseId) {
  switchTab('voicelab');
  const select = document.getElementById('voicelab-select');
  if (select) {
    select.value = phraseId;
    updateVoiceLabSelection();
  }
}

function updateVoiceLabSelection() {
  const select = document.getElementById('voicelab-select');
  if (!select) return;
  const phrase = STATE.phrases.find(p => p.id === select.value) || STATE.phrases[0];
  if (phrase) {
    document.getElementById('vl-jp').innerHTML = phrase.ruby || parseRubySyntax(phrase.japanese);
    document.getElementById('vl-romaji').innerText = phrase.romaji || '';
    document.getElementById('vl-vn').innerText = phrase.vietnamese;
    document.getElementById('btn-vl-play-user').style.display = 'none';
    document.getElementById('vl-feedback-box').innerHTML = 'Bấm <strong>Nghe bản xứ</strong> để lấy mẫu ngữ điệu, sau đó bấm <strong>Thu âm</strong> để bắt chước theo!';
  }
}

function playVoiceLabNative() {
  const select = document.getElementById('voicelab-select');
  const phrase = STATE.phrases.find(p => p.id === select?.value);
  if (phrase) {
    speakJapanese(phrase.japanese);
  }
}

async function toggleVoiceLabRecord() {
  const recordBtn = document.getElementById('btn-vl-record');
  const recordText = document.getElementById('vl-record-text');
  const feedbackBox = document.getElementById('vl-feedback-box');

  if (!STATE.isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      STATE.mediaRecorder = new MediaRecorder(stream);

      STATE.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      STATE.mediaRecorder.onstop = () => {
        STATE.recordedAudioBlob = new Blob(chunks, { type: 'audio/webm' });
        STATE.recordedAudioUrl = URL.createObjectURL(STATE.recordedAudioBlob);
        document.getElementById('btn-vl-play-user').style.display = 'inline-flex';
        feedbackBox.innerHTML = '<span style="color:var(--accent-green)">✅ Đã thu âm xong!</span> Bấm <strong>"Nghe lại giọng bạn"</strong> hoặc nghe xen kẽ với <strong>"Nghe bản xứ"</strong> để chỉnh ngữ điệu nhé.';
        stream.getTracks().forEach(track => track.stop());
      };

      STATE.mediaRecorder.start();
      STATE.isRecording = true;
      recordBtn.classList.add('recording');
      recordText.innerText = 'Đang thu... (Bấm dừng)';
      feedbackBox.innerHTML = '<span style="color:#ef4444">🔴 Đang thu âm giọng bạn... Hãy phát âm câu tiếng Nhật to rõ ràng!</span>';
    } catch (err) {
      showToast('Không thể truy cập Micro. Hãy cấp quyền truy cập micro cho trình duyệt.', 'info');
    }
  } else {
    if (STATE.mediaRecorder && STATE.mediaRecorder.state !== 'inactive') {
      STATE.mediaRecorder.stop();
    }
    STATE.isRecording = false;
    recordBtn.classList.remove('recording');
    recordText.innerText = 'Bấm để thu âm lại';
  }
}

function playUserVoice() {
  if (STATE.recordedAudioUrl) {
    const audio = new Audio(STATE.recordedAudioUrl);
    audio.play();
  }
}

// --------------------------------------------------------------------------
// BACKUP EXPORT & IMPORT
// --------------------------------------------------------------------------
function exportPhrasesJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(STATE.phrases, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `nihongo_flow_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Đã xuất file sao lưu dữ liệu cá nhân thành công! 📁', 'success');
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData)) {
        STATE.phrases = importedData;
        savePhrasesToStorage();
        renderPhrases();
        showToast(`Đã khôi phục thành công ${importedData.length} câu vào sổ tay! 🎉`, 'success');
      } else {
        showToast('File không đúng định dạng sao lưu của Nihongo Flow.', 'info');
      }
    } catch (err) {
      showToast('Lỗi đọc file JSON.', 'info');
    }
  };
  reader.readAsText(file);
}

// --------------------------------------------------------------------------
// TOAST NOTIFICATION UTILITY
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeQuote(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
