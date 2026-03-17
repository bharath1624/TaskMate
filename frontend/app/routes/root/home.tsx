import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
    CheckSquare,
    Users,
    BarChart3,
    Bell,
    Paperclip,
    Send,
    Lock,
    Layers,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Check,
    Search
} from "lucide-react";

const Homepage = () => {
    const scrollToFeatures = () => {
        const section = document.getElementById("features");
        section?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToHowItWorks = () => {
        const section = document.getElementById("how-it-works");
        section?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">

            {/* ================= NAVBAR (Floating Glassmorphism) ================= */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 supports-backdrop-filter:bg-white/40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight cursor-pointer" onClick={scrollToTop}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20">
                            <Layers size={20} className="text-white" />
                        </div>
                        <span className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">TaskMate</span>
                    </div>

                    {/* Actions & Navigation */}
                    <nav className="flex items-center gap-6">
                        {/* Desktop Quick Links */}
                        <div className="hidden md:flex items-center gap-6 mr-2">
                            <button
                                onClick={scrollToFeatures}
                                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                Features
                            </button>
                            <button
                                onClick={scrollToHowItWorks}
                                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                How it works
                            </button>
                        </div>

                        <Link to="/sign-in">
                            <span className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                Log in
                            </span>
                        </Link>

                        <Link to="/sign-up">
                            <Button className="font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 rounded-full px-6 transition-transform active:scale-95">
                                Get started
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ================= HERO (Modern SaaS Style) ================= */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Design Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-60" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Copy */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-sm font-semibold mb-6 shadow-sm">
                            <Sparkles size={14} className="text-blue-600" />
                            <span>The new standard for team productivity</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-slate-900">
                            Manage work better with <br className="hidden md:block" />
                            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TaskMate</span>
                        </h1>

                        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            A clean and powerful task management platform that helps teams organize work, stay focused, and deliver faster without the clutter.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            {/* Updated CTA Button */}
                            <Link to="/sign-up">
                                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-14 px-10 text-base font-semibold text-white shadow-xl shadow-blue-600/20 rounded-full group transition-all">
                                    Start Collaborating
                                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Image/Mockup (Realistic Dashboard UI) */}
                    <div className="relative mx-auto w-full max-w-[650px] lg:max-w-none perspective-1000">
                        {/* Decorative glow behind the mockup */}
                        <div className="absolute inset-0 bg-linear-to-tr from-blue-500 to-indigo-500 rounded-2xl blur-2xl opacity-20 transform -rotate-3" />

                        {/* Premium CSS-Built Realistic Mockup Wrapper */}
                        <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col aspect-4/3 sm:aspect-16/10 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-700 w-full text-slate-300 font-sans">

                            {/* App Header */}
                            <div className="h-12 border-b border-slate-800 bg-[#0f172a] flex items-center px-4 justify-between shrink-0">
                                {/* Window Controls */}
                                <div className="flex gap-2 w-16">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                </div>
                                {/* Mock Search Bar */}
                                <div className="hidden sm:flex flex-1 max-w-xs mx-4 bg-slate-800 rounded-md h-7 items-center px-3 border border-slate-700/50">
                                    <Search size={12} className="text-slate-500 mr-2" />
                                    <div className="h-1.5 w-24 bg-slate-600/50 rounded-full" />
                                </div>
                                {/* Team Avatars */}
                                <div className="flex -space-x-2">
                                    <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-blue-500" />
                                    <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-indigo-500" />
                                    <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-purple-500 flex items-center justify-center text-[9px] font-bold text-white">+1</div>
                                </div>
                            </div>

                            {/* App Body */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar */}
                                <div className="w-48 border-r border-slate-800 bg-[#0f172a] p-4 flex-col gap-1 hidden sm:flex shrink-0">
                                    <div className="flex items-center gap-3 text-blue-400 bg-blue-500/10 px-2 py-2 rounded-lg border border-blue-500/20">
                                        <Layers size={14} />
                                        <span className="text-xs font-semibold">Dashboard</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400 hover:text-slate-300 px-2 py-2 rounded-lg">
                                        <CheckSquare size={14} />
                                        <span className="text-xs font-medium">My Tasks</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400 hover:text-slate-300 px-2 py-2 rounded-lg">
                                        <Users size={14} />
                                        <span className="text-xs font-medium">Team Members</span>
                                    </div>
                                    <div className="mt-6 mb-2 px-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projects</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        <span className="text-xs text-slate-300">Platform Launch</span>
                                    </div>
                                </div>

                                {/* Main Content (Kanban Board) */}
                                <div className="flex-1 bg-slate-900 p-4 sm:p-5 flex flex-col overflow-hidden">
                                    <div className="flex justify-between items-end mb-5 shrink-0">
                                        <div>
                                            <h3 className="text-base font-bold text-white mb-0.5">Platform Launch</h3>
                                            <p className="text-[11px] text-slate-400">4 team members • Due in 5 days</p>
                                        </div>
                                        <div className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-medium rounded-md shadow-sm">
                                            + Add Task
                                        </div>
                                    </div>

                                    {/* Kanban Columns */}
                                    <div className="flex gap-4 flex-1 overflow-hidden">

                                        {/* To Do Column */}
                                        <div className="flex-1 flex flex-col gap-3 min-w-40">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-xs font-semibold text-slate-300">To Do</span>
                                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">2</span>
                                            </div>
                                            {/* Card 1 */}
                                            <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-lg shadow-sm">
                                                <div className="flex gap-1.5 mb-2">
                                                    <span className="text-[8px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase">High</span>
                                                    <span className="text-[8px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">Backend</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-200 mb-3 leading-snug">Setup Zod Schema Validation</p>
                                                <div className="flex justify-between items-center">
                                                    <Paperclip size={10} className="text-slate-500" />
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 border border-slate-700" />
                                                </div>
                                            </div>
                                            {/* Card 2 */}
                                            <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-lg shadow-sm">
                                                <div className="flex gap-1.5 mb-2">
                                                    <span className="text-[8px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase">Design</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-200 mb-3 leading-snug">Design interactive map UI</p>
                                                <div className="flex justify-between items-center">
                                                    <Paperclip size={10} className="text-slate-500" />
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500 border border-slate-700" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* In Progress Column */}
                                        <div className="flex-1 flex flex-col gap-3 min-w-40">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-xs font-semibold text-blue-400">In Progress</span>
                                                <span className="text-[10px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full">1</span>
                                            </div>
                                            {/* Card 3 (Active) */}
                                            <div className="bg-[#0f172a] border border-blue-500/30 p-3 rounded-lg shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500" />
                                                <div className="flex gap-1.5 mb-2 mt-1">
                                                    <span className="text-[8px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded uppercase">MERN</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-200 mb-3 leading-snug">Build REST API architecture</p>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                                        <CheckSquare size={10} /> 3/5
                                                    </div>
                                                    <div className="w-5 h-5 rounded-full bg-purple-500 border border-slate-700" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= USE CASES ================= */}
            <section className="relative z-20 py-24 bg-white border-y border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                            Built for every kind of team
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Whether you work solo or with a team, TaskMate adapts to your unique workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Individuals */}
                        <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                                <Users size={120} />
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Individuals</h3>
                            <p className="text-slate-600 leading-relaxed relative z-10">
                                Manage personal tasks, stay organized, and keep track of daily work with absolute clarity.
                            </p>
                        </div>

                        {/* Teams */}
                        <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                                <Users size={120} />
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Teams</h3>
                            <p className="text-slate-600 leading-relaxed relative z-10">
                                Collaborate seamlessly on tasks, assign responsibilities, and track collective progress effortlessly.
                            </p>
                        </div>

                        {/* Startups */}
                        <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-600/5 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                                <Layers size={120} />
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                <Layers size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Startups</h3>
                            <p className="text-slate-600 leading-relaxed relative z-10">
                                Organize complex projects, move fast, and scale your workflows seamlessly as your company grows.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section
                id="features"
                className="max-w-7xl mx-auto px-6 py-28 scroll-mt-20"
            >
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                        Everything you need to succeed
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        A complete toolkit to manage tasks, collaborate effectively, and keep your entire team aligned.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: CheckSquare,
                            title: "Task Management",
                            desc: "Create, assign, and track tasks across multiple projects with a clean interface.",
                        },
                        {
                            icon: ShieldCheck,
                            title: "Access Control",
                            desc: "Secure your workspace with distinct permissions and roles for every member.",
                        },
                        {
                            icon: Users,
                            title: "Team Collaboration",
                            desc: "Share updates, discuss tasks in threads, and keep everyone on the same page.",
                        },
                        {
                            icon: BarChart3,
                            title: "Progress Tracking",
                            desc: "Visualize your productivity with beautiful charts and actionable insights.",
                        },
                        {
                            icon: Bell,
                            title: "Smart Notifications",
                            desc: "Stay updated with real-time alerts that cut through the noise.",
                        },
                        {
                            icon: Paperclip,
                            title: "File Attachments",
                            desc: "Attach documents and files directly to tasks for absolute context.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="group rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mb-5">
                                <item.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {item.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= HOW IT WORKS ================= */}
            <section id="how-it-works" className="bg-slate-900 py-28 text-white relative overflow-hidden scroll-mt-10">
                {/* Dark mode background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm mb-3 block">
                            How it works
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Simple process, powerful results
                        </h2>
                        <p className="mt-4 text-slate-400 text-lg">
                            Get started in minutes and see immediate improvements in your team's productivity.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-0.5 bg-linear-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl flex items-center justify-center text-blue-400 mb-6 relative">
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm border-4 border-slate-900">1</div>
                                <Lock size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Create an account</h3>
                            <p className="text-slate-400 leading-relaxed max-w-[250px]">
                                Sign up for free and set up your first workspace in seconds.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl flex items-center justify-center text-blue-400 mb-6 relative">
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm border-4 border-slate-900">2</div>
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Invite your team</h3>
                            <p className="text-slate-400 leading-relaxed max-w-[250px]">
                                Add your team members and start collaborating right away.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl flex items-center justify-center text-blue-400 mb-6 relative">
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm border-4 border-slate-900">3</div>
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Get things done</h3>
                            <p className="text-slate-400 leading-relaxed max-w-[250px]">
                                Create projects, assign tasks, and track progress effortlessly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 overflow-hidden shadow-2xl shadow-blue-900/20 relative">
                    {/* Abstract BG shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />

                    <div className="relative z-10 px-6 py-20 text-center text-white">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            Start organizing your work today
                        </h2>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                            Join thousands of teams who use TaskMate to stay focused, aligned, and productive.
                        </p>
                        <Link to="/sign-up">
                            <Button
                                className="bg-white text-blue-600 hover:bg-slate-50 h-14 px-10 text-lg font-bold rounded-full shadow-xl transition-transform active:scale-95"
                            >
                                Get TaskMate free
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 cursor-pointer" onClick={scrollToTop}>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                            <Layers size={14} className="text-white" />
                        </div>
                        <span>TaskMate</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a>
                    </div>

                    <span className="text-sm text-slate-400">
                        © {new Date().getFullYear()} TaskMate. All rights reserved.
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;