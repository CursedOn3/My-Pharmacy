import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  Package,
  FileText,
  Heart,
  CreditCard,
  Users,
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  BadgePercent,
  Clock,
  Eye,
  FlaskConical,
  Upload,
  Download,
  Trash2,
  TestTube,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Medicare" },
      { name: "description", content: "Manage your orders, prescriptions and account." },
    ],
  }),
});

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
              {user.role === "admin" ? "Admin Dashboard" : "Welcome back"}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
              Hello, {user.name} 👋
            </h1>
          </div>
          <div className="bg-mint px-4 py-2 rounded-full text-xs font-bold uppercase text-primary-deep">
            {user.role}
          </div>
        </header>

        {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------- USER ---------------------------------- */

function UserDashboard() {
  const { count, subtotal } = useCart();
  const { orders, prescriptions } = useStore();

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const recentRx = useMemo(() => prescriptions.slice(0, 3), [prescriptions]);
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "Delivered").length,
    [orders]
  );

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-muted p-1 rounded-full h-auto flex flex-wrap gap-1">
        <TabsTrigger
          value="overview"
          className="rounded-full px-4 py-2 text-xs font-bold uppercase data-[state=active]:bg-primary-deep data-[state=active]:text-primary-deep-foreground"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="lab-results"
          className="rounded-full px-4 py-2 text-xs font-bold uppercase data-[state=active]:bg-primary-deep data-[state=active]:text-primary-deep-foreground"
        >
          <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
          Lab results
        </TabsTrigger>
        <TabsTrigger
          value="upload-tests"
          className="rounded-full px-4 py-2 text-xs font-bold uppercase data-[state=active]:bg-primary-deep data-[state=active]:text-primary-deep-foreground"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Upload test Rx
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Package} label="Active orders" value={String(activeOrders)} bg="bg-mint" />
          <StatCard icon={FileText} label="Prescriptions" value={String(prescriptions.length)} bg="bg-sun" />
          <StatCard icon={ShoppingBag} label="Cart items" value={String(count)} bg="bg-peach" />
          <StatCard icon={CreditCard} label="Cart value" value={`$${subtotal.toFixed(2)}`} bg="bg-rose" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader title="Recent orders" cta={<Link to="/orders" className="text-xs font-bold text-primary-deep">View all →</Link>} />
            <div className="divide-y divide-border">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-mint flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-deep">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()} · {o.lines.reduce((s, l) => s + l.qty, 0)} item
                      {o.lines.reduce((s, l) => s + l.qty, 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary-deep">${o.total.toFixed(2)}</span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase bg-mint text-primary-deep px-2 py-1 rounded-full">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Prescriptions" cta={<Link to="/prescription" className="text-xs font-bold text-primary-deep">Upload →</Link>} />
            <div className="space-y-2">
              {recentRx.map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-xl border border-border p-3 flex items-start gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-sun flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-deep">{rx.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rx.uploadedAt).toLocaleDateString()} · {rx.note ?? "Pending review"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      rx.status === "Approved"
                        ? "bg-mint text-primary-deep"
                        : "bg-peach text-primary-deep"
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader title="Quick actions" />
            <div className="grid sm:grid-cols-3 gap-3">
              <QuickAction to="/prescription" icon={FileText} label="Upload prescription" desc="Send a new Rx" bg="bg-mint" />
              <QuickAction to="/cart" icon={ShoppingBag} label="View cart" desc="Continue checkout" bg="bg-sun" />
              <QuickAction to="/reorder-favorites" icon={Heart} label="Reorder favorites" desc="Buy again in 1 click" bg="bg-peach" />
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="lab-results" className="mt-0">
        <LabResultsPanel />
      </TabsContent>

      <TabsContent value="upload-tests" className="mt-0">
        <UploadTestPrescriptionPanel />
      </TabsContent>
    </Tabs>
  );
}

/* ------------------------------- ADMIN --------------------------------- */

function AdminDashboard() {
  const { orders, prescriptions, customers } = useStore();

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const pendingRx = useMemo(
    () => prescriptions.filter((rx) => rx.status === "Pending").slice(0, 3),
    [prescriptions]
  );

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    );
    const revenueToday = todayOrders.reduce((s, o) => s + o.total, 0);
    return {
      revenueToday,
      ordersToday: todayOrders.length,
      pendingRx: prescriptions.filter((rx) => rx.status === "Pending").length,
      customers: customers.length
    };
  }, [orders, prescriptions, customers]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Revenue today" value={`$${stats.revenueToday.toFixed(2)}`} bg="bg-mint" />
        <StatCard icon={Package} label="Orders today" value={String(stats.ordersToday)} bg="bg-sun" />
        <StatCard icon={FileText} label="Pending Rx" value={String(stats.pendingRx)} bg="bg-peach" />
        <StatCard icon={Users} label="Customers" value={String(stats.customers)} bg="bg-rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent orders"
            cta={<span className="text-xs font-bold text-primary-deep">Manage →</span>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left py-2 font-semibold">Order</th>
                  <th className="text-left py-2 font-semibold">Customer</th>
                  <th className="text-left py-2 font-semibold">Total</th>
                  <th className="text-left py-2 font-semibold">Status</th>
                  <th className="text-right py-2 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-semibold text-primary-deep">{o.id}</td>
                    <td className="py-3 text-primary-deep/80">{o.customerName}</td>
                    <td className="py-3 font-bold text-primary-deep">${o.total.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground text-right">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Prescriptions queue" />
          <div className="space-y-2">
            {pendingRx.map((rx) => (
              <div
                key={rx.id}
                className="rounded-xl border border-border p-3 flex items-start gap-3"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    new Date(rx.uploadedAt).getTime() < Date.now() - 1000 * 60 * 60 * 24
                      ? "bg-destructive/15"
                      : "bg-sun"
                  }`}
                >
                  {new Date(rx.uploadedAt).getTime() < Date.now() - 1000 * 60 * 60 * 24 ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Clock className="h-4 w-4 text-primary-deep" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-deep">{rx.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {rx.customerName} · {new Date(rx.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <button className="p-1.5 rounded-full hover:bg-muted" aria-label="Review">
                  <Eye className="h-4 w-4 text-primary-deep" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Quick admin actions" />
          <div className="grid sm:grid-cols-4 gap-3">
            <QuickAction to="/admin/orders" icon={Package} label="All orders" desc="Manage shipments" bg="bg-mint" />
            <QuickAction to="/admin/prescriptions" icon={FileText} label="Review Rx" desc="Approve / reject" bg="bg-sun" />
            <QuickAction to="/admin/customers" icon={Users} label="Customers" desc="Manage accounts" bg="bg-peach" />
            <QuickAction to="/admin/inventory" icon={CheckCircle2} label="Inventory" desc="Stock & catalog" bg="bg-rose" />
            <QuickAction to="/admin/marketing" icon={BadgePercent} label="Discounts & banners" desc="Manage promos" bg="bg-cream" />
          </div>
        </Card>
      </div>
    </div>
  );
}

const statusColor = (s: string) => {
  switch (s) {
    case "Pending":
      return "bg-peach text-primary-deep";
    case "Processing":
      return "bg-sun text-primary-deep";
    case "Shipped":
      return "bg-mint text-primary-deep";
    default:
      return "bg-cream text-primary-deep";
  }
};

/* --------------------------- shared bits ------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 space-y-2`}>
      <div className="h-9 w-9 rounded-xl bg-background/70 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary-deep" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/70">
          {label}
        </div>
        <div className="font-display text-2xl font-extrabold text-primary-deep">{value}</div>
      </div>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border rounded-3xl p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  cta,
}: {
  title: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-lg font-extrabold text-primary-deep">{title}</h2>
      {cta}
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  desc,
  bg,
}: {
  to:
    | "/orders"
    | "/cart"
    | "/prescription"
    | "/reorder-favorites"
    | "/admin/orders"
    | "/admin/prescriptions"
    | "/admin/customers"
    | "/admin/inventory"
    | "/admin/marketing";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  bg: string;
}) {
  return (
    <Link
      to={to}
      className={`${bg} rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform`}
    >
      <div className="h-10 w-10 rounded-xl bg-background/70 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary-deep" />
      </div>
      <div className="min-w-0">
        <div className="font-display font-extrabold text-primary-deep text-sm">{label}</div>
        <div className="text-xs text-primary-deep/70">{desc}</div>
      </div>
    </Link>
  );
}

/* ----------------------- LAB RESULTS PANEL ---------------------------- */

type LabResult = {
  id: string;
  testName: string;
  date: string; // ISO
  status: "Normal" | "Borderline" | "Attention";
  summary: string;
  parameters: { name: string; value: string; range: string; flag?: "high" | "low" | "ok" }[];
};

const SAMPLE_LAB_RESULTS: LabResult[] = [
  {
    id: "LAB-2041",
    testName: "Complete Blood Count (CBC)",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: "Normal",
    summary: "All counts within reference ranges. No action needed.",
    parameters: [
      { name: "Haemoglobin", value: "14.2 g/dL", range: "13.5 – 17.5", flag: "ok" },
      { name: "WBC", value: "6.8 ×10³/µL", range: "4.0 – 11.0", flag: "ok" },
      { name: "Platelets", value: "245 ×10³/µL", range: "150 – 400", flag: "ok" },
    ],
  },
  {
    id: "LAB-2032",
    testName: "Lipid Profile",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    status: "Borderline",
    summary: "LDL slightly elevated. Lifestyle review recommended.",
    parameters: [
      { name: "Total Cholesterol", value: "212 mg/dL", range: "< 200", flag: "high" },
      { name: "HDL", value: "48 mg/dL", range: "> 40", flag: "ok" },
      { name: "LDL", value: "138 mg/dL", range: "< 130", flag: "high" },
      { name: "Triglycerides", value: "142 mg/dL", range: "< 150", flag: "ok" },
    ],
  },
  {
    id: "LAB-2018",
    testName: "Vitamin D (25-OH)",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    status: "Attention",
    summary: "Vitamin D deficient. Supplement consultation suggested.",
    parameters: [
      { name: "25-Hydroxy Vitamin D", value: "16 ng/mL", range: "30 – 100", flag: "low" },
    ],
  },
];

function LabResultsPanel() {
  const [results] = useState<LabResult[]>(SAMPLE_LAB_RESULTS);
  const [activeId, setActiveId] = useState<string>(results[0]?.id ?? "");
  const active = results.find((r) => r.id === activeId) ?? results[0];

  const counts = useMemo(() => {
    return {
      total: results.length,
      normal: results.filter((r) => r.status === "Normal").length,
      borderline: results.filter((r) => r.status === "Borderline").length,
      attention: results.filter((r) => r.status === "Attention").length,
    };
  }, [results]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FlaskConical} label="Total tests" value={String(counts.total)} bg="bg-mint" />
        <StatCard icon={CheckCircle2} label="Normal" value={String(counts.normal)} bg="bg-sun" />
        <StatCard icon={Clock} label="Borderline" value={String(counts.borderline)} bg="bg-peach" />
        <StatCard icon={AlertCircle} label="Needs attention" value={String(counts.attention)} bg="bg-rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader
            title="Test history"
            cta={
              <Link to="/lab-services" className="text-xs font-bold text-primary-deep">
                Book new →
              </Link>
            }
          />
          <div className="space-y-2">
            {results.map((r) => {
              const isActive = r.id === active?.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={`w-full text-left rounded-xl border p-3 flex items-start gap-3 transition-colors ${
                    isActive
                      ? "border-primary-deep bg-mint"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shrink-0">
                    <TestTube className="h-4 w-4 text-primary-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-deep truncate">
                      {r.testName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()} · {r.id}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full whitespace-nowrap ${labStatusColor(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          {active ? (
            <>
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-deep/60">
                    {active.id} · {new Date(active.date).toLocaleDateString()}
                  </span>
                  <h3 className="font-display text-xl font-extrabold text-primary-deep">
                    {active.testName}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${labStatusColor(
                      active.status
                    )}`}
                  >
                    {active.status}
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary-deep text-primary-deep-foreground px-3 py-1.5 rounded-full hover:opacity-90"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </button>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-3 mb-4 text-sm text-primary-deep/80">
                {active.summary}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left py-2 font-semibold">Parameter</th>
                      <th className="text-left py-2 font-semibold">Result</th>
                      <th className="text-left py-2 font-semibold">Reference</th>
                      <th className="text-right py-2 font-semibold">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {active.parameters.map((p) => (
                      <tr key={p.name}>
                        <td className="py-3 font-semibold text-primary-deep">{p.name}</td>
                        <td className="py-3 text-primary-deep/90">{p.value}</td>
                        <td className="py-3 text-muted-foreground">{p.range}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${flagColor(
                              p.flag ?? "ok"
                            )}`}
                          >
                            {p.flag === "high"
                              ? "High"
                              : p.flag === "low"
                                ? "Low"
                                : "Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-10">
              No lab results yet. Book a test to get started.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const labStatusColor = (s: LabResult["status"]) => {
  switch (s) {
    case "Normal":
      return "bg-mint text-primary-deep";
    case "Borderline":
      return "bg-sun text-primary-deep";
    case "Attention":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-cream text-primary-deep";
  }
};

const flagColor = (f: "high" | "low" | "ok") =>
  f === "ok"
    ? "bg-mint text-primary-deep"
    : f === "high"
      ? "bg-destructive/15 text-destructive"
      : "bg-peach text-primary-deep";

/* -------------------- UPLOAD TEST PRESCRIPTION ------------------------ */

type UploadedTestRx = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl: string | null;
  doctorName: string;
  note: string;
  uploadedAt: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function UploadTestPrescriptionPanel() {
  const [items, setItems] = useState<UploadedTestRx[]>([]);
  const [doctorName, setDoctorName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onPickFile = (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!ACCEPTED.includes(f.type)) {
      setError("Only JPG, PNG, WEBP or PDF files are allowed.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File must be under 10 MB.");
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose a prescription file to upload.");
      return;
    }
    const trimmedDoctor = doctorName.trim().slice(0, 100);
    const trimmedNote = note.trim().slice(0, 500);
    setSubmitting(true);
    try {
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      const newItem: UploadedTestRx = {
        id: `TRX-${Date.now().toString().slice(-6)}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        previewUrl,
        doctorName: trimmedDoctor || "Not specified",
        note: trimmedNote,
        uploadedAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
      setFile(null);
      setDoctorName("");
      setNote("");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader title="Upload test prescription" />
        <p className="text-xs text-muted-foreground mb-4">
          Upload a prescription from your doctor for the lab tests you need.
          Our team will reach out to schedule a sample collection.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label
            htmlFor="lab-rx-file"
            className="block rounded-2xl border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-primary-deep/40 hover:bg-muted/40 transition-colors"
          >
            <input
              ref={inputRef}
              id="lab-rx-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-mint flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary-deep" />
              </div>
              <div className="text-sm font-semibold text-primary-deep">
                {file ? file.name : "Click to choose a file"}
              </div>
              <div className="text-xs text-muted-foreground">
                JPG, PNG, WEBP or PDF — up to 10 MB
              </div>
            </div>
          </label>

          <div className="space-y-1.5">
            <label
              htmlFor="lab-doctor"
              className="text-xs font-bold uppercase tracking-wider text-primary-deep/70"
            >
              Doctor's name
            </label>
            <input
              id="lab-doctor"
              type="text"
              value={doctorName}
              maxLength={100}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. Jane Doe"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary-deep"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="lab-note"
              className="text-xs font-bold uppercase tracking-wider text-primary-deep/70"
            >
              Notes (optional)
            </label>
            <textarea
              id="lab-note"
              value={note}
              maxLength={500}
              rows={3}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific test names, fasting required, etc."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary-deep resize-none"
            />
            <div className="text-[10px] text-muted-foreground text-right">
              {note.length}/500
            </div>
          </div>

          {error && (
            <div className="text-xs font-semibold text-destructive bg-destructive/10 rounded-xl px-3 py-2 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full bg-primary-deep text-primary-deep-foreground font-bold text-sm py-3 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Uploading…" : "Submit prescription"}
          </button>
        </form>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader
          title="Your uploaded test prescriptions"
          cta={
            <span className="text-xs font-bold text-muted-foreground">
              {items.length} file{items.length === 1 ? "" : "s"}
            </span>
          }
        />
        {items.length === 0 ? (
          <div className="rounded-2xl bg-muted/50 border border-dashed border-border p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-background flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-primary-deep">
              No prescriptions uploaded yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a doctor's test prescription to get started.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-border p-3 flex items-start gap-3"
              >
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText className="h-6 w-6 text-primary-deep" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-deep truncate">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.id} · {item.doctorName} ·{" "}
                    {(item.fileSize / 1024).toFixed(0)} KB
                  </p>
                  {item.note && (
                    <p className="text-xs text-primary-deep/70 mt-1 line-clamp-2">
                      {item.note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold uppercase bg-sun text-primary-deep px-2 py-1 rounded-full">
                    Pending
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
