import EnhancedQuoteBuilder from "@/components/EnhancedQuoteBuilder";
import { useLocation } from "react-router-dom";
const QuoteBuilder = () => {
    const location = useLocation();
    const quote = location.state?.quote;
    return <EnhancedQuoteBuilder quote={quote}/>;
};
export default QuoteBuilder;
