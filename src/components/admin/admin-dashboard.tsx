"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Settings,
  Bell,
  FolderTree,
  BarChart3,
  Loader2,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Save,
  X,
  ArrowLeft,
  ArrowRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/store/auth-context";
import { useLang } from "@/lib/i18n";
import { AdSlot } from "@/components/ads";
import type { Profile, Ad, Setting, AppNotification, CalculatorCategory, Feedback, AdminStats } from "@/types/db";

interface AdminDashboardProps {
  onExit: () => void;
}

type AdminTab = "overview" | "users" | "ads" | "settings" | "notifications" | "categories" | "feedback";

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const { user } = useAuth();
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [tab, setTab] = useState<AdminTab>("overview");
  const ArrowBack = isRtl ? ArrowRight : ArrowLeft;

  const tabs: { key: AdminTab; label: string; icon: typeof Users }[] = [
    { key: "overview", label: isRtl ? "نظرة عامة" : "Overview", icon: LayoutDashboard },
    { key: "users", label: isRtl ? "المستخدمون" : "Users", icon: Users },
    { key: "ads", label: isRtl ? "الإعلانات" : "Ads", icon: Megaphone },
    { key: "settings", label: isRtl ? "الإعدادات" : "Settings", icon: Settings },
    { key: "notifications", label: isRtl ? "الإشعارات" : "Notifications", icon: Bell },
    { key: "categories", label: isRtl ? "التصنيفات" : "Categories", icon: FolderTree },
    { key: "feedback", label: isRtl ? "الملاحظات" : "Feedback", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onExit}>
              <ArrowBack className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                <LayoutDashboard className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <span className="block text-sm font-black">
                  {isRtl ? "لوحة التحكم" : "Admin Dashboard"}
                </span>
                <span className="block text-[9px] text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </div>
          <Badge className="gap-1 bg-amber-500 hover:bg-amber-600">
            <Shield /> ADMIN
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as AdminTab)}>
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7">
            {tabs.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className="gap-1.5 text-xs">
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4"><OverviewPanel /></TabsContent>
          <TabsContent value="users" className="mt-4"><UsersPanel /></TabsContent>
          <TabsContent value="ads" className="mt-4"><AdsPanel /></TabsContent>
          <TabsContent value="settings" className="mt-4"><SettingsPanel /></TabsContent>
          <TabsContent value="notifications" className="mt-4"><NotificationsPanel /></TabsContent>
          <TabsContent value="categories" className="mt-4"><CategoriesPanel /></TabsContent>
          <TabsContent value="feedback" className="mt-4"><FeedbackPanel /></TabsContent>
        </Tabs>

        {/* Footer banner ad on admin dashboard */}
        <div className="mt-6 flex justify-center border-t border-border/40 pt-4">
          <AdSlot placement="footer" />
        </div>
      </div>
    </div>
  );
}

function Shield() {
  return <span className="h-2 w-2 rounded-full bg-white" />;
}

/* ===================================================================== */
/*  OVERVIEW                                                              */
/* ===================================================================== */
function OverviewPanel() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, ads, feedback, calcs] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("ads").select("*", { count: "exact", head: false }).is("deleted_at", null),
          supabase.from("feedback").select("*", { count: "exact", head: false }).is("deleted_at", null),
          supabase.from("calculators").select("*", { count: "exact", head: true }).is("deleted_at", null),
        ]);

        setStats({
          totalUsers: users.count ?? 0,
          activeUsers: users.count ?? 0,
          totalCalculators: calcs.count ?? 0,
          totalAds: ads.data?.length ?? 0,
          activeAds: ads.data?.filter((a: Ad) => a.enabled).length ?? 0,
          totalFeedback: feedback.data?.length ?? 0,
          openFeedback: feedback.data?.filter((f: Feedback) => f.status === "open").length ?? 0,
          unreadNotifications: 0,
        });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <Empty text={isRtl ? "لا توجد بيانات" : "No data"} />;

  const cards = [
    { label: isRtl ? "إجمالي المستخدمين" : "Total Users", value: stats.totalUsers, color: "text-blue-600" },
    { label: isRtl ? "الآلات الحاسبة" : "Calculators", value: stats.totalCalculators, color: "text-emerald-600" },
    { label: isRtl ? "الإعلانات النشطة" : "Active Ads", value: `${stats.activeAds}/${stats.totalAds}`, color: "text-amber-600" },
    { label: isRtl ? "ملاحظات مفتوحة" : "Open Feedback", value: `${stats.openFeedback}/${stats.totalFeedback}`, color: "text-rose-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ===================================================================== */
/*  USERS                                                                 */
/* ===================================================================== */
function UsersPanel() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    setUsers((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (u: Profile) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isRtl ? "تم التحديث" : "Updated" });
      load();
    }
  };

  const softDelete = async (u: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", u.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isRtl ? "تم الحذف" : "Deleted" });
      load();
    }
  };

  if (loading) return <Spinner />;

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{isRtl ? "إدارة المستخدمين" : "User Management"}</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRtl ? "البريد" : "Email"}</TableHead>
                <TableHead>{isRtl ? "الاسم" : "Name"}</TableHead>
                <TableHead>{isRtl ? "الدور" : "Role"}</TableHead>
                <TableHead>{isRtl ? "ضيف" : "Guest"}</TableHead>
                <TableHead className="text-right">{isRtl ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell className="text-xs">{u.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.is_guest ? "✓" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => toggleRole(u)} title={isRtl ? "تبديل الدور" : "Toggle role"}>
                        {u.role === "admin" ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => softDelete(u)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {users.length === 0 && <Empty text={isRtl ? "لا يوجد مستخدمون" : "No users"} />}
      </CardContent>
    </Card>
  );
}

