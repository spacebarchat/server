import Link from "next/link";
import {
    Activity,
    BadgeAlert,
    Boxes,
    Cable,
    CheckCircle2,
    ChevronRight,
    CircleSlash,
    Cog,
    Database,
    FileClock,
    Image,
    LayoutDashboard,
    Search,
    Shield,
    Sparkles,
    Users,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/guilds", label: "Guilds", icon: Boxes },
    { href: "/discovery", label: "Discovery", icon: Sparkles },
    { href: "/channels", label: "Channels", icon: Cable },
    { href: "/media", label: "Media", icon: Image },
    { href: "/configuration", label: "Configuration", icon: Cog },
    { href: "/jobs", label: "Jobs", icon: Activity },
    { href: "/activity", label: "Activity", icon: FileClock },
];

export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="app-shell">
            <aside className="sidebar">
                <Link href="/" className="brand">
                    <span className="brand-mark">S</span>
                    <span>
                        <strong>Spacebar</strong>
                        <small>Admin</small>
                    </span>
                </Link>
                <nav className="nav-list">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="nav-item">
                            <item.icon size={17} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="main-surface">{children}</main>
        </div>
    );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <header className="page-header">
            <div>
                <h1>{title}</h1>
                {description ? <p>{description}</p> : null}
            </div>
            {action ? <div className="page-action">{action}</div> : null}
        </header>
    );
}

export function Metric({ label, value, tone = "default" }: { label: string; value: ReactNode; tone?: "default" | "good" | "warn" | "bad" }) {
    return (
        <div className={`metric metric-${tone}`}>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

export function StatusPill({ value }: { value: string | boolean | null | undefined }) {
    const normalized = String(value ?? "unknown");
    const positive = ["succeeded", "online", "true", "available", "database"].includes(normalized);
    const negative = ["failed", "deleted", "disabled", "false", "readonly"].includes(normalized);
    const Icon = positive ? CheckCircle2 : negative ? CircleSlash : BadgeAlert;

    return (
        <span className={`status-pill ${positive ? "status-good" : negative ? "status-bad" : "status-neutral"}`}>
            <Icon size={13} />
            {normalized}
        </span>
    );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
    return (
        <section className="panel">
            <div className="panel-header">
                <h2>{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
    return (
        <div className="empty-state">
            <Shield size={22} />
            <strong>{title}</strong>
            {detail ? <span>{detail}</span> : null}
        </div>
    );
}

export function ErrorBanner({ message }: { message: string | null }) {
    if (!message) return null;
    return (
        <div className="error-banner">
            <BadgeAlert size={16} />
            <span>{message}</span>
        </div>
    );
}

export function SearchForm({ defaultValue, placeholder = "Search" }: { defaultValue?: string; placeholder?: string }) {
    return (
        <form className="search-form">
            <Search size={16} />
            <input name="q" defaultValue={defaultValue} placeholder={placeholder} />
            <button type="submit">Apply</button>
        </form>
    );
}

export function RowLink({ href }: { href: string }) {
    return (
        <Link href={href} className="row-link" aria-label="Open detail">
            <ChevronRight size={16} />
        </Link>
    );
}

export function CodeBlock({ value }: { value: unknown }) {
    return <pre className="code-block">{JSON.stringify(value, null, 2)}</pre>;
}

export function KeyValueList({ items }: { items: [string, ReactNode][] }) {
    return (
        <dl className="kv-list">
            {items.map(([key, value]) => (
                <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function DatabaseMode({ source, readonly }: { source: string; readonly: boolean }) {
    return (
        <span className="db-mode">
            <Database size={14} />
            {source}
            {readonly ? " readonly" : ""}
        </span>
    );
}
