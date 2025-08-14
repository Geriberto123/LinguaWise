// GrammarCheck flow to identify and suggest corrections for grammar errors in translated text.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GrammarCheckInputSchema = z.object({
  text: z.string().describe('The translated text to check for grammar errors.'),
  sourceLang: z.string().describe('The source language of the original text.'),
  targetLang: z.string().describe('The target language of the translated text.'),
});
export type GrammarCheckInput = z.infer<typeof GrammarCheckInputSchema>;

const GrammarCheckOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text with grammar improvements.'),
  suggestions: z.array(z.string()).describe('An array of suggested corrections.'),
});
export type GrammarCheckOutput = z.infer<typeof GrammarCheckOutputSchema>;

export async function checkGrammar(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  return grammarCheckFlow(input);
}

const grammarCheckPrompt = ai.definePrompt({
  name: 'grammarCheckPrompt',
  input: {schema: GrammarCheckInputSchema},
  output: {schema: GrammarCheckOutputSchema},
  prompt: `You are a grammar expert. Review the following text translated from {{sourceLang}} to {{targetLang}} for grammatical errors and suggest corrections.

Text: {{{text}}}

Respond with the corrected text and an array of suggestions.`,
});

const grammarCheckFlow = ai.defineFlow(
  {
    name: 'grammarCheckFlow',
    inputSchema: GrammarCheckInputSchema,
    outputSchema: GrammarCheckOutputSchema,
  },
  async input => {
    const {output} = await grammarCheckPrompt(input);
    return output!;
  }
);
