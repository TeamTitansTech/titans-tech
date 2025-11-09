'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Wrench } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://media.tenor.com/uZOIS1_5O-MAAAAe/shitpost-memes.png"
          alt="Industrial machinery"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50 flex items-center justify-center z-10">
          <div className="text-center space-y-4 px-12">
            <div className="w-20 h-20 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center mx-auto">
              <Wrench className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground">InspectPro</h1>
            <p className="text-xl text-primary-foreground/90">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Wrench className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h2>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('form.email.label')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('form.email.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('form.password.label')}
                </Label>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                  onClick={() => router.push('/forgot-password')}
                >
                  {t('form.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('form.password.placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" size="lg">
              {t('form.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
