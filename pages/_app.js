import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';

// Supabase Client Initialization
const supabase = createClient(
    'https://novjnzqpvmhfbvxgxwdh.supabase.co', 
    'sb_publishable_izEhNjnWp4VD36Td3mdCjQ_XnlT1AMz'
);

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            // ၁။ လမ်းကြောင်းဟောင်း (/editor) ကို လာရင် ပင်မစာမျက်နှာ (/) ကို အတင်းပြန်ပို့မယ်
            if (router.pathname === '/editor') {
                router.replace('/');
                return;
            }

            // ၂။ Login မဝင်ရသေးရင် Login Page ကို ပို့မယ်
            if (!session && router.pathname !== '/login') {
                router.replace('/login');
            } 
            // ၃။ Login ဝင်ထားပြီးသားဆိုရင် Login Page ကနေ ပင်မစာမျက်နှာ (/) ကို ပို့မယ်
            else if (session && router.pathname === '/login') {
                router.replace('/');
            }

            setLoading(false);
        };

        checkUser();

        // Auth အပြောင်းအလဲဖြစ်တိုင်း (ဥပမာ Logout လုပ်ရင်) စောင့်ကြည့်ဖို့
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session && router.pathname !== '/login') {
                router.replace('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [router.pathname]);

    // Loading ပြနေချိန် (Branded Screen)
    if (loading) {
        return (
            <div className="min-h-screen bg-[#060912] flex items-center justify-center text-blue-500/30 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse font-padauk">
                Yangon TV Production Lab...
            </div>
        );
    }

    const menuVariants = {
        hidden: { opacity: 0, x: -300 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -300, transition: { duration: 0.2 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    return (
        <>
            <Head>
                {/* Mobile Optimizations - Redmi Note 14 & All Phones */}
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                {/* Font Awesome Icons */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <title>Yangon TV - Production</title>
            </Head>

            {/* Global Menu Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="fixed top-6 left-6 z-[200] w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all active:scale-90"
                title="Open Menu"
            >
                <i className="fas fa-bars text-lg"></i>
            </button>

            {/* Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Glassmorphism Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed left-0 top-0 h-screen w-80 z-[160] glass rounded-r-3xl shadow-2xl overflow-hidden"
                        style={{
                            background: 'rgba(6, 9, 18, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        {/* Menu Header */}
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest">YGNTV</h2>
                            <p className="text-xs text-blue-400 font-bold mt-1">Subtitle Editor</p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex flex-col gap-1 p-4 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold uppercase transition-all ${
                                    activeTab === 'about'
                                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                                        : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                <i className="fas fa-info-circle mr-2"></i> About App
                            </button>
                            <button
                                onClick={() => setActiveTab('tutorial')}
                                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold uppercase transition-all ${
                                    activeTab === 'tutorial'
                                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                                        : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                <i className="fas fa-book mr-2"></i> Tutorial
                            </button>
                            <button
                                onClick={() => setActiveTab('rules')}
                                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold uppercase transition-all ${
                                    activeTab === 'rules'
                                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                                        : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                <i className="fas fa-gavel mr-2"></i> Rules
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 overflow-y-auto h-[calc(100vh-280px)] space-y-4">
                            {/* About App Info */}
                            {activeTab === 'about' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-400 mb-2">App Description</h3>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            YGN TV Subtitle Editor သည် မြန်မာစာတန်းထိုး (Burmese Subtitles) များအား ပိုမိုမြန်ဆန်၊ သပ်ရပ်စွာ တည်းဖြတ်နိုင်ရန် Rules လုပ်ငန်းသုံး Tool တစ်ခုဖြစ်သည်။
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-green-400 mb-2">Key Features</h3>
                                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                                            <li>Premium Glassmorphism UI</li>
                                            <li>SRT Parsing & Sync</li>
                                            <li>Instant Server Sync</li>
                                            <li>Smart Toolbar</li>
                                            <li>Responsive Design</li>
                                        </ul>
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-[10px] text-white/40 font-bold uppercase">Yangon TV Production Lab</p>
                                        <p className="text-[9px] text-white/30">Version 2.0</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* User Tutorial */}
                            {activeTab === 'tutorial' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-400 mb-3">How to Use</h3>
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-xs font-bold text-white mb-1">Step 1: Upload SRT File</p>
                                                <p className="text-[11px] text-slate-400">Click the Upload button to select your .srt file</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-xs font-bold text-white mb-1">Step 2: Edit Content</p>
                                                <p className="text-[11px] text-slate-400">Edit subtitle text and timing as needed</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-xs font-bold text-white mb-1">Step 3: Sync Timing</p>
                                                <p className="text-[11px] text-slate-400">Use Advanced Resync for calibration</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-xs font-bold text-white mb-1">Step 4: Finalize</p>
                                                <p className="text-[11px] text-slate-400">Click Finalize & Archive to submit</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Rules & Regulations */}
                            {activeTab === 'rules' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-sm font-bold text-red-400 mb-3">Team Rules</h3>
                                        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                                            <li>စာတန်းထိုးရာတွင် သတ်ပုံအမှားမပါစေရန်</li>
                                            <li>ဘာသာပြန်ဆိုချက်များသည် မူရင်းအဓိပ္ပာယ်ကို မပျက်ယွင်းစေရန်</li>
                                            <li>သတ်မှတ်ထားသော Deadline အတွင်း အပြီးသတ်ပေးပို့ရန်</li>
                                            <li>Team ၏ လျှို့ဝှက်ချက်များကို ထိန်းသိမ်းရန်</li>
                                        </ul>
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <a
                                            href="https://github.com/Jeff-YANGONtv/YGNTV-Rules"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-block px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-center text-xs font-bold uppercase hover:bg-red-600/30 transition-all"
                                        >
                                            <i className="fas fa-external-link-alt mr-2"></i> View Full Rules
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Close Button */}
                        <div className="absolute top-6 right-6">
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Component {...pageProps} />
        </>
}

export default MyApp;
