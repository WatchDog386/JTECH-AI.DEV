import { motion } from "framer-motion";
import { 
  Loader2, 
  AlertCircle, 
  Check,
  ChevronRight,
  Home,
  Zap,
  Briefcase,
  Building2
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

const HERO_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop";

export default function PricingSection({ tiers, tiersLoading, tiersError, navigate }) {
  
  // --- THEME CONFIGURATION ---
  const getTheme = (index) => {
    const themes = [
      { 
        // 1. STARTER (Blue)
        subtitle: "STARTER",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        accentColor: "text-blue-600", 
        btnStyles: "bg-blue-600 hover:bg-blue-700 text-white"
      },
      { 
        // 2. PROFESSIONAL (Cyan)
        subtitle: "PROFESSIONAL",
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        accentColor: "text-cyan-600",
        btnStyles: "bg-cyan-600 hover:bg-cyan-700 text-white"
      },
      { 
        // 3. ENTERPRISE (Purple)
        subtitle: "ENTERPRISE",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        accentColor: "text-purple-600",
        btnStyles: "bg-purple-600 hover:bg-purple-700 text-white"
      }
    ];
    return themes[index % themes.length];
  };

  if (tiersLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-gray-50 font-inter">
        <Loader2 className="w-6 h-6 animate-spin mb-3 text-blue-600" /> 
        <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Loading options...</span>
      </div>
    );
  }

  if (tiersError) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-gray-50 text-red-600 font-inter">
        <AlertCircle className="w-6 h-6 mb-3" /> 
        <span className="font-bold text-sm">Unable to load pricing plans.</span>
      </div>
    );
  }

  return (
    <>
    <GlobalStyles />
    <div 
      id="pricing"
      className="font-inter text-[#1a1a1a] bg-gray-50 antialiased min-h-screen"
    >
      
      {/* =========================================
          1. HERO SECTION
      ========================================= */}
      <section className="relative h-[380px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={HERO_IMAGE} 
            alt="Support and Service" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001021]/95 to-[#003865]/90"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-center">
          <div className="absolute top-8 left-6 lg:left-0 flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
            <Home className="w-3 h-3" />
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Pricing Plans</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mt-4"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-base text-gray-300 font-light max-w-lg leading-relaxed">
              Select the perfect plan for your needs. Upgrade or cancel at any time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========================================
          2. CARDS SECTION (Compact & Sharp)
      ========================================= */}
      <section className="relative z-20 -mt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {tiers?.map((plan, index) => {
              const theme = getTheme(index);
              const IconComponent = index === 0 ? Zap : index === 1 ? Briefcase : Building2;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  // CHANGED: rounded-lg (sharper), p-6 (smaller padding), border (definition)
                  className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  
                  {/* --- HEADER: Compact Icon + Title --- */}
                  <div className="flex items-center gap-3 mb-5">
                    {/* Smaller Icon Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        {plan.image ? (
                           <img src={plan.image} alt={plan.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                           <IconComponent className={`w-5 h-5 ${theme.iconColor}`} />
                        )}
                    </div>
                    <div>
                        {/* Smaller Title */}
                        <h3 className="text-gray-900 text-lg font-bold leading-tight">
                            {plan.name}
                        </h3>
                        {/* Sharper Subtitle */}
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${theme.accentColor}`}>
                            {theme.subtitle}
                        </div>
                    </div>
                  </div>

                  {/* --- PRICE: Compacted --- */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-semibold text-gray-400">KES</span>
                      {/* Smaller Price Text */}
                      <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{plan.price}</span>
                      <span className="text-xs text-gray-400 font-medium">/year</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                      {plan.description || "Essential tools for your workflow."}
                    </p>
                  </div>

                  {/* --- FEATURES LIST: Smaller Text --- */}
                  <ul className="space-y-2.5 mb-6 flex-grow">
                    {plan.features?.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme.accentColor}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* --- BUTTON: Slimmer & Sharper --- */}
                  <button
                    onClick={() => navigate(`/auth?mode=signup&plan=${plan.id}`)}
                    className={`
                      w-full py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-md
                      transition-all duration-300 shadow-sm hover:shadow-md
                      ${theme.btnStyles}
                    `}
                  >
                    Select Plan
                  </button>

                </motion.div>
              );
            })}

          </div>
        </div>
      </section>

    </div>
    </>
  );
}