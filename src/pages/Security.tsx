import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Shield, Key, CheckCircle, AlertCircle, Loader2, QrCode } from "lucide-react";
import { cn } from "../lib/utils";

export default function Security() {
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [mfaData, setMfaData] = useState<any>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFactors();
  }, []);

  async function fetchFactors() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data.all);
    } catch (err: any) {
      console.error("Fetch factors error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function startEnroll() {
    setEnrolling(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "SuitabilityAI",
        friendlyName: "Main Authenticator",
      });
      if (error) throw error;
      setMfaData(data);
    } catch (err: any) {
      setError(err.message);
      setEnrolling(false);
    }
  }

  async function verifyEnroll() {
    setEnrolling(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.mfa.challenge({ factorId: mfaData.id });
      if (error) throw error;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaData.id,
        challengeId: data.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      setSuccess("MFA successfully enabled!");
      setMfaData(null);
      setVerifyCode("");
      fetchFactors();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  async function unenroll(factorId: string) {
    if (!confirm("Are you sure you want to disable this security factor?")) return;
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      fetchFactors();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">Security & Auth Factors</h1>
        <p className="text-sm text-slate-500 font-medium">Protect your account with multi-factor authentication.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Active Factors */}
        <div className="space-y-6">
          <SectionHeader title="Active Security Factors" />
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
              </div>
            ) : factors.length > 0 ? (
              factors.map(f => (
                <div key={f.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{f.friendly_name || "Authenticator App"}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.status} • {f.factor_type}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => unenroll(f.id)}
                    className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                <Shield className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-xs text-slate-400 font-medium">No auth factors active. Your account is less secure.</p>
              </div>
            )}
          </div>
        </div>

        {/* Enroll New */}
        <div className="space-y-6">
          <SectionHeader title="Enable New Factor" />
          {!mfaData ? (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <Key className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">Authenticator App</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-8">Use apps like Google Authenticator, Authy, or Microsoft Authenticator to generate secure one-time codes.</p>
              <button 
                onClick={startEnroll}
                disabled={enrolling}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                {enrolling ? "Initializing..." : "Enroll Factor"}
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-lg space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                  {/* Ideally use a QR component here, but for now we show the code */}
                  <img src={mfaData.totp.qr_code} alt="QR Code" className="w-40 h-40" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium px-4">Scan this QR code in your authenticator app, then enter the 6-digit code below.</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="000 000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <button 
                  onClick={verifyEnroll}
                  disabled={enrolling || verifyCode.length !== 6}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {enrolling ? "Verifying..." : "Verify & Enable"}
                </button>
                <button 
                  onClick={() => setMfaData(null)}
                  className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{title}</div>
      <div className="flex-1 h-[2px] bg-slate-50" />
    </div>
  );
}
