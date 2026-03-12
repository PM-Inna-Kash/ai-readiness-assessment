'use client'
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { questions } from './lib/questions'

export default function Home() {
  const [role, setRole] = useState<string | null>(null)
  const [step, setStep] = useState(0) 
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const roles = [
    { id: 'owner', title: 'Business Owner / CEO' },
    { id: 'hr', title: 'HR Manager / People Ops' },
    { id: 'lead', title: 'Team Lead / Project Manager' },
  ]

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer]
    const roleQuestions = questions[role as keyof typeof questions]

    if (currentQ < roleQuestions.length - 1) {
      setAnswers(newAnswers)
      setCurrentQ(currentQ + 1)
    } else {
      setStep(2)
      setLoading(true)
      
      // 1. Сохраняем в Supabase
      await supabase.from('assessments').insert([{ role, answers: newAnswers }])
      
      // 2. Запрашиваем ИИ-стратегию
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          body: JSON.stringify({ role, answers: newAnswers }),
        })
        const data = await res.json()
        
        // Если есть результат — показываем его, если ошибка — показываем ошибку
        setAiResult(data.result || data.error || "Something went wrong");
      } catch (e) {
        setAiResult("Connection error. Please check your internet or API key.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl">
        {step === 0 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-6 text-center">AI Readiness Assessment</h1>
            {roles.map(r => (
              <button key={r.id} onClick={() => {setRole(r.id); setStep(1)}} 
                      className="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 transition-all text-left font-medium">
                {r.title}
              </button>
            ))}
          </div>
        )}

        {step === 1 && role && (
          <div>
            <h2 className="text-xl font-bold mb-6">{questions[role as keyof typeof questions][currentQ].text}</h2>
            <div className="space-y-3">
              {questions[role as keyof typeof questions][currentQ].options.map(opt => (
                <button key={opt} onClick={() => handleAnswer(opt)}
                        className="w-full p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-200">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your AI Strategy</h2>
            {loading ? (
              <div className="animate-pulse text-blue-600 font-medium">Analyzing your data with Gemini...</div>
            ) : (
              <div className="text-left bg-blue-50 p-6 rounded-xl text-gray-800 whitespace-pre-wrap leading-relaxed border border-blue-100">
                {aiResult}
              </div>
            )}
            <button onClick={() => window.location.reload()} className="mt-8 text-sm text-gray-400 hover:underline">Start over</button>
          </div>
        )}
      </div>
    </main>
  )
}