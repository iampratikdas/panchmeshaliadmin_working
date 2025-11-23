import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { submitContent, checkQualityAI, proofreadAI } from '../lib/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Sparkles,
    CheckCircle2,
    Send,
    Loader2
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { motion } from 'framer-motion';

export default function Submit() {
    const [type, setType] = useState<'story' | 'poem'>('story');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [qualityResult, setQualityResult] = useState<any>(null);
    const [proofreadResult, setProofreadResult] = useState<any>(null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

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

    const canSubmit = title.trim() && content.trim();

    return (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Submit Your Work</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Share your story or poem with our community
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Content Type</CardTitle>
                    <CardDescription>Select what you want to submit</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <Button
                            variant={type === 'story' ? 'default' : 'outline'}
                            onClick={() => setType('story')}
                            className="h-12 sm:h-10"
                        >
                            Story
                        </Button>
                        <Button
                            variant={type === 'poem' ? 'default' : 'outline'}
                            onClick={() => setType('poem')}
                            className="h-12 sm:h-10"
                        >
                            Poem
                        </Button>
                    </div>
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

            <div className="flex justify-end">
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
                    Submit {type === 'story' ? 'Story' : 'Poem'}
                </Button>
            </div>
        </div>
    );
}
