"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Loader2,
  ListPlus,
  CheckSquare,
  Trash2,
  StickyNote,
  Trophy,
  LayoutDashboard,
  UserCircle,
  MousePointerClick,
  Pencil,
  BookOpen,
  Menu,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Step {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
  accent: string;
  iconBg: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: ListPlus,
    title: "เพิ่มรายการที่ต้องทำ",
    description: "เริ่มต้นด้วยการสร้างรายการ Todo ใหม่",
    details: [
      "พิมพ์ชื่อรายการในช่อง \"เพิ่มรายการใหม่...\"",
      "ใส่รายละเอียดเพิ่มเติม สถานที่ และกำหนดวัน",
      "เลือกระดับความสำคัญ: วันนี้ / พรุ่งนี้ / 3 วัน / สัปดาห์หน้า",
      "ติ๊ก \"บันทึกเป็นเทมเพลต\" หากต้องการใช้ซ้ำ",
      "กดปุ่ม \"เพิ่มรายการ\" เพื่อบันทึก",
    ],
    accent: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-50 text-blue-500",
  },
  {
    number: 2,
    icon: CheckSquare,
    title: "เช็คงานเสร็จ & ได้คะแนน",
    description: "ทำ Todo เสร็จแล้วกดเช็คเพื่อรับคะแนนสะสม",
    details: [
      "กดที่วงกลมหน้ารายการเพื่อเช็คว่าทำเสร็จ",
      "ทุกงานที่เสร็จจะได้รับ +20 คะแนน",
      "กดซ้ำอีกครั้งเพื่อยกเลิกสถานะเสร็จ",
    ],
    accent: "from-emerald-500 to-green-400",
    iconBg: "bg-emerald-50 text-emerald-500",
  },
  {
    number: 3,
    icon: Trash2,
    title: "ลบรายการ",
    description: "ลบรายการที่ไม่ต้องการออกได้ทันที",
    details: [
      "กดไอคอนถังขยะ 🗑️ ทางขวาของรายการ",
      "รายการจะถูกลบทันที",
    ],
    accent: "from-rose-500 to-pink-400",
    iconBg: "bg-rose-50 text-rose-500",
  },
  {
    number: 4,
    icon: StickyNote,
    title: "บันทึกโน้ต (NoteH.)",
    description: "เขียนบันทึก ไอเดีย หรือสรุปเนื้อหาสำคัญ",
    details: [
      "กดเมนู Menu > NoteH. ที่แถบด้านบน",
      "กดปุ่ม \"+\" เพื่อสร้างโน้ตใหม่",
      "ตั้งชื่อโน้ต แล้วพิมพ์เนื้อหาได้เลย",
      "ใช้ปุ่ม ตัวหนา / ตัวเอียง / ไฮไลท์ เพื่อจัดรูปแบบ",
      "มีเครื่องคิดเลขในตัวสำหรับคำนวณเลข",
      "กดไอคอน 💾 เพื่อบันทึก",
    ],
    accent: "from-amber-500 to-orange-400",
    iconBg: "bg-amber-50 text-amber-500",
  },
  {
    number: 5,
    icon: Trophy,
    title: "ดูอันดับ (Ranking)",
    description: "แข่งขันกับผู้ใช้คนอื่นด้วยระบบคะแนนสะสม",
    details: [
      "กดแท็บ \"อันดับ\" ในหน้า Todolist",
      "คะแนนจะเพิ่มทุกครั้งที่เช็คงานเสร็จ",
      "Rank มีหลายระดับ: Bronze → Silver → Gold → Platinum → Diamond → Radiant",
      "ผู้ใช้ที่มีคะแนนสูงสุดจะอยู่อันดับ 1 🏆",
    ],
    accent: "from-violet-500 to-purple-400",
    iconBg: "bg-violet-50 text-violet-500",
  },
  {
    number: 6,
    icon: LayoutDashboard,
    title: "Dashboard & แก้ไขโปรไฟล์",
    description: "ดูสถิติของตัวเองและแก้ไขข้อมูลส่วนตัว",
    details: [
      "กดที่รูปโปรไฟล์มุมขวาบน > Dashboard",
      "ดูจำนวนงานทั้งหมด งานเสร็จ งานค้าง",
      "ดูกราฟสัดส่วนงาน และระดับ Rank ปัจจุบัน",
      "กดปุ่ม \"แก้ไข\" เพื่อเปลี่ยนชื่อ เบอร์โทร และอีเมล",
    ],
    accent: "from-indigo-500 to-blue-400",
    iconBg: "bg-indigo-50 text-indigo-500",
  },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  // Show loading while checking auth OR if redirecting
  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-background to-pink-50/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-chart-2/5 blur-[100px]" />

      {/* Header */}
      <section className="relative mx-auto max-w-4xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Welcome Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm"
          >
            <BookOpen className="h-4 w-4" />
            คู่มือการใช้งาน
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            วิธีใช้งาน{" "}
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-clip-text text-transparent">
              Todolish
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-xl text-base text-muted-foreground"
          >
            สวัสดี {user.display_name}! ทำตามขั้นตอนด้านล่างเพื่อเริ่มใช้งานได้เลย
          </motion.p>

          {/* CTA — Get Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            <Link href="/todolist#list" passHref>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-chart-2 px-8 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                เริ่มต้นใช้งาน
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Steps Guide */}
      <section className="relative mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Timeline line */}
        <div className="absolute left-1/2 top-0 bottom-20 hidden w-px -translate-x-1/2 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent lg:block" />

        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 0;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              >
                <div className="group relative rounded-2xl border border-border/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:bg-white/90">
                  {/* Step number badge */}
                  <div className="absolute -top-3 left-6">
                    <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${step.accent} px-3 py-1 text-xs font-bold text-white shadow-md`}>
                      <Sparkles className="h-3 w-3" />
                      ขั้นตอนที่ {step.number}
                    </div>
                  </div>

                  <div className="mt-2 flex items-start gap-4">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.iconBg} transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {step.description}
                      </p>

                      {/* Detail list */}
                      <ul className="mt-3 space-y-2">
                        {step.details.map((detail, j) => (
                          <motion.li
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 + j * 0.05 }}
                            className="flex items-start gap-2.5 text-sm text-foreground/80"
                          >
                            <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r ${step.accent} text-[10px] font-bold text-white`}>
                              {j + 1}
                            </span>
                            <span>{detail}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-white/80 to-chart-2/5 p-8 text-center shadow-sm backdrop-blur-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-chart-2 shadow-lg shadow-primary/25">
            <MousePointerClick className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            พร้อมแล้ว? เริ่มเลย!
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            ตอนนี้คุณรู้วิธีใช้งานทั้งหมดแล้ว กดปุ่มด้านล่างเพื่อเริ่มจัดการงานของคุณ
          </p>
          <Link href="/todolist#list" passHref>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-chart-2 px-10 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              เริ่มใช้งาน Todolish
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
