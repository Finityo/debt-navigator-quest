import { useState, useEffect } from "react";
import { Download, CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const ua = navigator.userAgent;
    setIsIos(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h1 className="text-2xl font-bold font-heading text-foreground">Already Installed</h1>
        <p className="text-muted-foreground max-w-md">
          Finityo is installed on your device. Open it from your home screen!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <Smartphone className="h-16 w-16 text-primary" />
      <h1 className="text-2xl font-bold font-heading text-foreground text-center">
        Install Finityo
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        Install Finityo on your device for a native app experience — works offline, loads instantly.
      </p>

      {deferredPrompt ? (
        <Button size="lg" onClick={handleInstall} className="gap-2">
          <Download className="h-5 w-5" />
          Install App
        </Button>
      ) : isIos ? (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg">Install on iOS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Tap the <strong>Share</strong> button in Safari</p>
            <p>2. Scroll down and tap <strong>Add to Home Screen</strong></p>
            <p>3. Tap <strong>Add</strong> to confirm</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg">Install from Browser</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Open the browser menu (⋮) and select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstallPage;
