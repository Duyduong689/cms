"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Role = "admin" | "editor";

export function Topbar() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem("role") as Role) || "admin",
  );

  useEffect(() => {
    localStorage.setItem("role", role);
  }, [role]);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  return (
    <header className="h-14 border-b flex items-center gap-4 px-4 bg-background">
      <div className="flex-1">
        <input
          placeholder="Search posts, tags, authors..."
          className="w-full max-w-xl px-3 py-2 rounded-md bg-secondary text-secondary-foreground placeholder:text-muted-foreground border"
        />
      </div>
      <div className="flex items-center gap-2">
        {/* <div className="text-xs text-muted-foreground hidden md:block">
          Role
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="px-2 py-1 border rounded-md bg-background"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select> */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
        {/* <div className="hidden md:flex items-center text-xs text-muted-foreground gap-1">
          <Shield className="w-3 h-3" />
          {role.toUpperCase()}
        </div> */}
      </div>
    </header>
  );
}
