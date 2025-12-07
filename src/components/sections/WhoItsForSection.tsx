// src/components/sections/JTechAISection.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Target,       // General Contractors
    FileText,     // Quantity Surveyors
    HardHat,      // Subcontractors
    Home,         // Home Builders
    ChevronRight,
    Brain,        // AI Estimators
    BarChart3,    // Construction Managers
    ArrowRight
} from "lucide-react";

export default function JTechAISection() {
    const navigate = useNavigate();

    const professionals = [
        {
            icon: <Target className="text-white h-7 w-7" />,
            title: "General Contractors",
            description: "Manage bids and verify estimates in one place—no spreadsheets, no guesswork.",
            cta: "FOR GCs",
            gradient: "from-[#1e40af] to-[#3b82f6]",
            shadow: "shadow-blue-500/30",
            borderColor: "#1e40af",
            imageUrl: "https://contractortrainingcenter.com/cdn/shop/articles/general_contractors_making_plans_for_new_project_smaller_520x500_db69fb37-61b4-4727-827a-b631920e58ba.jpg?v=1736785491"
        },
        {
            icon: <FileText className="text-white h-7 w-7" />,
            title: "Quantity Surveyors",
            description: "Automate takeoffs. Focus on high-value analysis—not manual counts.",
            cta: "FOR QS",
            gradient: "from-[#7e22ce] to-[#d946ef]",
            shadow: "shadow-purple-500/30",
            borderColor: "#7e22ce",
            imageUrl: "https://www.shutterstock.com/image-photo/black-engineer-wearing-safety-jacket-600nw-2195109333.jpg"
        },
        {
            icon: <HardHat className="text-white h-7 w-7" />,
            title: "Subcontractors",
            description: "Bid faster, win more. Cut takeoff time by 70%.",
            cta: "FOR TRADES",
            gradient: "from-[#0284c7] to-[#38bdf8]",
            shadow: "shadow-sky-500/30",
            borderColor: "#0284c7",
            imageUrl: "https://media.istockphoto.com/id/1249847960/photo/female-african-american-construction-worker.jpg?s=612x612&w=0&k=20&c=aURtbARF23o9JAbPo8g1_aYoC7sPMQQ5_1PASo0Qjbw="
        },
        {
            icon: <Brain className="text-white h-7 w-7" />,
            title: "AI Estimators",
            description: "Catch costly errors before they happen. AI double-checks every number.",
            cta: "FOR ESTIMATORS",
            gradient: "from-[#475569] to-[#94a3b8]",
            shadow: "shadow-slate-500/30",
            borderColor: "#475569",
            imageUrl: "https://media.licdn.com/dms/image/v2/D5612AQEgIIu1uMeXjw/article-cover_image-shrink_720_1280/B56ZfPIJJ6G0AI-/0/1751526709444?e=2147483647&v=beta&t=-vJDyuhNgfNtOTfhjzMw9Qc5c4VuuG6S9_r6Ye8bXWw"
        },
        {
            icon: <BarChart3 className="text-white h-7 w-7" />,
            title: "Construction Managers",
            description: "Track costs in real time. Approve change orders with confidence.",
            cta: "FOR MANAGERS",
            gradient: "from-[#0d9488] to-[#2dd4bf]",
            shadow: "shadow-teal-500/30",
            borderColor: "#0d9488",
            imageUrl: "https://lh6.googleusercontent.com/proxy/lnwMTl77W7My0yMPlJmq7E1ihUQxgHX5rb0NVE1v1Olbx3dzgCxL61HKUl9NsWuhxIuk8PQiUvzgWPkhqB5Kt2c_fh6bDfNdN9ROKEh8MY0J2xA-7C_61cIOhMYQtoRtEXlmoP_fpXWB_MPts3WLQHZidg"
        },
        {
            icon: <Home className="text-white h-7 w-7" />,
            title: "Home Builders",
            description: "Turn plans into precise material lists—and trustworthy client quotes.",
            cta: "FOR BUILDERS",
            gradient: "from-[#ea580c] to-[#fb923c]",
            shadow: "shadow-orange-500/30",
            borderColor: "#ea580c",
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzbySqaSyzlTf8xu19--yNQ9Y_Ov9HDgP4MQ&s"
        },
    ];

    return (
        <div
            id="who-its-for"
            className="font-sans text-[#333333] bg-[#F0F7FA] antialiased"
        >

            {/* BASICS TO MASTERY */}
            <section
                className="bg-[#F0F7FA] py-24 border-b border-[#E1EBF2]"
            >
                <div className="max-w-[1240px] mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="w-full lg:w-[45%]">
                            <div className="bg-[#0a1e42] relative w-full aspect-[4/3] flex items-end justify-center overflow-hidden shadow-lg">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#000] to-transparent opacity-20" />
                                <div className="absolute top-0 right-0 w-[80%] h-full bg-[#112d5c] -skew-x-12 translate-x-10" />

                                <video
                                    className="relative z-10 h-[90%] w-full object-cover object-top"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                >
                                    <source src="/Demo1.mp4" type="video/mp4" />
                                </video>

                                <div className="absolute top-[20%] left-[15%] right-[15%] bottom-[20%] border-l-4 border-r-4 border-[#00d084] rounded-lg z-20 pointer-events-none opacity-80"></div>
                                <div className="absolute top-[20%] left-[15%] w-8 h-4 border-t-4 border-[#00d084] rounded-tl-lg z-20"></div>
                                <div className="absolute top-[20%] right-[15%] w-8 h-4 border-t-4 border-[#00d084] rounded-tr-lg z-20"></div>
                                <div className="absolute bottom-[20%] left-[15%] w-8 h-4 border-b-4 border-[#00d084] rounded-bl-lg z-20"></div>
                                <div className="absolute bottom-[20%] right-[15%] w-8 h-4 border-b-4 border-[#00d084] rounded-br-lg z-20"></div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[55%]">
                            <h2 className="text-[30px] font-bold text-[#333] mb-6">
                                From Basics to Mastery
                            </h2>
                            <p className="text-[15px] text-[#555] leading-relaxed mb-4">
                                Learn AI estimation your way—start simple, scale fast.
                            </p>
                            <p className="text-[15px] text-[#555] leading-relaxed">
                                Guided resources grow with you, from first bid to full automation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CARD GRID */}
            <section
                className="bg-[#F0F7FA] py-24"
            >
                <div className="max-w-[1240px] mx-auto px-6">
                    <div className="mb-12">
                        <h2 className="text-[30px] font-bold text-[#333] mb-4">
                            Built for Your Role
                        </h2>
                        <p className="text-[15px] text-[#666] max-w-2xl leading-relaxed">
                            AI workflows tailored to what you do—so you ship estimates, not spreadsheets.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {professionals.map((pro, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="bg-white p-0 flex flex-col items-start h-full border border-gray-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex w-full px-6 pt-6 pb-2 items-center relative">
                                    <div
                                        className="absolute top-0 left-0 w-12 h-12 flex items-center justify-center"
                                        style={{ backgroundColor: pro.borderColor }}
                                    >
                                        {pro.icon}
                                    </div>
                                    <h3 className="text-[15px] font-bold text-[#1a1a1a] uppercase tracking-wider pl-10">
                                        {pro.title}
                                    </h3>
                                </div>
                                <p className="text-[13px] text-[#666] leading-[1.6] mb-4 flex-grow px-6">
                                    {pro.description}
                                </p>
                                {pro.imageUrl && (
                                    <div className="w-full mb-0 mt-2 px-6">
                                        <img
                                            src={pro.imageUrl}
                                            alt={`Illustration for ${pro.title}`}
                                            className="w-full h-36 object-cover object-center border border-gray-200"
                                        />
                                    </div>
                                )}
                                <div className="w-full p-4 mt-4 bg-gray-50 border-t border-gray-200 flex items-center justify-start">
                                    <button
                                        onClick={() => navigate("/auth?mode=signup")}
                                        className="text-[12px] font-bold uppercase tracking-[1.2px] transition-colors text-left text-[#1a73e8] hover:text-[#005bb5]"
                                    >
                                        {pro.cta} <ChevronRight className="inline-block w-4 h-4 ml-1 relative bottom-[1px]" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SUPPORT SECTION - UPDATED LAYOUT */}
            <section className="bg-[#001226] py-16 text-white">
                <div className="max-w-[1240px] mx-auto px-6">
                    {/* Added lg:flex-row-reverse to swap sides, and items-center for vertical centering */}
                    <div className="flex flex-col lg:flex-row-reverse gap-10 lg:gap-16 items-center">
                        
                        {/* Text container - now on the right on large screens */}
                        <div className="lg:w-1/2 flex flex-col justify-center">
                            <h2 className="text-[30px] font-bold mb-6">
                                Support That Works
                            </h2>
                            <p className="text-[15px] text-gray-300 leading-relaxed mb-6">
                                Hit a snag? Our team helps you solve real problems—fast.
                            </p>
                            <p className="text-[15px] text-gray-300 leading-relaxed mb-10">
                                Onboarding, estimation, automation—we’ve got your back.
                            </p>
                            <div>
                                <button className="border border-white text-white hover:bg-white hover:text-[#001226] text-[11px] font-extrabold uppercase tracking-[1.5px] px-8 py-3.5 rounded-[3px] transition-all">
                                    Get Support
                                </button>
                            </div>
                        </div>

                        {/* Image container - now on the left on large screens */}
                        <div className="lg:w-1/2 relative">
                            <img
                                src="https://www.ituonline.com/wp-content/uploads/2024/01/IT-Technical-Support-Skills.jpg"
                                alt="Support"
                                // Removed shadow-2xl for a flatter look like the reference
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}