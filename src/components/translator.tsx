
"use client"

import { useState, useTransition, useEffect } from "react"
import {
  ArrowRightLeft,
  Clipboard,
  ClipboardCheck,
  Languages,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  X,
  Sparkles,
  BookCheck,
  Heart
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { mockLanguages, mockTones } from "@/lib/data"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { translateTextAction } from "@/lib/actions"
import type { TranslationResult, TranslationHistoryItem } from "@/lib/types"

const MAX_CHARACTERS = 5000;

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(error);
        }
    }, [key, state]);

    return [state, setState];
}


export default function Translator() {
  const [inputText, setInputText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  
  const [defaultTargetLang, setDefaultTargetLanguage] = usePersistentState("defaultTargetLanguage", "es");
  const [defaultTone, setDefaultTone] = usePersistentState("defaultTone", "formal");
  const [saveHistory, setSaveHistory] = usePersistentState("saveHistory", true);
  const [, setHistory] = usePersistentState<TranslationHistoryItem[]>("translationHistory", []);

  const [targetLang, setTargetLang] = useState(defaultTargetLang)
  const [tone, setTone] = useState(defaultTone)

  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setTargetLang(defaultTargetLang);
  }, [defaultTargetLang]);

  useEffect(() => {
    setTone(defaultTone);
  }, [defaultTone]);

  const handleSwapLanguages = () => {
    const tempLang = sourceLang
    setSourceLang(targetLang)
    setTargetLang(tempLang)
  }

  const handleClearText = () => {
    setInputText("")
    setResult(null)
  }

  const handleCopyToClipboard = () => {
    if (!result?.translatedText) return
    navigator.clipboard.writeText(result.translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copied to clipboard!" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append("originalText", inputText)
      formData.append("sourceLang", sourceLang)
      formData.append("targetLang", targetLang)
      formData.append("tone", tone)

      const response = await translateTextAction(formData)
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        setResult(response.data);
        if (saveHistory && response.data) {
          const newHistoryItem: TranslationHistoryItem = {
            id: new Date().toISOString(),
            userId: 'user_placeholder',
            originalText: inputText,
            translatedText: response.data.translatedText,
            sourceLang,
            targetLang,
            tone,
            timestamp: new Date().toISOString(),
          };
          setHistory(prev => [newHistoryItem, ...prev]);
        }
      }
    })
  }
  
  const charCount = inputText.length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Translate Text</CardTitle>
          <CardDescription>
            Enter your text, choose languages, and set the tone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Source Language" />
                </SelectTrigger>
                <SelectContent>
                  {mockLanguages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSwapLanguages}
                  aria-label="Swap languages"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>
              </div>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Target Language" />
                </SelectTrigger>
                <SelectContent>
                  {mockLanguages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Textarea
                placeholder="Enter text to translate..."
                className="min-h-[150px] resize-y pr-12"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={MAX_CHARACTERS}
              />
              {inputText && (
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={handleClearText}
                    aria-label="Clear text"
                 >
                    <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Tone" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockTones.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                            {t.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>{charCount} / {MAX_CHARACTERS}</span>
            </div>

            <Button type="submit" disabled={isPending || !inputText.trim()}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Languages className="mr-2 h-4 w-4" />
              )}
              Translate
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
          <CardDescription>
            Your translation will appear below.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {isPending && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isPending && result && (
            <div className="space-y-4">
              <div className="relative rounded-md border bg-muted p-4">
                <p className="text-foreground">{result.translatedText}</p>
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyToClipboard}
                    aria-label="Copy translation"
                  >
                    {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Text to speech">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {result.alternatives && result.alternatives.length > 0 && (
                  <AccordionItem value="alternatives">
                    <AccordionTrigger>
                      <Sparkles className="mr-2 h-4 w-4 text-accent" />
                      Alternative Translations
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc space-y-2 pl-6">
                        {result.alternatives.map((alt, index) => (
                          <li key={index}>{alt}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {result.culturalNotes && (
                  <AccordionItem value="cultural-notes">
                    <AccordionTrigger>
                      <BookCheck className="mr-2 h-4 w-4 text-accent" />
                      Cultural Notes
                    </AccordionTrigger>
                    <AccordionContent>
                      {result.culturalNotes}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>

              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Good
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Bad
                  </Button>
                </div>
                <Button variant="secondary" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Save to Favorites
                </Button>
              </div>
            </div>
          )}
           {!isPending && !result && (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <Languages className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Your translation will show up here</p>
                  <p className="text-sm">Start by typing in the box on the left.</p>
              </div>
           )}
        </CardContent>
      </Card>
    </div>
  )
}

    