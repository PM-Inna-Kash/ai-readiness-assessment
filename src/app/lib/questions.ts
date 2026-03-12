export const questions = {
  owner: [
    { id: 1, text: "What is your primary business goal for AI?", options: ["Revenue growth", "Operational efficiency", "Customer experience"] },
    { id: 2, text: "How much of your data is structured (in databases/tables)?", options: ["Most of it", "Some of it", "Almost none"] },
    { id: 3, text: "Do you have a budget for AI tools/subscriptions?", options: ["Yes, >$500/mo", "Small budget", "No budget yet"] },
    { id: 4, text: "What is the biggest bottleneck?", options: ["Manual reporting", "Sales outreach", "Content creation"] },
    { id: 5, text: "Is your team ready for AI change?", options: ["Excited", "Hesitant", "Resistant"] },
  ],
  hr: [
    { id: 1, text: "Primary pain point in recruitment?", options: ["Sourcing", "Screening", "Interview scheduling"] },
    { id: 2, text: "How do you handle employee inquiries?", options: ["Manual (Email/Slack)", "Basic FAQ", "Internal Portal"] },
    { id: 3, text: "Is your onboarding documented?", options: ["Fully digital", "Mostly paper/manual", "Not documented"] },
    { id: 4, text: "Time spent on routine admin tasks per week?", options: [">15 hours", "5-10 hours", "<5 hours"] },
    { id: 5, text: "Current ATS (Applicant Tracking System) usage?", options: ["Advanced", "Basic", "No ATS"] },
  ],
  lead: [
    { id: 1, text: "Main sprint delay factor?", options: ["Vague requirements", "Manual testing", "Too many meetings"] },
    { id: 2, text: "Code documentation level?", options: ["Automated/Detailed", "Manual/Brief", "Non-existent"] },
    { id: 3, text: "Are you using AI for code/tasks?", options: ["Daily", "Occasionally", "Never"] },
    { id: 4, text: "Technical debt status?", options: ["Under control", "Growing fast", "Critical"] },
    { id: 5, text: "Team size?", options: ["1-5", "6-15", "15+"] },
  ]
}