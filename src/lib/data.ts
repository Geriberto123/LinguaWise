// Mock data for UI development

export const mockLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ru', label: 'Russian' },
];

export const mockTones = [
  { value: 'formal', label: 'Formal' },
  { value: 'informal', label: 'Informal' },
  { value: 'technical', label: 'Technical' },
  { value: 'casual', label: 'Casual' },
];

export const mockHistory = [
  {
    id: "1",
    originalText: "Hello, how are you?",
    translatedText: "¿Hola, cómo estás?",
    sourceLang: "en",
    targetLang: "es",
    timestamp: "2024-05-20",
  },
  {
    id: "2",
    originalText: "The quick brown fox jumps over the lazy dog.",
    translatedText: "El rápido zorro marrón salta sobre el perro perezoso.",
    sourceLang: "en",
    targetLang: "es",
    timestamp: "2024-05-19",
  },
  {
    id: "3",
    originalText: "I love learning new languages.",
    translatedText: "J'adore apprendre de nouvelles langues.",
    sourceLang: "en",
    targetLang: "fr",
    timestamp: "2024-05-18",
  },
  {
    id: "4",
    originalText: "Das ist ein Prototyp.",
    translatedText: "This is a prototype.",
    sourceLang: "de",
    targetLang: "en",
    timestamp: "2024-05-17",
  },
];

export const mockDictionary = [
    {
        term: "Prototype",
        translation: "Prototipo",
        context: "In software development, a prototype is an early sample, model, or release of a product built to test a concept or process.",
        language: "Spanish",
    },
    {
        term: "AI",
        translation: "IA (Inteligencia Artificial)",
        context: "Abbreviation for Artificial Intelligence.",
        language: "Spanish",
    },
    {
        term: "User Interface",
        translation: "Interface utilisateur",
        context: "The means by which the user and a computer system interact.",
        language: "French",
    },
    {
        term: "Backend",
        translation: "Backend",
        context: "The part of a computer system or application that is not directly accessed by the user, typically responsible for storing and manipulating data.",
        language: "German",
    }
]
