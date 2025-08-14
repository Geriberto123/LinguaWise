export interface TranslationResult {
  translatedText: string;
  alternatives: string[];
  culturalNotes: string;
}

export interface TranslationHistoryItem {
  id?: string; // Firestore ID, optional before creation
  userId: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  tone: string;
  timestamp: string; // Using string for simplicity, would be timestamp in Firestore
}

export interface DictionaryEntry {
  id?: string; // Firestore ID, optional before creation
  userId: string;
  term: string;
  translation: string;
  context: string;
  language: string;
}

export interface UserSettings {
    nativeLanguage: string;
    defaultTargetLanguage: string;
    defaultTone: string;
    saveHistory: boolean;
}
