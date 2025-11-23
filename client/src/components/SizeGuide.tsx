import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";

const sizeChart = [
  { size: "XS", bust: "32", waist: "26", hips: "34" },
  { size: "S", bust: "34", waist: "28", hips: "36" },
  { size: "M", bust: "36", waist: "30", hips: "38" },
  { size: "L", bust: "38", waist: "32", hips: "40" },
  { size: "XL", bust: "40", waist: "34", hips: "42" },
  { size: "XXL", bust: "42", waist: "36", hips: "44" },
];

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto" data-testid="button-size-guide">
          <Ruler className="h-4 w-4 mr-1" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Size Guide</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Size</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Bust (inches)
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Waist (inches)
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Hips (inches)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="border-b">
                    <td className="py-3 px-4 font-medium">{row.size}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {row.bust}"
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {row.waist}"
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {row.hips}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <h4 className="font-semibold text-foreground text-base">
              How to Measure:
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong>Bust:</strong> Measure around the fullest part of your
                bust, keeping the tape parallel to the floor
              </li>
              <li>
                <strong>Waist:</strong> Measure around your natural waistline,
                keeping the tape comfortably loose
              </li>
              <li>
                <strong>Hips:</strong> Measure around the fullest part of your
                hips, about 8 inches below your waist
              </li>
            </ul>
            <p className="text-xs italic mt-4">
              Note: All measurements are in inches. For the best fit, we
              recommend professional tailoring after purchase.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
