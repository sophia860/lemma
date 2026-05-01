import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, Sparkles, AlertCircle, CheckCircle2, FileDown, Save, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function NewReport() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: "",
    purpose: "purchase",
    loanAmount: "",
    propertyValue: "",
    lender: "",
    rate: "",
    rateType: "fixed",
    term: "",
    initialPeriod: "",
    reasoning: "",
    additionalNotes: "",
  });

  const generateReport = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const systemInstruction = `
        You are an expert UK Mortgage Compliance Officer. 
        Your task is to generate a comprehensive Mortgage Suitability Report based on case notes.
        
        REQUIREMENTS:
        - Must follow FCA MCOB 4.7 suitability disclosure requirements.
        - Use formal UK English.
        - Use second person ("We have recommended...", "You told us...").
        - Mandatory sections: Client Objectives, Product Recommended, Why Suitable, Why Alternatives Not Recommended, Risks, Repayment Method, Fee Disclosure.
        ${profile?.house_style_template ? `- Adhere to this house style: "${profile.house_style_template}"` : ""}
        
        OUTPUT FORMAT:
        Return a structured JSON object with:
        {
          "title": "Suitability Report",
          "sections": [
            { "heading": "string", "body": "markdown-string" }
          ],
          "complianceChecklist": [
            { "item": "string", "present": true }
          ]
        }
      `;

      const prompt = `
        CLIENT DATA:
        Name: ${formData.clientName}
        Purpose: ${formData.purpose}
        Loan: £${formData.loanAmount}
        Value: £${formData.propertyValue}
        
        RECOMMENDATION:
        Lender: ${formData.lender}
        Rate: ${formData.rate}% ${formData.rateType}
        Term: ${formData.term} years
        Fixed Period: ${formData.initialPeriod} years
        Broker Reasoning: ${formData.reasoning}
        
        ADDITIONAL INFO:
        Notes: ${formData.additionalNotes || "N/A"}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    heading: { type: Type.STRING },
                    body: { type: Type.STRING }
                  }
                }
              },
              complianceChecklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    present: { type: Type.BOOLEAN }
                  }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text);
      setReport(result);

      // Save to Supabase
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          client_ref: formData.clientName,
          adviser_name: profile?.adviser_names?.split(',')[0] || "Broker",
          raw_input: formData,
          generated_output: result,
          compliance_checklist: result.complianceChecklist || [],
          status: "draft"
        })
        .select()
        .single();
      
      if (reportError) throw reportError;
      setReportId(reportData.id);
      
      // Update user quota
      await supabase.rpc('increment_reports_count', { user_id: user.id });

    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const finalizeReport = async () => {
    if (!reportId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: "finalised" })
        .eq('id', reportId);
        
      if (error) throw error;
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportDoc = async (type: 'pdf' | 'docx') => {
    if (!report) return;
    try {
      const response = await fetch(`/api/export/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suitability-report.${type}`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Draft New Report</h1>
          <p className="text-sm text-slate-500 font-medium">FCA MCOB 4.7 Compliant Generation</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Input Form */}
        <div className="space-y-8 bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm shadow-slate-200/50">
          <SectionHeader title="Case Fundamentals" />
          <div className="grid grid-cols-1 gap-6">
            <InputField label="Client Name" value={formData.clientName} onChange={(v) => setFormData({...formData, clientName: v})} placeholder="e.g. John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <SelectField 
              label="Purpose" 
              value={formData.purpose} 
              onChange={(v) => setFormData({...formData, purpose: v})} 
              options={[{v: "purchase", l: "Purchase"}, {v: "remortgage", l: "Remortgage"}, {v: "btl", l: "Buy-to-Let"}]} 
            />
            <InputField label="Loan Amount" value={formData.loanAmount} onChange={(v) => setFormData({...formData, loanAmount: v})} placeholder="£" />
          </div>

          <SectionHeader title="The Recommendation" />
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Lender" value={formData.lender} onChange={(v) => setFormData({...formData, lender: v})} />
            <InputField label="Interest Rate (%)" value={formData.rate} onChange={(v) => setFormData({...formData, rate: v})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Term (Years)" value={formData.term} onChange={(v) => setFormData({...formData, term: v})} />
            <InputField label="Initial Period (Years)" value={formData.initialPeriod} onChange={(v) => setFormData({...formData, initialPeriod: v})} />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
               <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-1">Why was this product selected?</label>
               <textarea 
                 className="w-full h-32 px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none resize-none text-[0.85rem] leading-relaxed text-slate-700 transition-all font-medium"
                 value={formData.reasoning} onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
                 placeholder="e.g. Lowest overall cost over initial period..."
               />
            </div>
            <div className="space-y-3">
               <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-1">Additional Case Notes (Adverse, Vulnerability, etc.)</label>
               <textarea 
                 className="w-full h-24 px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none resize-none text-[0.85rem] leading-relaxed text-slate-700 transition-all font-medium"
                 value={formData.additionalNotes} onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                 placeholder="e.g. No adverse credit history. Client not vulnerable."
               />
            </div>
          </div>

          <button 
            onClick={generateReport}
            disabled={loading || !formData.clientName}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 text-lg h-[56px]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Generate Report</>}
          </button>
        </div>

        {/* Right: AI Preview */}
        <div className="sticky top-12 space-y-6">
           {!report ? (
             <div className="bg-slate-50 rounded-[2rem] border-2 border-slate-200 border-dashed aspect-[3/4] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                   <FileDown className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium max-w-xs">Fill out the case notes to see a preview of the suitability report here.</p>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-7 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-bold text-slate-900">{report.title}</h3>
                    <div className="flex gap-2">
                       <button onClick={() => exportDoc('pdf')} className="px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors">
                         <FileDown className="w-3.5 h-3.5" /> PDF
                       </button>
                       <button onClick={() => exportDoc('docx')} className="px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors">
                         <FileDown className="w-3.5 h-3.5" /> DOCX
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 space-y-8 prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                    {(report.sections || []).map((s: any, i: number) => (
                      <div key={i} className="group">
                        <h4 className="flex items-center gap-3 text-slate-900 text-lg font-bold mb-3">
                           <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-[10px] flex items-center justify-center font-bold">{i+1}</span>
                           {s.heading}
                        </h4>
                        <div className="pl-9 text-[13.5px] font-medium leading-[1.8] text-slate-500">
                          <ReactMarkdown>{s.body}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-7 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-3">
                    <button 
                      onClick={finalizeReport}
                      disabled={loading}
                      className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex items-center gap-2"><Save className="w-4 h-4" /> Finalise & Log</div>}
                    </button>
                  </div>
                </div>

                {/* Compliance Checklist */}
                <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                   <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">MCOB Compliance Checklist</h5>
                   <div className="grid grid-cols-1 gap-4">
                      {(report.complianceChecklist || []).map((c: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 text-[13px] font-bold">
                          <div className={cn(
                             "w-5 h-5 rounded-full flex items-center justify-center",
                             c.present ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                          )}>
                             {c.present ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          </div>
                          <span className={c.present ? "text-slate-700" : "text-orange-600 italic"}>{c.item}</span>
                        </div>
                      ))}
                   </div>
                </div>
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

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2 leading-none">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">{label}</label>
      <input 
        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: {v: string, l: string}[] }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">{label}</label>
      <select 
        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
        value={value} onChange={(e) => onChange(e.target.value)}
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
