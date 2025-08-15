
"use client"

import {
  BookMarked,
  History,
  Languages,
  MoreHorizontal,
  Search,
  Settings,
  BarChart,
  Pencil,
  Trash2,
  Heart,
} from "lucide-react"
import { useSearchParams } from 'next/navigation'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { mockLanguages, mockTones } from "@/lib/data"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { AddTermDialog } from "./add-term-dialog"
import { ClearHistoryDialog } from "./clear-history-dialog"
import type { TranslationHistoryItem, DictionaryEntry, UserSettings, Favorite } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth"
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export function Dashboard() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const [activeTab, setActiveTab] = React.useState(tab || "statistics");
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])


  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);


  if (!isClient) {
      return null;
  }


  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="statistics"><BarChart className="mr-2 h-4 w-4" />Statistics</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
          <TabsTrigger value="favorites"><Heart className="mr-2 h-4 w-4" />Favorites</TabsTrigger>
          <TabsTrigger value="dictionary"><BookMarked className="mr-2 h-4 w-4" />Dictionary</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="statistics">
        <StatisticsTab />
      </TabsContent>
      <TabsContent value="history">
        <HistoryTab />
      </TabsContent>
       <TabsContent value="favorites">
        <FavoritesTab />
      </TabsContent>
      <TabsContent value="dictionary">
        <DictionaryTab />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  )
}

function useUserDocs<T extends { id?: string; userId?: string }>(
  collectionName: string,
  initialValue: T[]
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>(initialValue);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, collectionName), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));

      if (collectionName === 'translationHistory' && docs.length > 0) {
        (docs as TranslationHistoryItem[]).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      
      if (collectionName === 'favorites' && docs.length > 0) {
        (docs as Favorite[]).sort((a, b) => new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime());
      }


      setData(docs);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user, collectionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, loading, refetch: fetchData };
}