/* ===================================================================== */
/*  ADS                                                                   */
/* ===================================================================== */
function AdsPanel() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ads")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    setAds((data ?? []) as Ad[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleEnabled = async (a: Ad) => {
    await supabase.from("ads").update({ enabled: !a.enabled }).eq("id", a.id);
    load();
  };

  const remove = async (a: Ad) => {
    await supabase.from("ads").update({ deleted_at: new Date().toISOString() }).eq("id", a.id);
    toast({ title: isRtl ? "تم الحذف" : "Deleted" });
    load();
  };

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {isRtl ? "إعلان جديد" : "New Ad"}
      </Button>

      {showForm && <AdForm onDone={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />}

      {loading ? <Spinner /> : ads.length === 0 ? (
        <Empty text={isRtl ? "لا توجد إعلانات" : "No ads"} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ads.map((a) => (
            <Card key={a.id} className={!a.enabled ? "opacity-50" : ""}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {a.image_url && (
                     
                    <img src={a.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[9px]">{a.placement}</Badge>
                      <Badge variant="secondary" className="text-[9px]">P:{a.priority}</Badge>
                      <Badge variant="secondary" className="text-[9px]">👁 {a.impressions}</Badge>
                      <Badge variant="secondary" className="text-[9px]">👆 {a.clicks}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggleEnabled(a)}>
                    {a.enabled ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AdForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [form, setForm] = useState({
    title: "", description: "", image_url: "", button_text: "", link_url: "",
    placement: "home", priority: 0,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.title) {
      toast({ title: isRtl ? "أدخل العنوان" : "Title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("ads").insert({
      ...form,
      enabled: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 86400000).toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isRtl ? "تم الإضافة" : "Created" });
      onDone();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{isRtl ? "إعلان جديد" : "New Ad"}</CardTitle>
        <Button size="icon" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{isRtl ? "العنوان" : "Title"}</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{isRtl ? "الوصف" : "Description"}</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{isRtl ? "رابط الصورة" : "Image URL"}</Label>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{isRtl ? "رابط الزر" : "Link URL"}</Label>
            <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{isRtl ? "نص الزر" : "Button Text"}</Label>
            <Input value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{isRtl ? "الموضع" : "Placement"}</Label>
            <Select value={form.placement} onValueChange={(v) => setForm({ ...form, placement: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["home", "calculator", "results", "sidebar", "banner", "interstitial"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{isRtl ? "الأولوية" : "Priority"}</Label>
          <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
        </div>
        <Button onClick={submit} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isRtl ? "حفظ" : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ===================================================================== */
/*  SETTINGS                                                              */
/* ===================================================================== */
function SettingsPanel() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("settings")
      .select("*")
      .is("deleted_at", null)
      .order("category")
      .order("key");
    setItems((data ?? []) as Setting[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (s: Setting) => {
    const newVal = editing[s.key] ?? s.value;
    const { error } = await supabase.from("settings").update({ value: newVal }).eq("id", s.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isRtl ? "تم الحفظ" : "Saved" });
      setEditing((prev) => {
        const next = { ...prev };
        delete next[s.key];
        return next;
      });
      load();
    }
  };

  if (loading) return <Spinner />;

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <Card key={cat}>
          <CardHeader><CardTitle className="text-sm uppercase text-muted-foreground">{cat}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.filter((i) => i.category === cat).map((s) => (
              <div key={s.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Label className="text-xs font-bold">{s.key}</Label>
                  <p className="text-[10px] text-muted-foreground">{s.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.value_type === "boolean" ? (
                    <Switch
                      checked={(editing[s.key] ?? s.value) === "true"}
                      onCheckedChange={(v) => setEditing({ ...editing, [s.key]: v ? "true" : "false" })}
                    />
                  ) : (
                    <Input
                      value={editing[s.key] ?? s.value}
                      onChange={(e) => setEditing({ ...editing, [s.key]: e.target.value })}
                      className="h-8 w-48 text-xs"
                    />
                  )}
                  <Button size="sm" variant="ghost" onClick={() => save(s)}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ===================================================================== */
/*  NOTIFICATIONS                                                         */
/* ===================================================================== */
function NotificationsPanel() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as AppNotification[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const send = async (form: { title: string; body: string; is_broadcast: boolean }) => {
    const { error } = await supabase.from("notifications").insert({
      title: form.title,
      body: form.body,
      is_broadcast: form.is_broadcast,
      type: "system",
      is_read: false,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isRtl ? "تم الإرسال" : "Sent" });
      setShowForm(false);
      load();
    }
  };

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <Send className="h-4 w-4" />
        {isRtl ? "إرسال إشعار" : "Send Notification"}
      </Button>

      {showForm && <NotifForm onSend={send} onCancel={() => setShowForm(false)} />}

      {loading ? <Spinner /> : items.length === 0 ? (
        <Empty text={isRtl ? "لا توجد إشعارات" : "No notifications"} />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  {n.is_broadcast && <Badge className="text-[9px]">broadcast</Badge>}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  {new Date(n.created_at).toLocaleString(isRtl ? "ar-EG" : "en-US")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NotifForm({ onSend, onCancel }: { onSend: (f: { title: string; body: string; is_broadcast: boolean }) => void; onCancel: () => void }) {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [broadcast, setBroadcast] = useState(true);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{isRtl ? "إشعار جديد" : "New Notification"}</CardTitle>
        <Button size="icon" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{isRtl ? "العنوان" : "Title"}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{isRtl ? "المحتوى" : "Body"}</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={broadcast} onCheckedChange={setBroadcast} />
          {isRtl ? "إرسال للجميع" : "Broadcast to all"}
        </label>
        <Button onClick={() => onSend({ title, body, is_broadcast: broadcast })} className="w-full gap-2">
          <Send className="h-4 w-4" />
          {isRtl ? "إرسال" : "Send"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ===================================================================== */
/*  CATEGORIES                                                            */
/* ===================================================================== */
function CategoriesPanel() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [cats, setCats] = useState<CalculatorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("calculator_categories")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order");
    setCats((data ?? []) as CalculatorCategory[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (c: CalculatorCategory) => {
    await supabase.from("calculator_categories").update({ enabled: !c.enabled }).eq("id", c.id);
    load();
  };

  const remove = async (c: CalculatorCategory) => {
    await supabase.from("calculator_categories").update({ deleted_at: new Date().toISOString() }).eq("id", c.id);
    toast({ title: isRtl ? "تم الحذف" : "Deleted" });
    load();
  };

  if (loading) return <Spinner />;

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{isRtl ? "تصنيفات الآلات الحاسبة" : "Calculator Categories"}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {cats.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-bold">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.slug}</p>
            </div>
            <Switch checked={c.enabled} onCheckedChange={() => toggle(c)} />
            <Button size="icon" variant="ghost" onClick={() => remove(c)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        {cats.length === 0 && <Empty text={isRtl ? "لا توجد تصنيفات" : "No categories"} />}
      </CardContent>
    </Card>
  );
}

/* ===================================================================== */
/*  FEEDBACK                                                              */
/* ===================================================================== */
function FeedbackPanel() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as Feedback[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (f: Feedback, status: Feedback["status"]) => {
    await supabase.from("feedback").update({ status }).eq("id", f.id);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-2">
      {items.map((f) => (
        <Card key={f.id}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{f.subject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.message}</p>
                {f.rating && (
                  <p className="mt-1 text-xs">{"⭐".repeat(f.rating)}</p>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  {f.contact ?? "—"} · {new Date(f.created_at).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                </p>
              </div>
              <Select value={f.status} onValueChange={(v) => updateStatus(f, v as Feedback["status"])}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">open</SelectItem>
                  <SelectItem value="in_progress">in progress</SelectItem>
                  <SelectItem value="resolved">resolved</SelectItem>
                  <SelectItem value="closed">closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && <Empty text={isRtl ? "لا توجد ملاحظات" : "No feedback"} />}
    </div>
  );
}

/* ---------- Helpers ---------- */
function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="py-12 text-center text-sm text-muted-foreground">{text}</div>;
}
function _unused(_n: ReactNode) { return null; }
