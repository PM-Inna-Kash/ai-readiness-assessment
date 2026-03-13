'use client'
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { commonQuestions, roleQuestions } from './lib/questions' 
import ReactMarkdown from 'react-markdown'
import { jsPDF } from "jspdf"

export default function Home() {
  const [step, setStep] = useState(0) 
  const [role, setRole] = useState<string | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [userComment, setUserComment] = useState('')
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [bizInfo, setBizInfo] = useState({
    name: '', 
    email: '', 
    companyName: '', 
    companySize: '1-10', 
    market: 'Canada', 
    industry: '' 
  })

  const roles = [
    { id: 'owner', title: 'Business Owner / CEO' },
    { id: 'cto', title: 'CTO / Technical Director' },
    { id: 'hr', title: 'HR Manager / People Ops' },
    { id: 'lead', title: 'Team Lead / Project Manager' },
  ]

  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501+'];

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = 
    bizInfo.name.trim().length >= 2 && 
    validateEmail(bizInfo.email) && 
    bizInfo.companyName.trim().length >= 2 && 
    bizInfo.industry.trim().length >= 2;

  // Standardization: Combined questions array
  const activeQuestions = role ? [...commonQuestions, ...roleQuestions[role as keyof typeof roleQuestions]] : [];
  const totalQuestions = activeQuestions.length;

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer]
    if (currentQ < totalQuestions - 1) {
      setAnswers(newAnswers); 
      setCurrentQ(currentQ + 1);
    } else {
      setAnswers(newAnswers);
      setStep(4); // Move to the "Additional Context" step
    }
  }

  const generateAudit = async () => {
    setStep(5);
    setLoading(true);

    // Syncing new industry and comment fields to Supabase
    await supabase.from('assessments').insert([{ 
      role, 
      answers, 
      email: bizInfo.email, 
      company_name: bizInfo.companyName,
      industry: bizInfo.industry,
      comment: userComment.substring(0, 500)
    }]);

    const detailedAnswers = answers.map((ans, index) => ({
      question: activeQuestions[index].text, 
      answer: ans
    }));

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          role, 
          detailedAnswers, 
          businessInfo: bizInfo, 
          userComment: userComment.substring(0, 500) 
        }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch (e) { 
      setAiResult("The AI engine is currently busy. Please retry in 30 seconds.");
    } finally { 
      setLoading(false); 
    }
  }

  const downloadPDF = () => {
    if (!aiResult) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;
    let y = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138);
    doc.text(bizInfo.companyName.toUpperCase(), margin, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`AI STRATEGY AUDIT | PREPARED BY INNA KASHTANOVA`, margin, y);
    
    y += 10;
    doc.setDrawColor(240, 240, 240);
    doc.line(margin, y, 190, y);
    y += 15;

    const sections = aiResult.split('\n\n'); 

    sections.forEach((section) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      // Removing ASCII bars for clean PDF rendering
      let cleanSection = section.replace(/[█░]/g, '').replace(/###/g, '').replace(/\*\*/g, '');

      const lines = doc.splitTextToSize(cleanSection, 170);
      
      if (section.startsWith('###')) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(13);
        y += 5;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(11);
      }

      doc.text(lines, margin, y);
      y += (lines.length * 7) + 12; // Air between paragraphs
    });

    doc.save(`Audit_${bizInfo.companyName}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans text-gray-900">
      
      {/* Global Progress Bar */}
      {(step === 3 || step === 4) && (
        <div className="fixed top-0 left-0 w-full h-2 bg-gray-100 z-50">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{width: `${((step === 4 ? totalQuestions : currentQ + 1) / totalQuestions) * 100}%`}}
          ></div>
        </div>
      )}

      {/* Main Branding */}
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          AI Readiness <span className="text-blue-600">Assessment</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          High-impact AI roadmap for the Canadian & Global market in 2 minutes.
        </p>
      </div>

      {/* Main Assessment Card */}
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 mb-16">
        
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-left">
            <div className="text-5xl mb-6 text-center">🎯</div>
            <h2 className="text-2xl font-bold mb-4 text-center">Pilot Environment & MVP</h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed text-center">
              Evaluating organizational readiness across operational maturity and data infrastructure.
            </p>
            <button 
              onClick={() => setStep(1)} 
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg"
            >
              Start Assessment
            </button>
          </div>
        )}

        {/* Step 1: Business Context */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6 text-center">Business Context</h2>
            <input type="text" placeholder="Full Name *" className="w-full p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setBizInfo({...bizInfo, name: e.target.value})} />
            <input type="email" placeholder="Business Email *" className="w-full p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setBizInfo({...bizInfo, email: e.target.value})} />
            <input type="text" placeholder="Company Name *" className="w-full p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setBizInfo({...bizInfo, companyName: e.target.value})} />
            <input type="text" placeholder="Industry (e.g. Retail, SaaS) *" className="w-full p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setBizInfo({...bizInfo, industry: e.target.value})} />
            <div className="flex gap-2">
              <select className="flex-1 p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setBizInfo({...bizInfo, companySize: e.target.value})}>
                {companySizes.map(size => <option key={size} value={size}>{size} employees</option>)}
              </select>
              <select className="flex-1 p-4 bg-gray-50 rounded-xl outline-none" onChange={e => setBizInfo({...bizInfo, market: e.target.value})}>
                <option>Canada</option><option>USA</option><option>Europe</option><option>Global</option>
              </select>
            </div>
            <button onClick={() => setStep(2)} disabled={!isFormValid} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black disabled:bg-gray-200 mt-4 transition-all">
              Next Step
            </button>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold mb-6 text-center">Select Your Role</h2>
            {roles.map(r => (
              <button key={r.id} onClick={() => {setRole(r.id); setStep(3)}} className="w-full p-5 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-semibold">{r.title}</button>
            ))}
          </div>
        )}

        {/* Step 3: Questions */}
        {step === 3 && role && (
          <div className="text-left">
            <div className="text-4xl mb-4 text-center">{activeQuestions[currentQ].icon}</div>
            <h2 className="text-xl font-bold mb-1">{activeQuestions[currentQ].text}</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{activeQuestions[currentQ].hint}</p>
            <div className="space-y-3">
              {activeQuestions[currentQ].options.map(opt => (
                <button key={opt} onClick={() => handleAnswer(opt)} className="w-full p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-left font-medium border border-transparent">{opt}</button>
              ))}
            </div>
          </div>
        )}

        
        {/* Step 4: Comment Field */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-center">Final Context</h2>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed text-center">Provide any additional pain points or specific objectives.</p>
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-xl outline-none min-h-[150px] text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Example: We have a $500 monthly budget and need to automate staff scheduling."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
            />
            <button 
              onClick={generateAudit} 
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl"
            >
              Generate Strategic Audit
            </button>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 5 && (
          <div className="w-full">
            {loading ? (
              <div className="flex flex-col items-center py-20 bg-white">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-8"></div>
                <p className="text-gray-400 font-medium italic animate-pulse text-[10px] uppercase tracking-widest text-center">Architecting Strategy...</p>
              </div>
            ) : (
              <div className="text-left bg-white leading-relaxed">
                <div className="mb-16 border-b-2 border-blue-50 pb-12 text-center">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900 mb-2">{bizInfo.companyName}</h2>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.3em]">Confidential Strategic Audit</p>
                </div>
                <article className="prose prose-blue max-w-none prose-p:mb-8 prose-p:leading-relaxed prose-headings:text-blue-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-strong:text-blue-600">
                  <ReactMarkdown>{aiResult}</ReactMarkdown>
                </article>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
                  <button onClick={downloadPDF} className="md:col-span-2 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-blue-700 shadow-xl uppercase">Download PDF Audit</button>
                  <a href="https://www.linkedin.com/in/pminnaka/" target="_blank" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors">Connect on LinkedIn</a>
                  <a href="mailto:pm.inna.kash@gmail.com" className="flex items-center justify-center p-4 bg-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-colors">Book Consultation</a>
                </div>
                <button onClick={() => window.location.reload()} className="w-full mt-12 text-[10px] font-black text-gray-300 hover:text-blue-600 uppercase tracking-widest transition-colors">Restart Assessment</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expert Profile Footer Section */}
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex-shrink-0 flex items-center justify-center text-4xl shadow-inner text-white">👩‍💻</div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold">Inna Kashtanova</h3>
            <p className="text-blue-600 font-black text-xs mb-4 uppercase tracking-[0.2em]">Senior IT Project Manager</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">Expert in bridging business strategy with AI execution for Global markets.</p>
            <div className="flex justify-center md:justify-start gap-6">
                <a href="https://www.linkedin.com/in/pminnaka/" target="_blank" className="text-xs font-black text-gray-900 hover:text-blue-600 uppercase underline decoration-2 decoration-blue-100 underline-offset-4">LinkedIn</a>
                <a href="mailto:pm.inna.kash@gmail.com" className="text-xs font-black text-gray-900 hover:text-blue-600 uppercase underline decoration-2 decoration-blue-100 underline-offset-4">Email</a>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-gray-400 text-[10px] font-medium uppercase tracking-[0.3em] text-center max-w-lg mb-12">
        Built by Inna Kashtanova | AI Implementation Lead | 2026
      </footer>
    </main>
  );
}