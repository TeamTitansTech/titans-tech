'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
   <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">InspectPro</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400">
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Industrial Machine Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline inspections, maintenance, and machine management with our comprehensive
            platform designed for industrial environments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" asChild className="text-base">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base">
              <Link href="/login">Admin Access</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20 mb-4">
                  <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Machine Tracking</CardTitle>
                <CardDescription className="text-base">
                  Track all your industrial machines with detailed specifications, maintenance
                  history, and real-time status monitoring.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20 mb-4">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-2xl">Blueprint Management</CardTitle>
                <CardDescription className="text-base">
                  Create and manage machine blueprints with customizable parameters and inspection
                  criteria for each model.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20 mb-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Client Portal</CardTitle>
                <CardDescription className="text-base">
                  Empower your clients with their own portal to manage machines, request services,
                  and view maintenance history.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 TT. Powered by TiTech.
          </p>
        </div>
      </footer>
    </div>
  );
}
