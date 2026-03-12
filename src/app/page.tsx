'use client'
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { questions } from './lib/questions'

export default function Home() {
  const [step, setStep] = useState(0) // 0: Form, 1: Role, 2: Quiz, 3: Result
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
      setStep(3); setLoading(true)
      await supabase.from('assessments').insert([{ 
        role, answers: newAnswers, email: bizInfo.email, company_name: bizInfo.companyName 
      }])
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ role, answers: newAnswers, businessInfo: bizInfo }),
      })
      const data = await res.json()
      setAiResult(data.result || data.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl">
        
        {/* Step 0: Business Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center mb-6">AI Readiness Assessment</h1>
            <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg" onChange={e => setBizInfo({...bizInfo, name: e.target.value})} />
            <input type="email" placeholder="Business Email" className="w-full p-3 border rounded-lg" onChange={e => setBizInfo({...bizInfo, email: e.target.value})} />
            <input type="text" placeholder="Company Name" className="w-full p-3 border rounded-lg" onChange={e => setBizInfo({...bizInfo, companyName: e.target.value})} />
            <select className="w-full p-3 border rounded-lg" onChange={e => setBizInfo({...bizInfo, companySize: e.target.value})}>
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>50+ employees</option>
            </select>
            <select className="w-full p-3 border rounded-lg" onChange={e => setBizInfo({...bizInfo, market: e.target.value})}>
              <option>Canada</option>
              <option>USA</option>
              <option>Europe / Other</option>
            </select>
            <button onClick={() => setStep(1)} disabled={!bizInfo.email} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300">
              Start Assessment
            </button>
          </div>
        )}

        {/* Step 1: Roles */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">What is your role?</h2>
            {roles.map(r => (
              <button key={r.id} onClick={() => {setRole(r.id); setStep(2)}} className="w-full p-4 border-2 rounded-xl hover:border-blue-500 text-left">{r.title}</button>
            ))}
          </div>
        )}

        {/* Step 2: Quiz */}
        {step === 2 && role && (
          <div>
            <div className="mb-4 text-xs font-bold text-blue-600">QUESTION {currentQ + 1} / 5</div>
            <h2 className="text-xl font-bold mb-6">{questions[role as keyof typeof questions][currentQ].text}</h2>
            <div className="space-y-3">
              {questions[role as keyof typeof questions][currentQ].options.map(opt => (
                <button key={opt} onClick={() => handleAnswer(opt)} className="w-full p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-left border">{opt}</button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">AI Strategy for {bizInfo.companyName}</h2>
            {loading ? <div className="animate-pulse">Analyzing...</div> : (
              <div className="text-left bg-blue-50 p-6 rounded-xl whitespace-pre-wrap border border-blue-100">{aiResult}</div>
            )}
            <button onClick={() => window.location.reload()} className="mt-8 text-sm text-gray-400 hover:underline">Restart</button>
          </div>
        )}
      </div>
    </main>
  )
}