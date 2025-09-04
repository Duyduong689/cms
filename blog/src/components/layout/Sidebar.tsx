"use client";

import { cn } from "@/lib/utils";
import { Home, Newspaper, User, Tag, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/posts", label: "Posts", icon: Newspaper },
  { to: "/users", label: "Users", icon: Users },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/authors", label: "Authors", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground">
      <div className="h-14 flex items-center px-4 border-b">
        <div className="font-extrabold tracking-tight text-lg">Blog CMS</div>
      </div>
      <nav className="p-2 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                "hover:bg-sidebar-accent transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
