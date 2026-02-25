import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { FaXTwitter } from 'react-icons/fa6';
import {
    HiChartBar,
    HiCloud,
    HiArrowRight,
    HiLightningBolt,
    HiOutlineLink,
    HiOutlineTerminal,
    HiCalendar
} from 'react-icons/hi';

const SplashPage: React.FC = () => {
    const { setPage } = useAppContext();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen w-full bg-[rgba(var(--background-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] flex flex-col font-sans selection:bg-[rgba(var(--accent-rgb),0.3)] overflow-x-hidden">

            {/* Navbar */}
            <nav className={`fixed w-full flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 z-50 ${scrolled ? 'border-b border-[rgba(var(--border-primary-rgb))] backdrop-blur-md bg-[rgba(var(--background-primary-rgb),0.7)]' : 'bg-transparent'}`}>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <FaXTwitter className="w-6 h-6 text-[rgba(var(--foreground-primary-rgb))] group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-bold text-[17px] hidden sm:block tracking-tight text-[rgba(var(--foreground-primary-rgb))]">X To-Do Corp</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[rgba(var(--foreground-secondary-rgb))]">
                    <a href="#features" className="hover:text-[rgba(var(--foreground-primary-rgb))] transition-colors cursor-pointer">Features</a>
                    <a href="#scale" className="hover:text-[rgba(var(--foreground-primary-rgb))] transition-colors cursor-pointer">Build</a>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="hidden sm:block text-[14px] font-semibold text-[rgba(var(--foreground-primary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors"
                        onClick={() => setPage('login')}
                    >
                        Sign in
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage('login')}
                        className="relative overflow-hidden rounded-full bg-[rgba(var(--foreground-primary-rgb))] text-[rgba(var(--background-primary-rgb))] px-5 py-2 text-[14px] font-bold hover:opacity-90 transition-opacity"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Premium SaaS Hero Section */}
            <main className="flex-1 flex flex-col pt-16">
                <section className="relative pt-24 pb-20 px-6 md:px-10 overflow-visible flex flex-col items-center">
                    {/* Hero Background Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-[rgba(var(--accent-rgb),0.15)] blur-[120px] rounded-full pointer-events-none -z-10"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[rgba(var(--accent-rgb),0.05)] blur-[100px] rounded-full pointer-events-none -z-10"></div>

                    <div className="text-center max-w-4xl mx-auto space-y-6 animate-fade-in relative z-10 flex flex-col items-center">
                        {/* Pill Announcement */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(var(--accent-rgb),0.4)] bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--accent-rgb))] text-[13px] font-semibold mb-2 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] backdrop-blur-sm cursor-pointer hover:bg-[rgba(var(--accent-rgb),0.2)] transition-colors">
                            <span className="flex h-2 w-2 rounded-full bg-[rgba(var(--accent-rgb))] box-shadow-glow"></span>
                            Introducing X To-Do <HiArrowRight className="w-3 h-3 ml-1" />
                        </div>

                        {/* Bold SaaS Headline */}
                        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-[-0.03em] leading-[1.05] text-[rgba(var(--foreground-primary-rgb))]">
                            The new standard for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgba(var(--foreground-primary-rgb))] via-[rgba(var(--accent-rgb))] to-[rgba(var(--foreground-primary-rgb))] bg-[length:200%_auto] animate-gradient">
                                modern productivity
                            </span>
                        </h1>

                        <p className="text-[18px] md:text-[21px] text-[rgba(var(--foreground-secondary-rgb))] max-w-2xl mx-auto leading-relaxed mt-4 font-normal">
                            Meet the hyper-fast, offline-capable task manager designed specifically for high-performing teams and individuals.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full sm:w-auto">
                            <button
                                onClick={() => setPage('login')}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-bold text-[16px] hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)] flex items-center justify-center gap-2"
                            >
                                Start building <HiArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage('login')}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] text-[rgba(var(--foreground-primary-rgb))] font-bold text-[16px] hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors flex items-center justify-center gap-2"
                            >
                                <HiOutlineTerminal className="w-5 h-5 opacity-70" /> Sign In
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Image inside Safari/MacOS Window Mockup */}
                    <div className="w-full max-w-5xl mx-auto mt-20 relative z-20 animate-scale-in perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(var(--accent-rgb),0.2)] to-transparent opacity-30 blur-[60px] -z-10 rounded-full w-3/4 mx-auto h-3/4"></div>

                        <div className="rounded-2xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transform rotateX-[2deg] hover:rotate-[0deg] transition-transform duration-700 mx-4 md:mx-0">
                            {/* Window Header Mockup */}
                            <div className="h-12 border-b border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-tertiary-rgb))] flex items-center px-4 justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <div className="hidden sm:flex text-[rgba(var(--foreground-secondary-rgb))] text-xs px-3 py-1 bg-[rgba(var(--background-primary-rgb))] rounded-md border border-[rgba(var(--border-primary-rgb))] items-center gap-2 shadow-inner">
                                    <HiOutlineLink /> app.xtodo.corp
                                </div>
                                <div className="w-16"></div> {/* Spacer for balance */}
                            </div>

                            {/* App Interface Image */}
                            <div className="w-full bg-[rgba(var(--background-primary-rgb))] relative">
                                <img src="/screenshots/app-preview.png" alt="X To-Do Corp Application Screen" className="w-full h-auto object-cover" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Detailed Bento Grid Features */}
                <section id="features" className="py-32 px-6 md:px-10 bg-[rgba(var(--background-primary-rgb))]">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-20 text-center sm:text-left">
                            <h2 className="text-3xl md:text-5xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-6">Built for speed. <br className="hidden sm:block" /><span className="text-[rgba(var(--foreground-secondary-rgb))]">Designed for focus.</span></h2>
                            <p className="text-lg text-[rgba(var(--foreground-secondary-rgb))] max-w-2xl">X To-Do Corp is engineered to get out of your way. Navigate entirely by keyboard, work offline seamlessly, and let the system organize your chaos.</p>
                        </div>

                        {/* Bento Grid layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-[rgba(var(--background-primary-rgb))] rounded-3xl p-10 border border-[rgba(var(--border-primary-rgb))] hover:border-[rgba(var(--accent-rgb))] transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(var(--accent-rgb),0.05)] blur-[80px] rounded-full group-hover:bg-[rgba(var(--accent-rgb),0.15)] transition-colors"></div>
                                <HiLightningBolt className="w-10 h-10 text-[rgba(var(--accent-rgb))] mb-6 relative z-10" />
                                <h3 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-3 relative z-10">Command everything</h3>
                                <p className="text-[rgba(var(--foreground-secondary-rgb))] text-[16px] leading-relaxed max-w-md relative z-10">Hit <kbd className="bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-primary-rgb))] px-2 py-1 rounded border border-[rgba(var(--border-secondary-rgb))] text-xs font-mono ml-1 mr-1">?</kbd> to view shortcuts. Create, edit, tag, and assign tasks without ever touching your mouse. The speed of thought, realized.</p>
                            </div>

                            <div className="bg-[rgba(var(--background-primary-rgb))] rounded-3xl p-10 border border-[rgba(var(--border-primary-rgb))] hover:border-[rgba(var(--accent-rgb))] transition-colors overflow-hidden relative group">
                                <HiCloud className="w-10 h-10 text-[rgba(var(--foreground-primary-rgb))] group-hover:text-[rgba(var(--accent-rgb))] mb-6 transition-transform group-hover:scale-110" />
                                <h3 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-3">Sync & Offline</h3>
                                <p className="text-[rgba(var(--foreground-secondary-rgb))] text-[16px] leading-relaxed">Local-first architecture means sub-millisecond interactions. Cloud sync happens invisibly in the background.</p>
                            </div>

                            <div className="bg-[rgba(var(--background-primary-rgb))] rounded-3xl p-10 border border-[rgba(var(--border-primary-rgb))] hover:border-[rgba(var(--accent-rgb))] transition-colors relative overflow-hidden group">
                                <HiChartBar className="w-10 h-10 text-[rgba(var(--foreground-primary-rgb))] group-hover:text-[rgba(var(--accent-rgb))] mb-6 transition-transform group-hover:scale-110" />
                                <h3 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-3">Gamify Focus</h3>
                                <p className="text-[rgba(var(--foreground-secondary-rgb))] text-[16px] leading-relaxed">Unlock unique achievements and track your deep-work streaks automatically.</p>
                            </div>

                            <div className="md:col-span-2 bg-[rgba(var(--background-primary-rgb))] rounded-3xl p-10 border border-[rgba(var(--border-primary-rgb))] relative overflow-hidden hover:border-[rgba(var(--accent-rgb))] transition-colors group">
                                {/* Decor */}
                                <div className="absolute -bottom-20 -right-20 opacity-[0.03] pointer-events-none transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                    <HiCalendar className="w-64 h-64 text-[rgba(var(--foreground-primary-rgb))]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-3 relative z-10">Intelligent Scheduling</h3>
                                <p className="text-[rgba(var(--foreground-secondary-rgb))] text-[16px] leading-relaxed max-w-sm relative z-10">Calendar views, recurring rules, and time-blocking mechanisms built right into your task flow. Planning your week takes seconds, not hours.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA to match Login Page Footer context */}
                <section id="scale" className="py-32 bg-[rgba(var(--background-primary-rgb))] border-t border-[rgba(var(--border-primary-rgb))] relative overflow-hidden text-center">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-[rgba(var(--accent-rgb),0.1)] blur-[150px] pointer-events-none rounded-t-full"></div>
                    <div className="max-w-3xl mx-auto px-6 relative z-10">
                        <FaXTwitter className="w-12 h-12 text-[rgba(var(--foreground-primary-rgb))] mx-auto mb-8" />
                        <h2 className="text-4xl md:text-6xl font-extrabold text-[rgba(var(--foreground-primary-rgb))] mb-8 tracking-tight">Stop planning. <br /><span className="text-[rgba(var(--accent-rgb))] text-transparent bg-clip-text bg-gradient-to-r from-[rgba(var(--accent-rgb))] to-[rgba(var(--foreground-primary-rgb))]">Start executing.</span></h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setPage('login')}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[rgba(var(--foreground-primary-rgb))] text-[rgba(var(--background-primary-rgb))] font-bold text-[16px] hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(var(--foreground-primary-rgb),0.3)]"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Exact Footer matching LoginPage */}
            <div className="border-t border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))]">
                <div className="mx-auto max-w-7xl px-6 md:px-12 py-4">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-2 text-[12px] text-[rgba(var(--foreground-secondary-rgb))]">
                        <a className="hover:underline whitespace-nowrap" href="#">About</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Download the X app</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Help Center</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Terms of Service</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Privacy Policy</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Cookie Policy</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Accessibility</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Ads info</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Blog</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Careers</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Brand Resources</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Advertising</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Developers</a>
                        <a className="hover:underline whitespace-nowrap" href="#">Settings</a>
                        <span className="whitespace-nowrap">© 2025 X To-Do Corp.</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SplashPage;
