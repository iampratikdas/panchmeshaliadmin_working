import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { submitContent, checkQualityAI, proofreadAI, fetchEvents } from '../lib/api';
import { useAtom } from 'jotai';
import { workspaceFoldersAtom } from '../store/atoms';
import { RichTextEditor } from '../components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import {
    Sparkles,
    CheckCircle2,
    Send,
    Loader2
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { motion } from 'framer-motion';

const CONTENT_TYPES = [
    { value: 'novel', label: 'Novel' },
    { value: 'novella', label: 'Novella / Short novel' },
    { value: 'essay', label: 'Essay / Article' },
    { value: 'story', label: 'Story' },
    { value: 'long-story', label: 'Long story' },
    { value: 'short-story', label: 'Short story' },
    { value: 'micro-story', label: 'Micro story' },
    { value: 'nano-story', label: 'Nano story / Ultra-short story' },
    { value: 'dramatic-story', label: 'Dramatic story' },
    { value: 'verse', label: 'Verse' },
    { value: 'rhyme', label: 'Rhyme / Rhyming poem' },
    { value: 'poem', label: 'Poem' },
    { value: 'prose-poem', label: 'Prose poem' },
    { value: 'haiku', label: 'Haiku' },
    { value: 'limerick', label: 'Limerick' },
];

const PUBLISHERS = [
    { value: 'pub-1', label: 'Penguin Random House' },
    { value: 'pub-2', label: 'HarperCollins' },
    { value: 'pub-3', label: 'Simon & Schuster' },
    { value: 'pub-4', label: 'Hachette Book Group' },
    { value: 'pub-5', label: 'Macmillan Publishers' },
];

