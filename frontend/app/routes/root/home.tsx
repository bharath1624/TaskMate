import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
    CheckSquare,
    Calendar,
    Users,
    BarChart3,
    Bell,
    Link2,
    Paperclip,
    Send,
    Lock,
    Layers,
} from "lucide-react";
const Homepage = () => {
    const scrollToFeatures = () => {
        const section = document.getElementById("features");
        section?.scrollIntoView({ behavior: "smooth" });
    };
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="bg-white text-gray-900">
            {/* ================= NAVBAR ================= */}
            <header className="sticky top-0 z-50 bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 text-xl font-semibold text-blue-600">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <Layers size={18} />
                        </div>
                        <span>TaskMate</span>
                    </div>
                    {/* Actions */}
                    <nav className="flex items-center gap-4">
                        <Link to="/sign-in">
                            <Button
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                                Log in
                            </Button>
                        </Link>

                        <Link to="/sign-up">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Get started
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ================= HERO ================= */}
            <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
            >
                {/* Left */}
                <div>
                    <span className="inline-block text-sm font-medium text-blue-600 mb-4">
                        Simple • Fast • Reliable
                    </span>

                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                        Manage work better with
                        <br />
                        <span className="text-blue-600">TaskMate</span>
                    </h1>

                    <p className="mt-6 text-lg text-gray-600 max-w-lg">
                        A clean and powerful task management platform that helps teams
                        organize work, stay focused, and deliver faster.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <Link to="/sign-up">
                            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-6 text-base">
                                Get Started free
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            onClick={scrollToFeatures}
                            className="px-6 py-6 text-base border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                            View features
                        </Button>
                    </div>
                </div>

                {/* Right */}
                <div className="relative">
                    <img
                        src="/dashboard-preview.png"
                        alt="TaskMate dashboard"
                        className="rounded-2xl border shadow-xl"
                    />
                </div>
            </section>

            {/* ================= USE CASES ================= */}
            <section className="border-t bg-blue-50">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-semibold text-blue-600">
                            Built for every kind of team
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Whether you work solo or with a team, TaskMate adapts to your workflow.
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Individual */}
                        <div className="bg-white rounded-2xl p-6 border hover:shadow-md transition">
                            <h3 className="text-lg font-semibold text-blue-600">
                                Individuals
                            </h3>
                            <p className="mt-3 text-gray-600 text-sm">
                                Manage personal tasks, stay organized, and keep track of daily work.
                            </p>
                        </div>

                        {/* Teams */}
                        <div className="bg-white rounded-2xl p-6 border hover:shadow-md transition">
                            <h3 className="text-lg font-semibold text-blue-600">
                                Teams
                            </h3>
                            <p className="mt-3 text-gray-600 text-sm">
                                Collaborate on tasks, assign responsibilities, and track progress.
                            </p>
                        </div>

                        {/* Startups */}
                        <div className="bg-white rounded-2xl p-6 border hover:shadow-md transition">
                            <h3 className="text-lg font-semibold text-blue-600">
                                Startups
                            </h3>
                            <p className="mt-3 text-gray-600 text-sm">
                                Organize projects, move fast, and scale workflows as you grow.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section
                id="features"
                className="max-w-7xl mx-auto px-6 py-28 scroll-mt-24"
            >
                {/* Heading */}
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-semibold">
                        Designed to work with your workflow
                    </h2>
                    <p className="mt-4 text-gray-600">
                        Everything you need to manage tasks, collaborate, and stay organized.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: CheckSquare,
                            title: "Task Management",
                            desc: "Create, assign, and track tasks across projects.",
                        },
                        {
                            icon: Calendar,
                            title: "Smart Scheduling",
                            desc: "Plan deadlines and milestones with an integrated calendar.",
                        },
                        {
                            icon: Users,
                            title: "Team Collaboration",
                            desc: "Share updates, discuss about tasks, and keep everyone aligned.",
                        },
                        {
                            icon: BarChart3,
                            title: "Progress Tracking",
                            desc: "Visualize progress and productivity with simple insights.",
                        },
                        {
                            icon: Bell,
                            title: "Notifications",
                            desc: "Stay updated with real-time alerts.",
                        },
                        {
                            icon: Paperclip,
                            title: "Attachments",
                            desc: "Attach documents and files directly to tasks for better context.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl bg-gray-50 p-6 hover:bg-white hover:shadow-md transition border"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                                <item.icon size={20} />
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                {item.title}
                            </h3>

                            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= HOW IT WORKS ================= */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                {/* Heading */}
                <div className="text-center max-w-2xl mx-auto">
                    <span className="text-xl font-medium text-blue-600">
                        How it works
                    </span>

                    <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                        Simple process, powerful results
                    </h2>

                    <p className="mt-4 text-gray-600">
                        Get started in minutes and see improved team productivity.
                    </p>
                </div>

                {/* Steps */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Step 1 */}
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                            <Lock size={22} />
                        </div>

                        <h3 className="mt-6 text-lg font-semibold">
                            Create an account
                        </h3>

                        <p className="mt-3 text-sm text-gray-600 max-w-xs mx-auto">
                            Sign up for free and set up your first workspace in seconds.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                            <Users size={22} />
                        </div>

                        <h3 className="mt-6 text-lg font-semibold">
                            Invite your team
                        </h3>

                        <p className="mt-3 text-sm text-gray-600 max-w-xs mx-auto">
                            Add your team members and start collaborating right away.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                            <Send size={22} />
                        </div>

                        <h3 className="mt-6 text-lg font-semibold">
                            Get things done
                        </h3>

                        <p className="mt-3 text-sm text-gray-600 max-w-xs mx-auto">
                            Create projects, assign tasks, and track progress.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                    <h2 className="text-3xl md:text-4xl font-semibold">
                        Start organizing your work today
                    </h2>

                    <p className="mt-4 text-blue-100 max-w-xl mx-auto">
                        Join teams who use TaskMate to stay focused and productive.
                    </p>

                    <div className="mt-8">
                        <Button
                            onClick={scrollToTop}
                            className="bg-white text-blue-600 hover:bg-blue-100 px-8 py-6 text-base"
                        >
                            Get TaskMate free
                        </Button>

                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="border-t">
                <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-sm text-gray-500">
                        © {new Date().getFullYear()} TaskMate
                    </span>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Contact</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;
