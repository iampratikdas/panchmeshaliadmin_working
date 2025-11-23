import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { fetchContentById, fetchCommentsByContentId } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { CommentBox } from '../components/CommentBox';
import { ArrowLeft, Calendar, User, FileText, BookOpen } from 'lucide-react';

export default function ContentDetail() {
    const { id } = useParams({ from: '/content/$id' });
    const navigate = useNavigate();

    const { data: content, isLoading: contentLoading } = useQuery({
        queryKey: ['content', id],
        queryFn: () => fetchContentById(id),
    });

    const { data: comments = [], isLoading: commentsLoading } = useQuery({
        queryKey: ['comments', id],
        queryFn: () => fetchCommentsByContentId(id),
    });

    if (contentLoading) {
        return <LoadingSkeleton />;
    }

    if (!content) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Content not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate({ to: '/content' })}
                >
                    Back to Content List
                </Button>
            </div>
        );
    }

    const Icon = content.type === 'story' ? FileText : BookOpen;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button
                variant="ghost"
                onClick={() => navigate({ to: '/content' })}
                className="mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Content
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6 text-primary" />
                            <CardTitle className="text-3xl">{content.title}</CardTitle>
                        </div>
                        <StatusBadge status={content.status} />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {content.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(content.createdAt).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{content.type}</span>
                        {content.type === 'story' && (
                            <>
                                <span>{content.wordCount} words</span>
                                {content.genre && <span>{content.genre}</span>}
                            </>
                        )}
                        {content.type === 'poem' && (
                            <>
                                <span>{content.lines} lines</span>
                                {content.style && <span>{content.style}</span>}
                            </>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                </CardContent>

                <CardFooter className="flex-col items-start">
                    <div className="w-full border-t pt-6">
                        {commentsLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <CommentBox contentId={id} comments={comments} />
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