export default function Submit() {
    const [type, setType] = useState<string>('story');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEvent, setIsEvent] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [isForPublisher, setIsForPublisher] = useState(false);
    const [selectedPublisher, setSelectedPublisher] = useState<string>('');
    const [selectedFolder, setSelectedFolder] = useState<string>('root');
    const [isOriginal, setIsOriginal] = useState(false);
    const [qualityResult, setQualityResult] = useState<any>(null);
    const [proofreadResult, setProofreadResult] = useState<any>(null);

    const [folders] = useAtom(workspaceFoldersAtom);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch events for the dropdown
    const { data: events } = useQuery({
        queryKey: ['events'],
        queryFn: fetchEvents,
    });

    const submitMutation = useMutation({
        mutationFn: () => submitContent(type, title, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contents'] });
            toast({
                title: 'Success!',
                description: 'Your submission has been received.',
            });
            navigate({ to: '/content' });
        },
    });

    const qualityMutation = useMutation({
        mutationFn: () => checkQualityAI(content),
        onSuccess: (data) => {
            setQualityResult(data);
            toast({
                title: 'Quality Check Complete',
                description: `Quality Score: ${data.score}/100`,
            });
        },
    });

    const proofreadMutation = useMutation({
        mutationFn: () => proofreadAI(content),
        onSuccess: (data) => {
            setProofreadResult(data);
            setContent(data.correctedText);
            toast({
                title: 'Proofreading Complete',
                description: data.summary,
            });
        },
    });

    const canSubmit = title.trim() && content.trim() && isOriginal;

    return (
        <div className=" mx-auto space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Submit Your Work</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Share your story or poem with our community
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Event Submission</CardTitle>
                    <CardDescription>Is this submission for an event?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isEvent"
                            checked={isEvent}
                            onChange={(e) => {
                                setIsEvent(e.target.checked);
                                if (!e.target.checked) {
                                    setSelectedEventId('');
                                }
                            }}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="isEvent" className="text-sm font-medium cursor-pointer">
                            Yes, this is for an event
                        </label>
                    </div>

                    {isEvent && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-2">
                                <label htmlFor="eventSelect" className="text-sm font-medium">
                                    Select Event
                                </label>
                                <Select
                                    id="eventSelect"
                                    options={[
                                        { value: '', label: 'Choose an event...' },
                                        ...(events?.map(event => ({
                                            value: event.id,
                                            label: event.name,
                                        })) || []),
                                    ]}
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Publication Destination</CardTitle>
                    <CardDescription>Select where to publish your work</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isForPublisher"
                            checked={isForPublisher}
                            onChange={(e) => {
                                setIsForPublisher(e.target.checked);
                                if (e.target.checked) {
                                    setSelectedFolder('root');
                                } else {
                                    setSelectedPublisher('');
                                }
                            }}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="isForPublisher" className="text-sm font-medium cursor-pointer">
                            This is for a publisher
                        </label>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isForPublisher ? (
                            <div className="space-y-2">
                                <label htmlFor="publisherSelect" className="text-sm font-medium">
                                    Select Publisher
                                </label>
                                <Select
                                    id="publisherSelect"
                                    options={[
                                        { value: '', label: 'Choose a publisher...' },
                                        ...PUBLISHERS,
                                    ]}
                                    value={selectedPublisher}
                                    onChange={(e) => setSelectedPublisher(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label htmlFor="folderSelect" className="text-sm font-medium">
                                    Select Folder to Save
                                </label>
                                <Select
                                    id="folderSelect"
                                    options={folders.map(folder => ({
                                        value: folder.id,
                                        label: folder.name,
                                    }))}
                                    value={selectedFolder}
                                    onChange={(e) => setSelectedFolder(e.target.value)}
                                />
                            </div>
                        )}
                    </motion.div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Content Type</CardTitle>
                    <CardDescription>Select what you want to submit</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select
                        options={CONTENT_TYPES}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Title</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder={`Enter your ${type} title...`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Content</CardTitle>
                    <CardDescription>Write your {type} below</CardDescription>
                </CardHeader>
                <CardContent>
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder={`Start writing your ${type}...`}
                    />
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        Original Writing Confirmation
                    </CardTitle>
                    <CardDescription>Required before submission</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="isOriginal"
                            checked={isOriginal}
                            onChange={(e) => setIsOriginal(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer mt-0.5"
                        />
                        <label htmlFor="isOriginal" className="text-sm font-medium cursor-pointer leading-relaxed">
                            I confirm that this is my original work and I have not plagiarized from any source.
                            I understand that submitting plagiarized content may result in rejection and potential consequences.
                        </label>
                    </div>
                    {!isOriginal && (
                        <p className="text-xs text-muted-foreground mt-3 ml-8">
                            ⚠️ You must confirm that your work is original to submit
                        </p>
                    )}
                </CardContent>
            </Card>
            {
                isOriginal && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                AI Tools
                            </CardTitle>
                            <CardDescription>Enhance your work with AI assistance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => qualityMutation.mutate()}
                                    disabled={!content || qualityMutation.isPending}
                                    className="h-12 sm:h-10"
                                >
                                    {qualityMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    Check Quality
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => proofreadMutation.mutate()}
                                    disabled={!content || proofreadMutation.isPending}
                                    className="h-12 sm:h-10"
                                >
                                    {proofreadMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 mr-2" />
                                    )}
                                    Proofread
                                </Button>
                            </div>

                            {qualityResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 border rounded-lg bg-accent/50"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">Quality Analysis</h4>
                                        <Badge variant="success">Score: {qualityResult.score}/100</Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="font-medium text-green-600">Strengths:</p>
                                            <ul className="list-disc list-inside text-muted-foreground">
                                                {qualityResult.strengths.map((s: string, i: number) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium text-yellow-600">Improvements:</p>
                                            <ul className="list-disc list-inside text-muted-foreground">
                                                {qualityResult.improvements.map((s: string, i: number) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {proofreadResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 border rounded-lg bg-accent/50"
                                >
                                    <h4 className="font-semibold mb-2">Proofreading Results</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {proofreadResult.summary}
                                    </p>
                                    {proofreadResult.corrections.length > 0 && (
                                        <div className="space-y-1 text-sm">
                                            {proofreadResult.corrections.map((c: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="line-through text-red-500">{c.original}</span>
                                                    <span>→</span>
                                                    <span className="text-green-500">{c.corrected}</span>
                                                    <span className="text-xs text-muted-foreground">({c.reason})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                )
            }




            <div className="flex justify-end gap-2">
                <Button
                    size="lg"
                    onClick={() => submitMutation.mutate()}
                    disabled={!canSubmit || submitMutation.isPending}
                    className="w-full sm:w-auto min-h-[48px]"
                >
                    {submitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    Draft {CONTENT_TYPES.find(ct => ct.value === type)?.label || 'Content'}
                </Button>
                <Button
                    size="lg"
                    onClick={() => submitMutation.mutate()}
                    disabled={!canSubmit || submitMutation.isPending}
                    className="w-full sm:w-auto min-h-[48px]"
                >
                    {submitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    Submit {CONTENT_TYPES.find(ct => ct.value === type)?.label || 'Content'}
                </Button>
            </div>

        </div>
    );
}
