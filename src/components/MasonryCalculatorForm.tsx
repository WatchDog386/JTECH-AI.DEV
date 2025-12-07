// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Plus, Trash } from "lucide-react";
import useMasonryCalculator, {
  MasonryQSSettings,
  Room,
  Door,
  Window,
} from "@/hooks/useMasonryCalculator";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { RebarSize } from "@/hooks/useRebarCalculator";
const blockTypes = [
  {
    id: 1,
    displayName: "Standard Block (400\u00D7200\u00D7200mm)",
    name: "Standard Block",
    size: { length: 0.4, height: 0.2, thickness: 0.2 },
  },
  {
    id: 2,
    displayName: "Half Block (400\u00D7200\u00D7100mm)",
    name: "Half Block",
    size: { length: 0.4, height: 0.2, thickness: 0.1 },
  },
  {
    id: 3,
    displayName: "Brick (225\u00D7112.5\u00D775mm)",
    name: "Brick",
    size: { length: 0.225, height: 0.075, thickness: 0.1125 },
  },
  { id: 4, displayName: "Custom", name: "Custom", size: null },
];
const doorTypes = ["Flush", "Panel", "Metal", "Glass"];
const windowGlassTypes = ["Clear", "Tinted", "Frosted"];
const frameTypes = ["Wood", "Steel", "Aluminum"];
const plasterOptions = ["None", "One Side", "Both Sides"];
const standardDoorSizes = [
  "0.9 \u00D7 2.1 m",
  "1.0 \u00D7 2.1 m",
  "1.2 \u00D7 2.4 m",
];
const standardWindowSizes = [
  "1.2 \u00D7 1.2 m",
  "1.5 \u00D7 1.2 m",
  "2.0 \u00D7 1.5 m",
];
interface MasonryCalculatorFormProps {
  quote: any;
  setQuote: (quote: any) => void;
  materialBasePrices: any[];
  userMaterialPrices: any[];
  regionalMultipliers: any[];
  userRegion: string;
  getEffectiveMaterialPrice: (
    materialId: string,
    userRegion: string,
    userOverride: any,
    materialBasePrices: any[],
    regionalMultipliers: any[]
  ) => any;
}
export default function MasonryCalculatorForm({
  quote,
  setQuote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
}: MasonryCalculatorFormProps) {
  const {
    rooms,
    results,
    addRoom,
    removeRoom,
    handleRoomChange,
    handleNestedChange,
    addDoor,
    addWindow,
    removeNested,
    removeEntry,
    qsSettings,
    waterPrice,
  } = useMasonryCalculator({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });

  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuote((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuote]
  );

  const handleMortarRatioChange = (value: string) => {
    setQuote((prev: any) => ({
      ...prev,
      mortarRatio: value,
    }));
  };
  const handleJointThicknessChange = (value: string) => {
    const numValue = parseFloat(value);
    setQuote((prev: any) => ({
      ...prev,
      jointThickness: isNaN(numValue) ? 0.01 : numValue,
    }));
  };
  return (
    <div className="space-y-4">
      <div className="p-4 m-2 bg-blue-50 dark:bg-primary/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-lg text-primary dark:text-blue-100">
          Total Cost: Ksh {results.grossTotalCost?.toLocaleString() || 0}
        </h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Blocks:</span>{" "}
            {results.netBlocks?.toFixed(0) || 0} net →{" "}
            {results.grossBlocks?.toFixed(0) || 0} gross pcs
          </div>
          <div>
            <span className="font-medium">Mortar:</span>{" "}
            {results.netMortar?.toFixed(3) || 0} net →{" "}
            {results.grossMortar?.toFixed(3) || 0} gross m³
          </div>
          <div>
            <span className="font-medium">Plaster:</span>{" "}
            {results.netPlaster?.toFixed(2) || 0} net →{" "}
            {results.grossPlaster?.toFixed(2) || 0} gross m²
          </div>
          <div>
            <span className="font-medium">Wall Area:</span>{" "}
            {results.netArea?.toFixed(2) || 0} m² net
          </div>
          <div>
            <span className="font-medium">Water:</span>{" "}
            {results.netWater?.toFixed(0) || 0} net →{" "}
            {results.grossWater?.toFixed(0) || 0} gross liters
          </div>
          {!qsSettings.clientProvidesWater && results.grossWaterCost > 0 && (
            <div>
              <span className="font-medium">Water Cost:</span> Ksh{" "}
              {results.grossWaterCost?.toLocaleString() || 0}
              <span className="text-xs text-gray-500 ml-1">
                (@ Ksh {waterPrice || 0}/m³)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 m-2">
        <div>
          <Label htmlFor="mortar-ratio">Mortar Ratio (Cement:Sand)</Label>
          <Input
            id="mortar-ratio"
            type="text"
            value={quote.mortarRatio || "1:4"}
            onChange={(e) => handleMortarRatioChange(e.target.value)}
            placeholder="e.g., 1:4"
          />
        </div>

        <div>
          <Label htmlFor="wastage">Wastage</Label>
          <Input
            id="wastage"
            type="number"
            value={qsSettings.wastageMasonry || 5}
            onChange={(e) =>
              onSettingsChange({
                ...qsSettings,
                wastageMasonry: parseFloat(e.target.value),
              })
            }
            placeholder="e.g., 1:4"
          />
        </div>

        <div>
          <Label htmlFor="joint-thickness">Joint Thickness (m)</Label>
          <Input
            id="joint-thickness"
            type="number"
            step="0.001"
            min="0.005"
            max="0.02"
            value={quote.jointThickness || 0.01}
            onChange={(e) => handleJointThicknessChange(e.target.value)}
          />
          <span className="text-xs text-gray-500">Typical: 0.01m (10mm)</span>
        </div>
      </div>

      {qsSettings.clientProvidesWater ? (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            💧 Water will be provided by client -{" "}
            {results.grossWater?.toFixed(0)} liters required
          </p>
        </div>
      ) : results.grossWaterCost > 0 ? (
        <div className="p-3 bg-blue-50 dark:bg-primary/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div className="font-medium">💧 Water Cost Calculation:</div>
            <div>• Water Required: {results.grossWater?.toFixed(0)} liters</div>
            <div>• Water-Cement Ratio: {qsSettings.cementWaterRatio}:1</div>
            <div>
              • Water Price: Ksh {waterPrice?.toLocaleString() || "0"} per m³
            </div>
            <div className="font-semibold mt-1">
              • Total Water Cost: Ksh {results.grossWaterCost?.toLocaleString()}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {rooms.map((room: Room, index: number) => (
          <RoomSection
            key={index}
            room={room}
            index={index}
            onRoomChange={handleRoomChange}
            onNestedChange={handleNestedChange}
            onAddDoor={() => addDoor(index)}
            onAddWindow={() => addWindow(index)}
            onRemoveNested={removeNested}
            onRemoveEntry={removeEntry}
            onRemoveRoom={() => removeRoom(index)}
            roomBreakdown={results.breakdown?.[index]}
          />
        ))}

        <Button
          onClick={addRoom}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>
    </div>
  );
}
interface RoomSectionProps {
  room: Room;
  index: number;
  onRoomChange: (index: number, field: keyof Room, value: any) => void;
  onNestedChange: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number,
    key: string,
    value: any
  ) => void;
  onAddDoor: () => void;
  onAddWindow: () => void;
  onRemoveNested: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number
  ) => void;
  onRemoveEntry: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number
  ) => void;
  onRemoveRoom: () => void;
  roomBreakdown?: any;
}
function RoomSection({
  room,
  index,
  onRoomChange,
  onNestedChange,
  onAddDoor,
  onAddWindow,
  onRemoveNested,
  onRemoveEntry,
  onRemoveRoom,
  roomBreakdown,
}: RoomSectionProps) {
  return (
    <Card className="border  overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-gray-800/20 border-b">
        <div className="flex items-center justify-between">
          <Input
            type="text"
            value={room.room_name || ""}
            onChange={(e) => onRoomChange(index, "room_name", e.target.value)}
            placeholder="Room Name"
            className="text-lg font-bold border-0 pl-3 bg-transparent focus:ring-0 w-auto"
          />
          <Button variant="destructive" size="sm" onClick={onRemoveRoom}>
            <Trash className="w-4 h-4 mr-1" />
            Remove Room
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Length (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={room.length}
              onChange={(e) => onRoomChange(index, "length", e.target.value)}
              placeholder="Length"
            />
          </div>
          <div>
            <Label>Width (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={room.width}
              onChange={(e) => onRoomChange(index, "width", e.target.value)}
              placeholder="Width"
            />
          </div>
          <div>
            <Label>Height (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={room.height}
              onChange={(e) => onRoomChange(index, "height", e.target.value)}
              placeholder="Height"
            />
          </div>
          <div>
            <Label>Block Type</Label>
            <Select
              value={room.blockType}
              onValueChange={(value) => onRoomChange(index, "blockType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Block Type" />
              </SelectTrigger>
              <SelectContent>
                {blockTypes.map((block) => (
                  <SelectItem key={block.id} value={block.name}>
                    {block.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {room.blockType === "Custom" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div>
              <Label>Custom Length (m)</Label>
              <Input
                type="number"
                step="0.01"
                value={room.customBlock.length}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    length: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Custom Height (m)</Label>
              <Input
                type="number"
                step="0.01"
                value={room.customBlock.height}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    height: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Custom Thickness (m)</Label>
              <Input
                type="number"
                step="0.01"
                value={room.customBlock.thickness}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    thickness: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Custom Price (Ksh)</Label>
              <Input
                type="number"
                min="0"
                value={room.customBlock.price}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    price: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}

        <div className="max-w-xs">
          <Label>Plastering</Label>
          <Select
            value={room.plaster}
            onValueChange={(value) => onRoomChange(index, "plaster", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Plaster Option" />
            </SelectTrigger>
            <SelectContent>
              {plasterOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Doors</h4>
            <Button size="sm" variant="outline" onClick={onAddDoor}>
              <Plus className="w-4 h-4 mr-1" />
              Add Door
            </Button>
          </div>
          {room.doors.map((door: Door, doorIndex: number) => (
            <DoorWindowItem
              key={doorIndex}
              type="door"
              item={door}
              index={index}
              itemIndex={doorIndex}
              onNestedChange={onNestedChange}
              onRemove={onRemoveNested}
              standardSizes={standardDoorSizes}
              types={doorTypes}
            />
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Windows</h4>
            <Button size="sm" variant="outline" onClick={onAddWindow}>
              <Plus className="w-4 h-4 mr-1" />
              Add Window
            </Button>
          </div>
          {room.windows.map((window: Window, windowIndex: number) => (
            <DoorWindowItem
              key={windowIndex}
              type="window"
              item={window}
              index={index}
              itemIndex={windowIndex}
              onNestedChange={onNestedChange}
              onRemove={onRemoveEntry}
              standardSizes={standardWindowSizes}
              types={windowGlassTypes}
            />
          ))}
        </div>

        {roomBreakdown && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
            <h4 className="font-semibold text-lg mb-3">Room Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Dimensions:</span> {room.length}m
                × {room.width}m × {room.height}m
              </div>
              <div>
                <span className="font-medium">Wall Area:</span>{" "}
                {roomBreakdown.grossWallArea?.toFixed(2)} m² gross
              </div>
              <div>
                <span className="font-medium">Net Area:</span>{" "}
                {roomBreakdown.netWallArea?.toFixed(2)} m²
              </div>
              <div>
                <span className="font-medium">Blocks:</span>{" "}
                {roomBreakdown.netBlocks} net → {roomBreakdown.grossBlocks}{" "}
                gross
              </div>
              <div>
                <span className="font-medium">Plaster:</span>{" "}
                {roomBreakdown.netPlasterArea?.toFixed(2)} m²
              </div>
              <div>
                <span className="font-medium">Total Cost:</span> Ksh{" "}
                {roomBreakdown.totalCost?.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
interface DoorWindowItemProps {
  type: "door" | "window";
  item: Door | Window;
  index: number;
  itemIndex: number;
  onNestedChange: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number,
    key: string,
    value: any
  ) => void;
  onRemove: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number
  ) => void;
  standardSizes: string[];
  types: string[];
}
function DoorWindowItem({
  type,
  item,
  index,
  itemIndex,
  onNestedChange,
  onRemove,
  standardSizes,
  types,
}: DoorWindowItemProps) {
  const field = type === "door" ? "doors" : "windows";
  return (
    <div className="p-3 border rounded-lg bg-gray-50 dark:glass space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <Select
          value={item.sizeType}
          onValueChange={(value) =>
            onNestedChange(index, field, itemIndex, "sizeType", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Size Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {item.sizeType === "standard" && (
          <Select
            value={item.standardSize}
            onValueChange={(value) =>
              onNestedChange(index, field, itemIndex, "standardSize", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Size" />
            </SelectTrigger>
            <SelectContent>
              {standardSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {item.sizeType === "custom" && (
          <>
            <Input
              placeholder="Height (m)"
              type="number"
              step="0.01"
              value={item.custom.height}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "custom", {
                  ...item.custom,
                  height: e.target.value,
                })
              }
            />
            <Input
              placeholder="Width (m)"
              type="number"
              step="0.01"
              value={item.custom.width}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "custom", {
                  ...item.custom,
                  width: e.target.value,
                })
              }
            />
            <Input
              placeholder="Price (Ksh)"
              type="number"
              min="0"
              value={item.custom.price}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "custom", {
                  ...item.custom,
                  price: e.target.value,
                })
              }
            />
          </>
        )}

        <Select
          value={item.type}
          onValueChange={(value) =>
            onNestedChange(index, field, itemIndex, "type", value)
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={`${type === "door" ? "Door" : "Glass"} Type`}
            />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Qty"
          type="number"
          min="1"
          value={item.count}
          onChange={(e) =>
            onNestedChange(
              index,
              field,
              itemIndex,
              "count",
              parseInt(e.target.value) || 1
            )
          }
        />

        <Input
          placeholder="Price (Ksh)"
          type="number"
          min="0"
          value={item.price}
          onChange={(e) => onNestedChange(index, field, itemIndex, "price", e)}
        />

        <Button
          size="icon"
          variant="destructive"
          onClick={() => onRemove(index, field, itemIndex)}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2  rounded">
        <Select
          value={item.frame.type}
          onValueChange={(value) =>
            onNestedChange(index, field, itemIndex, "frame", {
              ...item.frame,
              type: value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Frame Type" />
          </SelectTrigger>
          <SelectContent>
            {frameTypes.map((frameType) => (
              <SelectItem key={frameType} value={frameType}>
                {frameType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={item.frame?.sizeType || ""}
          onValueChange={(value) =>
            onNestedChange(index, field, itemIndex, "frame", {
              ...item.frame,
              sizeType: value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Frame Size Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* {item.frame?.sizeType === "standard" && (
          <Select
            value={item.frame?.standardSize || ""}
            onValueChange={(value) =>
              onNestedChange(index, field, itemIndex, "frame", {
                ...item.frame,
                standardSize: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Frame Size" />
            </SelectTrigger>
            <SelectContent>
              {standardSizes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )} */}

        {item.frame?.sizeType === "custom" ? (
          <>
            <Input
              placeholder="Height (m)"
              type="number"
              value={item.frame?.custom?.height || ""}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "frame", {
                  ...item.frame,
                  custom: {
                    ...item.frame?.custom,
                    height: e.target.value,
                  },
                })
              }
            />
            <Input
              placeholder="Width (m)"
              type="number"
              value={item.frame?.custom?.width || ""}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "frame", {
                  ...item.frame,
                  custom: {
                    ...item.frame?.custom,
                    width: e.target.value,
                  },
                })
              }
            />
            <Input
              placeholder="Price (Ksh)"
              type="number"
              value={item.frame?.custom?.price || ""}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "frame", {
                  ...item.frame,
                  custom: {
                    ...item.frame.custom,
                    price: e.target.value,
                  },
                })
              }
            />
          </>
        ) : (
          <Input
            placeholder="Frame Price (Ksh)"
            type="number"
            min="0"
            value={item.frame.price}
            onChange={(e) =>
              onNestedChange(index, field, itemIndex, "frame", {
                ...item.frame,
                price: e.target.value,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
