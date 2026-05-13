import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const GlobalUsernameSetup = () => {
  const { user } = useAuth();
  const { profile, loading, updateUsername } = useProfile();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  // Don't show if not logged in, or if still loading profile, or if username is already set
  if (!user || loading || !profile || profile.username) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setSaving(true);
    const success = await updateUsername(username.trim());
    if (success) {
      toast.success('Username set successfully!');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <Card className="w-full max-w-md p-6 sm:p-8 minecraft-block bg-card border-2 shadow-2xl relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-700" />
        
        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black arcade-text text-primary">
              WELCOME
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider">
              Choose your player name
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setup-username" className="text-xs font-black uppercase tracking-wider">
                Username
              </Label>
              <Input
                id="setup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="minecraft-block font-bold h-12 text-base text-center tracking-wider"
                maxLength={20}
                required
                autoFocus
              />
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                This is how friends will find you. You can change it later.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full font-black arcade-text border-2 border-border h-12 text-base mt-2"
              disabled={saving || username.length < 3}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  SAVING...
                </>
              ) : (
                'START PLAYING'
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
