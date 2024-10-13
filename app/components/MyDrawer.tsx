import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "~/lib/utils";

import { Button } from "./ui/button";

interface MyDrawerProps {
  open: boolean;
  onOpenChange: () => void;
  children: React.ReactNode;
  className?: string;
}

// This is a non-locking drawer
// meaning the background can still be scrolled while the drawer is open
const MyDrawer: React.FC<MyDrawerProps> = ({
  open,
  onOpenChange,
  children,
  className,
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Focus the drawer when it opens
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onOpenChange(); // Close the drawer when Escape is pressed
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop (optional, non-blocking scroll) */}
      <div
        // by adding a pointer-events-none to the className and disabling the onClick we can interact with the main page below
        className="pointer-events-none fixed inset-0 z-50 bg-black/25 transition-opacity duration-300"
        // onClick={onOpenChange}
        role="none"
      />

      {/* Custom Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-x-0 z-50 bottom-0 w-full translate-y-0 rounded-t-xl border-t bg-background shadow-lg transition-transform duration-300 ease-in-out",
          className
        )}
        role="tab"
        tabIndex={-1}
        onKeyDown={handleKeyDown}>
        <div className="flex h-full flex-col font-sans">
          <div className="grow overflow-y-auto">
            <div className="flex flex-col items-end border-b">
              <Button variant="ghost" size="icon" onClick={onOpenChange}>
                <X className="size-6" />
              </Button>
            </div>
          </div>
          {/* Content */}
          {children}
        </div>
      </div>
    </>
  );
};

export { MyDrawer };
