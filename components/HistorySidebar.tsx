
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
    FileText, 
    MoreHorizontal, 
    Search, 
    Folder, 
    FolderOpen, 
    Plus, 
    Trash2, 
    Edit2, 
    Settings,
    ChevronDown,
    ChevronRight,
    FileJson,
    LayoutTemplate,
    Check,
    GripVertical,
    Zap,
    Brain,
    Image as ImageIcon,
    Clock,
    Send
} from 'lucide-react';
import { ProjectConfig, PostDraft } from '../types';

// Simple Context Menu Component
const ContextMenu = ({ x, y, options, onClose }: any) => (
    <div 
        className="fixed bg-[#252526] border border-[#3e3e42] shadow-xl rounded-sm z-50 py-1 min-w-[140px]"
        style={{ top: y, left: x }}
        onMouseLeave={onClose}
    >
        {options.map((opt: any, idx: number) => (
            <div 
                key={idx} 
                onClick={(e) => { e.stopPropagation(); opt.action(); onClose(); }}
                className={`px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer hover:bg-[#094771] hover:text-white ${opt.danger ? 'text-red-400' : 'text-[#cccccc]'}`}
            >
                {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
                {opt.label}
            </div>
        ))}
    </div>
);

// Helper to render badges
const DraftBadges = ({ draft }: { draft: PostDraft }) => {
    // Determine badges based on draft content/stats if available
    const hasImage = !!draft.imageBase64 || !!draft.imageUrl;
    const isScheduled = draft.status === 'scheduled';
    const isPublished = draft.status === 'published';
    
    // Check if model name contains 'flash' (fast/cheap) or not (smart/pro)
    const isFlash = draft.stats?.text?.modelName?.toLowerCase().includes('flash');
    const modelBadge = isFlash ? <Zap className="w-2.5 h-2.5 text-yellow-400" /> : <Brain className="w-2.5 h-2.5 text-blue-400" />;
    
    return (
        <div className="flex items-center gap-1.5 ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
            {isPublished && <Send className="w-2.5 h-2.5 text-green-500" />}
            {isScheduled && (
                <div title={`Scheduled: ${new Date(draft.scheduledAt!).toLocaleString()}`}>
                    <Clock className="w-2.5 h-2.5 text-orange-400" />
                </div>
            )}
            {hasImage && <ImageIcon className="w-2.5 h-2.5 text-purple-400" />}
            {draft.stats?.text && modelBadge}
        </div>
    );
};

export const HistorySidebar: React.FC = () => {
  const { 
      history, 
      folders, 
      templates,
      t, 
      currentView, 
      loadDraftToEditor, 
      editorState, 
      createFolder, 
      updateFolder, 
      deleteFolder, 
      deleteDraft,
      toggleFolder,
      setActiveFolder,
      loadTemplate,
      deleteTemplate,
      moveDraft,
      renameDraft
  } = useAppContext();

  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, options: any[] } | null>(null);
  
  // Modal State
  const [modalMode, setModalMode] = useState<'folder_create' | 'folder_edit' | 'file_rename' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  // DnD State
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Unified Modal for Folders and Files (Drafts)
  // Defined inside component to access 't'
  const ItemModal = ({ isOpen, onClose, onSave, mode, initialName = '', initialConfig = {} }: any) => {
    const [name, setName] = useState(initialName);
    const [config, setConfig] = useState<ProjectConfig>(initialConfig);

    // Reset state when opening different item
    React.useEffect(() => {
        if(isOpen) {
            setName(initialName);
            setConfig(initialConfig);
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const isFolder = mode === 'folder_create' || mode === 'folder_edit';
    const title = mode === 'folder_create' ? t('mdlNewProject') : mode === 'folder_edit' ? t('mdlEditProject') : t('mdlRenameFile');
    const placeholder = isFolder ? t('phProjectName') : t('phFileName');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#252526] border border-[#3e3e42] p-4 rounded shadow-2xl w-80 animate-fade-in">
                <h3 className="text-sm font-bold text-[#e0e0e0] mb-3">{title}</h3>
                
                <input 
                    className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-xs px-2 py-1.5 rounded-sm text-white mb-3 outline-none"
                    placeholder={placeholder}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') onSave(name, config); }}
                />
                
                {isFolder && (
                    <>
                        <div className="text-[10px] text-[#858585] uppercase font-bold mb-1">{t('lblDefaults')}</div>
                        <div className="space-y-2 mb-4">
                            <input 
                                className="w-full bg-[#3c3c3c] border border-transparent text-xs px-2 py-1.5 rounded-sm text-[#cccccc] outline-none placeholder-[#666]"
                                placeholder={t('phDefTone')}
                                value={config.defaultTone || ''}
                                onChange={e => setConfig({...config, defaultTone: e.target.value})}
                            />
                            <textarea 
                                className="w-full bg-[#3c3c3c] border border-transparent text-xs px-2 py-1.5 rounded-sm text-[#cccccc] outline-none placeholder-[#666] h-16 resize-none"
                                placeholder={t('phDefPrompt')}
                                value={config.defaultSystemPrompt || ''}
                                onChange={e => setConfig({...config, defaultSystemPrompt: e.target.value})}
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="px-3 py-1 text-xs text-[#cccccc] hover:bg-[#3e3e42] rounded-sm">{t('btnCancel')}</button>
                    <button onClick={() => onSave(name, config)} className="px-3 py-1 text-xs bg-[#0e639c] text-white hover:bg-[#1177bb] rounded-sm">{t('btnSave')}</button>
                </div>
            </div>
        </div>
    );
  };

  if (currentView !== 'main') return null;

  // Search Filter
  const filteredHistory = history.filter(h => 
      (h.title || h.topic).toLowerCase().includes(search.toLowerCase())
  );

  // Group by folder
  const rootItems = filteredHistory.filter(h => !h.folderId);
  
  const handleContextMenu = (e: React.MouseEvent, options: any[]) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, options });
  };

  const openFolderModal = (mode: 'folder_create' | 'folder_edit', id?: string) => {
      setModalMode(mode);
      setTargetId(id || null);
  };

  const openRenameFileModal = (id: string) => {
      setModalMode('file_rename');
      setTargetId(id);
  }

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, draftId: string) => {
      e.dataTransfer.setData('draftId', draftId);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | 'root') => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
      setDragOverFolderId(folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | undefined) => {
      e.preventDefault();
      const draftId = e.dataTransfer.getData('draftId');
      if (draftId) {
          moveDraft(draftId, folderId);
      }
      setDragOverFolderId(null);
  };

  return (
    <div className="hidden lg:flex flex-col w-64 bg-[#252526] h-full shrink-0 border-r border-[#1e1e1e] select-none">
      
      {/* HEADER */}
      <div className="h-9 px-4 flex items-center justify-between text-[11px] font-bold text-[#bbbbbb] uppercase tracking-wider bg-[#252526]">
        <span>{t('explorer')}</span>
        <div className="flex items-center gap-1">
            <button 
                onClick={() => openFolderModal('folder_create')}
                className="hover:bg-[#3e3e42] p-1 rounded" title={t('mdlNewProject')}
            >
                <FolderOpen className="w-3.5 h-3.5" />
            </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="px-4 py-2">
        <div className="bg-[#3c3c3c] border border-transparent focus-within:border-[#007acc] rounded-sm px-2 py-1 flex items-center gap-2">
            <Search className="w-3 h-3 text-[#cccccc]" />
            <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs text-[#cccccc] w-full outline-none placeholder-[#cccccc]/50" 
            />
        </div>
      </div>

      {/* FILE TREE */}
      <div 
         className="flex-1 overflow-y-auto custom-scrollbar"
         onDragOver={(e) => handleDragOver(e, 'root')} // Root drop zone
         onDrop={(e) => {
             // Only handle drop if not dropped on a specific folder (event bubbling)
             if (e.target === e.currentTarget) {
                 handleDrop(e, undefined);
             }
         }}
      >
          
          {/* TEMPLATES */}
          {templates.length > 0 && (
             <div className="mb-2">
                 <div className="px-2 py-1 text-[10px] font-bold text-[#858585] uppercase flex items-center gap-1">
                     <LayoutTemplate className="w-3 h-3" /> {t('lblTemplates')}
                 </div>
                 {templates.map(tpl => (
                     <div 
                        key={tpl.id}
                        className="group flex items-center gap-2 px-4 py-1 text-xs cursor-pointer text-[#cccccc] hover:bg-[#2a2d2e] relative"
                        onClick={() => loadTemplate(tpl)}
                        onContextMenu={(e) => handleContextMenu(e, [
                            { label: t('ctxDeleteTemplate'), icon: Trash2, danger: true, action: () => deleteTemplate(tpl.id) }
                        ])}
                     >
                        <FileJson className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate flex-1">{tpl.name}</span>
                     </div>
                 ))}
             </div>
          )}

          {/* FOLDERS */}
          {folders.map(folder => {
              const folderItems = filteredHistory.filter(h => h.folderId === folder.id);
              const isActive = editorState.activeFolderId === folder.id;
              const isDragOver = dragOverFolderId === folder.id;
              
              return (
                  <div 
                    key={folder.id}
                    onDragOver={(e) => { e.stopPropagation(); handleDragOver(e, folder.id); }}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder.id); }}
                    className={`${isDragOver ? 'bg-[#37373d] ring-1 ring-[#007acc] ring-inset' : ''}`}
                  >
                      <div 
                          className={`group flex items-center gap-1 px-2 py-1 text-xs cursor-pointer hover:bg-[#2a2d2e] ${isActive ? 'bg-[#37373d]' : ''}`}
                          onClick={() => toggleFolder(folder.id)}
                          onContextMenu={(e) => handleContextMenu(e, [
                              { label: t('ctxSetActive'), icon: Check, action: () => setActiveFolder(folder.id) },
                              { label: t('ctxEditSettings'), icon: Settings, action: () => openFolderModal('folder_edit', folder.id) },
                              { label: t('ctxDeleteFolder'), icon: Trash2, danger: true, action: () => deleteFolder(folder.id) }
                          ])}
                      >
                          {folder.isExpanded ? <ChevronDown className="w-3 h-3 text-[#cccccc]" /> : <ChevronRight className="w-3 h-3 text-[#cccccc]" />}
                          {folder.isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-[#dcb67a]" /> : <Folder className="w-3.5 h-3.5 text-[#dcb67a]" />}
                          <span className="font-bold truncate text-[#e0e0e0] flex-1">{folder.name}</span>
                          {folder.config?.defaultTone && <span className="text-[9px] px-1 bg-[#3e3e42] rounded text-[#858585]">{folder.config.defaultTone.substring(0,2)}</span>}
                          
                          <div 
                             onClick={(e) => { e.stopPropagation(); setActiveFolder(folder.id); }}
                             className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-transparent border border-[#555] group-hover:border-green-500'} mr-1`} 
                             title="Active Project"
                          />
                      </div>

                      {folder.isExpanded && (
                          <div className="ml-0 border-l border-[#3e3e42] ml-3 pl-1">
                              {folderItems.length === 0 && (
                                  <div className="px-4 py-1 text-[10px] text-[#666] italic">{t('emptyProject')}</div>
                              )}
                              {folderItems.map(post => {
                                  const isSelected = editorState.currentDraftId === post.id;
                                  return (
                                    <div 
                                        key={post.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, post.id)}
                                        onClick={() => loadDraftToEditor(post)}
                                        onContextMenu={(e) => handleContextMenu(e, [
                                            { label: t('ctxRename'), icon: Edit2, action: () => openRenameFileModal(post.id) },
                                            { label: t('ctxDeleteDraft'), icon: Trash2, danger: true, action: () => deleteDraft(post.id) }
                                        ])}
                                        className={`group flex items-center gap-2 px-3 py-1 text-xs cursor-pointer border-l-2 transition-all hover:bg-[#2a2d2e]
                                            ${isSelected ? 'bg-[#094771] text-white border-white' : 'text-[#cccccc] border-transparent'}
                                        `}
                                    >
                                        <FileText className={`w-3.5 h-3.5 ${post.status === 'published' ? 'text-[#73c991]' : (post.status === 'scheduled' ? 'text-orange-400' : 'text-[#519aba]')}`} />
                                        <span className="truncate flex-1 font-mono text-[11px]" title={post.topic}>{post.title || post.topic}</span>
                                        <DraftBadges draft={post} />
                                    </div>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              );
          })}

          {/* ROOT ITEMS DROP ZONE */}
          <div 
            className={`mt-1 min-h-[50px] ${dragOverFolderId === 'root' ? 'bg-[#2a2d2e] ring-1 ring-[#007acc] ring-inset' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'root')}
            onDrop={(e) => handleDrop(e, undefined)}
          >
             <div className="px-2 py-1 text-[10px] font-bold text-[#858585] uppercase">{t('lblUncategorized')}</div>
             {rootItems.length === 0 && <div className="px-4 text-[10px] text-[#666]">{t('noDraftsRoot')}</div>}
             {rootItems.map(post => {
                const isSelected = editorState.currentDraftId === post.id;
                return (
                    <div 
                        key={post.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, post.id)}
                        onClick={() => { loadDraftToEditor(post); setActiveFolder(null); }}
                        onContextMenu={(e) => handleContextMenu(e, [
                            { label: t('ctxRename'), icon: Edit2, action: () => openRenameFileModal(post.id) },
                            { label: t('ctxDelete'), icon: Trash2, danger: true, action: () => deleteDraft(post.id) }
                        ])}
                        className={`group flex items-center gap-2 px-4 py-1 text-xs cursor-pointer border-l-2 transition-all hover:bg-[#2a2d2e]
                            ${isSelected ? 'bg-[#094771] text-white border-white' : 'text-[#cccccc] border-transparent'}
                        `}
                    >
                        <FileText className={`w-3.5 h-3.5 ${post.status === 'published' ? 'text-[#73c991]' : (post.status === 'scheduled' ? 'text-orange-400' : 'text-[#d7ba7d]')}`} />
                        <span className="truncate flex-1 font-mono text-[11px]" title={post.topic}>{post.title || post.topic}</span>
                        <DraftBadges draft={post} />
                    </div>
                );
             })}
          </div>

      </div>

      {/* FOOTER */}
      <div className="h-6 bg-[#007acc] text-white flex items-center px-2 text-[10px] gap-2">
         <span className="font-bold">{editorState.activeFolderId ? `${t('lblProject')}: ${folders.find(f => f.id === editorState.activeFolderId)?.name}` : t('lblRoot')}</span>
      </div>

      {/* RENDER CONTEXT MENU */}
      {contextMenu && (
          <>
             <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)}></div>
             <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />
          </>
      )}

      {/* UNIFIED MODAL */}
      <ItemModal 
        isOpen={modalMode !== null} 
        mode={modalMode}
        onClose={() => { setModalMode(null); setTargetId(null); }}
        initialName={
            modalMode === 'file_rename' 
            ? (history.find(h => h.id === targetId)?.title || history.find(h => h.id === targetId)?.topic) 
            : (targetId ? folders.find(f => f.id === targetId)?.name : '')
        }
        initialConfig={
            (modalMode === 'folder_edit' && targetId) ? folders.find(f => f.id === targetId)?.config : {}
        }
        onSave={(name: string, config: ProjectConfig) => {
            if (modalMode === 'folder_create') {
                createFolder(name, config);
            } else if (modalMode === 'folder_edit' && targetId) {
                updateFolder(targetId, name, config);
            } else if (modalMode === 'file_rename' && targetId) {
                renameDraft(targetId, name);
            }
            setModalMode(null);
            setTargetId(null);
        }}
      />
    </div>
  );
};
