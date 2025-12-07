// src/components/sections/FeaturesSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, Users, GraduationCap, ArrowRight
} from "lucide-react";

// --- 1. GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

// --- 2. COMPACT GRAPHICS (RESIZED) ---

const GlobeGraphic = () => (
  <div className="relative w-40 h-40">
    {/* Main Blue Circle */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#005F9E] to-[#003865] shadow-xl"></div>
    {/* Grid Lines */}
    <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeWidth="1"/>
      <path d="M50 1 L50 99 M1 50 L99 50" stroke="white" strokeWidth="1" fill="none"/>
      <ellipse cx="50" cy="50" rx="49" ry="20" fill="none" stroke="white" strokeWidth="1" className="rotate-45 origin-center"/>
    </svg>
    {/* Highlight Dot */}
    <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
    {/* Small Floating Label */}
    <div className="absolute top-1/2 -left-2 bg-white text-[8px] font-bold text-[#003865] px-2 py-0.5 rounded shadow border border-gray-200">
      Zone: RV
    </div>
  </div>
);

const MonitorGraphic = () => (
  <div className="relative w-48">
    {/* Monitor Frame */}
    <div className="bg-[#001021] p-1.5 rounded shadow-xl border-b-2 border-[#001c36]">
      {/* Screen */}
      <div className="bg-[#005F9E] relative overflow-hidden rounded aspect-[16/10]">
         {/* UI Header */}
         <div className="h-3 bg-[#003865] w-full flex items-center px-1.5 space-x-1">
            <div className="w-1 h-1 rounded-full bg-red-400"></div>
            <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
         </div>
         {/* Blue Content Mockup */}
         <div className="p-2 grid grid-cols-2 gap-1 opacity-60">
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-8 bg-white/10 rounded border border-white/20"></div>
            <div className="col-span-2 h-4 bg-white/10 rounded"></div>
         </div>
      </div>
    </div>
    {/* Stand */}
    <div className="w-10 h-4 bg-[#001021] mx-auto"></div>
    <div className="w-16 h-1 bg-[#001021]/20 mx-auto rounded-full blur-[1px]"></div>
  </div>
);

// ✅ UPDATED: Community Container with IMAGE
const CommunityGraphic = () => (
  <div className="w-full h-full bg-[#001021] relative flex flex-col items-center justify-center overflow-hidden">
    
    {/* ✅ CHANGED FROM VIDEO TO IMG TAG so the JPG works */}
    <img 
      className="absolute inset-0 w-full h-full object-cover opacity-90"
      src="https://wpmedia.roomsketcher.com/content/uploads/2022/01/05101816/RoomSketcher-Custom-2D-Floor-Plan-Branding.jpg" 
      alt="Community Background"
    />

    {/* Dark gradient overlay to ensure text/buttons are readable over the image */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#001021]/90 via-[#001021]/40 to-transparent pointer-events-none" />

    {/* Pill Button */}
    <div className="relative z-10 mb-8 scale-90">
      <div className="px-6 py-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-md shadow-2xl flex items-center gap-2">
        <span className="text-white font-inter font-bold text-lg drop-shadow-md">
          J-Tech <span className="text-[#4dabf7]">Community</span>
        </span>
      </div>
    </div>

    {/* Small Icons */}
    <div className="flex gap-6 text-white/70 relative z-10 drop-shadow-md">
      <MessageSquare className="w-5 h-5" />
      <Users className="w-6 h-6 text-white -mt-1" />
      <GraduationCap className="w-5 h-5" />
    </div>
  </div>
);

// --- 3. MAIN COMPONENT ---

export default function FeaturesSection() {
  return (
    <>
      <GlobalStyles />
      <section 
        id="features"
        className="w-full py-20 bg-white font-inter text-[#1a1a1a] overflow-hidden scroll-mt-32"
      >
        <div className="max-w-[1100px] mx-auto px-6">
           
          {/* SECTION 1: COMMUNITY (Dark Box Left, Text Right) */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-32">
            
            {/* Visual Box - NOW CONTAINS IMAGE */}
            <motion.div 
              className="w-full md:w-1/2 h-[320px] rounded-xl overflow-hidden shadow-lg border border-gray-100"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <CommunityGraphic />
            </motion.div>

            {/* Text Content */}
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-extrabold text-[#001021] mb-5 leading-tight">
                Get Support Through the <br/> J-Tech Community
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                The J-Tech Community connects you with support engineers, fellow students, and experienced users — all ready to help you tackle technical challenges.
              </p>
              <button className="bg-[#001021] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest rounded hover:bg-[#005F9E] transition-colors shadow-md">
                Join the Community
              </button>
            </motion.div>
          </div>


          {/* SECTION 2: TOOLS GRID */}
          <div className="w-full">
            <motion.h2 
              className="text-center text-2xl font-bold text-gray-800 mb-12"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Online Tools to Streamline Your Workflow
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1: GLOBAL TAKEOFF */}
              <motion.div 
                className="bg-[#F5F7FA] rounded-lg relative overflow-hidden min-h-[300px] group border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-8 h-full flex flex-col justify-between relative z-20">
                  {/* Text Container */}
                  <div className="max-w-[60%]">
                    <h3 className="text-xl font-bold text-[#001021] mb-3">
                      Global Takeoff Tool
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Easily determine material quantities and regional pricing. Our interactive zone maps deliver precise data in seconds.
                    </p>
                  </div>
                  
                  <button className="w-fit bg-transparent border border-[#001021] text-[#001021] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#001021] hover:text-white transition-all">
                    Discover Tool
                  </button>
                </div>
                
                {/* Graphic */}
                <div className="absolute bottom-6 right-6 transform group-hover:scale-105 transition-transform duration-500 z-10">
                   <GlobeGraphic />
                </div>
              </motion.div>


              {/* CARD 2: MATERIAL DATABASE */}
              <motion.div 
                className="bg-[#F5F7FA] rounded-lg relative overflow-hidden min-h-[300px] group border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-8 h-full flex flex-col justify-between relative z-20">
                  {/* Text Container */}
                  <div className="max-w-[60%]">
                    <h3 className="text-xl font-bold text-[#001021] mb-3">
                      Material Database
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Access online tables to easily find cross-section properties for steel and timber sections.
                    </p>
                  </div>
                  
                  <button className="w-fit bg-transparent border border-[#001021] text-[#001021] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#001021] hover:text-white transition-all">
                    Get Material Info
                  </button>
                </div>

                {/* Graphic */}
                <div className="absolute bottom-8 right-6 transform group-hover:-translate-x-1 transition-transform duration-500 z-10">
                   <MonitorGraphic />
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}