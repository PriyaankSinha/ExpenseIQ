import OpenAI from 'openai'
import type { ParsedExpense, CategorySuggestion } from '@/types/database'

const getClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI API key not configured')
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
}

export async function parseExpense(text: string, currencyCode: string = 'USD'): Promise<ParsedExpense> {
  const client = getClient()
  const today = new Date().toISOString().split('T')[0]

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an expense parser. Extract expense details from natural language.
Return JSON with these exact fields:
- amount (number, required)
- currency (string, default "${currencyCode}")
- category_name (string, a general category like "Food", "Transport", "Shopping", "Entertainment", "Healthcare", "Bills", "Education", "Travel", "Groceries", "Coffee", etc.)
- merchant (string or null)
- note (string or null, any extra context)
- date (string, YYYY-MM-DD format, default to today: ${today})

Examples:
"spent 45 at starbucks" → {"amount":45,"currency":"${currencyCode}","category_name":"Coffee","merchant":"Starbucks","note":null,"date":"${today}"}
"uber ride 22.50 yesterday" → {"amount":22.5,"currency":"${currencyCode}","category_name":"Transport","merchant":"Uber","note":null,"date":"<yesterday>"}`,
      },
      { role: 'user', content: text },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Failed to parse expense')
  return JSON.parse(content) as ParsedExpense
}

export async function suggestCategoryMeta(
  categoryName: string
): Promise<CategorySuggestion> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Suggest a Lucide icon name and hex color for an expense category.
Return JSON: {"icon": "<lucide-icon-name>", "color": "#RRGGBB"}
Use common Lucide icon names like: shopping-bag, car, utensils, coffee, home, heart, plane, book, gamepad-2, music, shirt, gift, dumbbell, pill, smartphone, etc.
Choose vibrant, distinct colors that are visually appealing on dark backgrounds.`,
      },
      { role: 'user', content: `Category: "${categoryName}"` },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Failed to suggest category metadata')
  return JSON.parse(content) as CategorySuggestion
}

interface CoachContext {
  monthlyIncome?: number;
  monthlySavingGoal?: number;
  projectedSavings?: number;
  goals?: { name: string; target: number; current: number }[];
}

export async function generateSavingsTips(
  expenses: Array<{ amount: number; category_name: string; merchant: string | null; date: string }>,
  currencyCode: string = 'USD',
  context?: CoachContext
): Promise<string> {
  const client = getClient()

  // Format the helper summary to show currency correctly
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(n);
  
  const expenseSummary = expenses
    .map((e) => `${e.date}: ${fmt(e.amount)} on ${e.category_name}${e.merchant ? ` at ${e.merchant}` : ''}`)
    .join('\n')

  let contextString = ''
  if (context) {
    contextString = `\nContext:
- Monthly Income: ${context.monthlyIncome ? fmt(context.monthlyIncome) : 'Unknown'}
- Monthly Saving Goal: ${context.monthlySavingGoal ? fmt(context.monthlySavingGoal) : 'Unknown'}
- Projected Year-End Savings: ${context.projectedSavings ? fmt(context.projectedSavings) : 'Unknown'}
- User's Active Goals: ${context.goals?.map(g => `${g.name} (${fmt(g.current)} / ${fmt(g.target)})`).join(', ') || 'None'}

Please explicitly mention their projection trajectory and goals if applicable, and suggest where they can cut back based on their expenses.`
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content: `You are a witty, friendly AI savings coach. Analyze the user's recent expenses and trajectory, and provide 2-3 short, actionable, and slightly humorous saving tips. Keep it concise, fun, and natural (as a paragraph). Use emoji sparingly. Maintain focus on the ${currencyCode} currency.${contextString}`,
      },
      {
        role: 'user',
        content: `Here are my recent expenses:\n${expenseSummary}`,
      },
    ],
  })

  return (
    response.choices[0]?.message?.content ||
    'Keep tracking your expenses — awareness is the first step to saving! 💰'
  )
}
