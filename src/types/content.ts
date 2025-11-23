export type ContentStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export type ContentType = 'story' | 'poem';

export interface BaseContent {
    id: string;
    type: ContentType;
    title: string;
    content: string;
    status: ContentStatus;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    authorName: string;
}

export interface Story extends BaseContent {
    type: 'story';
    wordCount: number;
    genre?: string;
}

export interface Poem extends BaseContent {
    type: 'poem';
    lines: number;
    style?: string;
}

export type Content = Story | Poem;

export interface Comment {
    id: string;
    contentId: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
    isReviewer: boolean;
}

export interface ReviewerComment extends Comment {
    isReviewer: true;
    reviewStatus?: ContentStatus;
}
