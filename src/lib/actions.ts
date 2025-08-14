"use server";

import { smartTranslate, SmartTranslateInput } from "@/ai/flows/smart-translate";
import { getTranslationSuggestions, TranslationSuggestionsInput } from "@/ai/flows/translation-suggestions";
import { z } from "zod";
import type { TranslationResult } from "./types";

const formSchema = z.object({
  originalText: z.string().min(1, "Text is required."),
  sourceLang: z.string(),
  targetLang: z.string(),
  tone: z.string(),
});

export async function translateTextAction(formData: FormData): Promise<{data: TranslationResult | null, error: string | null}> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = formSchema.safeParse(rawFormData);
  
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
    
    // For demonstration, we'll call AI flows and return mock data structure.
    // In a real scenario, you would await the results from the AI flows.
    
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
