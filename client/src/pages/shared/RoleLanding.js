import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  FileText,
  Globe,
  Zap,
  Calculator,
  Eye,
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  Menu,
  X,
  Upload,
  FolderOpen,
  Clock,
  CheckCircle2
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useTheme } from '../../context/ThemeContext';

const roleConfigs = {
  user: {
    slug: 'user',
    brand: 'Permiso',
    hero: {
      highlight: 'Get Your Permits Approved Faster',
      title: 'Smart Permit Management Platform',
      description:
        'Skip the paperwork headaches. Upload your construction documents, get instant AI compliance checks, and track your permit status in real-time. Built for contractors, architects, and developers who value their time.'
    },
    navLinks: [
      { label: 'Home', href: '#home' },
      { label: 'Contact', href: '#contact' }
    ],
    headerButtons: [
      { label: 'Sign In', to: '/login', variant: 'outline' },
      { label: 'Get Started', to: '/register?role=user', variant: 'solid' }
    ],
    heroActions: [
      { label: 'Get Started Free', to: '/register?role=user', primary: true },
      { label: 'Sign In', to: '/login' }
    ],
    featuresHeading: 'Streamline Your Permit Process',
    featuresSubheading: 'Complete permit management solution designed for contractors, architects, and property developers',
    features: [
      {
        icon: Bot,
        title: 'AI Permit Checker',
        description: 'Automatically review your permit documents for compliance issues before submission. Get instant AI-powered feedback and recommendations to avoid costly rejections.',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        icon: Upload,
        title: 'Easy Project Upload',
        description: 'Simply drag and drop your construction documents. Our system automatically organizes and processes your files for permit submission.',
        color: 'from-purple-500 to-pink-500'
      },
      {
        icon: Calculator,
        title: 'Cost & Timeline Calculator',
        description: 'Know your costs upfront. Get instant estimates for permit fees, processing times, and potential delays before you submit your application.',
        color: 'from-indigo-500 to-purple-500'
      },
      {
        icon: FolderOpen,
        title: 'Smart Document Hub',
        description: 'Keep all your permit documents, plans, and correspondence organized in one secure location. Never lose track of important files again.',
        color: 'from-green-500 to-teal-500'
      },
      {
        icon: Clock,
        title: 'Live Application Tracking',
        description: 'Get instant notifications when your permit status changes. Know exactly where your application stands at every step of the review process.',
        color: 'from-orange-500 to-red-500'
      },
      {
        icon: Globe,
        title: 'Multi-Language Access',
        description: 'Work in your preferred language. Full platform support in English, Spanish, and Hindi for seamless communication.',
        color: 'from-pink-500 to-rose-500'
      }
    ],
    stats: [
      { number: '10K+', label: 'Permits Processed' },
      { number: '95%', label: 'First-Time Approval Rate' },
      { number: '50%', label: 'Faster Processing' },
      { number: '24/7', label: 'AI Assistant Available' }
    ],
    cta: {
      title: 'Ready to Get Started?',
      description: 'Join thousands of professionals who trust Permiso for permit management.',
      primary: { label: 'Start Free Trial', to: '/register?role=user' },
      secondary: { label: 'Contact Sales', to: '/contact' }
    },
    contact: {
      title: 'Contact Us',
      description: 'Have questions? Reach out and we’ll get back to you soon.'
    }
  },
  reviewer: {
    slug: 'reviewer',
    brand: 'Permiso Reviewer',
    hero: {
      highlight: 'Reviewer Portal',
      title: 'AI-Assisted Plan Checks',
      description:
        'Accelerate plan reviews with curated queues, collaborative annotations, and automated compliance insights.'
    },
    navLinks: [
      { label: 'Overview', href: '#home' },
      { label: 'Capabilities', href: '#features' },
      { label: 'Contact', href: '#contact' }
    ],
    headerButtons: [
      { label: 'Main Site', to: '/', variant: 'ghost' },
      { label: 'Reviewer Login', to: '/reviewer/login', variant: 'solid' }
    ],
    heroActions: [
      { label: 'Reviewer Login', to: '/reviewer/login', primary: true },
      { label: 'Register', to: '/register?role=reviewer' }
    ],
    featuresHeading: 'Built for Review Teams',
    featuresSubheading: 'Everything compliance teams need to move faster with confidence',
    features: [
      {
        icon: CheckCircle,
        title: 'Automated Pre-Check',
        description: 'AI flags code issues before they reach your queue.',
        color: 'from-emerald-500 to-green-500'
      },
      {
        icon: Users,
        title: 'Collaborative Workspace',
        description: 'Assign, comment, and resolve directly in shared views.',
        color: 'from-blue-500 to-indigo-500'
      },
      {
        icon: FileText,
        title: 'Smart Intake',
        description: 'Normalized submissions with required metadata collected upfront.',
        color: 'from-fuchsia-500 to-rose-500'
      },
      {
        icon: Eye,
        title: 'Traceable Decisions',
        description: 'Full audit trails with AI-generated summaries.',
        color: 'from-amber-500 to-orange-500'
      },
      {
        icon: Bot,
        title: 'AI Recommendations',
        description: 'Suggested revisions powered by jurisdictional knowledge.',
        color: 'from-cyan-500 to-sky-500'
      },
      {
        icon: Zap,
        title: 'Queue Automation',
        description: 'Auto-prioritized workloads with SLA monitoring.',
        color: 'from-purple-500 to-violet-500'
      }
    ],
    stats: [
      { number: '4x', label: 'Faster Reviews' },
      { number: '60%', label: 'Fewer Resubmits' },
      { number: '100%', label: 'Traceability' },
      { number: '0', label: 'Manual Intake Emails' }
    ],
    cta: {
      title: 'Modernize Your Review Team',
      description: 'Give reviewers AI copilots, structured workflows, and instant context.',
      primary: { label: 'Reviewer Login', to: '/reviewer/login' },
      secondary: { label: 'Schedule Demo', href: '#contact' }
    },
    contact: {
      title: 'Need Reviewer Access?',
      description: 'Tell us about your municipality or agency to enable reviewer seats.'
    }
  },
  admin: {
    slug: 'admin',
    brand: 'Permiso Admin',
    hero: {
      highlight: 'Admin Control',
      title: 'Operational Command Center',
      description:
        'Monitor workloads, enforce compliance, and orchestrate every review pipeline in one secure hub.'
    },
    navLinks: [
      { label: 'Overview', href: '#home' },
      { label: 'Insights', href: '#features' },
      { label: 'Contact', href: '#contact' }
    ],
    headerButtons: [
      { label: 'Main Site', to: '/', variant: 'ghost' },
      { label: 'Admin Login', to: '/admin/login', variant: 'solid' }
    ],
    heroActions: [
      { label: 'Admin Login', to: '/admin/login', primary: true },
      { label: 'Talk to Sales', href: '#contact' }
    ],
    featuresHeading: 'Enterprise-Grade Controls',
    featuresSubheading: 'Visibility, governance, and automation for agency leadership',
    features: [
      {
        icon: Shield,
        title: 'Role-Based Security',
        description: 'Fine-grained permissions with audit-ready logs.',
        color: 'from-slate-500 to-slate-700'
      },
      {
        icon: BarChart3,
        title: 'Real-Time Analytics',
        description: 'Monitor throughput, bottlenecks, and SLA risk.',
        color: 'from-yellow-500 to-amber-500'
      },
      {
        icon: Users,
        title: 'Team Orchestration',
        description: 'Balance workloads and staffing with predictive routing.',
        color: 'from-indigo-500 to-blue-600'
      },
      {
        icon: Bot,
        title: 'AI Policy Guardrails',
        description: 'Automated code checks aligned to local ordinances.',
        color: 'from-cyan-500 to-teal-500'
      },
      {
        icon: FileText,
        title: 'Centralized Records',
        description: 'Uniform data retention and reporting exports.',
        color: 'from-rose-500 to-pink-500'
      },
      {
        icon: CheckCircle,
        title: 'Compliance Automation',
        description: 'Embedded workflows for escalations and approvals.',
        color: 'from-green-500 to-emerald-500'
      }
    ],
    stats: [
      { number: '360°', label: 'Operational Visibility' },
      { number: '30%', label: 'Cost Reduction' },
      { number: '99.9%', label: 'System Uptime' },
      { number: 'SOC 2', label: 'Security Certified' }
    ],
    cta: {
      title: 'Lead With Intelligence',
      description: 'Empower your agency with AI insights and centralized control.',
      primary: { label: 'Admin Login', to: '/admin/login' },
      secondary: { label: 'Book Strategy Call', href: '#contact' }
    },
    contact: {
      title: 'Enterprise Inquiries',
      description: 'Need dedicated onboarding or compliance reviews? We’re here to help.'
    }
  }
};

