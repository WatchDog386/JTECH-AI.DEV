// src/components/sections/HowItWorks.tsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
    `}</style>
);

// --- TYPESCRIPT INTERFACE ---
interface Step {
    id: string;
    iconUrl: string;
    title: string;
    desc: string;
}

export default function HowItWorks() {
    const steps: Step[] = [
        {
            id: "01",
            // FIXED: Upload Icon (Cloud with Arrow)
            iconUrl: "https://img.icons8.com/color/96/upload--v1.png",
            title: "Upload Plans",
            desc: "Drag & drop PDF, DWG, or image files to initialize the extraction engine.",
        },
        {
            id: "02",
            // Analysis Icon (Charts/Data)
            iconUrl: "https://img.icons8.com/color/96/bullish.png",
            title: "AI Analysis",
            desc: "Algorithms scan geometry and text to identify materials and dimensions.",
        },
        {
            id: "03",
            // Calculator Icon
            iconUrl: "https://img.icons8.com/color/96/calculator--v1.png",
            title: "Auto-Calc",
            desc: "System computes exact quantities and applies current unit rates.",
        },
        {
            id: "04",
            // FIXED: Export Icon (PDF File)
            iconUrl: "https://img.icons8.com/color/96/export-pdf.png",
            title: "Export Quote",
            desc: "Generate a branded, client-ready PDF or export raw data to Excel.",
        }
    ];

    return (
        <>
        <GlobalStyles />
        <section 
            id="how-it-works" 
            className="bg-white font-inter text-[#1a1a1a] py-24 overflow-hidden border-b border-gray-100"
        >
            <div className="max-w-5xl mx-auto px-6">
                
                {/* --- SECTION HEADING --- */}
                <div className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-[#005F9E] text-[10px] font-bold uppercase tracking-widest mb-4">
                        <ArrowRight className="w-3 h-3" />
                        <span>Process Workflow</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#001021] mb-6 tracking-tight">
                        Automated Estimation Pipeline
                    </h2>
                    <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Transform raw construction plans into precise, client-ready quotes in four automated stages.
                    </p>
                </div>

                {/* --- PROCESS GRID --- */}
                <div className="relative">
                    
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gray-200 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                className="group relative flex flex-col items-center text-center md:items-start md:text-left"
                            >
                                {/* ICON CONTAINER */}
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:border-[#005F9E] group-hover:shadow-md transition-all duration-300 relative z-10">
                                        
                                        {/* ICON IMAGE */}
                                        <div className="w-14 h-14 relative flex items-center justify-center">
                                            <img 
                                                src={step.iconUrl} 
                                                alt={step.title}
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        
                                        {/* Step Number Badge */}
                                        <div className="absolute -top-3 -right-3 bg-[#001021] text-white text-[10px] font-bold px-2 py-1 rounded-[2px] shadow-sm z-20">
                                            STEP {step.id}
                                        </div>
                                    </div>

                                    {/* Arrow Connector (Mobile Only) */}
                                    {i < steps.length - 1 && (
                                        <div className="md:hidden absolute -bottom-10 left-1/2 -translate-x-1/2 text-gray-300">
                                            <ChevronRight className="w-6 h-6 rotate-90" />
                                        </div>
                                    )}
                                </div>

                                {/* TEXT CONTENT */}
                                <div className="px-2 md:px-0">
                                    <h3 className="text-lg font-bold text-[#001021] mb-2 group-hover:text-[#005F9E] transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        {step.desc}
                                    </p>
                                </div>

                                {/* PROGRESS INDICATOR (Desktop Line Active State) */}
                                <motion.div 
                                    className="hidden md:block absolute top-12 left-24 w-[calc(100%+1.5rem)] h-[2px] bg-[#005F9E] origin-left z-0"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 + 0.5, duration: 0.5 }}
                                    style={{ display: i === steps.length - 1 ? 'none' : 'block' }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
        </>
    );
}