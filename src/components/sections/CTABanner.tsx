// src/components/sections/CTABanner.tsx
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    // Outer Container: unchanged
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 flex justify-center">
      
      {/* Inner Container: width and padding unchanged */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full max-w-7xl bg-[#101D42] py-24 px-6 text-center shadow-sm"
      >
        <div className="flex flex-col items-center justify-center">
          
          {/* Reduced heading size */}
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 tracking-tight">
            Share Your Success with Our Software!
          </h2>
          
          {/* Reduced subtext size */}
          <p className="text-gray-100 text-xs md:text-sm mb-10 leading-relaxed max-w-2xl font-medium opacity-90">
            Showcase your projects created using our solutions and gain increased visibility on our website, social networks, and in industry journals, along with a discount on our software.
          </p>

          {/* Button text size unchanged (already small: text-xs) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-white text-white px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-white hover:text-[#101D42] transition-colors duration-300"
          >
            Share Your Project and Benefit
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}