import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (barcode: string, productData?: any) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScanResult }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Start camera for barcode scanning
  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };

  // Simulate barcode detection (in real app, would use a barcode detection library)
  const simulateBarcodeDetection = () => {
    setIsLoading(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      // Generate a mock barcode for demo purposes
      const mockBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000;
      setIsLoading(false);
      stopCamera();
      
      // Mock product data that would come from a food database API
      const mockProductData = {
        name: "Organic Whole Milk",
        brand: "Happy Farms",
        servingSize: "1 cup (240ml)",
        calories: 150,
        protein: 8,
        carbs: 12,
        fat: 8,
        barcode: mockBarcode.toString()
      };
      
      onScanResult(mockBarcode.toString(), mockProductData);
      onClose();
    }, 2000);
  };

  // Manual barcode entry
  const handleManualEntry = () => {
    const barcode = prompt('Enter barcode manually:');
    if (barcode) {
      stopCamera();
      onScanResult(barcode);
      onClose();
    }
  };

  // Cleanup on component unmount or dialog close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-fantasy-blue max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold flex items-center">
            <Camera className="mr-2" />
            Scan Food Barcode
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isScanning && !error && (
            <Card className="bg-slate-700 border-gray-600">
              <CardContent className="p-6 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-fantasy-blue" />
                <p className="text-light-text mb-4">
                  Scan a product barcode to automatically add nutritional information
                </p>
                <Button 
                  onClick={startCamera}
                  className="w-full bg-fantasy-blue hover:bg-blue-600 mb-2"
                >
                  Start Camera
                </Button>
                <Button 
                  onClick={handleManualEntry}
                  variant="outline"
                  className="w-full"
                >
                  Enter Barcode Manually
                </Button>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-red-900 border-red-600">
              <CardContent className="p-4 text-center">
                <p className="text-red-200 mb-4">{error}</p>
                <Button 
                  onClick={() => setError(null)}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-fantasy-gold w-48 h-32 rounded-lg relative">
                  <div className="absolute inset-0 border-dashed border-fantasy-gold animate-pulse"></div>
                </div>
              </div>
              
              {/* Scanning instructions */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 p-3 rounded-lg">
                <p className="text-light-text text-sm text-center">
                  Position the barcode within the frame
                </p>
              </div>
              
              {/* Control buttons */}
              <div className="absolute top-4 right-4 space-x-2">
                <Button
                  onClick={simulateBarcodeDetection}
                  disabled={isLoading}
                  size="sm"
                  className="bg-fantasy-green hover:bg-green-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Detect"
                  )}
                </Button>
                <Button
                  onClick={stopCamera}
                  size="sm"
                  variant="outline"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}