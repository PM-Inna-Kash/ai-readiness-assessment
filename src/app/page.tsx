'use client'
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { questions } from './lib/questions'

export default function Home() {
  const [role, setRole] = useState<string | null>(null)
  const [step, setStep] = useState(0) // 0 - выбор роли, 1 - вопросы, 2 - финиш
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

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
      // Сохраняем в базу данных!
      await supabase.from('assessments').insert([{
        role: role,
        answers: newAnswers,
      }])
      setStep(2)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl">
        
        {/* Шаг 0: Выбор роли */}
        {step === 0 && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Who are you?</h1>
            <div className="space-y-4">
              {roles.map(r => (
                <button key={r.id} onClick={() => {setRole(r.id); setStep(1)}} 
                        className="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 transition-all text-left font-medium">
                  {r.title}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Шаг 1: Вопросы */}
        {step === 1 && role && (
          <div>
            <div className="mb-4 text-sm text-blue-600 font-bold uppercase">Question {currentQ + 1} of {questions[role as keyof typeof questions].length}</div>
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

        {/* Шаг 2: Финиш */}
        {step === 2 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">Analysis Complete!</h2>
            <p className="text-gray-600">Your custom AI Strategy is being generated...</p>
          </div>
        )}

      </div>
    </main>
  )
}