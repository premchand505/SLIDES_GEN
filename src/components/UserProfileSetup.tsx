'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

export interface UserProfile {
  name: string;
  organization?: string;
}

interface UserProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfile = () => {
      try {
        const stored = localStorage.getItem('user-profile');
        if (stored) {
          const profile = JSON.parse(stored) as UserProfile;
          if (profile.name) {
            onComplete(profile);
            setShowDialog(false);
          } else {
            setShowDialog(true);
          }
        } else {
          setShowDialog(true);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setShowDialog(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [onComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      organization: organization.trim() || undefined,
    };

    try {
      localStorage.setItem('user-profile', JSON.stringify(profile));
      window.dispatchEvent(new Event('storage'));
      onComplete(profile);
      setShowDialog(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (isLoading || !showDialog) return null;

  return (
    <AnimatePresence>
      {showDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white bg-white text-black"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/10 mb-4">
                <User className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-black">
                Welcome to SLIDES GEN! 👋
              </h2>
              <p className="text-sm text-gray-700">
                Let&apos;s personalize your experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-black"
                >
                  Your Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="text-base border border-black focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="organization"
                  className="text-sm font-medium text-black"
                >
                  Organization (Optional)
                </label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="e.g., Your Company"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="text-base border border-black focus:ring-2 focus:ring-black"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-white hover:text-black border border-black transition-colors"
                size="lg"
                disabled={!name.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-4">
              Your information is stored locally on your device
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
