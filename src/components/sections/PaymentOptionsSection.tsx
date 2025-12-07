// src/components/sections/PaymentOptionsSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Lock } from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

const paymentMethods = [
  { id: "paypal", name: "PayPal", image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
  { id: "mastercard", name: "Mastercard", image: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
  { id: "visa", name: "Visa", image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
  { id: "mpesa", name: "M-Pesa", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png" },
];

const PaymentMethod = ({ method, index }) => (
  <motion.div
    // Card container styles
    className="relative group bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center justify-center h-24 cursor-pointer hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
  >
    {/* UPDATED IMAGE STYLES: Removed 'filter grayscale opacity-60' */}
    <img
      src={method.image}
      alt={method.name}
      // Icons now show original colors always. Retained scale on hover.
      className="max-h-8 md:max-h-9 w-auto object-contain transition-all duration-300 group-hover:scale-110"
      loading="lazy"
    />
  </motion.div>
);

export default function PaymentOptionsSection() {
  return (
    <>
      <GlobalStyles />
      <motion.section
        id="payment-options"
        className="py-20 px-6 bg-[#F5F7FA] font-inter text-[#1a1a1a]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-5 shadow-sm">
              <CreditCard className="w-3 h-3 text-[#005F9E]" />
              <span>Secure Checkout</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mb-4 tracking-tight">
              Supported Payment Methods
            </h2>
            
            <p className="max-w-xl mx-auto text-gray-500 text-sm leading-relaxed">
              We offer flexible, secure payment options tailored to your region. Upgrade your workflow instantly.
            </p>
          </div>

          {/* Payment Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {paymentMethods.map((method, index) => (
              <PaymentMethod key={method.id} method={method} index={index} />
            ))}
          </div>

          {/* Security Assurance Footer */}
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-4 opacity-90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-md border border-gray-200 shadow-sm text-xs text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SSL Encrypted</span>
            </div>
            
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-md border border-gray-200 shadow-sm text-xs text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
              <Lock className="w-3.5 h-3.5 text-[#005F9E]" />
              <span>PCI DSS Compliant</span>
            </div>
          </motion.div>

        </div>
      </motion.section>
    </>
  );
}