const roleHomePaths = {
  user: '/',
  reviewer: '/reviewer',
  admin: '/admin'
};

const RoleLanding = ({ variant = 'user' }) => {
  const config = roleConfigs[variant] || roleConfigs.user;
  const landingPath = roleHomePaths[config.slug] || '/';
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % config.features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [config.features.length]);

  const renderNavLink = (link) => {
    if (link.to) {
      return (
        <Link
          key={link.label}
          to={link.to}
          className={`${isDark ? 'text-gray-200 hover:text-white' : 'text-primary-900 hover:opacity-80'} text-sm px-3 py-2`}
        >
          {link.label}
        </Link>
      );
    }
    return (
      <a
        key={link.label}
        href={link.href}
        className={`${isDark ? 'text-gray-200 hover:text-white' : 'text-primary-900 hover:opacity-80'} text-sm px-3 py-2`}
      >
        {link.label}
      </a>
    );
  };

  const renderButton = (button, idx) => {
    const baseClasses = 'text-sm px-4 py-2 rounded-lg transition-all duration-300';
    let variantClasses = '';
    if (button.variant === 'solid') {
      variantClasses = 'glass-button bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white';
    } else if (button.variant === 'outline') {
      variantClasses = `glass-button border-2 ${
        isDark ? 'border-white/30 hover:bg-white/10 text-white' : 'border-primary-900/30 hover:bg-primary-900/5 text-primary-900'
      }`;
    } else {
      variantClasses = `${isDark ? 'text-gray-200 hover:text-white' : 'text-primary-900 hover:opacity-80'}`;
    }

    return (
      <Link key={`${button.label}-${idx}`} to={button.to} className={`${baseClasses} ${variantClasses}`}>
        {button.label}
      </Link>
    );
  };

  const renderHeroAction = (action, idx) => {
    const classes = action.primary
      ? 'glass-button bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center'
      : `glass-button border-2 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
          isDark ? 'border-white/30 hover:bg-white/10 text-white' : 'border-primary-900/30 hover:bg-primary-900/5 text-primary-900'
        }`;

    const content = (
      <>
        {action.label}
        {action.primary && <ArrowRight className="inline-block ml-2 w-5 h-5" />}
      </>
    );

    if (action.to) {
      return (
        <Link key={`${action.label}-${idx}`} to={action.to} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <a key={`${action.label}-${idx}`} href={action.href} className={classes}>
        {content}
      </a>
    );
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-gradient-to-b from-slate-900/70 to-transparent backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <div className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <Link
              to={landingPath}
              onClick={(event) => {
                if (typeof window !== 'undefined' && window.location.pathname === landingPath) {
                  event.preventDefault();
                  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center space-x-2"
            >
              <BrandLogo
                size={48}
                wordmark={config.brand}
                className="space-x-4"
                wordmarkClassName={isDark ? '' : 'text-primary-900'}
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-3">
              {config.navLinks.map(renderNavLink)}
              {config.headerButtons?.map((button, idx) => renderButton(button, idx))}
              <button
                onClick={toggleTheme}
                className="ml-1 px-3 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 text-gray-200"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {isDark ? '🌞' : '🌙'}
              </button>
            </nav>
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden glass rounded-xl px-4 py-4 space-y-3">
              <div className="flex flex-col space-y-2">
                {config.navLinks.map((link) => {
                  const node = renderNavLink(link);
                  const originalOnClick = node.props.onClick;
                  return React.cloneElement(node, {
                    key: link.label,
                    onClick: (e) => {
                      originalOnClick?.(e);
                      setIsMenuOpen(false);
                    },
                    className: `${node.props.className} border border-white/10 rounded-lg`
                  });
                })}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {config.headerButtons?.map((button, idx) => {
                  const buttonElement = renderButton(button, idx);
                  const originalOnClick = buttonElement.props.onClick;
                  return React.cloneElement(buttonElement, {
                    key: `${button.label}-${idx}`,
                    onClick: (e) => {
                      originalOnClick?.(e);
                      setIsMenuOpen(false);
                    },
                    className: `${buttonElement.props.className} w-full text-center`
                  });
                })}
              </div>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 text-gray-200"
              >
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </button>
            </div>
          )}
        </div>
      </header>

      <section id="home" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 sm:py-20">
        <div className={`absolute inset-0 ${isDark ? 'gradient-primary' : 'gradient-light'}`}>
          <div
            className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
          />
          {!isDark && <div className="water-overlay" />}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="w-full max-w-5xl"
            >
              <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-white/70 mb-6 font-medium">
                {config.hero.highlight}
              </p>
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight ${isDark ? 'text-white' : 'text-primary-900'}`}>
                <span className={`block mb-2 ${isDark ? 'text-gradient-accent' : 'text-gradient'}`}>
                  {config.hero.highlight}
                </span>
                <span className="block">
                  {config.hero.title}
                </span>
              </h1>
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-10 max-w-4xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {config.hero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {config.heroActions.map(renderHeroAction)}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-xl animate-bounce-gentle" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary-500/20 rounded-full blur-xl animate-bounce-gentle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-500/20 rounded-full blur-xl animate-bounce-gentle" style={{ animationDelay: '2s' }} />
      </section>

      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              {config.featuresHeading}
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              {config.featuresSubheading}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {config.features.map((feature, index) => (
              <motion.div
                key={`${feature.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`glass-card hover-lift cursor-pointer p-6 sm:p-8 ${
                  currentFeature === index ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => setCurrentFeature(index)}
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {config.stats.map((stat, index) => (
              <motion.div
                key={`${stat.label}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="glass-card p-6 sm:p-8 hover-lift">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="glass-card p-6 sm:p-10 lg:p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{config.cta.title}</h2>
            <p className="text-xl text-gray-300 mb-8">{config.cta.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {config.cta.primary.to ? (
                <Link
                  to={config.cta.primary.to}
                  className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center"
                >
                  {config.cta.primary.label}
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
              ) : (
                <a
                  href={config.cta.primary.href}
                  className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center"
                >
                  {config.cta.primary.label}
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </a>
              )}
              {config.cta.secondary.to ? (
                <Link
                  to={config.cta.secondary.to}
                  className="glass-button border-2 border-white/30 hover:bg-white/10 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  {config.cta.secondary.label}
                </Link>
              ) : (
                <a
                  href={config.cta.secondary.href}
                  className="glass-button border-2 border-white/30 hover:bg-white/10 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  {config.cta.secondary.label}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="py-20 relative">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-white mb-4">{config.contact.title}</h2>
            <p className="text-gray-300 mb-6">{config.contact.description}</p>
            <form className="grid grid-cols-1 gap-4">
              <input className="glass-input" placeholder="Your name" />
              <input className="glass-input" placeholder="Your email" />
              <textarea className="glass-input resize-none" placeholder="Message" rows="4" />
              <button className="glass-button bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 w-full">Send</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BrandLogo
                  size={44}
                  wordmark={config.brand}
                  className="space-x-4"
                  wordmarkClassName={isDark ? '' : 'text-primary-900'}
                />
              </div>
              <p className="text-gray-400">
                {variant === 'user'
                  ? 'AI-powered permit management platform for modern professionals.'
                  : variant === 'reviewer'
                  ? 'Purpose-built workflows and automations for municipal review teams.'
                  : 'Central oversight, analytics, and governance for agency leadership.'}
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/api" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link to="/integrations" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/status" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-gray-400">
            <p>&copy; 2024 Permiso Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RoleLanding;