function StatisticsTab() {
  const { data: history, loading: loadingHistory } = useUserDocs<TranslationHistoryItem>("translationHistory", []);
  const { data: dictionary, loading: loadingDictionary } = useUserDocs<DictionaryEntry>("dictionary", []);
  const { data: favorites, loading: loadingFavorites } = useUserDocs<Favorite>("favorites", []);
  
  const stats = useMemo(() => {
    const wordsTranslated = history.reduce((acc, item) => acc + (item.originalText?.split(' ').length || 0), 0);
    
    const languageCounts = history.reduce((acc, item) => {
      const langLabel = mockLanguages.find(l => l.value === item.targetLang)?.label || item.targetLang;
      acc[langLabel] = (acc[langLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteLanguageLabel = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const langData = Object.entries(languageCounts).map(([name, count]) => ({
        name,
        count
    })).sort((a,b) => b.count - a.count).slice(0, 5);


    const usageData = history.reduce((acc, item) => {
        if (!item.timestamp) return acc;
        const month = new Date(item.timestamp).toLocaleString('default', { month: 'short' });
        const existingMonth = acc.find(d => d.name === month);
        if (existingMonth) {
            existingMonth.words += item.originalText?.split(' ').length || 0;
        } else {
            acc.push({ name: month, words: item.originalText?.split(' ').length || 0 });
        }
        return acc;
    }, [] as { name: string; words: number }[]).reverse();

    return { wordsTranslated, favoriteLanguageLabel, langData, usageData };
  }, [history]);
  
  if (loadingHistory || loadingDictionary || loadingFavorites) return <div>Loading statistics...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>
          An overview of your translation activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
                    <Languages className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{history.length}</div>
                    <p className="text-xs text-muted-foreground">Total translations made</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Words Translated</CardTitle>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.wordsTranslated}</div>
                    <p className="text-xs text-muted-foreground">Total words processed</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saved Favorites</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{favorites.length}</div>
                    <p className="text-xs text-muted-foreground">Favorite translations saved</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dictionary Terms</CardTitle>
                    <BookMarked className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{dictionary.length}</div>
                    <p className="text-xs text-muted-foreground">Custom terms saved</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
            <div>
                <h3 className="text-lg font-semibold mb-2">Words Translated Per Month</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={stats.usageData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                        <Legend />
                        <Bar dataKey="words" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Top Languages</h3>
                <ResponsiveContainer width="100%" height={300}>
                     <RechartsBarChart data={stats.langData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                        <Legend />
                        <Bar dataKey="count" name="Translations" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}


function HistoryTab() {
    const { data: history, setData: setHistory, loading: loadingHistory, refetch: refetchHistory } = useUserDocs<TranslationHistoryItem>("translationHistory", []);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();
    const { user } = useAuth();

    const handleClearHistory = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, "translationHistory"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const batch = writeBatch(db);
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            setHistory([]);
            toast({ title: "Success", description: "Translation history has been cleared." });
        } catch (error) {
            console.error("Error clearing history:", error);
            toast({ title: "Error", description: "Failed to clear history.", variant: "destructive" });
        }
    };
    
    const handleDeleteItem = async (id: string) => {
        if (!user || !id) return;
        const originalHistory = [...history];
        setHistory(prev => prev.filter(item => item.id !== id));
        try {
            await deleteDoc(doc(db, "translationHistory", id));
            toast({ title: "Success", description: "Translation entry has been deleted." });
        } catch (error) {
             console.error("Error deleting item:", error);
            toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
            setHistory(originalHistory);
        }
    };

    const filteredHistory = history.filter(item =>
        item.originalText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translatedText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Translation History</CardTitle>
                <CardDescription>
                    Review and manage your past translations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search history..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <ClearHistoryDialog onConfirm={handleClearHistory} />
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Original Text</TableHead>
                        <TableHead>Translated Text</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                     {loadingHistory ? (
                        <TableRow><TableCell colSpan={5} className="text-center">Loading history...</TableCell></TableRow>
                     ) : filteredHistory.length > 0 ? (
                        filteredHistory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium max-w-xs truncate">{item.originalText}</TableCell>
                                <TableCell className="max-w-xs truncate">{item.translatedText}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{mockLanguages.find(l => l.value === item.sourceLang)?.label || item.sourceLang}</Badge> → <Badge variant="outline">{mockLanguages.find(l => l.value === item.targetLang)?.label || item.targetLang}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => item.id && handleDeleteItem(item.id)} className="text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                     ) : (
                        <TableRow><TableCell colSpan={5} className="text-center">No history found.</TableCell></TableRow>
                     )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function FavoritesTab() {
    const { data: favorites, setData: setFavorites, loading: loadingFavorites } = useUserDocs<Favorite>("favorites", []);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();
    const { user } = useAuth();

    const handleDeleteItem = async (id: string) => {
        if (!user || !id) return;
        const originalFavorites = [...favorites];
        setFavorites(prev => prev.filter(item => item.id !== id));
        try {
            await deleteDoc(doc(db, "favorites", id));
            toast({ title: "Success", description: "Favorite has been removed." });
        } catch (error) {
             console.error("Error removing favorite:", error);
            toast({ title: "Error", description: "Failed to remove favorite.", variant: "destructive" });
            setFavorites(originalFavorites);
        }
    };

    const filteredFavorites = favorites.filter(item =>
        item.originalText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translatedText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Favorite Translations</CardTitle>
                <CardDescription>
                    Review and manage your saved translations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search favorites..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Original Text</TableHead>
                        <TableHead>Translated Text</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead className="hidden md:table-cell">Date Saved</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                     {loadingFavorites ? (
                        <TableRow><TableCell colSpan={5} className="text-center">Loading favorites...</TableCell></TableRow>
                     ) : filteredFavorites.length > 0 ? (
                        filteredFavorites.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium max-w-xs truncate">{item.originalText}</TableCell>
                                <TableCell className="max-w-xs truncate">{item.translatedText}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{mockLanguages.find(l => l.value === item.sourceLang)?.label || item.sourceLang}</Badge> → <Badge variant="outline">{mockLanguages.find(l => l.value === item.targetLang)?.label || item.targetLang}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{item.favoritedAt ? new Date(item.favoritedAt).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => item.id && handleDeleteItem(item.id)} className="text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                     ) : (
                        <TableRow><TableCell colSpan={5} className="text-center">No favorites found.</TableCell></TableRow>
                     )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


function DictionaryTab() {
    const { data: dictionary, setData: setDictionary, loading: loadingDictionary, refetch: refetchDictionary } = useUserDocs<DictionaryEntry>("dictionary", []);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();
    const { user } = useAuth();

    const handleAddTerm = async (newTerm: Omit<DictionaryEntry, 'userId' | 'id'>) => {
        if (!user) return;
        try {
            const termWithUser: Omit<DictionaryEntry, 'id'> = { ...newTerm, userId: user.uid };
            const docRef = await addDoc(collection(db, "dictionary"), termWithUser);
            setDictionary(prev => [{ ...termWithUser, id: docRef.id }, ...prev]);
            toast({ title: "Success", description: `Term "${newTerm.term}" has been added.` });
        } catch (error) {
            console.error("Error adding term:", error);
            toast({ title: "Error", description: "Failed to add term.", variant: "destructive" });
        }
    };

    const handleDeleteTerm = async (id: string) => {
        if (!user || !id) return;
        const originalDictionary = [...dictionary];
        setDictionary(prev => prev.filter(item => item.id !== id));
        try {
            await deleteDoc(doc(db, "dictionary", id));
            toast({ title: "Success", description: `Term has been deleted.` });
        } catch (error) {
             console.error("Error deleting term:", error);
            toast({ title: "Error", description: "Failed to delete term.", variant: "destructive" });
            setDictionary(originalDictionary);
        }
    }

    const filteredDictionary = dictionary.filter(item =>
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Custom Dictionary</CardTitle>
                <CardDescription>
                    Manage your personal dictionary of terms and translations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search dictionary..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <AddTermDialog onAddTerm={handleAddTerm} />
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Term</TableHead>
                        <TableHead>Translation</TableHead>
                        <TableHead className="hidden md:table-cell">Context</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                     {loadingDictionary ? (
                        <TableRow><TableCell colSpan={5} className="text-center">Loading dictionary...</TableCell></TableRow>
                     ) : filteredDictionary.length > 0 ? (
                        filteredDictionary.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.term}</TableCell>
                                <TableCell>{item.translation}</TableCell>
                                <TableCell className="hidden md:table-cell max-w-sm truncate">{item.context}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{item.language}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => item.id && handleDeleteTerm(item.id)} className="text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                     ) : (
                        <TableRow><TableCell colSpan={5} className="text-center">No terms found.</TableCell></TableRow>
                     )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function SettingsTab() {
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [settings, setSettings] = useState<Partial<UserSettings>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleSettingChange = (key: keyof UserSettings, value: any) => {
        setSettings(prev => ({...prev, [key]: value}));
    }

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const docRef = doc(db, "userSettings", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as UserSettings);
                } else {
                    // Set default settings if none exist
                    setSettings({
                        nativeLanguage: "en",
                        defaultTargetLanguage: "es",
                        defaultTone: "formal",
                        saveHistory: true,
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({ title: "Error", description: "Could not load your settings.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [user, toast]);


    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, "userSettings", user.uid), settings, { merge: true });
            toast({
                title: "Preferences Saved",
                description: "Your settings have been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({ title: "Error", description: "Failed to save your settings.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    if(loading) return <div>Loading settings...</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                Manage your account and translation preferences.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Language Preferences</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="native-language">Native Language</Label>
                             <Select value={settings.nativeLanguage} onValueChange={(value) => handleSettingChange('nativeLanguage', value)}>
                                <SelectTrigger id="native-language">
                                    <SelectValue placeholder="Select your native language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockLanguages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="default-target-language">Default Target Language</Label>
                            <Select value={settings.defaultTargetLanguage} onValueChange={(value) => handleSettingChange('defaultTargetLanguage', value)}>
                                <SelectTrigger id="default-target-language">
                                    <SelectValue placeholder="Select a default target" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockLanguages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Translation Preferences</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tone-preference">Default Tone Preference</Label>
                            <Select value={settings.defaultTone} onValueChange={(value) => handleSettingChange('defaultTone', value)}>
                                <SelectTrigger id="tone-preference">
                                    <SelectValue placeholder="Select a default tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockTones.map(tone => <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center space-x-2 pt-6">
                            <Switch id="save-history" checked={settings.saveHistory} onCheckedChange={(value) => handleSettingChange('saveHistory', value)} />
                            <Label htmlFor="save-history">Save translation history</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                 <div className="flex justify-end w-full">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

    
