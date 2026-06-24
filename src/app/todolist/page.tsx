"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TodoForm from "@/components/todo-form";
import TodoList from "@/components/todo-list";
import Dashboard from "@/components/dashboard";
import RankBoard from "@/components/rank-board";
import NoteH from "@/components/note-pasin";
import { Todo, DashboardStats, RankUser, UserProfile } from "@/types";
import { toast } from "sonner";
import {
  Trophy,
  ListTodo,
  Sparkles,
  Loader2,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Section = "dashboard" | "rank" | "list" | "notes";

const sections: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "list", label: "รายการ", icon: ListTodo },
  { key: "rank", label: "อันดับ", icon: Trophy },
];

export default function TodolistPage() {
  const router = useRouter();
  const [hash, setHash] = useState<Section>("list");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rankUsers, setRankUsers] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Fetch current user session — redirect if not logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user);
          setUserId(d.user.id);
        } else {
          router.push("/auth");
        }
      })
      .catch(() => router.push("/auth"))
      .finally(() => setAuthChecked(true));
  }, [router]);

  const fetchTodos = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/todos?userId=${userId}`);
      const data = await res.json();
      setTodos(data.todos || []);
    } catch {
      toast.error("ไม่สามารถโหลดรายการได้");
    }
  }, [userId]);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/todos?stats=true&userId=${userId}`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, [userId]);

  const fetchRank = useCallback(async () => {
    try {
      const res = await fetch("/api/rank");
      const data = await res.json();
      setRankUsers(data.users || []);
    } catch {
      toast.error("ไม่สามารถโหลดอันดับได้");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([fetchTodos(), fetchStats(), fetchRank()]).finally(() =>
      setLoading(false)
    );
  }, [userId, fetchTodos, fetchStats, fetchRank]);

  // === Web Notification Polling (every 30 seconds) ===
  useEffect(() => {
    if (!userId) return;

    const checkNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        const data = await res.json();
        const notifications = data.notifications || [];

        for (const n of notifications) {
          if (notifiedIdsRef.current.has(n.id)) continue;
          notifiedIdsRef.current.add(n.id);

          toast(
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Bell className="h-4 w-4 text-amber-500" />
                ⏰ ใกล้ถึงเวลาแล้ว!
              </div>
              <p className="text-sm">📋 {n.title}</p>
              {n.location && <p className="text-xs text-muted-foreground">📍 {n.location}</p>}
              <p className="text-xs text-emerald-600 font-medium">⭐ ทำเสร็จได้ +{n.points_reward} คะแนน</p>
              <p className="text-xs text-muted-foreground mt-1">{n.motivation}</p>
            </div>,
            { duration: 15000 }
          );
        }
      } catch {
        // Silently fail — don't disrupt user experience
      }
    };

    // Check immediately on mount
    checkNotifications();

    // Poll every 30 seconds
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const updateHash = () => {
      const rawHash = window.location.hash.split("#").filter(Boolean).pop() || "list";
      setHash(rawHash as Section);
    };
    updateHash(); // Set initial hash
    window.addEventListener("hashchange", updateHash);
    // Also listen for popstate — Next.js router.push may trigger this instead of hashchange
    window.addEventListener("popstate", updateHash);
    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("popstate", updateHash);
    };
  }, []);

  const refreshUser = async () => {
    const res = await fetch("/api/auth/me");
    const d = await res.json();
    if (d.user) setCurrentUser(d.user);
  };

  const addTodo = async (todo: {
    title: string;
    description?: string;
    location?: string;
    due_date?: string;
    points_reward: number;
    is_important: boolean;
  }) => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...todo,
          user_id: userId,
        }),
      });
      if (res.ok) {
        toast.success("เพิ่มรายการสำเร็จ");
        await fetchTodos();
        await fetchStats();
      } else {
        toast.error("เพิ่มรายการไม่สำเร็จ");
      }
    } catch {
      toast.error("เพิ่มรายการไม่สำเร็จ");
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/todos?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === "completed") {
          toast.success(
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              ทำเสร็จแล้ว! +{todo.points_reward} คะแนน
            </div>
          );
        } else {
          toast.info("ยกเลิกสถานะเสร็จสิ้น");
        }
        await fetchTodos();
        await fetchStats();
        await fetchRank();
      } else {
        toast.error("อัปเดตไม่สำเร็จ");
      }
    } catch {
      toast.error("อัปเดตไม่สำเร็จ");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบรายการสำเร็จ");
        await fetchTodos();
        await fetchStats();
      } else {
        toast.error("ลบรายการไม่สำเร็จ");
      }
    } catch {
      toast.error("ลบรายการไม่สำเร็จ");
    }
  };

  // Show loading while checking auth
  if (!authChecked || !userId) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-secondary/50 p-1.5 backdrop-blur-sm">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = hash === s.key;
          return (
            <button
              key={s.key}
              onClick={() => {
                window.location.hash = s.key;
                setHash(s.key);
              }}
              className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={hash}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {hash === "dashboard" && (
            <Dashboard
              stats={stats}
              loading={loading}
              user={currentUser}
              onProfileUpdate={refreshUser}
            />
          )}

          {hash === "rank" && (
            <RankBoard users={rankUsers} loading={loading} />
          )}

          {hash === "notes" && (
            <NoteH />
          )}

          {hash === "list" && (
            <div className="space-y-6">
              <TodoForm onAdd={addTodo} />
              <Card className="border-border/40 bg-white/80 shadow-sm backdrop-blur-sm">
                <CardContent className="p-5">
                  <TodoList
                    todos={todos}
                    loading={loading}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
