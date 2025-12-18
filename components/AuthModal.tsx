
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { t, showToast } = useAppContext();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
                        }
                    }
                });
                if (signUpError) throw signUpError;
                showToast("Account created! You can now log in.", "success");
                setMode('signin');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
                showToast(t('authWelcome'), "success");
                onClose();
            }
        } catch (err: any) {
            setError(err.message || t('authError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl w-full max-w-sm animate-fade-in overflow-hidden relative">
                
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#666] hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 pt-8 text-center">
                    <h2 className="text-xl font-bold text-white mb-2">{t('authTitle')}</h2>
                    <p className="text-xs text-[#969696] mb-6 leading-relaxed">
                        {t('authDesc')}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4 text-left">
                        {mode === 'signup' && (
                            <div>
                                <label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        required
                                        className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 pl-10 text-sm text-white focus:border-[#007acc] outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('authEmail')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 pl-10 text-sm text-white focus:border-[#007acc] outline-none"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('authPassword')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 pl-10 text-sm text-white focus:border-[#007acc] outline-none"
                                    placeholder="••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? t('authLoading') : (
                                mode === 'signin' ? <><LogIn className="w-4 h-4" /> {t('authSignIn')}</> : <><UserPlus className="w-4 h-4" /> {t('authSignUp')}</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-[#3e3e42]">
                        <button 
                            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                            className="text-xs text-[#007acc] hover:text-[#40a6ff] hover:underline"
                        >
                            {mode === 'signin' ? t('authNoAccount') : t('authHasAccount')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
