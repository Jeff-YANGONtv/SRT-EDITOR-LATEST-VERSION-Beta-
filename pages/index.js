import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://novjnzqpvmhfbvxgxwdh.supabase.co', 
    'sb_publishable_izEhNjnWp4VD36Td3mdCjQ_XnlT1AMz'
);

export default function EditorPage() {
    const [srtBlocks, setSrtBlocks] = useState([]);
    const [historyStack, setHistoryStack] = useState([]);
    const [movieName, setMovieName] = useState("");
    const [mediaType, setMediaType] = useState("movie");
    const [season, setSeason] = useState("");
    const [episode, setEpisode] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [rawFileName, setRawFileName] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [senderName, setSenderName] = useState("");
    const [showSyncTools, setShowSyncTools] = useState(false);
    const router = useRouter();

    const [firstSubTime, setFirstSubTime] = useState("");
    const [lastSubTime, setLastSubTime] = useState("");

    const CONFIG = {
        BOT_TOKEN: '8069487397:AAHtsni-K1sFyOL1-MnvtooIYmEiZDohKYo',
        CHAT_IDS: ['6369723726', '6986426348']
    };

    useEffect(() => {
        const savedName = localStorage.getItem('ygn_user');
        if (savedName) setSenderName(savedName);
    }, []);

    const saveToHistory = () => setHistoryStack(prev => [...prev.slice(-19), JSON.stringify(srtBlocks)]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    // 🧹 Blank Line Delete Function (With Renumbering)
    const cleanBlankLines = () => {
        if (srtBlocks.length === 0) return;
        saveToHistory();
        const cleaned = srtBlocks
            .filter(b => b.text.trim() !== "")
            .map((b, i) => ({ ...b, id: i + 1 }));
        setSrtBlocks(cleaned);
        alert("စာသားမရှိတဲ့ အကွက်လွတ်တွေ ရှင်းထုတ်ပြီးပါပြီ!");
    };

    // --- Core Sync Logic ---
    const timeToMs = (t) => {
        if (!t) return 0;
        const parts = t.replace(',', '.').split(':');
        return (parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2])) * 1000;
    };

    const msToTime = (ms) => {
        if (ms < 0) ms = 0;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = (ms % 60000) / 1000;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0').replace('.', ',')}`;
    };

    const applyAdvancedSync = () => {
        if (!firstSubTime || !lastSubTime || srtBlocks.length < 2) return alert("Calibration Times ထည့်ပါဦး!");
        saveToHistory();
        const oldStart = timeToMs(srtBlocks[0].time.split(' --> ')[0]);
        const oldEnd = timeToMs(srtBlocks[srtBlocks.length - 1].time.split(' --> ')[0]);
        const newStart = timeToMs(firstSubTime);
        const newEnd = timeToMs(lastSubTime);
        const factor = (newEnd - newStart) / (oldEnd - oldStart);

        setSrtBlocks(prev => prev.map(b => {
            const [start, end] = b.time.split(' --> ');
            const sMs = newStart + (timeToMs(start) - oldStart) * factor;
            const eMs = sMs + (timeToMs(end) - timeToMs(start)) * factor;
            return { ...b, time: `${msToTime(sMs)} --> ${msToTime(eMs)}` };
        }));
        setShowSyncTools(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRawFileName(file.name);
        const reader = new FileReader();
        reader.onload = (r) => {
            const content = r.target.result.replace(/\r/g, '').trim();
            const blocks = content.split(/\n\s*\n/);
            const parsed = blocks.map((b, i) => {
                const lines = b.split('\n').filter(l => l.trim() !== "");
                if (lines.length < 2) return null;
                const timeLine = lines.find(l => l.includes(' --> '));
                const textLines = lines.filter(l => l !== timeLine && !/^\d+$/.test(l));
                return { id: i + 1, time: timeLine || "", text: textLines.join('\n') };
            }).filter(b => b && b.time);
            setSrtBlocks(parsed);
        };
        reader.readAsText(file);
    };

    const sendData = async () => {
        if (!movieName || !senderName || srtBlocks.length === 0) return alert("Data အစုံအလင်ဖြည့်ပါ!");
        setIsSending(true);
        const seriesInfo = mediaType === 'tv' ? `S${season}E${episode}` : '';
        const fname = `[YGN]_${movieName.replace(/\s+/g, '_')}_${seriesInfo}.srt`;
        const fPath = `${Date.now()}_${fname}`;
        const srtContent = srtBlocks
            .filter(b => b.text.trim() !== "")
            .map((b, i) => `${i + 1}\n${b.time}\n${b.text.trim()}`)
            .join('\n\n');
        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });

        try {
            // Upload to Storage
            const { error: uploadError } = await supabase.storage.from('srt-files').upload(fPath, blob);
            if (uploadError) throw uploadError;

            // Get URL & Insert History (Force sync)
            const { data: urlData } = supabase.storage.from('srt-files').getPublicUrl(fPath);
            const { error: dbError } = await supabase.from('activity_history').insert([{
                editor_name: senderName,
                file_name: fname,
                file_url: urlData.publicUrl,
                action_type: "Upload"
            }]);
            
            if (dbError) throw dbError;

            // Telegram Send
            for (let cid of CONFIG.CHAT_IDS) {
                const fd = new FormData();
                fd.append('chat_id', cid); fd.append('document', blob, fname);
                fd.append('caption', `🎥 ${movieName} ${seriesInfo}\n✍️ By ${senderName}\n🌐 Yangon TV Production`);
                await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendDocument`, { method: 'POST', body: fd });
            }

            alert("Finalized & Archive Completed!");
            router.reload();
        } catch (e) { alert(e.message); } finally { setIsSending(false); }
    };

    return (
        <div className="min-h-screen bg-[#060912] text-slate-200 font-padauk pb-44">
            <Head><title>Yangon TV - Production Lab</title></Head>
            
            <nav className="fixed top-0 w-full z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center justify-around px-4">
                <Link href="/" className="text-blue-500 flex flex-col items-center">
                    <i className="fas fa-edit text-lg"></i>
                    <span className="text-[9px] font-black mt-1 uppercase">Lab</span>
                </Link>
                <Link href="/history" className="text-white/20 flex flex-col items-center">
                    <i className="fas fa-history text-lg"></i>
                    <span className="text-[9px] font-black mt-1 uppercase">Archive</span>
                </Link>
                <button onClick={handleLogout} className="text-red-500/50 flex flex-col items-center">
                    <i className="fas fa-power-off text-lg"></i>
                    <span className="text-[9px] font-black mt-1 uppercase">Exit</span>
                </button>
            </nav>

            <main className="pt-28 p-4 max-w-md mx-auto space-y-6">
                <div className="glass-card p-6 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 shadow-2xl">
                    <input type="text" placeholder="Editor Name" value={senderName} onChange={e => {setSenderName(e.target.value); localStorage.setItem('ygn_user', e.target.value);}} className="w-full bg-black/40 p-4 rounded-2xl text-xs outline-none border border-white/5 focus:border-blue-500/50 transition-all" />
                    <input type="text" placeholder="Movie Name" value={movieName} onChange={e => setMovieName(e.target.value)} className="w-full bg-black/40 p-4 rounded-2xl text-xs outline-none border border-white/5 focus:border-blue-500/50 transition-all" />
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 gap-1">
                        <button onClick={() => setMediaType('movie')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mediaType === 'movie' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/30'}`}>Movie</button>
                        <button onClick={() => setMediaType('tv')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mediaType === 'tv' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/30'}`}>Series</button>
                    </div>
                    {mediaType === 'tv' && (
                        <div className="flex gap-2">
                            <input type="number" placeholder="Season" value={season} onChange={e => setSeason(e.target.value)} className="flex-1 bg-black/60 p-4 rounded-2xl text-xs border border-white/5 text-center outline-none focus:border-blue-500/50" />
                            <input type="number" placeholder="Episode" value={episode} onChange={e => setEpisode(e.target.value)} className="flex-1 bg-black/60 p-4 rounded-2xl text-xs border border-white/5 text-center outline-none focus:border-blue-500/50" />
                        </div>
                    )}
                </div>

                <div className="flex gap-3 px-2">
                    <label className="flex-1 bg-blue-600 p-4 rounded-3xl text-[10px] font-black uppercase text-center cursor-pointer shadow-lg active:scale-95 transition-all">
                        <i className="fas fa-file-upload mr-2"></i> {rawFileName ? "Change" : "Upload SRT"}
                        <input type="file" accept=".srt" className="hidden" onChange={handleFileChange} />
                    </label>
                    {/* Clean Blank Button */}
                    <button onClick={cleanBlankLines} className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center active:scale-90 transition-all" title="Clean Blanks">
                        <i className="fas fa-broom"></i>
                    </button>
                    <button onClick={() => setShowSyncTools(!showSyncTools)} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${showSyncTools ? 'bg-blue-600/20 border-blue-600/40 text-blue-400 shadow-lg' : 'bg-white/5 border-white/5 text-white/20'}`}>
                        <i className="fas fa-sync-alt"></i>
                    </button>
                    <button onClick={() => { if (historyStack.length > 0) { setSrtBlocks(JSON.parse(historyStack[historyStack.length - 1])); setHistoryStack(prev => prev.slice(0, -1)); } }} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 text-yellow-500 active:scale-90">
                        <i className="fas fa-undo"></i>
                    </button>
                </div>

                <AnimatePresence>
                    {showSyncTools && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-blue-600/10 p-6 rounded-[2.5rem] border border-blue-500/20 space-y-4 shadow-2xl">
                            <h3 className="text-[10px] font-black text-center uppercase tracking-widest text-blue-400 italic">Advanced Resync</h3>
                            <div className="space-y-3">
                                <input type="text" placeholder="First Sub Target (00:00:10,000)" value={firstSubTime} onChange={e => setFirstSubTime(e.target.value)} className="w-full bg-black/40 p-4 rounded-xl text-center font-mono text-xs text-green-400 border border-white/5 outline-none" />
                                <input type="text" placeholder="Last Sub Target (01:30:45,000)" value={lastSubTime} onChange={e => setLastSubTime(e.target.value)} className="w-full bg-black/40 p-4 rounded-xl text-center font-mono text-xs text-green-400 border border-white/5 outline-none" />
                                <button onClick={applyAdvancedSync} className="w-full bg-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">Apply Calibration</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    <input type="text" placeholder="Quick search content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 p-4 rounded-2xl text-xs border border-white/5 outline-none focus:border-blue-500/40 transition-all" />
                    {srtBlocks.filter(b => b.text.toLowerCase().includes(searchQuery.toLowerCase())).map((b) => (
                        <div key={b.id} className="bg-white/5 p-6 rounded-[2.2rem] border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-green-500 text-[10px] font-mono font-bold">{b.time}</span>
                                <span className="text-[8px] text-white/10 font-black tracking-widest">#{b.id}</span>
                            </div>
                            <textarea value={b.text} onChange={(e) => { 
                                const u = [...srtBlocks]; 
                                const idx = u.findIndex(bl => bl.id === b.id); 
                                u[idx].text = e.target.value; 
                                setSrtBlocks(u); 
                            }} className="w-full bg-black/20 p-5 rounded-2xl text-sm outline-none border border-white/10 min-h-[120px] text-white/80 focus:border-blue-500/30" />
                        </div>
                    ))}
                </div>
            </main>

            <footer className="fixed bottom-0 w-full z-[110] bg-black/80 backdrop-blur-3xl px-6 pt-6 pb-12 border-t border-white/5 rounded-t-[3.5rem]">
                <button onClick={sendData} disabled={isSending} className="w-full bg-blue-600 h-16 rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all shadow-blue-600/20">
                    {isSending ? <><i className="fas fa-spinner animate-spin mr-2"></i> UPLOADING...</> : "FINALIZE & ARCHIVE"}
                </button>
            </footer>
        </div>
    );
        }
        
