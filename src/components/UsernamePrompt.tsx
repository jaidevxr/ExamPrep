import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, User } from "lucide-react";

interface UsernamePromptProps {
  open: boolean;
  onSuccess: () => void;
}

export const UsernamePrompt = ({ open, onSuccess }: UsernamePromptProps) => {
  const { updateUsername } = useProfile();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (username.length < 3 || username.length > 20) return;
    
    setSaving(true);
    const success = await updateUsername(username);
    setSaving(false);

    if (success) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md minecraft-block border-4 border-border bg-card [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-black arcade-text text-primary flex items-center gap-2">
            <User className="h-6 w-6" />
            CHOOSE USERNAME
          </DialogTitle>
          <DialogDescription className="font-bold text-muted-foreground pt-2">
            Welcome to ExamPrep! Pick a username so your study buddies can find and chat with you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-black arcade-text text-primary uppercase tracking-wider">
              Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
              placeholder="e.g. StudyMaster99"
              className="h-12 border-2 bg-muted/50 font-bold"
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <p className="text-[10px] text-muted-foreground font-bold">
              3-20 characters, no spaces allowed.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={username.length < 3 || saving}
            className="w-full h-12 font-black arcade-text border-2"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "SAVE AND CONTINUE"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
