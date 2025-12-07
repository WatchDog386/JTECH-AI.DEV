// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Save } from "lucide-react";

export default function renderMaterialEditor(
  material,
  tempValues,
  setTempValues,
  handleSave,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice
) {
  if (!material.type) return null;

  const isArray = (value) => Array.isArray(value);
  const isObject = (value) =>
    value && typeof value === "object" && !isArray(value);

  // Helper function to get user override and effective price
  const getUserOverrideAndPrice = () => {
    const userOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion
    );
    const effectivePrice = getEffectiveMaterialPrice(
      material.id,
      userRegion,
      userOverride,
      userMaterialPrices,
      materialBasePrices,
      regionalMultipliers
    );
    return { userOverride, effectivePrice };
  };

  // Generic collapsible wrapper
  const renderCollapsible = (content, title = material.name) => (
    <Collapsible>
      <CollapsibleTrigger className="flex animate-fade-in items-center justify-between w-full p-2 border rounded-lg bg-primary/20">
        <span className="text-sm text-gray-500 dark:text-gray-300">
          {title}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 animate-fade-in mt-2">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );

  // 1. Rebar - Array of objects with price_kes_per_kg
  if (material.name === "Rebar" && isArray(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((bar, idx) => {
          const overridePrice =
            tempValues[`rebar-${idx}`] !== undefined
              ? tempValues[`rebar-${idx}`]
              : userOverride?.type?.[idx]?.price_kes_per_kg ??
                bar.price_kes_per_kg;
          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">{bar.size}</span>
                <span className="text-xs text-gray-500">
                  Ø{bar.diameter_mm}mm, {bar.unit_weight_kg_per_m} kg/m
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type="number"
                  value={overridePrice}
                  onChange={(e) =>
                    setTempValues({
                      ...tempValues,
                      [`rebar-${idx}`]: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Button
                  className="text-white"
                  size="sm"
                  onClick={() =>
                    handleSave(
                      material.name,
                      "material",
                      material.id,
                      material.name,
                      tempValues[`rebar-${idx}`] ?? bar.price_kes_per_kg,
                      idx
                    )
                  }
                >
                  <Save className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 2. Bricks/Blocks - Array of objects with price_kes and dimensions
  if (
    (material.name === "Bricks" || material.name.includes("Block")) &&
    isArray(material.type)
  ) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((block, idx) => {
          const overridePrice =
            tempValues[`block-${idx}`] !== undefined
              ? tempValues[`block-${idx}`]
              : userOverride?.type?.[idx]?.price_kes ?? block.price_kes;
          return (
            <div key={idx} className="p-2 border rounded-lg">
              <span className="font-medium">{block.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                {block.dimensions_m?.length}×{block.dimensions_m?.height}×
                {block.dimensions_m?.thickness}m
              </span>

              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type="number"
                  value={overridePrice}
                  onChange={(e) =>
                    setTempValues({
                      ...tempValues,
                      [`block-${idx}`]: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Button
                  className="text-white"
                  size="sm"
                  onClick={() =>
                    handleSave(
                      material.name,
                      "material",
                      material.id,
                      material.name,
                      tempValues[`block-${idx}`] ?? block.price_kes,
                      idx
                    )
                  }
                >
                  <Save className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 3. Doors, Windows, Frames - Array of objects with price_kes object for sizes
  if (
    (material.name === "Doors" ||
      material.name === "Windows" ||
      material.name === "Door Frames" ||
      material.name === "Window Frames") &&
    isArray(material.type)
  ) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2 rounded-lg">
        {material.type.map((item, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{item.type}</span>

            {Object.entries(item.price_kes).map(([size, price]) => {
              const key = `${material.name.toLowerCase()}-${idx}-${size}`;
              const overridePrice =
                tempValues[key] !== undefined ? tempValues[key] : price;
              return (
                <div
                  key={size}
                  className="flex items-center justify-between mt-1"
                >
                  <p className="min-w-[80px] items-center">{size}</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
                    />
                    <Button
                      className="text-white"
                      size="sm"
                      onClick={() =>
                        handleSave(
                          material.name,
                          "material",
                          material.id,
                          material.name,
                          tempValues[key] ?? price,
                          `${idx}-${size}`
                        )
                      }
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 4. Materials with type as object containing materials (Paint, Flooring, Ceiling, etc.)
  if (
    isObject(material.type) &&
    material.type.materials &&
    isObject(material.type.materials)
  ) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(material.type.materials).map(
          ([materialName, price], idx) => {
            const key = `${material.name.toLowerCase()}-${materialName}`;
            const overridePrice =
              tempValues[key] !== undefined ? tempValues[key] : price;

            return (
              <div key={idx} className="p-2 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{materialName}</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
                    />
                    <Button
                      className="text-white"
                      size="sm"
                      onClick={() =>
                        handleSave(
                          material.name,
                          "material",
                          material.id,
                          material.name,
                          tempValues[key] ?? price,
                          materialName
                        )
                      }
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    );

    return renderCollapsible(content);
  }

  // 5. BRC Mesh - Array with price_kes_per_sqm and technical specs
  if (material.name === "BRC Mesh" && isArray(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((mesh, idx) => {
          const key = `brc-mesh-${idx}`;
          const overridePrice =
            tempValues[key] !== undefined
              ? tempValues[key]
              : userOverride?.type?.[idx]?.price_kes_per_sqm ??
                mesh.price_kes_per_sqm;

          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">{mesh.grade}</span>
                <span className="text-xs text-gray-500">
                  Spacing: {mesh.spacing}mm, Weight: {mesh.weightPerSqm}kg/m²
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Wire: Ø{mesh.wireDiameter}mm
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type="number"
                  value={overridePrice}
                  onChange={(e) =>
                    setTempValues({
                      ...tempValues,
                      [key]: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Button
                  className="text-white"
                  size="sm"
                  onClick={() =>
                    handleSave(
                      material.name,
                      "material",
                      material.id,
                      material.name,
                      tempValues[key] ?? mesh.price_kes_per_sqm,
                      idx
                    )
                  }
                >
                  <Save className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 6. Pipes - Array with price_kes_per_meter and diameters
  if (material.name === "Pipes" && isArray(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((pipeType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{pipeType.type}</span>

            {Object.entries(pipeType.price_kes_per_meter).map(
              ([diameter, price]) => {
                const key = `pipe-${idx}-${diameter}`;
                const overridePrice =
                  tempValues[key] !== undefined ? tempValues[key] : price;

                return (
                  <div
                    key={diameter}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{diameter}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
                      />
                      <Button
                        className="text-white"
                        size="sm"
                        onClick={() =>
                          handleSave(
                            material.name,
                            "material",
                            material.id,
                            material.name,
                            tempValues[key] ?? price,
                            `${idx}-${diameter}`
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 7. Cable - Array with price_kes_per_meter and sizes
  if (material.name === "Cable" && isArray(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((cableType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{cableType.type}</span>

            {Object.entries(cableType.price_kes_per_meter).map(
              ([size, price]) => {
                const key = `cable-${idx}-${size}`;
                const overridePrice =
                  tempValues[key] !== undefined ? tempValues[key] : price;

                return (
                  <div
                    key={size}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{size}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
                      />
                      <Button
                        className="text-white"
                        size="sm"
                        onClick={() =>
                          handleSave(
                            material.name,
                            "material",
                            material.id,
                            material.name,
                            tempValues[key] ?? price,
                            `${idx}-${size}`
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 8. Lighting - Array with price_kes_per_unit and wattage/control types
  if (material.name === "Lighting" && isArray(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((lightType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{lightType.type}</span>

            {Object.entries(lightType.price_kes_per_unit).map(
              ([spec, price]) => {
                const key = `lighting-${idx}-${spec}`;
                const overridePrice =
                  tempValues[key] !== undefined ? tempValues[key] : price;

                return (
                  <div
                    key={spec}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{spec}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
                      />
                      <Button
                        className="text-white"
                        size="sm"
                        onClick={() =>
                          handleSave(
                            material.name,
                            "material",
                            material.id,
                            material.name,
                            tempValues[key] ?? price,
                            `${idx}-${spec}`
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 9. Outlets - Array with price_kes_per_unit and ratings
  if (material.name === "Outlets" && isArray(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((outletType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{outletType.type}</span>

            {Object.entries(outletType.price_kes_per_unit).map(
              ([rating, price]) => {
                const key = `outlet-${idx}-${rating}`;
                const overridePrice =
                  tempValues[key] !== undefined ? tempValues[key] : price;

                return (
                  <div
                    key={rating}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{rating}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
                      />
                      <Button
                        className="text-white"
                        size="sm"
                        onClick={() =>
                          handleSave(
                            material.name,
                            "material",
                            material.id,
                            material.name,
                            tempValues[key] ?? price,
                            `${idx}-${rating}`
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 10. DPC, Sealant - Array with price_kes object for sizes
  if (
    (material.name === "DPC" || material.name === "Sealant") &&
    isArray(material.type)
  ) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((item, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{item.type}</span>

            {Object.entries(item.price_kes).map(([size, price]) => {
              const key = `${material.name.toLowerCase()}-${idx}-${size}`;
              const overridePrice =
                tempValues[key] !== undefined ? tempValues[key] : price;

              return (
                <div
                  key={size}
                  className="flex items-center justify-between mt-1"
                >
                  <span className="text-sm">{size}</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
                    />
                    <Button
                      className="text-white"
                      size="sm"
                      onClick={() =>
                        handleSave(
                          material.name,
                          "material",
                          material.id,
                          material.name,
                          tempValues[key] ?? price,
                          `${idx}-${size}`
                        )
                      }
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 11. Fixtures - Array with price_kes_per_item and qualities
  if (material.name === "Fixtures" && isArray(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((fixture, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{fixture.fixture}</span>

            {Object.entries(fixture.price_kes_per_item).map(
              ([quality, price]) => {
                const key = `fixture-${idx}-${quality}`;
                const overridePrice =
                  tempValues[key] !== undefined ? tempValues[key] : price;

                return (
                  <div
                    key={quality}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm capitalize">{quality}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
                      />
                      <Button
                        className="text-white"
                        size="sm"
                        onClick={() =>
                          handleSave(
                            material.name,
                            "material",
                            material.id,
                            material.name,
                            tempValues[key] ?? price,
                            `${idx}-${quality}`
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 12. Timber, Roof-Covering, Insulation, Underlayment - Array with direct price property
  if (
    (material.name === "Timber" ||
      material.name === "Roof-Covering" ||
      material.name === "Insulation" ||
      material.name === "UnderLayment") &&
    isArray(material.type)
  ) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((item, idx) => {
          const key = `${material.name.toLowerCase()}-${idx}`;
          const overridePrice =
            tempValues[key] !== undefined
              ? tempValues[key]
              : userOverride?.type?.[idx]?.price ?? item.price;

          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">{item.name || item.type}</span>
                <span className="text-xs text-gray-500">
                  {item.size && `Size: ${item.size}`}
                  {item.thickness && `, Thickness: ${item.thickness}`}
                  {item.rValue && `, R-Value: ${item.rValue}`}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type="number"
                  value={overridePrice}
                  onChange={(e) =>
                    setTempValues({
                      ...tempValues,
                      [key]: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Button
                  className="text-white"
                  size="sm"
                  onClick={() =>
                    handleSave(
                      material.name,
                      "material",
                      material.id,
                      material.name,
                      tempValues[key] ?? item.price,
                      idx
                    )
                  }
                >
                  <Save className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 13. Accessories - Object with nested arrays
  if (material.name === "Accesories" && isObject(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2">
        {Object.entries(material.type).map(([category, items]) => {
          if (!isArray(items)) return null;

          return (
            <div key={category} className="p-2 border rounded-lg">
              <h4 className="font-medium capitalize mb-2">
                {category.replace(/([A-Z])/g, " $1")}
              </h4>
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const key = `accessory-${category}-${idx}`;
                  const overridePrice =
                    tempValues[key] !== undefined
                      ? tempValues[key]
                      : userOverride?.type?.[category]?.[idx]?.price ??
                        item.price;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {item.type || item.size || item.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {item.material && `(${item.material})`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={overridePrice}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              [key]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-32"
                        />
                        <Button
                          className="text-white"
                          size="sm"
                          onClick={() =>
                            handleSave(
                              material.name,
                              "material",
                              material.id,
                              material.name,
                              tempValues[key] ?? item.price,
                              `${category}-${idx}`
                            )
                          }
                        >
                          <Save className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 14. Fasteners - Object with nested arrays
  if (material.name === "Fasteners" && isObject(material.type)) {
    const { userOverride } = getUserOverrideAndPrice();

    const content = (
      <div className="space-y-2">
        {Object.entries(material.type).map(([category, items]) => {
          if (!isArray(items)) return null;

          return (
            <div key={category} className="p-2 border rounded-lg">
              <h4 className="font-medium capitalize mb-2">{category}</h4>
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const key = `fastener-${category}-${idx}`;
                  const overridePrice =
                    tempValues[key] !== undefined
                      ? tempValues[key]
                      : userOverride?.type?.[category]?.[idx]?.price ??
                        item.price;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {item.type} ({item.size})
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={overridePrice}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              [key]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-32"
                        />
                        <Button
                          className="text-white"
                          size="sm"
                          onClick={() =>
                            handleSave(
                              material.name,
                              "material",
                              material.id,
                              material.name,
                              tempValues[key] ?? item.price,
                              `${category}-${idx}`
                            )
                          }
                        >
                          <Save className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // Default case - show a simple editor for materials with type but no specific handler
  const content = (
    <div className="p-4 text-center text-gray-500">
      <p>Editor for {material.name} is not implemented yet</p>
      <p className="text-xs mt-2">
        Type: {isArray(material.type) ? "Array" : "Object"}
      </p>
      {isArray(material.type) && (
        <p className="text-xs">Items: {material.type.length}</p>
      )}
    </div>
  );

  return renderCollapsible(content);
}
