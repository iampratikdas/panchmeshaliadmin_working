import { atom } from 'jotai';
import type { ContentStatus } from '../types/content';

// User state
export const currentUserAtom = atom({
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
});

// UI state
export const sidebarOpenAtom = atom(true);
export const themeAtom = atom<'light' | 'dark'>('light');

// Filter state for content list
export const contentFilterAtom = atom<ContentStatus | 'all'>('all');
export const currentPageAtom = atom(1);
