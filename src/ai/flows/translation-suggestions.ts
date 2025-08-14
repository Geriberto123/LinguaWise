'use server';

/**
 * @fileOverview Provides contextual translation suggestions, alternative translations, and cultural notes.
 *
 * - getTranslationSuggestions - A function that handles the translation suggestions process.
 * - TranslationSuggestionsInput - The input type for the getTranslationSuggestions function.
 * - TranslationSuggestionsOutput - The return type for the getTranslationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslationSuggestionsInputSchema = z.object({
  originalText: z.string().describe('The original text to be translated.'),
  sourceLang: z.string().describe('The source language of the text.'),
  targetLang: z.string().describe('The target language for translation.'),
  tone: z.string().describe('The desired tone of the translation (formal, informal, technical, casual).'),
});
export type TranslationSuggestionsInput = z.infer<typeof TranslationSuggestionsInputSchema>;

const TranslationSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of contextual translation suggestions.'),
  alternatives: z.array(z.string()).describe('An array of alternative translations.'),
  culturalNotes: z.string().describe('Cultural notes relevant to the translation.'),
});
export type TranslationSuggestionsOutput = z.infer<typeof TranslationSuggestionsOutputSchema>;

export async function getTranslationSuggestions(input: TranslationSuggestionsInput): Promise<TranslationSuggestionsOutput> {
  return translationSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translationSuggestionsPrompt',
  input: {schema: TranslationSuggestionsInputSchema},
  output: {schema: TranslationSuggestionsOutputSchema},
  prompt: `You are an expert translator providing suggestions for improving translations.

  Original Text: {{{originalText}}}
  Source Language: {{{sourceLang}}}
  Target Language: {{{targetLang}}}
  Tone: {{{tone}}}

  Provide a list of contextual translation suggestions, alternative translations, and any relevant cultural notes.
  Format your response as a JSON object matching the TranslationSuggestionsOutputSchema schema.
  `,
});

const translationSuggestionsFlow = ai.defineFlow(
  {
    name: 'translationSuggestionsFlow',
    inputSchema: TranslationSuggestionsInputSchema,
    outputSchema: TranslationSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
