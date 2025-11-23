import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FilterProps {
  filters: {
    category?: string;
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
    fabrics: string[];
  };
  onFilterChange: (filters: any) => void;
}

const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const allColors = ["Red", "Blue", "Green", "Pink", "Black", "White", "Gold", "Silver"];
const allFabrics = ["Silk", "Cotton", "Chiffon", "Georgette", "Velvet", "Brocade"];

export function ProductFilter({ filters, onFilterChange }: FilterProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["price", "size", "color", "fabric"])
  );

  const toggleSection = (section: string) => {
    const newSections = new Set(openSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setOpenSections(newSections);
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: value as [number, number] });
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  const handleFabricToggle = (fabric: string) => {
    const newFabrics = filters.fabrics.includes(fabric)
      ? filters.fabrics.filter((f) => f !== fabric)
      : [...filters.fabrics, fabric];
    onFilterChange({ ...filters, fabrics: newFabrics });
  };

  const clearFilters = () => {
    onFilterChange({
      category: filters.category,
      priceRange: [0, 50000],
      sizes: [],
      colors: [],
      fabrics: [],
    });
  };

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.fabrics.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 50000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            data-testid="button-clear-filters"
          >
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <Collapsible open={openSections.has("price")}>
        <CollapsibleTrigger
          className="flex items-center justify-between w-full py-2 hover-elevate active-elevate-2 rounded-md px-2"
          onClick={() => toggleSection("price")}
        >
          <Label className="font-semibold cursor-pointer">Price Range</Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.has("price") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              max={50000}
              step={500}
              className="w-full"
              data-testid="slider-price-range"
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>₹{filters.priceRange[0].toLocaleString("en-IN")}</span>
              <span>₹{filters.priceRange[1].toLocaleString("en-IN")}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Size */}
      <Collapsible open={openSections.has("size")}>
        <CollapsibleTrigger
          className="flex items-center justify-between w-full py-2 hover-elevate active-elevate-2 rounded-md px-2"
          onClick={() => toggleSection("size")}
        >
          <Label className="font-semibold cursor-pointer">Size</Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.has("size") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-3 gap-2">
            {allSizes.map((size) => (
              <Button
                key={size}
                variant={filters.sizes.includes(size) ? "default" : "outline"}
                size="sm"
                onClick={() => handleSizeToggle(size)}
                data-testid={`button-filter-size-${size.toLowerCase()}`}
              >
                {size}
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Color */}
      <Collapsible open={openSections.has("color")}>
        <CollapsibleTrigger
          className="flex items-center justify-between w-full py-2 hover-elevate active-elevate-2 rounded-md px-2"
          onClick={() => toggleSection("color")}
        >
          <Label className="font-semibold cursor-pointer">Color</Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.has("color") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-2">
          {allColors.map((color) => (
            <div key={color} className="flex items-center gap-2">
              <Checkbox
                id={`color-${color}`}
                checked={filters.colors.includes(color)}
                onCheckedChange={() => handleColorToggle(color)}
                data-testid={`checkbox-filter-color-${color.toLowerCase()}`}
              />
              <Label
                htmlFor={`color-${color}`}
                className="cursor-pointer flex-1"
              >
                {color}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Fabric */}
      <Collapsible open={openSections.has("fabric")}>
        <CollapsibleTrigger
          className="flex items-center justify-between w-full py-2 hover-elevate active-elevate-2 rounded-md px-2"
          onClick={() => toggleSection("fabric")}
        >
          <Label className="font-semibold cursor-pointer">Fabric</Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.has("fabric") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-2">
          {allFabrics.map((fabric) => (
            <div key={fabric} className="flex items-center gap-2">
              <Checkbox
                id={`fabric-${fabric}`}
                checked={filters.fabrics.includes(fabric)}
                onCheckedChange={() => handleFabricToggle(fabric)}
                data-testid={`checkbox-filter-fabric-${fabric.toLowerCase()}`}
              />
              <Label
                htmlFor={`fabric-${fabric}`}
                className="cursor-pointer flex-1"
              >
                {fabric}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
