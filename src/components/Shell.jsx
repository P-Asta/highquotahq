import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { BookOpen, FileText, LogIn, Menu, Moon, ShieldCheck, Sun, Trophy, UploadCloud, UserRound, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Leaderboards", to: "/leaderboards/vanilla", icon: Trophy },
  { label: "Submit", to: "/submit/vanilla", icon: UploadCloud },
  { label: "Guides", to: "/guides", icon: BookOpen },
  { label: "Rules", to: "/rules", icon: FileText },
  { label: "About", to: "/about" }
];

export function Shell({ children }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });
  const { user, username, isStaff } = useAuth();
  const profilePath = username ? `/profile/${encodeURIComponent(username)}` : "/profile";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const linkClass = ({ isActive }) =>
    cn(
      "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-[#171717] transition-colors hover:bg-[#fafafa] dark:text-white dark:hover:bg-[#0a0a0a]",
      isActive && "bg-[#171717] text-white hover:bg-[#171717] dark:bg-white dark:text-black dark:hover:bg-[#ededed]"
    );

  return (
    <div className="min-h-screen bg-white text-[#171717] dark:bg-black dark:text-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-border dark:bg-black/80">
        <div className="container flex h-16 items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/high-quota-logo.png" alt="High Quota HQ" className="h-9 w-9 object-contain" />
            <span className="truncate text-sm font-semibold">High Quota HQ</span>
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.icon ? <item.icon className="mr-2 h-4 w-4" strokeWidth={1.8} /> : null}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button
              variant="secondary"
              size="icon"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isStaff ? (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin">
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            ) : null}
            {user ? (
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link to={profilePath}>
                    <UserRound className="h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild variant="secondary" size="sm">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          <button
            type="button"
            className="focus-ring ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-[0_0_0_1px_rgb(235,235,235)] dark:bg-black dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)] md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="container pb-4 md:hidden">
            <div className="grid gap-1 rounded-lg bg-white p-2 shadow-card dark:bg-black">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                  {item.icon ? <item.icon className="mr-2 h-4 w-4" strokeWidth={1.8} /> : null}
                  {item.label}
                </NavLink>
              ))}
              {isStaff ? (
                <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin
                </NavLink>
              ) : null}
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
              >
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </Button>
              {user ? (
                <>
                  <NavLink to={profilePath} className={linkClass} onClick={() => setOpen(false)}>
                    <UserRound className="mr-2 h-4 w-4" />
                    Profile
                  </NavLink>
                  <Button variant="ghost" className="justify-start" onClick={() => signOut(auth)}>
                    Logout
                  </Button>
                </>
              ) : (
                <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </NavLink>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="mt-20 shadow-[0_-1px_0_rgba(0,0,0,0.08)] dark:shadow-[0_-1px_0_rgba(255,255,255,0.16)]">
        <div className="container flex flex-col gap-5 py-10 text-sm text-[#666] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src="/high-quota-logo.png" alt="" className="h-8 w-8 object-contain" />
            <span>High Quota HQ</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a className="font-medium hover:text-[#171717]" href="https://discord.com/invite/usYCEz49Je" target="_blank" rel="noreferrer">Discord</a>
            <a className="font-medium hover:text-[#171717]" href="mailto:highquotahq@gmail.com">Email</a>
            <a className="font-medium hover:text-[#171717]" href="https://ko-fi.com/highquotahq" target="_blank" rel="noreferrer">Ko-fi</a>
            <a className="font-medium hover:text-[#171717]" href="https://www.youtube.com/@highquotahq" target="_blank" rel="noreferrer">YouTube</a>
            <a className="font-medium hover:text-[#171717]" href="https://www.twitch.tv/highquotahq" target="_blank" rel="noreferrer">Twitch</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
