// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { CategorizedMaterial } from "./advancedMaterialExtractor";
export interface ConsolidatedMaterial {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  locations: string[];
  category: string;
}
export class MaterialConsolidator {
  static consolidateAllMaterials(
    materials: CategorizedMaterial[]
  ): ConsolidatedMaterial[] {
    const materialMap = new Map<string, ConsolidatedMaterial>();
    materials.forEach((material) => {
      if (material.materialBreakdown) {
        material.materialBreakdown.forEach((breakdown) => {
          const key = `${this.cleanDescription(breakdown.material)}_${
            breakdown.unit
          }_${breakdown.category}`.toLowerCase();
          if (materialMap.has(key)) {
            const existing = materialMap.get(key)!;
            existing.quantity += material.quantity * breakdown.ratio;
            existing.amount +=
              material.rate * breakdown.ratio * material.quantity;
            if (
              material.location &&
              !existing.locations.includes(material.location)
            ) {
              existing.locations.push(material.location);
            }
            if (existing.quantity > 0) {
              existing.rate = existing.amount / existing.quantity;
            }
          } else {
            materialMap.set(key, {
              itemNo: material.itemNo,
              description: this.cleanDescription(breakdown.material),
              unit: breakdown.unit,
              quantity: material.quantity * breakdown.ratio,
              rate: material.rate * breakdown.ratio,
              amount: material.rate * breakdown.ratio * material.quantity,
              locations: material.location ? [material.location] : [],
              category: material.category,
            });
          }
        });
        return;
      }
      const key = `${this.cleanDescription(material.description)}_${
        material.unit
      }_${material.category}`.toLowerCase();
      if (materialMap.has(key)) {
        const existing = materialMap.get(key)!;
        existing.quantity += material.quantity;
        existing.amount += material.amount;
        if (
          material.location &&
          !existing.locations.includes(material.location)
        ) {
          existing.locations.push(material.location);
        }
        if (existing.quantity > 0) {
          existing.rate = existing.amount / existing.quantity;
        }
      } else {
        materialMap.set(key, {
          itemNo: material.itemNo,
          description: this.cleanDescription(material.description),
          unit: material.unit,
          quantity: material.quantity,
          rate: material.rate,
          amount: material.amount,
          locations: material.location ? [material.location] : [],
          category: material.category,
        });
      }
    });
    return Array.from(materialMap.values()).map((material, index) => ({
      ...material,
      itemNo: this.generateItemNumber(index),
      description: this.generateConsolidatedDescription(material),
    }));
  }
  private static cleanDescription(description: string): string {
    return description.trim();
  }
  private static generateConsolidatedDescription(
    material: ConsolidatedMaterial
  ): string {
    return material.description;
  }
  private static generateItemNumber(index: number): string {
    const numbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return numbers[index] || `Z${index - 35}`;
  }
}
