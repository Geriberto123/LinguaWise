
"use client"

import {
  BookMarked,
  History,
  Languages,
  MoreHorizontal,
  PlusCircle,
  Search,
  Settings,
  BarChart,
  Trash2,
  Pencil,
  Save,
} from "lucide-react"

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
import { mockHistory, mockDictionary, mockLanguages, mockTones } from "@/lib/data"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import React from "react"
import { useToast } from "@/hooks/use-toast"
import { AddTermDialog } from "./add-term-dialog"
import { ClearHistoryDialog } from "./clear-history-dialog"

export function Dashboard() {
  return (
    <Tabs defaultValue="statistics">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="statistics"><BarChart className="mr-2 h-4 w-4" />Statistics</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
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
      <TabsContent value="dictionary">
        <DictionaryTab />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  )
}

function StatisticsTab() {
  const usageData = [
    { name: 'Jan', words: 4000 },
    { name: 'Feb', words: 3000 },
    { name: 'Mar', words: 2000 },
    { name: 'Apr', words: 2780 },
    { name: 'May', words: 1890 },
    { name: 'Jun', words: 2390 },
  ];
  const langData = [
    { name: 'Spanish', count: 540 },
    { name: 'French', count: 320 },
    { name: 'German', count: 180 },
    { name: 'Japanese', count: 120 },
    { name: 'Other', count: 80 },
  ]
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
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Words Translated</CardTitle>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">15,6K</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Favorite Language</CardTitle>
                    <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Spanish</div>
                    <p className="text-xs text-muted-foreground">Most frequently used</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dictionary Terms</CardTitle>
                    <BookMarked className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">Custom terms saved</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
            <div>
                <h3 className="text-lg font-semibold mb-2">Words Translated Per Month</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={usageData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                        <Legend />
                        <Bar dataKey="words" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Top Languages</h3>
                <ResponsiveContainer width="100%" height={300}>
                     <RechartsBarChart data={langData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                        <Legend />
                        <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}


function HistoryTab() {
    const [history, setHistory] = React.useState(mockHistory);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();

    const handleClearHistory = () => {
        setHistory([]);
        toast({ title: "Success", description: "Translation history has been cleared." });
    };

    const filteredHistory = history.filter(item =>
        item.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
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
                    {filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-xs truncate">{item.originalText}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.translatedText}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{item.sourceLang}</Badge> → <Badge variant="outline">{item.targetLang}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{item.timestamp}</TableCell>
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function DictionaryTab() {
    const [dictionary, setDictionary] = React.useState(mockDictionary);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();

    const handleAddTerm = (newTerm: any) => {
        setDictionary(prev => [newTerm, ...prev]);
        toast({ title: "Success", description: `Term "${newTerm.term}" has been added.` });
    };

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
                    {filteredDictionary.map((item) => (
                        <TableRow key={item.term}>
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
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function SettingsTab() {
    const { toast } = useToast();
    const [nativeLanguage, setNativeLanguage] = React.useState("en");
    const [defaultTargetLanguage, setDefaultTargetLanguage] = React.useState("es");
    const [defaultTone, setDefaultTone] = React.useState("formal");
    const [saveHistory, setSaveHistory] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Preferences Saved",
                description: "Your settings have been updated successfully.",
            });
        }, 1000);
    };

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
                             <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
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
                            <Select value={defaultTargetLanguage} onValueChange={setDefaultTargetLanguage}>
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
                            <Select value={defaultTone} onValueChange={setDefaultTone}>
                                <SelectTrigger id="tone-preference">
                                    <SelectValue placeholder="Select a default tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockTones.map(tone => <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center space-x-2 pt-6">
                            <Switch id="save-history" checked={saveHistory} onCheckedChange={setSaveHistory} />
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

