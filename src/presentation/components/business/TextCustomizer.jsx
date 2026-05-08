"use client";

import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Button } from "@/presentation/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/presentation/lib/utils";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
const templateImages = {
  t1: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
  t2: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  t3: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  t4: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
  t5: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80",
  t6: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
};
export const TextCustomizer = ({
  selectedTemplate,
  customImage,
  promotionText,
  textPosition,
  fontSize,
  textColor,
  backgroundColor,
  showOverlay,
  onTextChange,
  onBackgroundColorChange,
}) => {
  // Support both single text and multiple text items
  const [textItems, setTextItems] = useState(() => {
    if (typeof promotionText === "string") {
      return promotionText
        ? [
            {
              id: "1",
              content: promotionText,
              color: textColor,
              fontSize: fontSize,
              x: textPosition.x,
              y: textPosition.y,
            },
          ]
        : [];
    }
    return promotionText || [];
  });
  const [selectedTextIndex, setSelectedTextIndex] = useState(0);
  const handleAddText = () => {
    const newTextItem = {
      id: Date.now().toString(),
      content: "",
      color: "#ffffff",
      fontSize: "24",
      x: 50,
      y: 50 + ((textItems.length * 10) % 40),
    };
    const newItems = [...textItems, newTextItem];
    setTextItems(newItems);
    setSelectedTextIndex(newItems.length - 1);
    onTextChange(newItems);
  };
  const handleDeleteText = (index) => {
    const newItems = textItems?.filter((_, i) => i !== index);
    setTextItems(newItems);
    setSelectedTextIndex(Math.max(0, index - 1));
    onTextChange(newItems);
  };
  const handleUpdateText = (index, updates) => {
    const newItems = textItems.map((item, i) =>
      i === index ? { ...item, ...updates } : item,
    );
    setTextItems(newItems);
    onTextChange(newItems);
  };
  const handleMoveText = (direction) => {
    if (textItems.length === 0) return;
    const currentItem = textItems[selectedTextIndex];
    const step = 5;
    const newX =
      direction === "left"
        ? Math.max(0, currentItem.x - step)
        : direction === "right"
          ? Math.min(100, currentItem.x + step)
          : currentItem.x;
    const newY =
      direction === "up"
        ? Math.max(0, currentItem.y - step)
        : direction === "down"
          ? Math.min(100, currentItem.y + step)
          : currentItem.y;
    handleUpdateText(selectedTextIndex, { x: newX, y: newY });
  };
  const currentText =
    textItems.length > 0 ? textItems[selectedTextIndex] : null;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 2
        </span>
        <h3 className="text-lg font-semibold text-foreground">
          Customize Text
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Live Preview</h4>
          <PromotionVisualCard
            imageUrl={customImage || templateImages[selectedTemplate || ""]}
            backgroundColor={backgroundColor}
            text={textItems}
            className="aspect-video shadow-xl"
          />
        </div>

        {/* Customization Controls */}
        <div className="space-y-6">
          {/* Multiple Text Items List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Text Elements ({textItems?.length})</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddText}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Text
              </Button>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              {textItems?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No text elements yet. Click "Add Text" to create one.
                </p>
              ) : (
                textItems?.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-2 rounded-lg border-2 cursor-pointer transition-all",
                      selectedTextIndex === index
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                    onClick={() => setSelectedTextIndex(index)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.content || "Empty text"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Position: ({item.x}, {item.y}) • Size: {item.fontSize}
                          px
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteText(index);
                        }}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Edit Selected Text */}
          {currentText && (
            <>
              <div className="space-y-2">
                <Label>Text Content</Label>
                <Textarea
                  value={currentText.content}
                  onChange={(e) =>
                    handleUpdateText(selectedTextIndex, {
                      content: e.target.value,
                    })
                  }
                  placeholder="Enter text"
                  className="w-full p-2 border border-border rounded-lg resize-none text-lg"
                  rows={3} // default height
                />
              </div>

              <div className="space-y-2">
                <Label>Position (Use Arrows)</Label>
                <div className="flex items-center justify-center gap-2">
                  <div className="grid grid-cols-3 gap-1">
                    <div />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveText("up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <div />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveText("left")}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-9 h-9 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                      {currentText.x},{currentText.y}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveText("right")}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveText("down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <div />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size: {currentText.fontSize}px</Label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={currentText.fontSize}
                  onChange={(e) =>
                    handleUpdateText(selectedTextIndex, {
                      fontSize: e.target.value,
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={currentText.color}
                    onChange={(e) =>
                      handleUpdateText(selectedTextIndex, {
                        color: e.target.value,
                      })
                    }
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer p-0.5"
                  />
                  <Input
                    value={currentText.color}
                    onChange={(e) =>
                      handleUpdateText(selectedTextIndex, {
                        color: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Image Darkness</Label>
            <select
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(Number(e.target.value))}
              className="w-full border border-border rounded-lg p-2 bg-background"
            >
              <option value={0}>0%</option>
              <option value={50}>50%</option>
              <option value={70}>70%</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
