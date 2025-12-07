// src/components/sections/TestimonialsSection.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const BRAND_BLUE = "#005EB8"; 

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Grouped data (2 per slide)
  const testimonials = [
    {
      id: 1,
      quote: "Over the years, I’ve been impressed by JTech’s willingness to make software improvements based on user feedback. It truly feels like a partnership.",
      name: "Amy Baker",
      title: "Spec Writing Consultant & Architect",
      company: "ab ARCHITECT"
    },
    {
      id: 2,
      quote: "The bidder client was particularly popular with our vendors due to its completeness check and the seamless integration of the GAEB standard.",
      name: "Lars Ohse",
      title: "Head of Procurement",
      company: "LEIPZIG-HALLE AIRPORT"
    },
    {
      id: 3,
      quote: "JTech AI reduced our estimation time by 70% and improved accuracy by 40%. The AI-powered insights have transformed how we approach project budgeting.",
      name: "Michael Johnson",
      title: "Senior Estimator",
      company: "JTech AI Ltd"
    },
    {
      id: 4,
      quote: "We're now able to bid on more projects with confidence. The platform's ability to learn from past data has been a game changer for our margins.",
      name: "Sarah Williams",
      title: "Project Director",
      company: "UrbanBuild Group"
    }
  ];

  const totalPages = Math.ceil(testimonials.length / 2);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentPair = testimonials.slice(activeIndex * 2, activeIndex * 2 + 2);

  return (
    // ✅ FIXED: Added id="testimonials" and scroll-mt-28 so the navbar link works
    <section 
      id="testimonials" 
      className="py-24 bg-[#eef5f9] font-sans scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span style={{ color: BRAND_BLUE }}>What Our</span>{" "}
            <span className="text-gray-900">Clients Say</span>
          </h2>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-6xl mx-auto">
          
          {/* Navigation Arrows (Outside the card) */}
          <button
            onClick={prevSlide}
            className="absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10 hidden md:block"
            aria-label="Previous"
          >
            <ChevronLeft className="w-12 h-12 stroke-[0.5]" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-12 lg:-right-20 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10 hidden md:block"
            aria-label="Next"
          >
            <ChevronRight className="w-12 h-12 stroke-[0.5]" />
          </button>

          {/* Main White Card */}
          <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden min-h-[380px] flex items-stretch">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 w-full"
              >
                {currentPair.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`
                      flex flex-col p-10 md:p-14
                      ${index === 0 ? 'md:border-r border-gray-200' : ''} 
                      ${index === 0 ? 'border-b md:border-b-0 border-gray-100' : ''}
                    `}
                  >
                    {/* Large Quote Icon */}
                    <div className="mb-6">
                      <Quote 
                        className="w-10 h-10 fill-current transform scale-x-[-1]" 
                        style={{ color: BRAND_BLUE }} 
                        strokeWidth={0}
                      />
                    </div>
                    
                    {/* Quote Text */}
                    <p className="text-gray-800 text-[15px] leading-relaxed mb-8 font-normal">
                      {item.quote}
                    </p>

                    {/* Author Info */}
                    <div className="mt-auto">
                      <h4 className="font-bold text-gray-900 text-base">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500 font-light mb-4">
                        {item.title}
                      </p>
                      
                      {/* Company Logo Simulation */}
                      <div className="mt-4 pt-2">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                           <span className="sr-only">Logo for</span>
                           {item.company.includes("AIRPORT") ? (
                             <div className="flex items-center gap-2 text-blue-900">
                               <div className="w-6 h-6 bg-blue-900 rounded-sm"></div> {/* Fake Icon */}
                               <span>{item.company}</span>
                             </div>
                           ) : (
                             <div className="text-gray-800 font-bold text-lg leading-none" style={{ fontFamily: 'serif' }}>
                               {item.company.split(' ')[0]} <span className="font-sans text-xs font-normal text-gray-400 block">{item.company.split(' ').slice(1).join(' ')}</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? "w-8" 
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                style={{ backgroundColor: idx === activeIndex ? BRAND_BLUE : undefined }}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}