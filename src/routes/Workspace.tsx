import { useState } from 'react';
import { useAtom } from 'jotai';
import {
    workspaceFoldersAtom,
    workspaceFilesAtom,
    currentFolderAtom
} from '../store/atoms';
import { FolderTree } from '../components/FolderTree';
import { FileGrid } from '../components/FileGrid';
import { StorageBar } from '../components/StorageBar';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { RenameFolderModal } from '../components/RenameFolderModal';
import { ShareModal } from '../components/ShareModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
    FolderPlus,
    Upload,
    ChevronRight,
    Home,
    Search
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { EmailTheme, WorkspaceFile } from '../types/workspace';
import { motion } from 'framer-motion';

export default function Workspace() {
    const [folders, setFolders] = useAtom(workspaceFoldersAtom);
    const [files, setFiles] = useAtom(workspaceFilesAtom);
    const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);

    // Modal states
    const [createFolderModal, setCreateFolderModal] = useState<{ isOpen: boolean; parentId: string }>({
        isOpen: false,
        parentId: 'root'
    });
    const [renameModal, setRenameModal] = useState<{ isOpen: boolean; folderId: string; foldername: string }>({
        isOpen: false,
        folderId: '',
        folderName: ''
    });
    const [shareModal, setShareModal] = useState<{ isOpen: boolean; file: WorkspaceFile | null }>({
        isOpen: false,
        file: null
    });
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'folder' | 'file';
        id: string;
        name: string;
    }>({
        isOpen: false,
        type: 'file',
        id: '',
        name: ''
    });

    const [searchQuery, setSearchQuery] = useState('');

    // Get breadcrumb path
    const getBreadcrumbs = () => {
        const breadcrumbs = [];
        let folderId: string | null = currentFolder;

        while (folderId) {
            const folder = folders.find(f => f.id === folderId);
            if (folder) {
                breadcrumbs.unshift(folder);
                folderId = folder.parentId;
            } else {
                break;
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();
    const currentFolderData = folders.find(f => f.id === currentFolder);

    // Folder operations
    const handleCreateFolder = (folderName: string) => {
        const newFolder = {
            id: `folder-${Date.now()}`,
            name: folderName,
            parentId: createFolderModal.parentId,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)]
        };
        setFolders([...folders, newFolder]);
    };

    const handleRenameFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        setRenameModal({
            isOpen: true,
            folderId: folderId,
            folderName: folder.name
        });
    };

    const confirmRenameFolder = (newName: string) => {
        if (newName && newName.trim()) {
            setFolders(folders.map(f =>
                f.id === renameModal.folderId
                    ? { ...f, name: newName.trim(), modifiedAt: new Date().toISOString() }
                    : f
            ));
        }
    };

    const handleDeleteFolder = (folderId: string) => {
        // Check if folder has children
        const hasChildren = folders.some(f => f.parentId === folderId) ||
            files.some(f => f.folderId === folderId);

        if (hasChildren) {
            alert('Cannot delete folder with contents. Please delete all files and subfolders first.');
            return;
        }

        setFolders(folders.filter(f => f.id !== folderId));
        if (currentFolder === folderId) {
            setCurrentFolder('root');
        }
    };

    // File operations
    const handleUploadFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const newFile: WorkspaceFile = {
                    id: `file-${Date.now()}`,
                    name: file.name,
                    folderId: currentFolder,
                    type: file.name.split('.').pop() as any || 'txt',
                    size: file.size,
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                };
                setFiles([...files, newFile]);
            }
        };
        input.click();
    };

    const handleDownloadFile = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            alert(`Downloading: ${file.name}\n(In production, this would trigger an actual download)`);
        }
    };

    const handleShareFile = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            setShareModal({ isOpen: true, file });
        }
    };

    const handleShareConfirm = (emails: string[], theme: EmailTheme, message: string) => {
        alert(`File shared via ${theme} theme to:\n${emails.join(', ')}\n\nMessage: ${message || '(none)'}`);
    };

    const handleDeleteFile = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            setDeleteModal({
                isOpen: true,
                type: 'file',
                id: fileId,
                name: file.name
            });
        }
    };

    const confirmDelete = () => {
        if (deleteModal.type === 'file') {
            setFiles(files.filter(f => f.id !== deleteModal.id));
        } else {
            handleDeleteFolder(deleteModal.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Workspace</h1>
                    <p className="text-muted-foreground">Manage your files and folders</p>
                </div>
            </div>

            {/* Breadcrumb Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4"
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setCurrentFolder('root')}
                        className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </button>
                    {breadcrumbs.map((folder, index) => (
                        <div key={folder.id} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <button
                                onClick={() => setCurrentFolder(folder.id)}
                                className={`text-sm font-medium transition-colors ${index === breadcrumbs.length - 1
                                        ? 'text-primary'
                                        : 'hover:text-primary'
                                    }`}
                            >
                                {folder.name}
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar - Folder Tree */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3"
                >
                    <div className="glass-card rounded-xl p-4 sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Folders</h2>
                            <Button
                                size="sm"
                                onClick={() => setCreateFolderModal({ isOpen: true, parentId: currentFolder })}
                                className="h-8 w-8 p-0"
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </div>
                        <FolderTree
                            onCreateFolder={(parentId) => setCreateFolderModal({ isOpen: true, parentId })}
                            onRenameFolder={handleRenameFolder}
                            onDeleteFolder={(folderId) => {
                                const folder = folders.find(f => f.id === folderId);
                                if (folder) {
                                    setDeleteModal({
                                        isOpen: true,
                                        type: 'folder',
                                        id: folderId,
                                        name: folder.name
                                    });
                                }
                            }}
                        />
                    </div>
                </motion.div>

                {/* Main Area - Files */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-9 space-y-4"
                >
                    {/* Action Bar */}
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search files..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleUploadFile} className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Upload File
                            </Button>
                        </div>
                    </div>

                    {/* Files Grid */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">
                                {currentFolderData?.name || 'My Drive'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {files.filter(f => f.folderId === currentFolder).length} files
                            </p>
                        </div>
                        <FileGrid
                            onDownload={handleDownloadFile}
                            onShare={handleShareFile}
                            onDelete={handleDeleteFile}
                        />
                    </div>

                    {/* Storage Bar */}
                    <div className="glass-card rounded-xl p-4">
                        <StorageBar />
                    </div>
                </motion.div>
            </div>

            {/* Modals */}
            <CreateFolderModal
                isOpen={createFolderModal.isOpen}
                onClose={() => setCreateFolderModal({ isOpen: false, parentId: 'root' })}
                onConfirm={handleCreateFolder}
            />

            <RenameFolderModal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ isOpen: false, folderId: '', folderName: '' })}
                onConfirm={confirmRenameFolder}
                currentName={renameModal.folderName}
            />

            <ShareModal
                isOpen={shareModal.isOpen}
                fileName={shareModal.file?.name || ''}
                onClose={() => setShareModal({ isOpen: false, file: null })}
                onShare={handleShareConfirm}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                itemName={deleteModal.name}
                onClose={() => setDeleteModal({ isOpen: false, type: 'file', id: '', name: '' })}
                onConfirm={() => {
                    confirmDelete();
                    setDeleteModal({ isOpen: false, type: 'file', id: '', name: '' });
                }}
                title={`Delete ${deleteModal.type === 'folder' ? 'Folder' : 'File'}`}
                message={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
            />
        </div>
    );
}
