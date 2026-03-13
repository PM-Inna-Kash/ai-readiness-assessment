// src/app/lib/questions.ts

export type Option = string;

export interface Question {
  id: string;
  icon: string;
  text: string;
  hint: string; // Micro-hint for cognitive load reduction
  options: Option[];
}

export const commonQuestions: Question[] = [
  {
    id: 'stack',
    icon: '🧱',
    text: 'Main IT Stack',
    hint: 'Primary business communication and collaboration hub',
    options: ['Slack / MS Teams / Email', 'Salesforce / HubSpot', 'Legacy Systems', 'No specific tools']
  },
  {
    id: 'data_foundation',
    icon: '💾',
    text: 'Data Foundation',
    hint: 'How structured and accessible is your business data?',
    options: ['No data tracked', 'Fragmented (Spreadsheets/Chats)', 'Structured (Databases/Tables)', 'Advanced (Data Lake/BI)']
  },
  {
    id: 'data_volume',
    icon: '📊',
    text: 'Data Volume',
    hint: 'Estimated number of records (leads, orders, or tickets)',
    options: ['Hundreds (Small)', 'Thousands (Medium)', 'Millions (Big Data)', 'Unknown']
  },
  {
    id: 'budget',
    icon: '💸',
    text: 'AI Budget',
    hint: 'Monthly budget for new AI tools and automation',
    options: ['Minimal ($0-$100)', 'Mid-range ($100-$500)', 'Enterprise ($500+)', 'Not defined']
  }
];

export const roleQuestions: Record<string, Question[]> = {
  owner: [
    {
      id: 'owner_pain',
      icon: '🚀',
      text: 'Growth Barrier',
      hint: 'What is the main bottleneck for scaling your operations?',
      options: ['Human Factor/Errors', 'Slow Processes', 'Lack of Analytics']
    },
    {
      id: 'owner_goal',
      icon: '🎯',
      text: 'Primary Focus',
      hint: 'What is your key business KPI for this year?',
      options: ['Revenue Growth', 'Cost Reduction', 'Product Quality']
    }
  ],
  hr: [
    {
      id: 'hr_pain',
      icon: '😫',
      text: 'Manual Workload',
      hint: 'Which HR task consumes most of your time?',
      options: ['Screening Resumes', 'Employee FAQ/Support', 'Onboarding/Offboarding']
    },
    {
      id: 'hr_goal',
      icon: '📈',
      text: 'Team Health',
      hint: 'What is the current burnout risk level in your team?',
      options: ['High (Critical)', 'Moderate', 'Low (Stable)']
    }
  ],
  cto: [
    {
      id: 'cto_pain',
      icon: '⚙️',
      text: 'Technical Debt',
      hint: 'What is the main issue with your current data architecture?',
      options: ['Data Silos', 'Low Data Quality', 'Security/Privacy Risks']
    },
    {
      id: 'cto_goal',
      icon: '🔧',
      text: 'Infrastructure',
      hint: 'How ready is your stack for AI API integrations?',
      options: ['Not Ready (No API access)', 'Partially Ready', 'Full API Readiness']
    }
  ],
  lead: [
    {
      id: 'lead_pain',
      icon: '📅',
      text: 'Management Debt',
      hint: 'What hinders your daily team coordination?',
      options: ['Manual Status Updates', 'Communication Gaps', 'Resource Planning']
    },
    {
      id: 'lead_goal',
      icon: '⚡',
      text: 'Efficiency Goal',
      hint: 'Where do you want to see the most AI impact?',
      options: ['Meeting Automation', 'Task Prioritization', 'Documentation']
    }
  ]
};