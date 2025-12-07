// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import * as XLSX from "xlsx";
export const generateQuoteExcel = async ({
  quote,
  isClientExport = false,
}: {
  quote: any;
  isClientExport?: boolean;
}) => {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const summaryData = [
    ["Project Title", quote.title],
    ["Client Name", quote.client_name],
    ["Location", quote.location],
    ["House Type", quote.house_type],
    ["Date Generated", new Date().toLocaleDateString()],
    ["Total Amount", quote.total_amount],
  ];
  if (!isClientExport) {
    summaryData.push(
      ["Overhead", quote.overhead_amount],
      ["Contingency", quote.contingency_amount],
      ["Permit Cost", quote.permit_cost],
      ["Profit Margin", quote.profit_amount]
    );
  }
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summaryData),
    "Summary"
  );
  if (quote.boq_sections?.length) {
    const boqData = [
      [
        "Section",
        "Item No.",
        "Description",
        "Unit",
        "Quantity",
        "Rate",
        "Amount",
        "Source",
      ],
    ];
    quote.boq_sections.forEach((section) => {
      boqData.push([section.title, "", "", "", "", "", "", ""]);
      section.items.forEach((item) => {
        if (item.isHeader) {
          boqData.push(["", "", item.description, "", "", "", "", ""]);
        } else {
          boqData.push([
            "",
            item.itemNo,
            item.description,
            item.unit,
            item.quantity,
            item.rate,
            item.amount,
            item.sourceLocation || "",
          ]);
        }
      });
      const sectionTotal = section.items
        .filter((item) => !item.isHeader)
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      boqData.push(["", "", "Section Total", "", "", "", sectionTotal, ""]);
      boqData.push([]);
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(boqData),
      "Bill of Quantities"
    );
  }
  if (quote.materials?.length && !isClientExport) {
    const materialsData = [
      [
        "Material",
        "Category",
        "Unit",
        "Total Quantity",
        "Unit Price",
        "Total Price",
        "Source Locations",
      ],
      ...quote.materials.map((m) => [
        m.name,
        m.category || "",
        m.unit || "",
        m.quantity || "",
        m.unit_price || "",
        m.total_price || "",
        m.sourceLocations?.join(", ") || "",
      ]),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(materialsData),
      "Materials Schedule"
    );
  }
  if (quote.equipment?.length && !isClientExport) {
    const equipmentData = [
      ["Equipment", "Days", "Daily Rate", "Total"],
      ...quote.equipment.map((e) => [
        e.name,
        e.days,
        e.daily_rate,
        e.total_cost,
      ]),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(equipmentData),
      "Equipment"
    );
  }
  if (quote.addons?.length && !isClientExport) {
    const servicesData = [
      ["Service", "Price"],
      ...quote.addons.map((s) => [s.name, s.price]),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(servicesData),
      "Services"
    );
  }
  if (quote.distance_km && !isClientExport) {
    const transportData = [
      ["Distance (km)", "Transport Cost"],
      [quote.distance_km, quote.transport_costs],
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(transportData),
      "Transport"
    );
  }
  XLSX.writeFile(
    wb,
    `${isClientExport ? "Client" : "Contractor"}_Quote_${quote.title.replace(
      /\s+/g,
      "_"
    )}.xlsx`
  );
};
