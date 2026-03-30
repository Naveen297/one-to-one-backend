import translate from "@vitalets/google-translate-api";

/**
 * Translates text from source language to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'en', 'uk')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang) => {
  try {
    if (!text || !targetLang) {
      throw new Error("Text and target language are required");
    }

    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text if translation fails
    return text;
  }
};

/**
 * Language codes mapping
 */
export const LANGUAGES = {
  ENGLISH: "en",
  UKRAINIAN: "uk",
  SPANISH: "es",
  FRENCH: "fr",
  GERMAN: "de",
  ITALIAN: "it",
  PORTUGUESE: "pt",
  RUSSIAN: "ru",
  CHINESE: "zh-cn",
  JAPANESE: "ja",
  KOREAN: "ko",
  ARABIC: "ar",
  HINDI: "hi",
};

/**
 * Get language name from code
 */
export const getLanguageName = (code) => {
  const languageNames = {
    en: "English",
    uk: "Ukrainian",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    "zh-cn": "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
    hi: "Hindi",
  };
  return languageNames[code] || code;
};
