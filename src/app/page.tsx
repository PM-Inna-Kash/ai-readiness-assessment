'use client'
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { questions } from './lib/questions'

export default function Home() {
  const [step, setStep] = useState(0) // 0: Onboarding, 1: Form, 2: Role, 3: Quiz, 4: Result
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

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer]
    const roleQs = questions[role as keyof typeof questions]

    if (currentQ < roleQs.length - 1) {
      setAnswers(newAnswers)
      setCurrentQ(currentQ + 1)
    } else {
      setStep(4); setLoading(true)
      // Save leads to Supabase for business analysis
      await supabase.from('assessments').insert([{ 
        role, answers: newAnswers, email: bizInfo.email, company_name: bizInfo.companyName 
      }])
      
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          body: JSON.stringify({ role, answers: newAnswers, businessInfo: bizInfo }),
        })
        const data = await res.json()
        setAiResult(data.result || data.error)
      } catch (e) {
        setAiResult("Service temporarily busy. Please try again in 30 seconds.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans text-gray-900">
      
      {/* 1. HERO SECTION */}
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          AI Readiness <span className="text-blue-600">Assessment</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Stop guessing. Get a high-impact AI implementation roadmap for the Canadian market in 2 minutes.
        </p>
      </div>

      {/* 2. MAIN TOOL INTERFACE */}
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 mb-16">
        
        {step === 0 && (
          <div className="text-center">
            <div className="text-5xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold mb-4">Start Your Strategy</h2>
            <p className="text-gray-500 mb-8">Identify automation opportunities and ROI-driven AI tools for your team.</p>
            <button onClick={() => setStep(1)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Get Started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6 text-center">Business Context</h2>
            <input type="text" placeholder="Your Name" className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" onChange={e => setBizInfo({...bizInfo, name: e.target.value})} />
            <input type="email" placeholder="Business Email" className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" onChange={e => setBizInfo({...bizInfo, email: e.target.value})} />
            <input type="text" placeholder="Company Name" className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" onChange={e => setBizInfo({...bizInfo, companyName: e.target.value})} />
            <div className="flex gap-2">
                <select className="flex-1 p-4 bg-gray-50 border-none rounded-xl" onChange={e => setBizInfo({...bizInfo, companySize: e.target.value})}>
                <option>1-10 staff</option>
                <option>11-50 staff</option>
                <option>50+ staff</option>
                </select>
                <select className="flex-1 p-4 bg-gray-50 border-none rounded-xl" onChange={e => setBizInfo({...bizInfo, market: e.target.value})}>
                <option>Canada</option>
                <option>USA</option>
                <option>Global</option>
                </select>
            </div>
            <button onClick={() => setStep(2)} disabled={!bizInfo.email || !bizInfo.companyName} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black disabled:bg-gray-200 transition-all mt-4">
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold mb-6">Select Your Primary Focus</h2>
            {roles.map(r => (
              <button key={r.id} onClick={() => {setRole(r.id); setStep(3)}} className="w-full p-5 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-semibold">
                {r.title}
              </button>
            ))}
          </div>
        )}

        {step === 3 && role && (
          <div>
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Question {currentQ + 1} / 5</span>
                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all" style={{width: `${(currentQ + 1) * 20}%`}}></div>
                </div>
            </div>
            <h2 className="text-xl font-bold mb-8 leading-tight">{questions[role as keyof typeof questions][currentQ].text}</h2>
            <div className="space-y-3">
              {questions[role as keyof typeof questions][currentQ].options.map(opt => (
                <button key={opt} onClick={() => handleAnswer(opt)} className="w-full p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-left font-medium border border-transparent">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2 className="text-2xl font-black mb-6">AI Strategy for {bizInfo.companyName}</h2>
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-500 font-medium">Analyzing data with Gemini 3...</p>
              </div>
            ) : (
              <div className="text-left bg-blue-50 p-6 rounded-2xl whitespace-pre-wrap border border-blue-100 text-gray-800 leading-relaxed font-medium">
                {aiResult}
              </div>
            )}
            <button onClick={() => window.location.reload()} className="mt-10 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
              Restart Assessment
            </button>
          </div>
        )}
      </div>

      {/* 3. ABOUT ME SECTION */}
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-inner">
            👩‍💻
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">Inna Kashtanova</h3>
            <p className="text-blue-600 font-bold text-sm mb-3">Product Manager & AI Implementation Expert</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Specializing in bridging the gap between business goals and AI technologies. Focused on ROI-driven automation for the Canadian market.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
                <a href="https://www.linkedin.com/in/pminnaka/" target="_blank" className="text-sm font-black text-gray-900 hover:text-blue-600 transition-colors">
                  LINKEDIN →
                </a>
                <a href="mailto:pm.inna.kash@gmail.com" className="text-sm font-black text-gray-900 hover:text-blue-600 transition-colors">
                  EMAIL →
                </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-gray-400 text-xs font-medium uppercase tracking-widest">
        Built with Gemini 3 & Next.js © 2026
      </footer>
    </main>
  )
}