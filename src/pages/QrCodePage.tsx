import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const QrCodePage = () => {
  const { user } = useAuth();
  const upiId = `${user?.email?.split("@")[0] || "user"}@flexcred`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied!");
  };

  // Generate a simple QR-like visual using SVG
  const generateQrPattern = (text: string) => {
    const cells: { x: number; y: number }[] = [];
    const size = 21;
    // Create a deterministic pattern from the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Fixed position patterns (corners)
        const isCorner =
          (row < 7 && col < 7) ||
          (row < 7 && col >= size - 7) ||
          (row >= size - 7 && col < 7);
        const isCornerBorder =
          isCorner &&
          (row === 0 || row === 6 || col === 0 || col === 6 ||
            row === size - 7 || row === size - 1 || col === size - 7 || col === size - 1 ||
            (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
            (row >= 2 && row <= 4 && col >= size - 5 && col <= size - 3) ||
            (row >= size - 5 && row <= size - 3 && col >= 2 && col <= 4));

        if (isCornerBorder) {
          cells.push({ x: col, y: row });
        } else if (!isCorner) {
          // Pseudo-random fill
          const seed = (hash * (row + 1) * (col + 1)) & 0xffff;
          if (seed % 3 !== 0) {
            cells.push({ x: col, y: row });
          }
        }
      }
    }
    return { cells, size };
  };

  const { cells, size } = generateQrPattern(upiId);
  const cellSize = 10;
  const svgSize = size * cellSize + 20;

  return (
    <AppLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">My QR Code</h1>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-lg flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Scan to Pay
            </CardTitle>
            <CardDescription>Share this QR code to receive payments</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* QR Code */}
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <rect width={svgSize} height={svgSize} fill="white" />
                {cells.map((cell, i) => (
                  <rect
                    key={i}
                    x={cell.x * cellSize + 10}
                    y={cell.y * cellSize + 10}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    rx={1}
                    fill="hsl(250, 75%, 55%)"
                  />
                ))}
              </svg>
            </div>

            {/* UPI ID */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1.5 font-mono">
                {upiId}
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Scan this QR code using any UPI app to send money to your FlexCred wallet.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default QrCodePage;
