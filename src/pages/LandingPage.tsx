import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  ArrowRight, 
  PieChart, 
  Shield, 
  Zap, 
  Target, 
  ChartBar, 
  Rocket, 
  CheckCircle2, 
  TrendingUp,
  Brain,
  Quote,
  Star,
  Plus,
  ArrowDown
} from 'lucide-react'
import LandingNav from '@/components/layout/LandingNav'
import BentoCard from '@/components/ui/BentoCard'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
}

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden">
      {/* Background blobs */}
      <div className="blob w-[800px] h-[800px] bg-emerald-600/10 top-[-200px] right-[-200px]" />
      <div className="blob w-[600px] h-[600px] bg-sky-600/5 bottom-[-100px] left-[-200px]" />
      <div className="blob w-[500px] h-[500px] bg-purple-600/5 top-[30%] left-[10%]" />

      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Financial Freedom</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Stop Tracking. <br />
            <span className="gradient-text">Start Saving.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The intelligent expense tracker that uses GPT-powered AI to categorize your spending, 
            detect patterns, and help you reach your goals 3x faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup" className="btn-primary group flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto">
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-ghost text-lg px-8 py-4 w-full sm:w-auto">
              Live Demo
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl opacity-50 rounded-4xl" />
          <div className="glass-card p-2 border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
              alt="Dashboard Preview" 
              className="rounded-xl w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
            {/* Floating UI Elements Over Image */}
            <div className="absolute top-10 right-10 glass-card p-4 border-emerald-500/30 glow-emerald hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Savings this month</p>
                  <p className="text-lg font-bold text-white">+$2,450.00</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-12">
          {[
            { label: 'Total Tracked', val: '$1.2B+' },
            { label: 'Happy Users', val: '250k+' },
            { label: 'AI Accuracy', val: '99.9%' },
            { label: 'Categories', val: 'Unlimited' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="text-center md:text-left"
            >
              <p className="text-3xl md:text-5xl font-black text-white mb-2">{stat.val}</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Supercharged Features</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Everything you need to manage your money with superhuman efficiency.</p>
        </div>

        <motion.div 
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <BentoCard className="lg:col-span-2 group">
            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
              <div className="flex-1">
                <Brain className="w-12 h-12 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-bold mb-4">AI Smart Categorization</h3>
                <p className="text-slate-400 leading-relaxed">
                  Powered by GPT-4, SpendSmart automatically understands your transactions. 
                  Say goodbye to manual categorization forever.
                </p>
              </div>
              <div className="flex-1 w-full bg-slate-950/50 rounded-xl p-4 border border-white/5">
                <div className="space-y-3">
                  {[
                    { t: "Starbucks", c: "Food & Drink", p: "-$5.50" },
                    { t: "Netflix", c: "Entertainment", p: "-$15.99" },
                    { t: "Uber", c: "Transport", p: "-$22.00" }
                  ].map((it, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-sm font-medium">{it.t}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{it.c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <Target className="w-10 h-10 text-purple-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">Goal Management</h3>
            <p className="text-slate-400 text-sm">Set savings goals and track progress with beautiful visual indicators.</p>
          </BentoCard>

          <BentoCard>
            <ChartBar className="w-10 h-10 text-sky-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">Visual Analytics</h3>
            <p className="text-slate-400 text-sm">Stunning charts and heatmaps that reveal the story behind your spending.</p>
          </BentoCard>

          <BentoCard className="lg:col-span-2">
            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
               <div className="flex-1">
                <Shield className="w-12 h-12 text-amber-500 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Bank-Level Security</h3>
                <p className="text-slate-400 leading-relaxed">
                  Your data is encrypted with 256-bit AES. We never store your credentials 
                  and prioritize your privacy above all else.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                 <Zap className="w-32 h-32 text-emerald-500/20 animate-pulse" />
              </div>
            </div>
          </BentoCard>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 px-6 bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How it Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Three simple steps to financial mastery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent -translate-y-1/2 z-0" />
            
            {[
              { 
                step: '01', 
                title: 'Connect & Track', 
                desc: 'Easily import your data or add transactions manually. Our secure system keeps everything in sync.',
                icon: Plus,
                color: 'text-emerald-500'
              },
              { 
                step: '02', 
                title: 'AI Analysis', 
                desc: 'Our GPT-powered AI automatically categorizes transactions and identifies hidden spending patterns.',
                icon: Brain,
                color: 'text-sky-500'
              },
              { 
                step: '03', 
                title: 'Reach Your Goals', 
                desc: 'Get actionable insights and automated budgeting to help you hit your savings targets faster.',
                icon: Target,
                color: 'text-purple-500'
              }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 glass-card p-8 flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 border border-white/5 shadow-xl group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                </div>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-4">{s.step}</span>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Real users, real savings, real financial freedom.</p>
          </div>

          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                text: "SpendSmart AI completely changed how I think about my money. The AI categorization is spooky accurate!",
                author: "Sarah Johnson",
                role: "Freelance Designer",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
              },
              {
                text: "I saved over $500 in my first month just by identifying recurring subscriptions I had forgotten about.",
                author: "Mark Davis",
                role: "Software Engineer",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
              },
              {
                text: "The goals tracking is so motivating. Seeing that progress bar fill up makes me want to save even more.",
                author: "Elena Rodriguez",
                role: "Marketing Director",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
              },
              {
                text: "Clean, fast, and secure. It's the only finance app I actually enjoy using every single day.",
                author: "James Wilson",
                role: "Small Business Owner",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
              },
              {
                text: "The bento-style UI is beautiful. It feels like a premium product but helps me stay on a budget.",
                author: "Chloe Chen",
                role: "Graduate Student",
                avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200"
              },
              {
                text: "Bank-level security was my main concern, but SpendSmart handles it perfectly. I feel safe tracking here.",
                author: "Robert Miller",
                role: "Financial Analyst",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
              }
            ].map((t, i) => (
              <BentoCard key={i} className="flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}
                </div>
                <Quote className="w-8 h-8 text-emerald-500/20 mb-4" />
                <p className="text-slate-300 text-sm italic mb-6 flex-1 lead-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full border border-emerald-500/20" />
                  <div>
                    <p className="text-sm font-bold text-white">{t.author}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </BentoCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Transform Your Finances?</h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">
            Join 250,000+ people taking control of their money every day. 
            No credit card required.
          </p>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-xl px-12 py-5 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            Create Your Free Account
            <Rocket className="w-6 h-6" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SpendSmart AI</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
          </div>

          <p className="text-sm text-slate-600">
            © 2026 SpendSmart AI. All rights reserved. @Priyaank Sinha
          </p>
        </div>
      </footer>
    </div>
  )
}
