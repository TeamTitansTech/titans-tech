'use client';

import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Powered by</span>
          <Image
            src="/assets/logos/Titechlogo.png"
            alt="TITECH Logo"
            width={25}
            height={25}
            className="object-contain"
          />
        </div>
      </div>
    </footer>
  );
}
