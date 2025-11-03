'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

interface UserProfile {
  name: string;
  organization?: string;
}

interface UserProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');

  // Check profile without effect
  const hasProfile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('user-profile');
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        onComplete(profile);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [onComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      organization: organization.trim() || undefined,
    };

    localStorage.setItem('user-profile', JSON.stringify(profile));
    onComplete(profile);
  };

  if (hasProfile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full border"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to SLIDES GEN!</h2>
            <p className="text-muted-foreground text-sm">
              Let&apos;s personalize your experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Your Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Organization (Optional)
              </label>
              <Input
                id="organization"
                type="text"
                placeholder="Your Company"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="text-base"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={!name.trim()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}