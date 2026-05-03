"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TodoTemplate } from "@/types";
import {
  Plus,
  MapPin,
  Bookmark,
  BookmarkCheck,
  X,
  Sparkles,
  Star,
  FileText,
  Send,
  Clock,
  CalendarDays,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface TodoFormProps {
  onAdd: (todo: {
    title: string;
    description?: string;
    location?: string;
    due_date?: string;
    points_reward: number;
    is_important: boolean;
  }) => void;
}

const FIXED_POINTS = 20;

function parseDateInput(input: string): string | undefined {
  if (!input.trim()) return undefined;
  const cleaned = input.trim().replace(/\//g, "-").replace(/\s+/g, " ");
  // Format: DD-MM-YYYY HH:MM or DD-MM-YYYY
  const match = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (match) {
    const [, dd, mm, yyyy, hh, min] = match;
    const hour = parseInt(hh || "23", 10);
    const minute = parseInt(min || "59", 10);
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10);
    
    if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return "INVALID";
    }

    const hourStr = hour.toString().padStart(2, "0");
    const minStr = minute.toString().padStart(2, "0");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${hourStr}:${minStr}:00`;
  }
  // Try ISO/native format
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString();
  return undefined;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateText, setDateText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isImportant, setIsImportant] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<TodoTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dueDate = parseDateInput(dateText);
    if (dueDate === "INVALID") {
      toast.error("รูปแบบเวลาไม่ถูกต้อง", { description: "กรุณากรอกเวลาให้ถูกต้อง (ตัวอย่าง: 05/05/2026 14:30)" });
      return;
    }

    setSubmitting(true);

    if (isTemplate) {
      await saveAsTemplate();
    }

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      due_date: dueDate,
      points_reward: FIXED_POINTS,
      is_important: isImportant,
    });
    
    setTitle("");
    setDescription("");
    setLocation("");
    setDateText("");
    setIsTemplate(false);
    setIsImportant(false);
    setTimeout(() => setSubmitting(false), 500);
  };

  const saveAsTemplate = async () => {
    if (!title.trim()) {
      toast.error("กรุณาระบุชื่อรายการก่อน");
      return;
    }
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          points_reward: FIXED_POINTS,
          is_important: isImportant,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setTemplates((prev) => [d.template, ...prev]);
        toast.success("บันทึกเทมเพลตสำเร็จ");
      }
    } catch {
      toast.error("บันทึกไม่สำเร็จ");
    }
  };

  const loadTemplate = (t: TodoTemplate) => {
    setTitle(t.title);
    setDescription(t.description || "");
    setLocation(t.location || "");
    setIsImportant(t.is_important || false);
    setShowTemplates(false);
    toast.success("โหลดเทมเพลตแล้ว");
  };

  const deleteTemplate = async (id: string) => {
    try {
      await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch { }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className={`relative overflow-hidden border transition-all duration-300 ${focused
          ? "border-primary/30 shadow-lg shadow-primary/10 bg-white"
          : "border-border/40 bg-white/80 shadow-sm backdrop-blur-sm"
        }`}>
        {/* Animated gradient top bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />

        <CardContent className="p-0">
          <form onSubmit={handleSubmit}>
            {/* Main input area */}
            <div className="p-5 pb-3 space-y-3">
              {/* Title input with neon glow */}
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? "text-primary" : "text-muted-foreground/40"}`}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <input
                  placeholder="เพิ่มรายการใหม่..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="neon-input w-full h-12 rounded-xl bg-secondary/30 pl-11 pr-4 text-sm font-medium placeholder:text-muted-foreground/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              {/* Star importance toggle */}
              <div className="flex items-center justify-between">
                <motion.button
                  type="button"
                  onClick={() => setIsImportant(!isImportant)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isImportant
                      ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30"
                      : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/50 border border-transparent"
                    }`}
                >
                  <Star className={`h-4 w-4 transition-all ${isImportant ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  {isImportant ? "สำคัญ (+5/-5 ตามเวลา)" : "ติ๊กดาวถ้าสำคัญ"}
                </motion.button>

                {templates.length > 0 && (
                  <motion.button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${showTemplates ? "bg-chart-5/10 text-chart-5" : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/50"
                      }`}
                  >
                    <Bookmark className="h-3 w-3" />
                    {templates.length}
                  </motion.button>
                )}
              </div>

              {/* Details section - always visible */}
              <div className="space-y-2.5 pt-2">
                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                {/* Description with neon glow */}
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <Input
                    placeholder="รายละเอียดเพิ่มเติม..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="neon-input h-9 rounded-lg pl-9 bg-secondary/20 border-0 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                </div>

                {/* Location + Date row with neon glow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                    <Input
                      placeholder="สถานที่"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="neon-input h-9 rounded-lg pl-9 bg-secondary/20 border-0 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                    <Input
                      placeholder="วัน/เดือน/ปี เวลา เช่น 15/06/2026 14:30"
                      value={dateText}
                      onChange={(e) => setDateText(e.target.value)}
                      className="neon-input h-9 rounded-lg pl-9 bg-secondary/20 border-0 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Quick date buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Clock className="h-3 w-3 text-muted-foreground/40" />
                  {[
                    { label: "วันนี้", fn: () => { const d = new Date(); setDateText(`${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} 23:59`); } },
                    { label: "พรุ่งนี้", fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); setDateText(`${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} 23:59`); } },
                    { label: "3 วัน", fn: () => { const d = new Date(); d.setDate(d.getDate() + 3); setDateText(`${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} 23:59`); } },
                    { label: "สัปดาห์หน้า", fn: () => { const d = new Date(); d.setDate(d.getDate() + 7); setDateText(`${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} 23:59`); } },
                  ].map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={q.fn}
                      className="rounded-md bg-secondary/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* Save as template toggle */}
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-all ${isTemplate ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105' : 'border-input bg-background group-hover:border-primary/50'}`}>
                    {isTemplate && <Check className="h-3 w-3" strokeWidth={3} />}
                  </div>
                  <span className={`text-[12px] font-medium transition-colors ${isTemplate ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    บันทึกรายการนี้เป็นเทมเพลต (ใช้ซ้ำได้)
                  </span>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isTemplate} 
                    onChange={(e) => setIsTemplate(e.target.checked)} 
                  />
                </label>
              </div>
            </div>

            {/* Templates list */}
            <AnimatePresence>
              {showTemplates && templates.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mx-5 mb-3 rounded-lg border border-border/30 bg-secondary/10 p-2 space-y-1">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-md bg-white/80 px-3 py-1.5 text-sm hover:bg-primary/5 transition-colors cursor-pointer group"
                        onClick={() => loadTemplate(t)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px]">�</span>
                          <span className="truncate text-xs font-medium">{t.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-chart-3">+{FIXED_POINTS} pts</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-destructive/40 hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <div className="px-5 pb-5">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={!title.trim() || submitting}
                  className="relative w-full h-11 rounded-xl overflow-hidden font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-30 disabled:shadow-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                  <span className="relative flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    เพิ่มรายการ
                  </span>
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes neonGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3), 0 0 10px rgba(99, 102, 241, 0.2), 0 0 15px rgba(99, 102, 241, 0.1); }
          50% { box-shadow: 0 0 8px rgba(99, 102, 241, 0.5), 0 0 16px rgba(99, 102, 241, 0.3), 0 0 24px rgba(99, 102, 241, 0.15); }
        }
        .neon-input:focus {
          animation: neonGlow 2s ease-in-out infinite;
          border-color: rgba(99, 102, 241, 0.5) !important;
        }
      `}</style>
    </motion.div>
  );
}
