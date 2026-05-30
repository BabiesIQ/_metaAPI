import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { changePassword, updateProfile } from "@/lib/api";
import type { PlanCode } from "@/types/index";
import { Eye, EyeOff, LogOut, Save, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PLAN_BADGE: Record<PlanCode, string> = {
  free: "bg-muted text-muted-foreground border-0",
  pro: "bg-primary/15 text-primary border-0",
  pro_plus: "bg-accent/20 text-accent-foreground border-0",
  business: "bg-yellow-500/15 text-yellow-400 border-0",
};

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Other",
];

function DashboardSettingsContent() {
  const { user: authUser, setUser, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("India");
  const [saving, setSaving] = useState(false);

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const user = authUser?.user;
  const plan = authUser?.plan;

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setCountry(user.country ?? "India");
    }
  }, [user]);

  const handleAvatarClick = () => fileRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar must be under 2MB.");
      return;
    }
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await updateProfile(fd);
    if (res.success && res.data) {
      setUser(res.data);
      toast.success("Avatar updated!");
    } else {
      toast.error(res.error ?? "Failed to update avatar.");
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("first_name", firstName);
    fd.append("last_name", lastName);
    fd.append("country", country);
    const res = await updateProfile(fd);
    setSaving(false);
    if (res.success && res.data) {
      setUser(res.data);
      toast.success("Profile saved!");
    } else {
      toast.error(res.error ?? "Failed to save profile.");
    }
  };

  const handleChangePassword = async () => {
    if (newPwd.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setPwdLoading(true);
    const res = await changePassword(currentPwd, newPwd);
    setPwdLoading(false);
    if (res.success) {
      toast.success("Password changed successfully!");
      setShowPwdModal(false);
      setCurrentPwd("");
      setNewPwd("");
    } else {
      toast.error(res.error ?? "Failed to change password.");
    }
  };

  const isLoading = !authUser;

  return (
    <div className="space-y-6 max-w-2xl" data-ocid="settings.page">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Avatar + Plan */}
      <Card className="bg-card border-border" data-ocid="settings.profile.card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-display">Profile</CardTitle>
          </div>
          <CardDescription className="font-body">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center group cursor-pointer border-2 border-transparent hover:border-primary transition-smooth"
              onClick={handleAvatarClick}
              aria-label="Change avatar"
              data-ocid="settings.avatar.upload_button"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-primary" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
              aria-label="Upload avatar file"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {user?.email}
              </p>
              {!isLoading && (
                <Badge
                  className={`mt-1 text-xs ${PLAN_BADGE[(plan?.code as PlanCode) ?? "free"]}`}
                >
                  {plan?.name ?? "Free"} Plan
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {isLoading ? (
            <div className="space-y-4" data-ocid="settings.loading_state">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first-name" className="font-body text-sm">
                    First Name
                  </Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="bg-background border-input"
                    data-ocid="settings.first_name.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last-name" className="font-body text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="bg-background border-input"
                    data-ocid="settings.last_name.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-email" className="font-body text-sm">
                  Email Address
                </Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  disabled
                  className="bg-muted border-input font-body opacity-60"
                  data-ocid="settings.email.input"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country" className="font-body text-sm">
                  Country
                </Label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-ocid="settings.country.select"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="gradient-primary text-white border-0"
                  data-ocid="settings.save.submit_button"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPwdModal(true)}
                  data-ocid="settings.change_password.button"
                >
                  Change Password
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        className="bg-card border-destructive/30"
        data-ocid="settings.danger.card"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription className="font-body">
            Actions that affect your account session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4 bg-destructive/20" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-body text-foreground font-medium">
                Sign Out
              </p>
              <p className="text-xs text-muted-foreground font-body">
                End your current session
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
              data-ocid="settings.logout.button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={showPwdModal} onOpenChange={setShowPwdModal}>
        <DialogContent
          className="bg-card border-border"
          data-ocid="settings.change_password.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Change Password</DialogTitle>
            <DialogDescription className="font-body">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  data-ocid="settings.current_password.input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={showCurrent ? "Hide" : "Show"}
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  className="pr-10"
                  data-ocid="settings.new_password.input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? "Hide" : "Show"}
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPwdModal(false)}
              data-ocid="settings.change_password.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={pwdLoading || !currentPwd || !newPwd}
              className="gradient-primary text-white border-0"
              data-ocid="settings.change_password.confirm_button"
            >
              {pwdLoading ? "Updating…" : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DashboardSettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardSettingsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
