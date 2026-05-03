"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Note } from "@/types";
import {
  StickyNote,
  Save,
  Trash2,
  Plus,
  Bold,
  Italic,
  Highlighter,
  Type,
  Calculator,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pencil,
  BookOpen,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export default function NoteH() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [showCalc, setShowCalc] = useState(false);

  // Calculator state
  const [calcExpr, setCalcExpr] = useState("");
  const [calcResult, setCalcResult] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      toast.error("ไม่สามารถโหลดบันทึกได้");
    } finally {
      setLoading(false);
    }
  };

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setEditId(null);
    setIsEditing(false);
    setFontSize(16);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const startNew = () => {
    resetEditor();
    setIsEditing(true);
  };

  const startEdit = (note: Note) => {
    setEditId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = note.content;
    }, 50);
  };

  const handleSave = async () => {
    const htmlContent = editorRef.current?.innerHTML || content;
    const plainText = editorRef.current?.innerText || "";
    if (!title.trim() || !plainText.trim()) {
      toast.error("กรุณากรอกชื่อและเนื้อหาบันทึก");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/notes?id=${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: htmlContent }),
        });
        if (res.ok) {
          toast.success("บันทึกสำเร็จ");
          await fetchNotes();
          resetEditor();
        } else {
          toast.error("บันทึกไม่สำเร็จ");
        }
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: htmlContent }),
        });
        if (res.ok) {
          toast.success(
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              บันทึกสำเร็จ! +20 คะแนน
            </div>
          );
          await fetchNotes();
          resetEditor();
        } else {
          toast.error("บันทึกไม่สำเร็จ");
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบบันทึกแล้ว");
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } else {
        toast.error("ลบไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      document.execCommand("fontSize", false, "7");
      // Then replace with span style
      const fontElements = document.querySelectorAll("font[size='7']");
      fontElements.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        span.innerHTML = el.innerHTML;
        el.parentNode?.replaceChild(span, el);
      });
    }
  };

  const calcEvaluate = () => {
    try {
      // Safe eval alternative for basic math
      const sanitized = calcExpr.replace(/[^0-9+\-*/().\s]/g, "");
      if (!sanitized) return;
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      setCalcResult(String(result));
    } catch {
      setCalcResult("Error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 w-full rounded-2xl bg-secondary/50 animate-pulse" />
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 w-full rounded-2xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + New Note Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-chart-5 to-chart-4 shadow-sm">
            <StickyNote className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">NoteH.</h2>
            <p className="text-xs text-muted-foreground">สรุปบันทึกสิ่งสำคัญ +20 pts ต่อบันทึก</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={startNew} className="gap-1.5">
            <Plus className="h-4 w-4" />
            เขียนบันทึกใหม่
          </Button>
        )}
      </div>

      {/* Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border/40 bg-white/80 shadow-lg backdrop-blur-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-chart-5 via-chart-4 to-chart-3 bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
              <CardContent className="p-5 space-y-4">
                {/* Title */}
                <Input
                  placeholder="ชื่อบันทึก..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 text-base font-semibold bg-secondary/20 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                />

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-secondary/40 p-2">
                  <ToolbarButton
                    icon={<Bold className="h-4 w-4" />}
                    onClick={() => execCommand("bold")}
                    label="ตัวหนา"
                  />
                  <ToolbarButton
                    icon={<Italic className="h-4 w-4" />}
                    onClick={() => execCommand("italic")}
                    label="ตัวเอียง"
                  />
                  <ToolbarButton
                    icon={<Highlighter className="h-4 w-4" />}
                    onClick={() => execCommand("hiliteColor", "#fef08a")}
                    label="ไฮไลต์"
                  />
                  <div className="w-px h-6 bg-border/50 mx-1" />
                  <div className="flex items-center gap-1">
                    <Type className="h-3.5 w-3.5 text-muted-foreground" />
                    {[14, 16, 18, 20, 24].map((s) => (
                      <button
                        key={s}
                        onClick={() => applyFontSize(s)}
                        className={`h-7 w-7 rounded-md text-[11px] font-medium transition-colors ${
                          fontSize === s ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                        }`}
                        title={`${s}px`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="w-px h-6 bg-border/50 mx-1" />
                  <ToolbarButton
                    icon={<Calculator className="h-4 w-4" />}
                    onClick={() => setShowCalc(!showCalc)}
                    label="เครื่องคิดเลข"
                    active={showCalc}
                  />
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-xs font-bold text-chart-3">+20 pts</span>
                  </div>
                </div>

                {/* Calculator */}
                <AnimatePresence>
                  {showCalc && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl bg-secondary/30 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">เครื่องคิดเลข</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="เช่น 100 + 20 * 3"
                            value={calcExpr}
                            onChange={(e) => setCalcExpr(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && calcEvaluate()}
                            className="h-9 text-sm bg-white/60"
                          />
                          <Button size="sm" onClick={calcEvaluate} variant="secondary">
                            =
                          </Button>
                        </div>
                        {calcResult && (
                          <div className="text-sm font-bold text-chart-3">ผลลัพธ์: {calcResult}</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rich Text Editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[200px] rounded-xl border border-border/30 bg-white/60 p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  style={{ fontSize: `${fontSize}px` }}
                  onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
                />

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={resetEditor}>
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    ยกเลิก
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "กำลังบันทึก..." : editId ? "บันทึกการแก้ไข" : "บันทึก (+20 pts)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {notes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group border-border/40 bg-white/80 shadow-sm backdrop-blur-sm hover:shadow-md transition-all overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-chart-5/60 to-chart-4/40" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="h-4 w-4 text-chart-5 shrink-0" />
                      <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => startEdit(note)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                      </Button>
                    </div>
                  </div>

                  <div
                    className="text-sm text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-chart-3">
                      <Sparkles className="h-3 w-3" />
                      +{note.points_reward} pts
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notes.length === 0 && !isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 py-16"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
            <StickyNote className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">ยังไม่มีบันทึก</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            คลิก "เขียนบันทึกใหม่" เพื่อเริ่มต้นและรับคะแนน +20 pts
          </p>
        </motion.div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon,
  onClick,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {icon}
    </button>
  );
}
