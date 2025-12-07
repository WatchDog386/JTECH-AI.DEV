import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavbarSection from "@/components/sections/NavbarSection";

const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#5BB539",
  HERO_ACCENT_BLUE: "#38bdf8",
  FONT_FAMILY: "'Arial', 'Helvetica Neue', sans-serif",
  TEXT_STROKE_COLOR: "rgba(255, 255, 255, 0.9)",
  TEXT_STROKE_WIDTH: "0.5px",
};

const openDemoVideo = () => {
  window.open("/Demo1.mp4", "_blank");
};

const Hero = ({ scrollTo, demoOpen, setDemoOpen }: any) => {
  const navigate = useNavigate();

  return (
    <div 
      className="antialiased text-white selection:bg-green-500 selection:text-white bg-[#000B29]"
      style={{ fontFamily: THEME.FONT_FAMILY }}
    >
      <NavbarSection scrollTo={scrollTo} setDemoOpen={setDemoOpen} />

      {/* Reduced height from min-h-[800px] to min-h-[600px] */}
      <section className="relative w-full min-h-[50vh] lg:min-h-[600px] overflow-hidden flex items-center pt-16 lg:pt-0">
        
        {/* ====================================================================================
             UPDATED BACKGROUND SECTION - Clearer background
           ==================================================================================== */}
        <div className="absolute inset-0 z-0 w-full h-full">
            {/* 1. The Image */}
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
              alt="Background"
              className="w-full h-full object-cover"
            />

            {/* 2. Gradient Overlay: Left (Solid Navy) -> Right (Transparent) */}
            {/* This creates the smooth fade effect where the text sits */}
            <div 
              className="absolute inset-0 z-10"
              style={{
                background: `linear-gradient(to right, 
                  ${THEME.NAVY_BG} 0%, 
                  ${THEME.NAVY_BG} 50%, 
                  rgba(0, 11, 41, 0.8) 65%, 
                  transparent 100%)`
              }}
            />
            
            {/* 3. Mobile Only: Darker overlay to ensure text is readable on small screens */}
            <div className="absolute inset-0 bg-[#000B29]/60 sm:hidden z-10" />
        </div>

        {/* Content - Reduced max width and adjusted padding */}
        <div className="relative z-20 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full">
          <div className="w-full lg:w-[55%] pt-2 text-center lg:text-left">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="mb-3">
                    <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] mb-1.5 uppercase opacity-90" style={{ color: THEME.HERO_BTN_GREEN }}>
                        The Solution
                    </p>

                    <h1 className="leading-[0.95] mb-2">
                      <span className="block font-black text-xl sm:text-2xl lg:text-3xl xl:text-4xl uppercase tracking-tighter text-white mb-0.5">
                          GENERATE ACCURATE QUOTES
                      </span>
                      {/* Changed: "IN MINUTES" now has same style/color as above */}
                      <span className="block font-black text-xl sm:text-2xl lg:text-3xl xl:text-4xl uppercase tracking-tighter text-white">
                          IN MINUTES.
                      </span>
                    </h1>
                    
                    <p className="text-gray-200 text-[10px] sm:text-[11px] leading-relaxed max-w-[280px] mx-auto lg:mx-0 font-normal tracking-wide opacity-90">
                      Generate and edit accurate quotes. Connect workflows, validate costs, 
                      and generate automated takeoffs with 99.9% precision.
                    </p>

                    <div className="w-8 sm:w-10 h-[1.5px] bg-white/20 mt-3 rounded-full mx-auto lg:mx-0"></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-4 justify-center lg:justify-start">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openDemoVideo}
                        className="text-white text-[9px] sm:text-[10px] font-bold uppercase px-3 py-1.5 rounded-[2px] shadow transition-all tracking-wider hover:brightness-110 flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: THEME.HERO_BTN_GREEN }}
                    >
                        Watch Demo <PlayCircle className="w-2.5 h-2.5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/auth?mode=signup")}
                        className="bg-white text-[#000B29] text-[9px] sm:text-[10px] font-bold uppercase px-3 py-1.5 rounded-[2px] shadow transition-all tracking-wider hover:bg-gray-100 flex items-center justify-center gap-1.5"
                    >
                        <PlayCircle className="w-2.5 h-2.5 text-[#0696D7]" /> Get Started
                    </motion.button>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 text-[10px] font-medium justify-center lg:justify-start">
                    <button 
                        onClick={openDemoVideo}
                        className="flex items-center gap-1 text-white/80 hover:text-white transition-colors justify-center sm:justify-start"
                    >
                        <PlayCircle className="w-3 h-3 text-[#38bdf8]" /> Watch Demo
                    </button>
                    <div className="hidden sm:block h-2 w-px bg-white/20"></div>
                    <p className="text-white/50 text-[8px] uppercase tracking-wide">
                        Trusted by 500+ Top Firms
                    </p>
                </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;