import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    Clock, 
    CheckCircle2, 
    FileText, 
    Plus,
    MoreHorizontal
} from 'lucide-react';
import { PostDraft } from '../types';

export const CalendarPage: React.FC = () => {
    const { history, t, loadDraftToEditor, setEditorState, editorState, setCurrentView } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // --- DATE LOGIC ---
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun
    
    // Adjust for Monday start (EU/RU standard)
    // If Sun (0) -> 6. If Mon (1) -> 0.
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    // --- HELPERS ---
    const getPostsForDate = (day: number) => {
        return history.filter(p => {
            if (!p.scheduledAt) return false;
            const d = new Date(p.scheduledAt);
            return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        });
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    const handleCreatePostOnDate = () => {
        if (!selectedDate) return;
        
        // Set time to 10:00 AM by default for new posts
        const scheduledTime = new Date(selectedDate);
        scheduledTime.setHours(10, 0, 0, 0);

        setEditorState({
            ...editorState,
            topic: '',
            generatedText: '',
            generatedImage: null,
            currentDraftId: null,
            // Format for datetime-local input: YYYY-MM-DDTHH:mm
            scheduledAt: new Date(scheduledTime.getTime() - (scheduledTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
        });
        setCurrentView('main');
    };

    // --- SUB-COMPONENTS ---

    const CalendarCell: React.FC<{ day: number, isCurrentMonth: boolean, isToday: boolean, isSelected: boolean }> = ({ day, isCurrentMonth, isToday, isSelected }) => {
        const posts = isCurrentMonth ? getPostsForDate(day) : [];
        
        return (
            <div 
                onClick={() => isCurrentMonth && handleDayClick(day)}
                className={`
                    min-h-[100px] border-b border-r border-[#3e3e42] p-2 relative group transition-all select-none
                    ${!isCurrentMonth ? 'bg-[#1e1e1e] text-[#444] pointer-events-none' : 'bg-[#252526] hover:bg-[#2d2d2d] cursor-pointer text-[#ccc]'}
                    ${isSelected ? 'bg-[#2d2d2d] ring-1 ring-inset ring-[#007acc]' : ''}
                `}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold ${isToday ? 'bg-[#007acc] text-white px-1.5 rounded-full' : ''}`}>
                        {day}
                    </span>
                    {posts.length > 0 && <span className="text-[10px] text-[#666] font-mono">{posts.length}</span>}
                </div>

                <div className="mt-2 space-y-1">
                    {posts.slice(0, 3).map(post => (
                        <div key={post.id} className="flex items-center gap-1.5 px-1 py-0.5 rounded bg-[#1e1e1e] border border-[#333] overflow-hidden">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${post.status === 'published' ? 'bg-green-500' : 'bg-orange-500'}`} />
                            <span className="text-[9px] truncate w-full">{post.title || post.topic}</span>
                        </div>
                    ))}
                    {posts.length > 3 && (
                        <div className="text-[9px] text-[#666] pl-1">+{posts.length - 3} more</div>
                    )}
                </div>
            </div>
        );
    };

    const DayDetailsPanel = () => {
        if (!selectedDate) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-[#666] p-8 text-center h-full">
                    <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Select a day to view or plan content.</p>
                </div>
            );
        }

        const datePosts = getPostsForDate(selectedDate.getDate()).sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0));
        const formattedDate = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

        return (
            <div className="h-full flex flex-col">
                <div className="p-6 border-b border-[#3e3e42] bg-[#252526]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{formattedDate}</h3>
                            <p className="text-xs text-[#858585]">{datePosts.length} posts scheduled</p>
                        </div>
                        <button 
                            onClick={handleCreatePostOnDate}
                            className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-3 py-1.5 rounded-sm text-xs font-bold flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> {t('calAddPost')}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1e1e1e]">
                    {datePosts.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-xs text-[#858585] italic">{t('calNoPosts')}</p>
                        </div>
                    )}
                    
                    {datePosts.map(post => {
                        const time = new Date(post.scheduledAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div 
                                key={post.id} 
                                onClick={() => loadDraftToEditor(post)}
                                className="group bg-[#252526] border border-[#3e3e42] rounded-md p-3 hover:border-[#505050] hover:bg-[#2d2d2d] cursor-pointer transition-all shadow-sm flex gap-3"
                            >
                                <div className="flex flex-col items-center gap-1 pt-1 min-w-[40px]">
                                    <span className="text-[10px] font-mono text-[#858585]">{time}</span>
                                    <div className={`w-0.5 h-full ${post.status === 'published' ? 'bg-green-500/30' : 'bg-orange-500/30'}`}></div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                                            post.status === 'published' ? 'bg-green-900/20 text-green-400' : 'bg-orange-900/20 text-orange-400'
                                        }`}>
                                            {post.status === 'published' ? t('calPublished') : t('calScheduled')}
                                        </span>
                                        <MoreHorizontal className="w-4 h-4 text-[#444] group-hover:text-[#ccc]" />
                                    </div>
                                    <h4 className="text-sm font-medium text-[#e0e0e0] truncate mb-1">{post.title || post.topic}</h4>
                                    <p className="text-[11px] text-[#858585] line-clamp-2 leading-relaxed opacity-80 font-mono">
                                        {post.content.slice(0, 100).replace(/<[^>]*>?/gm, '')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- RENDER ---
    return (
        <div className="flex h-full bg-[#1e1e1e] text-slate-300 overflow-hidden font-sans select-none animate-fade-in">
            {/* LEFT: CALENDAR GRID */}
            <div className="flex-1 flex flex-col border-r border-[#3e3e42]">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-6 border-b border-[#252526] bg-[#1e1e1e]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-400" /> {monthName} <span className="text-[#666]">{year}</span>
                        </h2>
                        <div className="flex gap-1">
                            <button onClick={handlePrevMonth} className="p-1.5 rounded hover:bg-[#333] text-[#ccc]"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="px-2 py-1 text-[10px] bg-[#333] hover:bg-[#444] rounded text-[#ccc] uppercase font-bold">{t('calGoToToday')}</button>
                            <button onClick={handleNextMonth} className="p-1.5 rounded hover:bg-[#333] text-[#ccc]"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex gap-4 text-[10px] font-medium uppercase tracking-wider">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div>{t('calScheduled')}</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>{t('calPublished')}</div>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-[#252526] border-b border-[#3e3e42]">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="py-2 text-center text-[10px] font-bold text-[#666] uppercase">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-[#1e1e1e]">
                    {/* Empty cells for start offset */}
                    {Array.from({ length: startOffset }).map((_, i) => (
                        <CalendarCell 
                            key={`prev-${i}`} 
                            day={prevMonthDays - startOffset + i + 1} 
                            isCurrentMonth={false} 
                            isToday={false}
                            isSelected={false}
                        />
                    ))}

                    {/* Days of current month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate?.toDateString() === date.toDateString();

                        return (
                            <CalendarCell 
                                key={`curr-${i}`} 
                                day={day} 
                                isCurrentMonth={true} 
                                isToday={isToday}
                                isSelected={isSelected}
                            />
                        );
                    })}

                    {/* Fill remaining cells to complete grid (42 cells total usually) */}
                    {Array.from({ length: 42 - daysInMonth - startOffset }).map((_, i) => (
                        <CalendarCell 
                            key={`next-${i}`} 
                            day={i + 1} 
                            isCurrentMonth={false} 
                            isToday={false}
                            isSelected={false}
                        />
                    ))}
                </div>
            </div>

            {/* RIGHT: DETAILS SIDEBAR */}
            <div className="w-80 bg-[#1e1e1e] flex flex-col shadow-2xl z-10">
                <DayDetailsPanel />
            </div>
        </div>
    );
};