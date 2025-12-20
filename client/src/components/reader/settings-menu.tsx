import { useState, useEffect } from "react";
import { useSettings } from "@/lib/store";
import { 
  Settings, 
  Type, 
  Moon, 
  Sun, 
  Coffee,
  Minus,
  Plus,
  X
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function SettingsMenu() {
  const { theme, setTheme, fontSize, setFontSize } = useSettings();
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm pb-8 pt-4 px-4">
          <DrawerHeader className="flex justify-between items-center mb-4 px-0">
            <DrawerTitle className="text-xl font-display">Reader Settings</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="space-y-8">
            {/* Theme Selection */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Theme</span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-primary bg-stone-50 text-stone-900' 
                      : 'border-transparent bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <Sun className="h-6 w-6 mb-1" />
                  <span className="text-xs font-sans">Light</span>
                </button>
                
                <button
                  onClick={() => setTheme('sepia')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    theme === 'sepia' 
                      ? 'border-primary bg-[#F4ECD8] text-[#5B4636]' 
                      : 'border-transparent bg-[#F4ECD8]/50 text-[#5B4636]/60 hover:bg-[#F4ECD8]'
                  }`}
                >
                  <Coffee className="h-6 w-6 mb-1" />
                  <span className="text-xs font-sans">Sepia</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-primary bg-stone-900 text-stone-50' 
                      : 'border-transparent bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  <Moon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-sans">Dark</span>
                </button>
              </div>
            </div>
            
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Text Size</span>
                <span className="text-sm font-mono text-muted-foreground">{fontSize}%</span>
              </div>
              
              <div className="flex items-center gap-4 bg-secondary/50 p-2 rounded-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full w-10 h-10 shrink-0"
                  onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                  disabled={fontSize <= 80}
                >
                  <span className="text-sm font-serif">A</span>
                </Button>
                
                <Slider
                  value={[fontSize]}
                  min={80}
                  max={150}
                  step={10}
                  onValueChange={(val) => setFontSize(val[0])}
                  className="flex-1"
                />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full w-10 h-10 shrink-0"
                  onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                  disabled={fontSize >= 150}
                >
                  <span className="text-xl font-serif">A</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
