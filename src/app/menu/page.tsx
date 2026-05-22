"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ListTodo, StickyNote, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    id: "todolist",
    title: "Todolist",
    description: "จัดการรายการสิ่งที่ต้องทำ พร้อมระบบคะแนนรางวัล",
    icon: ListTodo,
    href: "/todolist",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-50",
  },
  {
    id: "noteh",
    title: "NoteH.",
    description: "บันทึกความคิด ไอเดีย และเรื่องสำคัญของคุณ",
    icon: StickyNote,
    href: "/todolist#notes",
    color: "from-amber-500 to-orange-400",
    bgColor: "bg-amber-50",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "ดูสถิติและความคืบหน้าของคุณแบบเรียลไทม์",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "from-violet-500 to-purple-400",
    bgColor: "bg-violet-50",
  },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center justify-between"
        >
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับหน้าแรก
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Harnkhm Lab
            </span>
          </h1>
          <p className="mt-2 text-lg text-slate-600">เลือกเครื่องมือที่ต้องการใช้งาน</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={tool.href}>
                <Card className="group cursor-pointer overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
                  <CardHeader className={`${tool.bgColor} pb-6`}>
                    <div
                      className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${tool.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <tool.icon className="h-10 w-10 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 text-center">
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {tool.title}
                    </CardTitle>
                    <p className="mt-3 text-sm text-slate-600">
                      {tool.description}
                    </p>
                    <Button
                      className={`mt-6 w-full bg-gradient-to-r ${tool.color} text-white transition-all duration-300 hover:opacity-90`}
                    >
                      เริ่มใช้งาน
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
