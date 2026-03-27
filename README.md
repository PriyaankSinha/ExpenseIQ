# SpendSmart AI

SpendSmart AI is a next-generation, intelligent personal finance application designed to help you track expenses, manage budgets, and achieve your saving goals seamlessly. With built-in AI capabilities, it not only monitors your spending but actively coaches you toward better financial habits based on your unique goals and income trajectory.

## 🚀 Features

- **Smart NLP Expense Input**: Log expenses using natural language (e.g., *"spent $45 at Starbucks"*).
- **Proactive AI Savings Coach**: Receives deep context (monthly income, custom saving goals, and recent expenses) to generate personalized, humorous, and highly actionable saving tips.
- **Dynamic Dashboards**: Built with immersive charts (Recharts) to visualize cash flow, category breakdowns, and 6-month savings trends.
- **Goal Tracking & Projections**: Automatically projects your end-of-year savings balance based on your rolling average monthly savings.
- **Robust Authentication**: Powered by Supabase Auth with secure session management.
- **Mobile-Responsive UI**: A premium, dark-themed responsive interface with smooth `framer-motion` animations.

---

## 💻 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/v5/) (React Query)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **AI Integration**: [OpenAI API](https://openai.com/api/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🤖 AI Integration Overview

SpendSmart leverages the **OpenAI API** (`gpt-4o-mini` model) to power two core features:

1. **Expense Parsing**: Converts natural language into structured JSON objects (amount, currency, merchant, category, date).
2. **AI Savings Coach**: Analyzes your monthly income, your default savings target, your 6-month historical trajectory, and your most recent isolated expenses to present actionable financial wisdom.

**Security Note:** 
The platform requires an active OpenAI API key to function properly. **Never commit your actual API keys to version control.** Always use local `.env` variables (as outlined below) when running the application.

---

## 🛠️ Getting Started

Follow these steps to clone the repository and run the application locally.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/spendsmart-ai.git
cd spendsmart-ai
```

### 2. Install Dependencies
Make sure you have Node.js installed on your machine.
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` or `.env` file in the root of your project. You will need your Supabase project keys and your private OpenAI API key. 

Add the following variables to your environment file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
# Note: Keep this key strictly confidential! Do not expose it in public repositories.
VITE_OPENAI_API_KEY=your_openai_private_key_here
```

### 4. Database Setup
Ensure you have Supabase CLI installed, or run the migrations manually in your Supabase SQL Editor. 
The migrations are located in the `supabase/migrations/` directory.

### 5. Start the Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` (or the port specified in your terminal) to experience SpendSmart AI!

---

## 📝 License
This project is licensed under the MIT License.
