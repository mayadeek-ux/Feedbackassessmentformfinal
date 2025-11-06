import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { QrCode, Copy, Share2, Globe, Wifi, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function QRCodeGenerator() {
  const [customUrl, setCustomUrl] = useState('');
  const [detectedUrl, setDetectedUrl] = useState('');
  const [networkInfo, setNetworkInfo] = useState<{ isLocal: boolean; suggestions: string[] }>({ 
    isLocal: false, 
    suggestions: [] 
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setDetectedUrl(url);
      
      // Check if URL is localhost/127.0.0.1
      const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0');
      
      let suggestions: string[] = [];
      if (isLocal) {
        // Try to get local network IP suggestions
        const hostname = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;
        const pathname = window.location.pathname;
        
        // Common local network patterns
        suggestions = [
          `${protocol}//192.168.1.XXX${port ? ':' + port : ''}${pathname}`,
          `${protocol}//192.168.0.XXX${port ? ':' + port : ''}${pathname}`,
          `${protocol}//10.0.0.XXX${port ? ':' + port : ''}${pathname}`
        ];
      }
      
      setNetworkInfo({ isLocal, suggestions });
    }
  }, []);

  const urlToUse = customUrl || detectedUrl;

  const generateQRCode = (text: string, size: number = 256) => {
    // Generate QR code with better styling
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=10&color=991b1b&bgcolor=fef2f2`;
    return qrApiUrl;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Event Assessment System',
          text: 'Access the assessment system',
          url: urlToUse,
        });
      } catch (err) {
        copyToClipboard(urlToUse);
      }
    } else {
      copyToClipboard(urlToUse);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-red-600" />
            Share Assessment System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Network Status */}
          {networkInfo.isLocal && (
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-amber-800 font-medium">Local Development Detected</h4>
                  <p className="text-sm text-amber-700">
                    Your current URL ({detectedUrl}) won't work on other devices. 
                    For external access, you'll need to use your computer's network IP address.
                  </p>
                  {networkInfo.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-amber-700 font-medium">Try these formats:</p>
                      {networkInfo.suggestions.map((suggestion, index) => (
                        <Badge key={index} variant="outline" className="mr-2 text-xs">
                          {suggestion}
                        </Badge>
                      ))}
                      <p className="text-xs text-amber-600 mt-2">
                        Replace "XXX" with your actual IP address. Find it in your network settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* URL Configuration */}
          <div className="space-y-3">
            <Label htmlFor="detectedUrl">Current URL</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <code className="text-sm flex-1">{detectedUrl}</code>
              <Button 
                onClick={() => copyToClipboard(detectedUrl)} 
                variant="ghost" 
                size="sm"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="customUrl">Override URL (for production/network sharing)</Label>
            <Input
              id="customUrl"
              placeholder="https://your-domain.com or http://192.168.1.100:3000"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL that assessors should access. Leave empty to use current URL.
            </p>
          </div>

          {/* QR Code Display */}
          <div className="text-center space-y-4">
            <div className="inline-block p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
              <img 
                src={generateQRCode(urlToUse)} 
                alt="QR Code for Assessment System"
                className="w-64 h-64 rounded-lg"
              />
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-md">
                <p className="text-sm font-medium mb-1">QR Code URL:</p>
                <code className="text-xs break-all">{urlToUse}</code>
              </div>
              
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => copyToClipboard(urlToUse)} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button onClick={shareUrl} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  onClick={() => window.open(generateQRCode(urlToUse), '_blank')} 
                  variant="outline" 
                  size="sm"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
            <h4 className="font-medium text-red-900 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Instructions for Assessors
            </h4>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Scan the QR code with your phone's camera app</li>
              <li>The assessment form will open in your browser</li>
              <li>Make sure you're on the same network (WiFi)</li>
              <li>All assessments sync automatically across devices</li>
              <li>You can bookmark the page for easy access</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <details className="space-y-2">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Troubleshooting & Network Setup
            </summary>
            <div className="space-y-3 text-sm text-muted-foreground pl-4">
              <div>
                <h5 className="font-medium text-foreground">For Local Development:</h5>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Find your computer's IP: Settings → Network → WiFi Properties</li>
                  <li>Replace localhost with your IP (e.g., 192.168.1.100:3000)</li>
                  <li>Make sure your firewall allows the port</li>
                  <li>All devices must be on the same WiFi network</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-foreground">For Production:</h5>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Deploy to a hosting service (Vercel, Netlify, etc.)</li>
                  <li>Use the production URL in the override field</li>
                  <li>Share the QR code via email, WhatsApp, or print</li>
                </ul>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}