
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { mockLanguages } from '@/lib/data';
import type { DictionaryEntry } from '@/lib/types';

interface AddTermDialogProps {
  onAddTerm: (newTerm: Omit<DictionaryEntry, 'userId' | 'id'>) => void;
}

export function AddTermDialog({ onAddTerm }: AddTermDialogProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!term.trim() || !translation.trim() || !language) {
      setError("Term, Translation, and Language are required.");
      return;
    }
    setError('');
    const selectedLanguage = mockLanguages.find(l => l.value === language);
    onAddTerm({ term, translation, context, language: selectedLanguage?.label || '' });
    setOpen(false);
    // Reset fields
    setTerm('');
    setTranslation('');
    setContext('');
    setLanguage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Term
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Term</DialogTitle>
          <DialogDescription>
            Add a new term to your custom dictionary. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">
              Term
            </Label>
            <Input id="term" value={term} onChange={(e) => setTerm(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="translation" className="text-right">
              Translation
            </Label>
            <Input id="translation" value={translation} onChange={(e) => setTranslation(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              Language
            </Label>
            <Select onValueChange={setLanguage} value={language}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a language" />
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="context" className="text-right">
              Context
            </Label>
            <Textarea id="context" value={context} onChange={(e) => setContext(e.target.value)} className="col-span-3" />
          </div>
          {error && <p className="text-sm text-destructive text-center col-span-4">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAdd}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
