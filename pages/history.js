import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

const supabase = createClient(
    'https://novjnzqpvmhfbvxgxwdh.supabase.co', 
    'sb_publishable_izEhNjnWp4VD36Td3mdCjQ_XnlT1AMz'
);

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('activity_history')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(40);
            if (!error) setHistory(data);
            setLoading(false);
        };
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-[#060912] text-slate-200 font-padauk pb-20">
            <Head><title>Archive | Yangon TV Production</title></Head>

            <nav className="fixed top-0 w-full z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center justify-around px-4">
                <Link href="/" className="text-white/20 flex flex-col items-center"><i className="fas fa-edit text-lg"></i><span className="text-[9px] font-black mt-1 uppercase">Lab</span></Link>
                <Link href="/history" className="text-blue-500 flex flex-col items-center"><i className="fas fa-history text-lg"></i><span className="text-[9px] font-black mt-1 uppercase">Archive</span></Link>
                <button onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }} className="text-red-500/50 flex flex-col items-center"><i className="fas fa-power-off text-lg"></i><span className="text-[9px] font-black mt-1 uppercase">Exit</span></button>
            </nav>

            <main className="pt-28 p-6 max-w-2xl mx-auto space-y-6">
                <div className="space-y-1 mb-10">
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-wider">Production Archive</h1>
                    <p className="text-[9px] text-blue-500 font-bold uppercase tracking-[0.3em]">Yangon TV Media Network</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 text-blue-500/20 animate-pulse text-[10px] font-black tracking-widest uppercase">Fetching Data...</div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="bg-white/5 border border-white/5 p-6 rounded-[2.2rem] backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full group-hover:bg-blue-600/10 transition-all"></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="space-y-2 max-w-[75%]">
                                        <h3 className="text-xs font-bold text-slate-100 truncate">{item.file_name}</h3>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-[8px] bg-blue-600/30 text-blue-400 px-3 py-1 rounded-full font-black uppercase">By: {item.editor_name}</span>
                                            <span className="text-[8px] text-white/20 font-mono italic">{new Date(item.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg border border-white/5">
                                        <i className="fas fa-download"></i>
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
                    }
        
