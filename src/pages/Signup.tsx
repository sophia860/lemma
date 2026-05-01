import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, ShieldCheck, ArrowRight, Chrome } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      const user = data.user;

      if (user) {
        // Create profile in Supabase
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          plan: "solo",
          subscription_status: "active",
          reports_this_month: 0
        });
        
        if (profileError) throw profileError;
        navigate("/onboarding");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (authError) throw authError;
      // Profile creation handled via trigger or first login check in Dashboard?
      // For now, we rely on the Dashboard/Onboarding checking for profile existence.
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError(err.message || "Could not sign up with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-extrabold tracking-tight inline-block mb-6">
            Suitability<span className="text-blue-600">AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Create your account</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Get started with professional AI reporting</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] rounded-2xl border border-red-100 font-medium leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <button 
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Chrome className="w-5 h-5 text-blue-600" />
            Sign up with Google
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or email</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-1">Work Email</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300"
              placeholder="name@firm.co.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 mt-4 h-[56px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-slate-300" />
          Secure Enterprise Authentication
        </div>

        <p className="text-center mt-8 text-[13px] text-slate-500 font-medium">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
