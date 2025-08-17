"use server";

import { smartTranslate, SmartTranslateInput } from "@/ai/flows/smart-translate";
import { getTranslationSuggestions, TranslationSuggestionsInput } from "@/ai/flows/translation-suggestions";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from "@/ai/flows/text-to-speech";
import { z } from "zod";
import type { TranslationResult } from "./types";

const translateFormSchema = z.object({
  originalText: z.string().min(1, "Text is required."),
  sourceLang: z.string(),
  targetLang: z.string(),
  tone: z.string(),
});

export async function translateTextAction(formData: FormData): Promise<{data: TranslationResult | null, error: string | null}> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = translateFormSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return { data: null, error: "Invalid input data." };
  }
  
  const { originalText, sourceLang, targetLang, tone } = validatedFields.data;

  try {
    const translationInput: SmartTranslateInput = {
      originalText,
      sourceLang,
      targetLang,
      tone: tone as 'formal' | 'informal' | 'technical' | 'casual',
      userTonePreference: 'neutral' // Placeholder
    };
    
    const suggestionsInput: TranslationSuggestionsInput = {
      originalText,
      sourceLang,
      targetLang,
      tone
    };
    
    const [translationResult, suggestionsResult] = await Promise.all([
      smartTranslate(translationInput),
      getTranslationSuggestions(suggestionsInput)
    ]);


    if (!translationResult.translatedText) {
        throw new Error("Translation failed.");
    }
    
    const result: TranslationResult = {
      translatedText: translationResult.translatedText,
      alternatives: suggestionsResult.alternatives,
      culturalNotes: suggestionsResult.culturalNotes,
    };
    
    return { data: result, error: null };

  } catch (error) {
    console.error("Translation action failed:", error);
    return { data: null, error: "An unexpected error occurred during translation." };
  }
}

export async function textToSpeechAction(text: string): Promise<{data: TextToSpeechOutput | null, error: string | null}> {
    if (!text) {
        return { data: null, error: "No text provided for speech synthesis." };
    }
    
    try {
        const result = await textToSpeech(text);
        return { data: result, error: null };
    } catch (error) {
        console.error("Text-to-speech action failed:", error);
        return { data: null, error: "An unexpected error occurred during speech synthesis." };
    }
}
