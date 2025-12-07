// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator as CalculatorIcon, X } from "lucide-react";
interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}
const Calculator = ({ isOpen, onClose }: CalculatorProps) => {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const calculateVolume = () => {
    const vol = parseFloat(length) * parseFloat(width) * parseFloat(height);
    setResult(vol);
  };
  const reset = () => {
    setLength("");
    setWidth("");
    setHeight("");
    setResult(null);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            Volume Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white" htmlFor="length">
                Length (m)
              </Label>
              <Input
                id="length"
                type="number"
                min="0"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-white" htmlFor="width">
                Width (m)
              </Label>
              <Input
                id="width"
                type="number"
                min="0"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-white" htmlFor="height">
                Height (m)
              </Label>
              <Input
                id="height"
                type="number"
                min="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {result !== null && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg animate-fade-in">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Volume: {result.toFixed(2)} m³
              </h3>
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={calculateVolume} className="flex-1 text-white">
              Calculate
            </Button>
            <Button onClick={reset} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default Calculator;
