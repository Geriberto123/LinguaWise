export interface TranslationResult {
  translatedText: string;
  alternatives: string[];
  culturalNotes: string;
}

export interface TranslationHistoryItem {
  id: string;
  userId: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  tone: string;
  timestamp: string; // Using string for simplicity, would be timestamp in Firestore
}

export interface DictionaryEntry {
  userId: string;
  term: string;
  translation: string;
  context: string;
  language: string;
}
