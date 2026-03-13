'use client'
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { questions } from './lib/questions'
import ReactMarkdown from 'react-markdown'
import { jsPDF } from "jspdf"

export default function Home() {
  const [step, setStep] = useState(0) 
  const [role, setRole] = useState<string | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [bizInfo, setBizInfo] = useState({
    name: '', email: '', companyName: '', companySize: '1-10', market: 'Canada'
  })

  const roles = [
    { id: 'owner', title: 'Business Owner / CEO' },
    { id: 'hr', title: 'HR Manager / People Ops' },
    { id: 'lead', title: 'Team Lead / Project Manager' },
  ]

  const isFormValid = bizInfo.name.trim() !== '' && 
                      bizInfo.email.trim() !== '' && 
                      bizInfo.companyName.trim() !== '';

  const downloadPDF = () => {
    if (!aiResult) return;
    const doc = new jsPDF();

    // 1. Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text(`AI Strategy: ${bizInfo.companyName}`, 20, 25);

    // 2. Branding
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Prepared by Inna Kashtanova | AI Implementation Lead | 2026`, 20, 32);
    doc.line(20, 36, 190, 36); 

    // 3. Strategy Body
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    const cleanText = aiResult.replace(/\*\*/g, ''); 
    const splitText = doc.splitTextToSize(cleanText, 170);
    doc.text(splitText, 20, 50);

    // 4. Contact Section & Interactive Links
    const lastLineY = 50 + (splitText.length * 7);
    const contactY = lastLineY > 250 ? 20 : lastLineY + 10;
    if (lastLineY > 250) doc.addPage();

    doc.line(20, contactY, 190, contactY);
    doc.setFont("helvetica", "bold");
    doc.text("Let's build this together!", 20, contactY + 10);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Ready to transform your workflow? Reach out for a deep dive.", 20, contactY + 18);
    
    
    doc.setTextColor(37, 99, 235); 
    
    // LinkedIn Link
    doc.text(`LinkedIn: linkedin.com/in/pminnaka/`, 20, contactY + 28);
    doc.link(20, contactY + 24, 80, 7, { url: "https://www.linkedin.com/in/pminnaka/" });
    
    // Email Link
    doc.text(`Email: pm.inna.kash@gmail.com`, 20, contactY + 35);
    doc.link(20, contactY + 31, 80, 7, { url: "mailto:pm.inna.kash@gmail.com" });

    doc.save(`AI_Strategy_${bizInfo.companyName.replace(/\s+/g, '_')}.pdf`);
  };
  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer]
    const roleQs = questions[role as keyof typeof questions]
    if (currentQ < roleQs.length - 1) {
      setAnswers(newAnswers); setCurrentQ(currentQ + 1)
    } else {
      setStep(4); setLoading(true)
      await supabase.from('assessments').insert([{ 
        role, answers: newAnswers, email: bizInfo.email, company_name: bizInfo.companyName 
      }])
      const detailedAnswers = newAnswers.map((ans, index) => ({
        question: roleQs[index].text, answer: ans
      }));
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          body: JSON.stringify({ role, detailedAnswers, businessInfo: bizInfo }),
        })
        const data = await res.json()
        setAiResult(data.result || data.error)
      } catch (e) { setAiResult("Service busy. Please retry.") } finally { setLoading(false) }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans text-gray-900">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">AI Readiness <span className="text-blue-600">Assessment</span></h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">High-impact AI roadmap for your market in 2 minutes.</p>
      </div>
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 mb-16">
        {step === 0 && (
          <div className="text-left">
            <div className="text-5xl mb-6 text-center">🎯</div>
            <h2 className="text-2xl font-bold mb-4 text-center">Pilot Environment & MVP</h2>
            <p className="text-gray-600 text-sm mb-8">Welcome! This is a technical pilot built to demonstrate AI automation and Inna Kashtanova's PM expertise.</p>
            <button onClick={() => setStep(1)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Start Assessment</button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6 text-center">Business Context</h2>
            <input type="text" placeholder="Full Name *" className="w-full p-4 bg-gray-50 border-none rounded-xl" onChange={e => setBizInfo({...bizInfo, name: e.target.value})} />
            <input type="email" placeholder="Business Email *" className="w-full p-4 bg-gray-50 border-none rounded-xl" onChange={e => setBizInfo({...bizInfo, email: e.target.value})} />
            <input type="text" placeholder="Company Name *" className="w-full p-4 bg-gray-50 border-none rounded-xl" onChange={e => setBizInfo({...bizInfo, companyName: e.target.value})} />
            <div className="flex gap-2 text-sm">
                <select className="flex-1 p-4 bg-gray-50 border-none rounded-xl" onChange={e => setBizInfo({...bizInfo, companySize: e.target.value})}><option>1-10 employees</option><option>11-50 employees</option></select>
                <select className="flex-1 p-4 bg-gray-50 border-none rounded-xl" onChange={e => setBizInfo({...bizInfo, market: e.target.value})}><option>Canada</option><option>USA</option></select>
            </div>
            <button onClick={() => setStep(2)} disabled={!isFormValid} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black disabled:bg-gray-200 mt-4">Next Step</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold mb-6">Your Primary Focus</h2>
            {roles.map(r => (
              <button key={r.id} onClick={() => {setRole(r.id); setStep(3)}} className="w-full p-5 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-semibold">{r.title}</button>
            ))}
          </div>
        )}
        {step === 3 && role && (
          <div>
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black uppercase text-blue-600">Question {currentQ + 1} / 5</span>
                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all" style={{width: `${(currentQ + 1) * 20}%`}}></div>
                </div>
            </div>
            <h2 className="text-xl font-bold mb-8">{questions[role as keyof typeof questions][currentQ].text}</h2>
            <div className="space-y-3">
              {questions[role as keyof typeof questions][currentQ].options.map(opt => (
                <button key={opt} onClick={() => handleAnswer(opt)} className="w-full p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-left font-medium">{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2 className="text-2xl font-black mb-6 uppercase">AI Strategy for {bizInfo.companyName}</h2>
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-500 font-medium italic text-sm">Gemini 3 is crafting your roadmap...</p>
              </div>
            ) : (
              <div className="text-left bg-blue-50 p-6 rounded-2xl border border-blue-100 text-gray-800 leading-relaxed font-medium mb-8">
                <article className="prose prose-sm prose-blue max-w-none"><ReactMarkdown>{aiResult}</ReactMarkdown></article>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <button onClick={downloadPDF} disabled={loading || !aiResult} className={`md:col-span-2 flex items-center justify-center p-4 rounded-xl font-bold text-xs transition-all uppercase tracking-widest mb-2 shadow-lg ${loading || !aiResult ? 'bg-gray-200 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                {loading ? '⌛ Generating Strategy...' : '📥 Download Strategy (PDF)'}
              </button>
              <a href="https://github.com/PM-Inna-Kash/ai-readiness-assessment" target="_blank" className="flex items-center justify-center p-3 bg-gray-100 rounded-xl font-bold text-[10px] uppercase tracking-widest">📂 GitHub Code</a>
              <a href="https://www.linkedin.com/in/pminnaka/" target="_blank" className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">🤝 LinkedIn Profile</a>
              <a href="mailto:pm.inna.kash@gmail.com" className="md:col-span-2 flex items-center justify-center p-3 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">☕ Invite for an Interview</a>
            </div>
            <button onClick={() => window.location.reload()} className="text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest">Restart Assessment</button>
          </div>
        )}
      </div>

      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-inner">👩‍💻</div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">Inna Kashtanova</h3>
            <p className="text-blue-600 font-bold text-sm mb-3 uppercase tracking-widest">Product Manager & AI Specialist</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">Building ROI-driven AI solutions for global markets. Bridging business vision and technical execution.</p>
            <div className="flex justify-center md:justify-start gap-4">
                <a href="https://www.linkedin.com/in/pminnaka/" target="_blank" className="text-xs font-black text-gray-900 hover:text-blue-600 tracking-widest uppercase underline decoration-2 decoration-blue-100">LINKEDIN</a>
                <a href="mailto:pm.inna.kash@gmail.com" className="text-xs font-black text-gray-900 hover:text-blue-600 tracking-widest uppercase underline decoration-2 decoration-blue-100">EMAIL</a>
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-12 text-gray-400 text-[10px] font-medium uppercase tracking-[0.2em] text-center max-w-lg">
        Built with Gemini 3 & Next.js by Inna Kashtanova AI Implement Lead 2026
      </footer>
    </main>
  )
}