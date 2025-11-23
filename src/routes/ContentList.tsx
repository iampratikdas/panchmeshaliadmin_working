import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { fetchContents } from '../lib/api';
import { ContentCard } from '../components/ContentCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Button } from '../ui/button';
import type { ContentStatus } from '../types/content';
import { useAtom } from 'jotai';
import { contentFilterAtom, currentPageAtom } from '../store/atoms';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function ContentList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useAtom(contentFilterAtom);
    const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
    const pageSize = 6;

    const { data, isLoading } = useQuery({
        queryKey: ['contents', currentPage, filter],
        queryFn: () => fetchContents(
            currentPage,
            pageSize,
            filter === 'all' ? undefined : filter as ContentStatus
        ),
    });

    const filters: Array<ContentStatus | 'all'> = [
        'all',
        'Submitted',
        'Under Review',
        'Approved',
        'Rejected',
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">My Content</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    View and manage your submissions
                </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium mr-2">Filter:</span>
                {filters.map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                            setFilter(f);
                            setCurrentPage(1);
                        }}
                        className="h-9 text-xs sm:text-sm"
                    >
                        {f === 'all' ? 'All' : f}
                    </Button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {data?.data.map((content) => (
                            <ContentCard
                                key={content.id}
                                content={content}
                                onClick={() => navigate({ to: `/content/${content.id}` })}
                            />
                        ))}
                    </div>

                    {data && data.data.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No content found for this filter.
                            </p>
                        </div>
                    )}

                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-10 w-10"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <span className="text-xs sm:text-sm px-2">
                                Page {currentPage} of {data.totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                                disabled={currentPage === data.totalPages}
                                className="h-10 w-10"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
