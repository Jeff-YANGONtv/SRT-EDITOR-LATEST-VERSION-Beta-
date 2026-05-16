import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
    'https://novjnzqpvmhfbvxgxwdh.supabase.co', 
    'sb_publishable_izEhNjnWp4VD36Td3mdCjQ_XnlT1AMz'
);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                // Login ပုံမှန်ဝင်ခြင်း
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.replace('/'); 
            } else {
                // Sign Up လုပ်တဲ့အခါ Redirect Link ကို Dynamic ဖြစ်အောင် လုပ်ထားတယ်
                const { error } = await supabase.auth.signUp({ 
                    email, password,
                    options: { 
                        // 🔥 ဒီနေရာမှာ လက်နဲ့မရေးတော့ဘဲ လက်ရှိ Link ကိုပဲ ယူခိုင်းလိုက်မယ်
                        emailRedirectTo: `${window.location.origin}/login` 
                    }
                });
                if (error) throw error;
                alert("OTP Code ကို Email ထဲ ပို့ပေးထားတယ် Bro! Spam folder ကိုပါ စစ်ပေးပါ။");
                setShowOtp(true);
            }
        } catch (error) { alert(error.message); } finally { setLoading(false); }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
            if (error) throw error;
            router.replace('/');
        } catch (error) { alert(error.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#060912] flex items-center justify-center p-6 font-padauk text-white">
            <Head><title>Yangon TV | Production Sign In</title></Head>
            <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[100px] rounded-full"></div>
                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-blue-500 tracking-[0.1em] uppercase italic">Yangon TV</h1>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Production System</p>
                    </div>
                    <AnimatePresence mode="wait">
                        {!showOtp ? (
                            <motion.form key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleAuth} className="space-y-5">
                                <input type="email" placeholder="Production Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 p-5 rounded-3xl text-xs outline-none border border-white/5 focus:border-blue-500/50 text-white" required />
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 p-5 rounded-3xl text-xs outline-none border border-white/5 focus:border-blue-500/50 text-white" required />
                                <button disabled={loading} className="w-full bg-blue-600 h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                                    {loading ? <i className="fas fa-spinner animate-spin"></i> : isLogin ? 'Enter Production' : 'Create Account'}
                                </button>
                                <p onClick={() => setIsLogin(!isLogin)} className="text-center text-[10px] text-white/20 uppercase font-black cursor-pointer hover:text-blue-400 transition-colors">
                                    {isLogin ? "Need access? Request Account" : "Back to Sign In"}
                                </p>
                            </motion.form>
                        ) : (
                            <motion.form key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={verifyOtp} className="space-y-6">
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-blue-400 font-bold">Verify Identity</p>
                                    <p className="text-[9px] text-white/40 uppercase">Enter the code sent to your email</p>
                                </div>
                                <input type="text" placeholder="######" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-black/60 p-6 rounded-3xl text-center text-2xl font-mono border border-blue-500/30 text-white" maxLength={6} required />
                                <button disabled={loading} className="w-full bg-green-600 h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all">Confirm & Access</button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
                    }
