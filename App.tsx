import React, { useState, useEffect, useRef } from 'react';
import { generatePRD } from './services/geminiService';
import { auth, db } from './services/api';
import { AppState, PRDResponse, Tab, User, Project } from './types';
import {
  IconSparkles, IconCode, IconLayout, IconDatabase,
  IconList, IconCopy, IconCheck, IconArrowRight, IconLoader,
  IconFileText, IconRocket, IconMenu, IconPlus, IconHistory,
  IconDownload, IconShare, IconMail, IconLock, IconGoogle, IconGithub,
  IconStar, IconCreditCard, IconLogOut, IconTrash
} from './components/Icons';

// --- HELPERS ---

const generateMarkdown = (data: PRDResponse) => {
  return `# ${data.appName}
> ${data.tagline}

## Executive Summary
${data.summary}

## Target Users
${data.targetUsers.map(u => `- ${u}`).join('\n')}

## Features
${data.features.map(f => `### ${f.name} (${f.priority})
${f.userStory}
**Acceptance Criteria:**
${f.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}
`).join('\n')}

## Tech Stack
- Frontend: ${data.techStack.frontend}
- Backend: ${data.techStack.backend}
- Database: ${data.techStack.database}
- Auth: ${data.techStack.auth}
- Deployment: ${data.techStack.deployment}

## Data Models
${data.dataModels.map(dm => `### ${dm.name}
${dm.description}
Attributes:
${dm.attributes.map(a => `- ${a}`).join('\n')}
`).join('\n')}

## User Flow
${data.userFlow}

## MVP Scope
### Must Have
${data.mvpScope.mustHave.map(i => `- ${i}`).join('\n')}
### Should Have
${data.mvpScope.shouldHave.map(i => `- ${i}`).join('\n')}
`;
};

// --- AUTH COMPONENTS ---

