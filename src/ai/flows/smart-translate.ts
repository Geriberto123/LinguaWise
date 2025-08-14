// A Genkit flow for intelligently translating text with tone adjustment.

'use server';

/**
 * @fileOverview A smart translation AI agent that translates text and adjusts the tone of the translation.
 *
 * - smartTranslate - A function that handles the smart translation process.
 * - SmartTranslateInput - The input type for the smartTranslate function.
 * - SmartTranslateOutput - The return type for the smartTranslate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTranslateInputSchema = z.object({
  originalText: z.string().describe('The text to be translated.'),
  sourceLang: z.string().describe('The language of the original text.'),
  targetLang: z.string().describe('The desired language for the translation.'),
  tone: z
    .enum(['formal', 'informal', 'technical', 'casual'])
    .describe('The desired tone of the translation.'),
  userTonePreference: z.string().optional().describe('The user\s preferred tone.'),
});
export type SmartTranslateInput = z.infer<typeof SmartTranslateInputSchema>;

const SmartTranslateOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type SmartTranslateOutput = z.infer<typeof SmartTranslateOutputSchema>;

export async function smartTranslate(input: SmartTranslateInput): Promise<SmartTranslateOutput> {
  return smartTranslateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTranslatePrompt',
  input: {schema: SmartTranslateInputSchema},
  output: {schema: SmartTranslateOutputSchema},
  prompt: `You are a highly skilled translator, able to translate text from one language to another while maintaining the appropriate tone.

Translate the following text from {{sourceLang}} to {{targetLang}}, using a tone that is both {{tone}} and aligned with the user's general tone preference of {{userTonePreference}}:

{{originalText}}

Ensure that the translation is accurate, grammatically correct, and culturally appropriate. Pay attention to nuances in language and adapt the translation accordingly.
`,
});

const smartTranslateFlow = ai.defineFlow(
  {
    name: 'smartTranslateFlow',
    inputSchema: SmartTranslateInputSchema,
    outputSchema: SmartTranslateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
