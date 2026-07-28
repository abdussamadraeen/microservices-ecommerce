"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorPickerProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

const popularColors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#00FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FF8800" },
  { name: "Purple", hex: "#8000FF" },
  { name: "Pink", hex: "#FF69B4" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Gray", hex: "#808080" },
  { name: "Navy", hex: "#000080" },
  { name: "Teal", hex: "#008080" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Maroon", hex: "#800000" },
];

const paletteColors = [
  "#FF0000", "#FF4500", "#FF8C00", "#FFD700", "#FFFF00", "#ADFF2F",
  "#00FF00", "#00FA9A", "#00FFFF", "#1E90FF", "#0000FF", "#8A2BE2",
  "#9400D3", "#FF00FF", "#FF1493", "#FF69B4", "#FFC0CB", "#FFA07A",
  "#FA8072", "#E9967A", "#F08080", "#CD5C5C", "#DC143C", "#B22222",
  "#8B0000", "#FFA500", "#FF6347", "#FF4500", "#FF8C00", "#FFA07A",
  "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", "#BDB76B", "#FFFF00",
  "#9ACD32", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#00FA9A",
  "#00FF7F", "#3CB371", "#2E8B57", "#008000", "#006400", "#66CDAA",
  "#00CED1", "#48D1CC", "#40E0D0", "#00FFFF", "#00BFFF", "#1E90FF",
  "#6495ED", "#4169E1", "#0000FF", "#0000CD", "#00008B", "#000080",
  "#191970", "#8B008B", "#9370DB", "#8A2BE2", "#9400D3", "#9932CC",
  "#BA55D3", "#FF00FF", "#C71585", "#DB7093", "#FFC0CB", "#FFB6C1",
  "#FF69B4", "#FF1493", "#C0C0C0", "#D3D3D3", "#A9A9A9", "#808080",
  "#696969", "#000000", "#FFFFFF", "#F5F5F5", "#DCDCDC", "#D3D3D3",
];

export const ColorPicker = ({ selectedColors, onChange }: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState("#000000");

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onChange(selectedColors.filter((c) => c !== color));
    } else {
      onChange([...selectedColors, color]);
    }
  };

  const addCustomColor = () => {
    if (customColor && !selectedColors.includes(customColor)) {
      onChange([...selectedColors, customColor]);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="palette">Palette</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {popularColors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => toggleColor(color.hex)}
                className="relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all hover:scale-105"
                style={{
                  borderColor: selectedColors.includes(color.hex)
                    ? color.hex
                    : "transparent",
                  backgroundColor: selectedColors.includes(color.hex)
                    ? `${color.hex}10`
                    : "transparent",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 relative"
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColors.includes(color.hex) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check
                        className="w-5 h-5"
                        style={{
                          color:
                            color.hex === "#FFFFFF" || color.hex === "#FFD700"
                              ? "#000000"
                              : "#FFFFFF",
                        }}
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-center dark:text-gray-300">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="palette" className="space-y-4">
          <div className="grid grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2">
            {paletteColors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                type="button"
                onClick={() => toggleColor(color)}
                className="relative w-8 h-8 rounded border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: selectedColors.includes(color)
                    ? "#000"
                    : "transparent",
                }}
                title={color}
              >
                {selectedColors.includes(color) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className="w-4 h-4"
                      style={{
                        color:
                          color === "#FFFFFF" ||
                          color === "#FFFF00" ||
                          color === "#FFD700"
                            ? "#000000"
                            : "#FFFFFF",
                      }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="color-input">Color Code (Hex)</Label>
                <Input
                  id="color-input"
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-picker">Pick Color</Label>
                <input
                  id="color-picker"
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-10 rounded border-2 cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={addCustomColor}
                className="px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Preview:
              </p>
              <div
                className="w-full h-16 rounded border-2 border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: customColor }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Colors Display */}
      {selectedColors.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Colors ({selectedColors.length})</Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-gray-50 dark:bg-slate-900 dark:border-slate-800">
            {selectedColors.map((color) => (
              <div
                key={color}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 bg-white dark:bg-slate-950"
                style={{ borderColor: color }}
              >
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium font-mono">{color}</span>
                <button
                  type="button"
                  onClick={() => toggleColor(color)}
                  className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