const AuthLayout = ({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) => (
  <div className="min-h-screen bg-[#09090b] bg-grid flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-[400px] animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <IconFileText className="text-white w-6 h-6" />
        </div>
      </div>
      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">{title}</h2>
        <p className="text-zinc-400 text-center mb-8 text-sm leading-relaxed">{subtitle}</p>
        {children}
      </div>
      <div className="mt-6 text-center">
        <p className="text-zinc-500 text-xs">
          By continuing, you agree to VibeSpecs <a href="#" className="underline hover:text-zinc-300">Terms</a> and <a href="#" className="underline hover:text-zinc-300">Privacy</a>.
        </p>
      </div>
    </div>
  </div>
);

const SocialAuthButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all text-sm font-medium text-zinc-300 hover:text-white"
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

const AuthInput = ({ icon: Icon, type, placeholder, value, onChange }: { icon: any, type: string, placeholder: string, value?: string, onChange?: (e: any) => void }) => (
  <div className="relative group">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-[#09090b] border border-zinc-700 focus:border-violet-500/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
    />
  </div>
);

const LoginPage = ({ onLogin, onSwitch }: { onLogin: (user: User) => void, onSwitch: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('demo@vibespecs.pro');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await auth.login(email, password);
      onLogin(user);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue vibecoding">
      <div className="space-y-4">
        <div className="flex gap-3">
          <SocialAuthButton icon={IconGoogle} label="Google" />
          <SocialAuthButton icon={IconGithub} label="GitHub" />
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-zinc-500">OR</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            icon={IconMail} type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <div className="space-y-1">
            <AuthInput
              icon={IconLock} type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <div className="flex justify-end">
              <a href="#" className="text-xs text-violet-400 hover:text-violet-300">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-violet-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <IconLoader className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-violet-400 hover:text-violet-300 font-medium">
            Sign up
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

const SignupPage = ({ onSignup, onSwitch }: { onSignup: (user: User) => void, onSwitch: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await auth.signup(email, password, name);
      onSignup(user);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start generating PRDs for your next big idea">
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            icon={IconFileText} type="text" placeholder="Full Name"
            value={name} onChange={e => setName(e.target.value)}
          />
          <AuthInput
            icon={IconMail} type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <AuthInput
            icon={IconLock} type="password" placeholder="Create password"
            value={password} onChange={e => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-violet-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <IconLoader className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-zinc-500">OR CONTINUE WITH</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <div className="flex gap-3">
          <SocialAuthButton icon={IconGoogle} label="Google" />
          <SocialAuthButton icon={IconGithub} label="GitHub" />
        </div>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-violet-400 hover:text-violet-300 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

// --- PRICING COMPONENT ---

const PricingPage = ({ onBack }: { onBack: () => void }) => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for hobbyists and side projects.',
      features: ['3 PRD Generations / month', 'Basic IDE Prompts', 'Standard Support', 'Export to Text'],
      highlight: false,
      buttonText: 'Current Plan'
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For serious developers shipping products.',
      features: ['Unlimited Generations', 'Advanced "One-Shot" Prompts', 'Markdown & PDF Export', 'Priority Support', 'Gemini 1.5 Pro Access'],
      highlight: true,
      buttonText: 'Upgrade to Pro'
    },
    {
      name: 'Team',
      price: '$49',
      period: '/month',
      description: 'Collaborate with your team on specs.',
      features: ['Everything in Pro', 'Team Workspace', 'Shared History', 'API Access', 'Custom Templates'],
      highlight: false,
      buttonText: 'Contact Sales'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090b] animate-fade-in relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-violet-900/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <button
          onClick={onBack}
          className="absolute top-8 left-6 md:left-0 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <IconArrowRight className="w-4 h-4 rotate-180" />
          Back to Workspace
        </button>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-violet-400 font-semibold tracking-wider uppercase text-sm mb-4">Pricing Plans</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ship faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Pro Superpowers</span>
          </h1>
          <p className="text-xl text-zinc-400 font-light">
            Choose the plan that fits your coding workflow. Upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`
                relative flex flex-col p-8 rounded-2xl border transition-all duration-300
                ${plan.highlight
                  ? 'bg-zinc-900/50 border-violet-500/50 shadow-2xl shadow-violet-900/20 scale-105 z-10'
                  : 'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30'
                }
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-2 ${plan.highlight ? 'text-white' : 'text-zinc-300'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-sm text-zinc-300">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      <IconCheck className="w-2.5 h-2.5" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`
                w-full py-3 rounded-xl font-semibold text-sm transition-all
                ${plan.highlight
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }
              `}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const Sidebar = ({
  state,
  activeTab,
  onTabChange,
  data,
  onNewProject,
  user,
  onOpenPricing,
  projects,
  onLoadProject,
  onDeleteProject,
  onLogout
}: {
  state: AppState,
  activeTab: Tab,
  onTabChange: (tab: Tab) => void,
  data: PRDResponse | null,
  onNewProject: () => void,
  user: User | null,
  onOpenPricing: () => void,
  projects: Project[],
  onLoadProject: (p: Project) => void,
  onDeleteProject: (id: string, e: React.MouseEvent) => void,
  onLogout: () => void
}) => {
  const tabs = [
    { id: Tab.SUMMARY, icon: IconLayout, label: 'Overview' },
    { id: Tab.FEATURES, icon: IconList, label: 'Features' },
    { id: Tab.TECH_DATA, icon: IconDatabase, label: 'Tech & Data' },
    { id: Tab.FLOW, icon: IconArrowRight, label: 'User Flow' },
    { id: Tab.PROMPTS, icon: IconRocket, label: 'IDE Prompts' },
  ];

  const handleDownload = () => {
    if (!data) return;
    const md = generateMarkdown(data);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.appName.toLowerCase().replace(/\s+/g, '-')}-prd.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col h-full flex-shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onNewProject}>
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
            <IconFileText className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-zinc-100 tracking-tight text-sm">VibeSpecs</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Actions */}
        <div className="space-y-1">
          <button onClick={onNewProject} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-all group">
            <IconPlus className="w-4 h-4 text-zinc-500 group-hover:text-violet-400" />
            New PRD
          </button>
        </div>

        {/* Dynamic Project Navigation */}
        {state === AppState.COMPLETE && data && (
          <div className="animate-fade-in space-y-4">
            <div>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Document</span>
              </div>
              <div className="space-y-0.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`
                         w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-200
                         ${isActive
                          ? 'bg-zinc-800 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }
                       `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-zinc-500'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="px-3 mb-2">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Actions</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors text-left"
              >
                <IconDownload className="w-4 h-4" />
                Export Markdown
              </button>
            </div>
          </div>
        )}

        {/* Real History */}
        <div className="pt-4 border-t border-zinc-900">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">History</span>
            <span className="text-[10px] text-zinc-700">{projects.length}</span>
          </div>

          <div className="space-y-0.5">
            {projects.length === 0 ? (
              <p className="px-3 text-xs text-zinc-600 italic">No projects yet.</p>
            ) : (
              projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onLoadProject(p)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 rounded-md transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <IconHistory className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                    <span className="truncate">{p.name || 'Untitled Project'}</span>
                  </div>
                  <div
                    onClick={(e) => onDeleteProject(p.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"
                  >
                    <IconTrash className="w-3 h-3" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-zinc-800">
        {/* Upgrade CTA */}
        <button
          onClick={onOpenPricing}
          className="w-full mb-4 flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-lg text-xs font-medium text-violet-200 hover:border-violet-500/50 transition-all group"
        >
          <IconStar className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300" />
          Upgrade to Pro
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 ring-1 ring-zinc-700 uppercase">
            {user?.name.slice(0, 2) || 'VB'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-medium text-zinc-200 truncate">{user?.name}</div>
            <div className="text-[10px] text-zinc-500 truncate capitalize">{user?.plan} Plan</div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
            title="Sign Out"
          >
            <IconLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

const Homepage = ({ onSubmit, isLoading, onOpenPricing }: { onSubmit: (idea: string) => void, isLoading: boolean, onOpenPricing: () => void }) => {
  const [idea, setIdea] = useState('');

  const templates = [
    { label: "SaaS Boilerplate", prompt: "Create a PRD for a NextJS + Supabase SaaS boilerplate with Stripe subscription and user dashboard." },
    { label: "AI Content Repurposer", prompt: "Build a PRD for an AI tool that turns YouTube videos into blog posts and Twitter threads." },
    { label: "Fitness Social App", prompt: "Design a mobile app for tracking workouts with a social feed and leaderboards." },
    { label: "E-commerce Backend", prompt: "A headless e-commerce backend API with inventory management and order processing." }
  ];

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto h-full">
      {/* Top Nav (Visual only for Homepage feel) */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-end items-center z-10">
        <div className="flex gap-4">
          <button
            onClick={onOpenPricing}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Docs
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-[600px] pb-10">
        <div className="max-w-4xl w-full flex flex-col items-center text-center animate-slide-up">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-medium mb-8">
            <IconSparkles className="w-3 h-3" />
            <span>The AI Product Manager for Vibe Coders</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
            Supercharge your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">product specs</span>
          </h1>

          <p className="text-xl text-zinc-400 font-light mb-12 max-w-2xl leading-relaxed">
            Stop writing messy docs. Turn your ideas into crystal-clear PRDs and "One-Shot" IDE prompts for Cursor & Replit instantly.
          </p>

          {/* Input Box */}
          <div className="w-full bg-[#18181b] p-3 rounded-2xl border border-zinc-800 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all duration-300 shadow-2xl relative group max-w-2xl mx-auto">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={isLoading}
              placeholder="Describe your app idea in detail..."
              className="w-full bg-transparent text-white p-4 outline-none resize-none font-sans text-lg placeholder:text-zinc-600 min-h-[120px] rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  if (idea.trim() && !isLoading) onSubmit(idea);
                }
              }}
            />

            <div className="flex justify-between items-center px-2 pb-1 mt-2">
              <div className="flex gap-2">
                <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Attach context">
                  <IconCode className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => idea.trim() && onSubmit(idea)}
                disabled={isLoading || !idea.trim()}
                className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                      ${isLoading || !idea.trim()
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/25 hover:scale-105 active:scale-95'
                  }
                    `}
              >
                {isLoading ? (
                  <>
                    <IconLoader className="w-4 h-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    Generate
                    <IconArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Starters */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
            {templates.map((t, i) => (
              <button
                key={i}
                onClick={() => setIdea(t.prompt)}
                className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-violet-500/30 rounded-xl transition-all group text-left"
              >
                <span className="text-sm text-zinc-400 group-hover:text-zinc-200">{t.label}</span>
                <IconArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Trust indicators */}
      <div className="w-full py-8 text-center mt-auto">
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          Outputs Optimized For
        </p>
        <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="font-bold text-lg text-zinc-400 tracking-tight">CURSOR</span>
          <span className="font-bold text-lg text-zinc-400 tracking-tight">REPLIT</span>
          <span className="font-bold text-lg text-zinc-400 tracking-tight">LOVABLE</span>
          <span className="font-bold text-lg text-zinc-400 tracking-tight">V0</span>
        </div>
      </div>
    </div>
  );
};

// --- DOCUMENT VIEWS ---

const DocumentHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-10 pb-6 border-b border-zinc-800/50">
    <div className="flex items-center gap-2 mb-4">
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/10 text-violet-400 uppercase tracking-wider border border-violet-500/20">Draft v1.0</span>
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 uppercase tracking-wider border border-zinc-700">Confidential</span>
    </div>
    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{title}</h1>
    <p className="text-xl text-zinc-400 font-light leading-relaxed">{subtitle}</p>
  </div>
);

const SummaryView = ({ data }: { data: PRDResponse }) => (
  <div className="animate-fade-in max-w-[65ch] mx-auto py-12">
    <DocumentHeader title={data.appName} subtitle={data.tagline} />

    <div className="prose prose-invert prose-zinc max-w-none">
      <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
        <IconLayout className="w-4 h-4 text-violet-500" /> Executive Summary
      </h3>
      <p className="text-zinc-300 leading-7 text-[16px] mb-10">{data.summary}</p>

      <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-4">Target Audience</h3>
      <div className="grid gap-3 mb-10">
        {data.targetUsers.map((user, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
              {idx + 1}
            </div>
            <span className="text-zinc-300 text-sm font-medium">{user}</span>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-4">MVP Scope</h3>
      <div className="space-y-4">
        <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
          <div className="text-emerald-400 text-xs font-bold mb-3 uppercase flex items-center gap-2">
            <IconCheck className="w-3 h-3" /> Core Requirements
          </div>
          <ul className="space-y-2">
            {data.mvpScope.mustHave.map((item, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 bg-emerald-500 rounded-full shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const FeaturesView = ({ data }: { data: PRDResponse }) => (
  <div className="animate-fade-in max-w-[80ch] mx-auto py-12 px-6">
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
      <h2 className="text-2xl font-bold text-white">Feature Specs</h2>
      <div className="flex gap-2">
        <span className="text-xs font-mono text-zinc-500">{data.features.length} ITEMS</span>
      </div>
    </div>

    <div className="space-y-4">
      {data.features.map((feature, idx) => (
        <div key={idx} className="bg-zinc-900/20 border border-zinc-800 hover:border-zinc-700 rounded-lg p-5 transition-all">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold text-zinc-200">{feature.name}</h3>
            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded uppercase tracking-wider ${feature.priority === 'High' ? 'bg-rose-950/30 text-rose-500 border border-rose-900/50' :
              feature.priority === 'Medium' ? 'bg-amber-950/30 text-amber-500 border border-amber-900/50' :
                'bg-blue-950/30 text-blue-500 border border-blue-900/50'
              }`}>
              {feature.priority}
            </span>
          </div>

          <p className="text-zinc-400 text-sm mb-4 leading-relaxed border-l-2 border-zinc-800 pl-3">
            {feature.userStory}
          </p>

          <div>
            <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Acceptance Criteria</h4>
            <ul className="space-y-1">
              {feature.acceptanceCriteria.map((ac, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  <IconCheck className="w-3 h-3 text-violet-500/50" />
                  {ac}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TechDataView = ({ data }: { data: PRDResponse }) => (
  <div className="animate-fade-in max-w-[80ch] mx-auto py-12 px-6">
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">Technical Architecture</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(data.techStack).map(([key, value]) => (
          <div key={key} className="bg-zinc-900/20 border border-zinc-800 p-4 rounded-lg flex flex-col hover:bg-zinc-900/40 transition-colors">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-2">{key}</span>
            <span className="text-zinc-200 font-mono text-sm">{value as string}</span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Schema Design</h2>
      <div className="grid gap-6">
        {data.dataModels.map((model, idx) => (
          <div key={idx} className="bg-zinc-900/20 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IconDatabase className="w-4 h-4 text-violet-500" />
                <span className="font-mono font-bold text-zinc-200">{model.name}</span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-zinc-500 mb-4 font-mono">{model.description}</p>
              <div className="space-y-1">
                {model.attributes.map((attr, i) => {
                  const [col, type] = attr.split(':').map(s => s.trim());
                  return (
                    <div key={i} className="flex justify-between text-xs font-mono py-1.5 border-b border-zinc-800/30 last:border-0">
                      <span className="text-zinc-300">{col}</span>
                      <span className="text-violet-400/80">{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UserFlowView = ({ data }: { data: PRDResponse }) => (
  <div className="animate-fade-in max-w-[65ch] mx-auto py-12">
    <div className="mb-8 border-b border-zinc-800/50 pb-6">
      <h2 className="text-2xl font-bold text-white">User Journey</h2>
    </div>
    <div className="prose prose-invert prose-zinc max-w-none">
      <div className="whitespace-pre-line leading-loose text-zinc-300">
        {data.userFlow}
      </div>
    </div>
  </div>
);

const PromptsView = ({ data }: { data: PRDResponse }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="animate-fade-in h-full flex flex-col max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">IDE Prompts</h2>
          <p className="text-zinc-500 text-sm mt-1">Copy these into Cursor or Replit to start building immediately.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20 flex-1 min-h-0">
        {/* Cursor Prompt */}
        <div className="flex flex-col bg-[#0d1117] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex-1">
          <div className="px-4 py-3 border-b border-zinc-800 bg-[#090d13] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <span className="font-mono text-xs text-zinc-400 ml-2">cursor_composer.txt</span>
            </div>
            <button
              onClick={() => copyToClipboard(data.cursorPrompt, 'cursor')}
              className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-zinc-300 transition-all border border-zinc-700"
            >
              {copied === 'cursor' ? <IconCheck className="w-3 h-3 text-emerald-400" /> : <IconCopy className="w-3 h-3" />}
              {copied === 'cursor' ? 'COPIED' : 'COPY'}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0d1117]">
            <pre className="text-xs font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap selection:bg-violet-500/20 selection:text-violet-200">
              <span className="text-violet-400"># Cursor Composer Prompt</span>
              {'\n\n'}
              {data.cursorPrompt}
            </pre>
          </div>
        </div>

        {/* Replit Prompt */}
        <div className="flex flex-col bg-[#0d1117] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex-1">
          <div className="px-4 py-3 border-b border-zinc-800 bg-[#090d13] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
              </div>
              <span className="font-mono text-xs text-zinc-400 ml-2">replit_agent.md</span>
            </div>
            <button
              onClick={() => copyToClipboard(data.replitPrompt, 'replit')}
              className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-zinc-300 transition-all border border-zinc-700"
            >
              {copied === 'replit' ? <IconCheck className="w-3 h-3 text-emerald-400" /> : <IconCopy className="w-3 h-3" />}
              {copied === 'replit' ? 'COPIED' : 'COPY'}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0d1117]">
            <pre className="text-xs font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap selection:bg-orange-500/20 selection:text-orange-200">
              <span className="text-orange-400"># Replit Agent Prompt</span>
              {'\n\n'}
              {data.replitPrompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<PRDResponse | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SUMMARY);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'generator' | 'pricing'>('generator');

  const [projects, setProjects] = useState<Project[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load User on Mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error("Failed to restore session:", e);
      }
    };
    initAuth();
  }, []);

  // Load Projects when User changes
  useEffect(() => {
    if (user) {
      const loadProjects = async () => {
        const list = await db.getProjects();
        setProjects(list);
      };
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    // View is already default, no need to reset unless we want to
  };

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    setData(null);
    setState(AppState.IDLE);
  };

  const handleGenerate = async (idea: string) => {
    setState(AppState.GENERATING);
    setError(null);
    try {
      const result = await generatePRD(idea);

      // Save to DB
      await db.saveProject(result);

      // Refresh list
      const list = await db.getProjects();
      setProjects(list);

      setData(result);
      setState(AppState.COMPLETE);
      setActiveTab(Tab.SUMMARY);
    } catch (e) {
      console.error(e);
      setError("Failed to generate PRD. Please check your API key and try again.");
      setState(AppState.ERROR);
    }
  };

  const handleLoadProject = (project: Project) => {
    setData(project.data);
    setState(AppState.COMPLETE);
    setActiveTab(Tab.SUMMARY);
    setView('generator');
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await db.deleteProject(id);
      const list = await db.getProjects();
      setProjects(list);

      // If deleting currently viewed project, reset
      if (data && projects.find(p => p.id === id)?.data.appName === data.appName) {
        handleNewProject();
      }
    }
  };

  const handleNewProject = () => {
    setState(AppState.IDLE);
    setData(null);
    setView('generator');
  };

  // Scroll to top on tab change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  // Auth Routing Logic
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onLogin={handleAuthSuccess}
          onSwitch={() => setAuthView('signup')}
        />
      );
    } else {
      return (
        <SignupPage
          onSignup={handleAuthSuccess}
          onSwitch={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e] text-zinc-200 font-sans selection:bg-violet-500/30">

      {/* Sidebar - Always visible */}
      <Sidebar
        state={state}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        data={data}
        onNewProject={handleNewProject}
        user={user}
        onOpenPricing={() => setView('pricing')}
        projects={projects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-grid">

        {view === 'pricing' ? (
          <PricingPage onBack={() => setView('generator')} />
        ) : (
          // Generator Views
          <>
            {state === AppState.IDLE ? (
              <Homepage
                onSubmit={handleGenerate}
                isLoading={false}
                onOpenPricing={() => setView('pricing')}
              />
            ) : state === AppState.GENERATING ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-zinc-400 animate-pulse">Designing your application...</p>
              </div>
            ) : state === AppState.COMPLETE && data ? (
              <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
                {activeTab === Tab.SUMMARY && <SummaryView data={data} />}
                {activeTab === Tab.FEATURES && <FeaturesView data={data} />}
                {activeTab === Tab.TECH_DATA && <TechDataView data={data} />}
                {activeTab === Tab.FLOW && <UserFlowView data={data} />}
                {activeTab === Tab.PROMPTS && <PromptsView data={data} />}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full flex-col">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={handleNewProject} className="text-zinc-400 hover:text-white underline">Return Home</button>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}