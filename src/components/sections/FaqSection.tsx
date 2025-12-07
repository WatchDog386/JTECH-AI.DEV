// src/components/sections/FaqSection.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Plus, 
  Minus, 
  Target,
  FileCode,
  ShieldCheck,
  HelpCircle,
  Play
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
  `}</style>
);

// --- THEME COLORS ---
const THEME = {
  headerBackground: "#001021",
  brandBlue: "#005F9E",
  bgLight: "#F5F7FA",
  textDark: "#1a1a1a",
};

// --- MOCK DATA ---
const faqCategories = [
  { name: "General", checked: true },
  { name: "Account", checked: false },
  { name: "Upload", checked: false },
  { name: "AI Takeoff", checked: false },
  { name: "Estimation", checked: false },
  { name: "Pricing", checked: false },
  { name: "QS", checked: false },
  { name: "Files", checked: false },
  { name: "Security", checked: false },
  { name: "Billing", checked: false },
];

const mockFaqResults = [
  {
    id: "JT001",
    icon: Target,
    tags: ["AI", "Accuracy"],
    title: "How accurate is J-Tech AI?",
    question: "Precision level of automated measurements?",
    answer: "**99.9% accuracy** on clear, scaled plans. AI cross-validates with structural logic. Review & adjust before finalizing.",
    historyText: "How does J-Tech verify results?",
    historyAnswer: "Dual-validation: geometric checks + material logic rules. You retain final control."
  },
  {
    id: "JT002",
    icon: FileCode,
    tags: ["Upload", "Files"],
    title: "Supported file types?",
    question: "Scanned PDFs or hand-drawn plans?",
    answer: "**PDF, DWG, DXF, JPG, PNG**, including scanned/hand-drawn. Include scale reference for best results.",
    historyText: "Upload tips",
    historyAnswer: "High contrast, properly oriented. Built-in rotation & crop tools available."
  },
  {
    id: "JT003",
    icon: ShieldCheck,
    tags: ["Security", "Data"],
    title: "Is my data secure?",
    question: "Storage & access controls?",
    answer: "**AES-256 encryption** on AWS. GDPR compliant. Only you & authorized team members.",
    historyText: "AI training on my plans?",
    historyAnswer: "Never without explicit consent. Your IP remains yours."
  },
];

// --- COMPONENTS ---

const VideoCardMockup = ({ opacity = 1, scale = 1, offset = 0 }) => (
  <div 
    className="absolute top-1/2 -translate-y-1/2 w-[240px] h-[140px] rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col justify-between shadow-xl"
    style={{ 
      right: `${offset}px`, 
      opacity: opacity, 
      transform: `translateY(-50%) scale(${scale})`,
      zIndex: Math.floor(opacity * 10)
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
    
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center bg-black/20 backdrop-blur-md">
        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
      </div>
    </div>

    <div className="mt-auto p-2.5">
       <div className="flex justify-between items-center mb-1 px-1">
         <div className="h-1 w-1 bg-red-500 rounded-full"></div>
         <div className="h-1 w-1 bg-white/30 rounded-full"></div>
       </div>
       <div className="w-full h-[1.5px] bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 w-[70%]"></div>
       </div>
    </div>
  </div>
);

const CategorySidebar = () => (
  <aside className="w-full max-w-[220px] hidden md:block flex-shrink-0">
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6 sticky top-24">
      <div className="p-3.5 bg-[#F5F7FA] border-b border-gray-200 flex justify-between items-center">
        <span className="text-xs font-bold text-[#001021] uppercase tracking-wider">
          Categories
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="p-3.5 space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar">
        {faqCategories.map((category, index) => (
          <label key={index} className="flex items-center text-sm text-gray-600 hover:text-[#005F9E] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 text-[#005F9E] border-gray-300 rounded focus:ring-[#005F9E] mr-2.5 cursor-pointer"
              defaultChecked={category.checked}
            />
            <span className="group-hover:translate-x-0.5 transition-transform duration-200 text-sm">
              {category.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  </aside>
);

const FaqItem = ({ faq, index }) => {
  const [isOpenMain, setIsOpenMain] = useState(index === 0); 
  const [isOpenSub, setIsOpenSub] = useState(false);
  const IconComponent = faq.icon || HelpCircle;

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="hidden md:flex flex-col items-center pt-1.5 w-10 flex-shrink-0">
         <div className="w-10 h-10 rounded-full bg-[#F5F7FA] flex items-center justify-center border border-gray-200 text-[#005F9E] shadow-sm">
            <IconComponent className="w-5 h-5" />
         </div>
         <div className="h-full w-px bg-gray-200 mt-3 border-l border-dashed border-gray-300"></div>
      </div>

      <div className="flex-grow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow overflow-hidden">
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-gray-400 text-[9px] font-mono border border-gray-100 px-1.5 py-0.5 rounded">
              {faq.id}
            </span>
            {faq.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-[#005F9E]">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-bold text-[#001021] mb-4">
            {faq.title}
          </h3>

          <div className="border border-gray-200 rounded-lg overflow-hidden mb-2">
            <div 
              onClick={() => setIsOpenMain(!isOpenMain)}
              className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${isOpenMain ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${isOpenMain ? 'text-[#005F9E]' : 'text-gray-700'}`}>
                  {faq.question}
                </span>
              </div>
              {isOpenMain ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            </div>
            <AnimatePresence>
              {isOpenMain && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 pt-0 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                     <p dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {faq.historyText && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                onClick={() => setIsOpenSub(!isOpenSub)}
                className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${isOpenSub ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
              >
                 <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isOpenSub ? 'text-[#005F9E]' : 'text-gray-700'}`}>
                      {faq.historyText}
                    </span>
                 </div>
                 {isOpenSub ? <Minus className="w-3.5 h-3.5 text-gray-400" /> : <Plus className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <AnimatePresence>
                {isOpenSub && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 pt-0 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                      <p dangerouslySetInnerHTML={{ __html: faq.historyAnswer?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
const FaqSection = () => {
  return (
    <>
      <GlobalStyles />
      <div id="faq" className="w-full font-inter bg-white min-h-screen">
        
        {/* HERO SECTION */}
        <div
          className="w-full relative overflow-hidden h-[400px]"
          style={{ backgroundColor: THEME.headerBackground }}
        >
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>

          <div className="max-w-[1200px] mx-auto px-5 h-full flex items-center relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-10 items-center">
              
              <div className="w-full max-w-md">
                <motion.h1
                  className="text-3xl lg:text-4xl font-extrabold text-white mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  J-Tech AI FAQs
                </motion.h1>

                <p className="text-gray-300 text-sm leading-relaxed mb-6 pr-6">
                  Instant communication between AI assistant & participants. Reliable internet required.
                </p>

                <div className="flex bg-white rounded-sm overflow-hidden h-12 w-full max-w-md shadow-lg">
                  <div className="flex-1 flex items-center px-3.5">
                    <input
                      type="text"
                      placeholder="Search FAQs"
                      className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent font-medium"
                    />
                  </div>
                  <button
                    className="h-full px-6 font-bold text-white text-xs uppercase tracking-wide transition-colors hover:bg-opacity-90"
                    style={{ backgroundColor: THEME.headerBackground }}
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="hidden lg:block relative h-56 w-full rounded-lg overflow-hidden shadow-xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                >
                  <source src="/demo.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none rounded-lg"></div>
              </div>

            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="max-w-[1100px] mx-auto flex py-12 px-5 gap-6 bg-white">
          <CategorySidebar />
          <div className="w-full md:flex-1"> 
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 mb-6 pb-3 border-b border-gray-100">
              <span className="font-semibold text-[#001021]">
                Showing <span className="text-[#005F9E]">3</span> of 142
              </span>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Sort:</span>
                  <select className="bg-transparent font-semibold text-[#001021] focus:outline-none cursor-pointer text-sm">
                    <option>Relevance</option>
                    <option>Latest</option>
                    <option>Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {mockFaqResults.map((faq, index) => (
                <FaqItem key={faq.id} faq={faq} index={index} />
              ))}
            </div>
            <div className="mt-10 text-center">
               <button className="px-5 py-2.5 border border-gray-200 text-[#001021] font-bold text-xs uppercase tracking-widest rounded hover:border-[#001021] transition-colors">
                  Load More
               </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FaqSection;