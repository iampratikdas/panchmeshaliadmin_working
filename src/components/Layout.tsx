import type { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '../lib/utils';
import {
    Home,
    PenTool,
    FileText,
    Settings as SettingsIcon,
    Menu,
    X,
    User,
    Calendar,
    Users,
    MessageSquare,
    FolderOpen
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAtom } from 'jotai';
import { sidebarOpenAtom, currentUserAtom } from '../store/atoms';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { NotificationDropdown } from './NotificationDropdown';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/submit', label: 'Submit', icon: PenTool },
    { to: '/content', label: 'My Content', icon: FileText, badge: 4 },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/chats', label: 'Chats', icon: MessageSquare, badge: 2 },
    { to: '/workspace', label: 'Workspace', icon: FolderOpen },
];

const projectItems = [
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
    const [user] = useAtom(currentUserAtom);
    const location = useLocation();

    // Close sidebar on mobile by default on first load
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [setSidebarOpen]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname, setSidebarOpen]);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    return (
        <div className="min-h-screen">
            {/* Top Header with Notification */}
            <div className="fixed top-0 right-0 z-50 p-4 flex items-center gap-2">
                <NotificationDropdown />
            </div>

            {/* Mobile menu button */}
            {(!sidebarOpen || isMobile) && (
                <div className="lg:hidden fixed top-4 left-4 z-50">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="h-12 w-12 shadow-xl glass"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            )}

            {/* Mobile overlay backdrop */}
            <AnimatePresence>
                {sidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || (!isMobile && window.innerWidth >= 1024)) && (
                    <motion.aside
                        initial={isMobile ? { x: -300 } : false}
                        animate={{ x: 0 }}
                        exit={isMobile ? { x: -300 } : {}}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed z-50 [scrollbar-width:none] top-0 left-0 h-screen w-72 sm:w-80 lg:w-64 bg-black text-white p-4 z-40 overflow-y-auto flex flex-col"
                    >
                        {/* Close button inside sidebar for mobile */}
                        <div className="lg:hidden absolute top-4 right-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="mb-6 px-2 pr-12 lg:pr-2">
                            <h1 className="text-xl font-bold text-white">Writer's Hub</h1>
                        </div>

                        <nav className="space-y-1 flex-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.to;
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={cn(
                                            'flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-all text-sm min-h-[44px] touch-manipulation group',
                                            isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        )}
                                        onClick={() => isMobile && setSidebarOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}

                            <div className="pt-6">
                                <div className="px-3 mb-2">
                                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">More</h3>
                                </div>
                                {projectItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.to;
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm min-h-[40px] touch-manipulation',
                                                isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                                            )}
                                            onClick={() => isMobile && setSidebarOpen(false)}
                                        >
                                            <Icon className="h-4 w-4 flex-shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        <div className="mt-auto pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-white/60">View Profile</p>
                                </div>
                                <SettingsIcon className="h-4 w-4 text-white/40 group-hover:text-white/60 flex-shrink-0" />
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className={cn('transition-all duration-300', !isMobile && sidebarOpen ? 'lg:pl-64' : 'pl-0')}>
                <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 pt-20 lg:pt-6 max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
