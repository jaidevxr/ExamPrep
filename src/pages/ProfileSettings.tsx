import { useState, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudProgress } from '@/hooks/useCloudProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, User, Mail, Calendar, Target, Flame, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subjects } from '@/data/subjects';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, uploading, updateUsername, uploadAvatar, updatePreferences } = useProfile();
  const { progress } = useCloudProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(profile?.username || '');
  const [focusDuration, setFocusDuration] = useState(profile?.default_focus_duration || 25);
  const [breakDuration, setBreakDuration] = useState(profile?.default_break_duration || 5);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const handleUsernameUpdate = async () => {
    if (username === profile?.username) return;
    setIsUpdatingUsername(true);
    await updateUsername(username);
    setIsUpdatingUsername(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handlePreferencesUpdate = async (focus: number, breakTime: number) => {
    await updatePreferences(focus, breakTime);
  };

  const totalCompleted = Object.values(progress).reduce((acc, subject) => {
    return acc + Object.values(subject).filter(Boolean).length;
  }, 0);

  const totalTopics = subjects.reduce((acc, subject) => {
    return acc + subject.units.reduce((unitAcc, unit) => unitAcc + unit.topics.length, 0);
  }, 0);

  const completionPercentage = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/20 pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 sm:h-11 sm:w-11"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">PROFILE SETTINGS</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Avatar and Basic Info */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Profile Picture</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Update your avatar and basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || 'User'} />
                  <AvatarFallback className="text-2xl sm:text-4xl bg-primary/10">
                    {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full sm:w-auto h-11 min-h-[44px]"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </Button>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  JPG, PNG or WebP. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="h-11 flex-1"
                    maxLength={20}
                  />
                  <Button
                    onClick={handleUsernameUpdate}
                    disabled={isUpdatingUsername || username === profile?.username || username.length < 3}
                    className="h-11 min-h-[44px] w-full sm:w-auto"
                  >
                    {isUpdatingUsername ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">3-20 characters</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Study Preferences</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Customize your study timer settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Focus Duration</Label>
                  <span className="text-sm font-bold text-primary">{focusDuration} min</span>
                </div>
                <Slider
                  value={[focusDuration]}
                  onValueChange={([value]) => setFocusDuration(value)}
                  onValueCommit={([value]) => handlePreferencesUpdate(value, breakDuration)}
                  min={15}
                  max={60}
                  step={5}
                  className="touch-manipulation"
                />
                <p className="text-xs text-muted-foreground">Time for focused study sessions (15-60 minutes)</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Break Duration</Label>
                  <span className="text-sm font-bold text-primary">{breakDuration} min</span>
                </div>
                <Slider
                  value={[breakDuration]}
                  onValueChange={([value]) => setBreakDuration(value)}
                  onValueCommit={([value]) => handlePreferencesUpdate(focusDuration, value)}
                  min={5}
                  max={15}
                  step={1}
                  className="touch-manipulation"
                />
                <p className="text-xs text-muted-foreground">Time for short breaks (5-15 minutes)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Profile Statistics</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your study progress and account info</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 p-4 rounded-lg bg-secondary/20 min-h-[100px] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs font-medium">Email</span>
                </div>
                <p className="text-xs sm:text-sm font-bold truncate">{user?.email}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-secondary/20 min-h-[100px] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Joined</span>
                </div>
                <p className="text-xs sm:text-sm font-bold">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-secondary/20 min-h-[100px] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-medium">Completed</span>
                </div>
                <p className="text-xs sm:text-sm font-bold">
                  {totalCompleted}/{totalTopics} ({completionPercentage}%)
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-secondary/20 min-h-[100px] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs font-medium">Progress</span>
                </div>
                <p className="text-xs sm:text-sm font-bold">{Object.keys(progress).length} subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
