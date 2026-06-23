"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Loader2,
  UserPlus,
  ListPlus,
  CheckSquare,
  Trophy,
  StickyNote,
  LayoutDashboard,
  Bell,
  MousePointerClick,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Step {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
  accent: string;
  accentBg: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: UserPlus,
    title: "สมัครสมาชิก / เข้าสู่ระบบ",
    description: "สร้างบัญชีใหม่หรือเข้าสู่ระบบด้วยชื่อผู้ใช้ที่คุณตั้งไว้",
    details: [
      "กดปุ่ม \"เข้าสู่ระบบ\" ที่มุมขวาบน",
      "กรอกชื่อผู้ใช้และรหัสผ่าน แล้วกด Login",
      "ถ้ายังไม่มีบัญชี กดสลับไปที่หน้า \"สมัครสมาชิก\"",
    ],
    accent: "text-blue-600",
    accentBg: "bg-blue-500",
  },
  {
    number: 2,
    icon: ListPlus,
    title: "เพิ่มรายการ Todo",
    description: "สร้างรายการสิ่งที่ต้องทำใหม่ ตั้งรายละเอียดและกำหนดเวลา",
    details: [
      "พิมพ์ชื่อรายการในช่อง \"เพิ่มรายการใหม่...\"",
      "กรอกรายละเอียด, สถานที่, และวันครบกำหนด (ไม่บังคับ)",
      "เลือกติดดาวเป็นรายการสำคัญได้",
      "กดปุ่ม \"เพิ่มรายการ\" เพื่อบันทึก",
    ],
    accent: "text-emerald-600",
    accentBg: "bg-emerald-500",
  },
  {
    number: 3,
    icon: CheckSquare,
    title: "เช็คทำเสร็จ / ลบรายการ",
    description: "เมื่อทำสำเร็จให้กดเช็คเพื่อรับคะแนน หรือลบรายการที่ไม่ต้องการ",
    details: [
      "กดปุ่ม ✓ ที่ด้านซ้ายของรายการเพื่อเช็คเสร็จ",
      "ได้รับ +20 คะแนนต่อรายการที่ทำเสร็จ",
      "กดปุ่มถังขยะ 🗑️ เพื่อลบรายการ",
      "สลับแท็บ \"ทั้งหมด / เหลือ / เสร็จแล้ว\" ที่ด้านบน",
    ],
    accent: "text-violet-600",
    accentBg: "bg-violet-500",
  },
  {
    number: 4,
    icon: Trophy,
    title: "ระบบ Rank & คะแนน",
    description: "สะสมคะแนนจากการทำรายการเสร็จ เพื่อเลื่อนอันดับ",
    details: [
      "กดแท็บ \"อันดับ\" ในหน้า Todolist เพื่อดูอันดับ",
      "Rank เริ่มจาก Bronze → Silver → Gold → Platinum → Diamond → Radiant",
      "คะแนนสะสมจากทุกรายการที่ทำเสร็จ",
      "แข่งขันกับผู้ใช้คนอื่นในระบบได้",
    ],
    accent: "text-amber-600",
    accentBg: "bg-amber-500",
  },
  {
    number: 5,
    icon: StickyNote,
    title: "NoteH. — บันทึกส่วนตัว",
    description: "เขียนบันทึกย่อ ไอเดีย หรือเรื่องสำคัญที่ต้องจดไว้",
    details: [
      "กดเมนู Menu > NoteH. ที่แถบด้านบน",
      "กดปุ่ม + เพื่อสร้างบันทึกใหม่",
      "ตั้งหัวข้อ พิมพ์เนื้อหา แล้วกด Save",
      "ใช้ปุ่มตกแต่ง: ตัวหนา, ตัวเอียง, ไฮไลท์ข้อความ",
    ],
    accent: "text-orange-600",
    accentBg: "bg-orange-500",
  },
  {
    number: 6,
    icon: LayoutDashboard,
    title: "Dashboard — ดูสถิติ",
    description: "ตรวจสอบความคืบหน้าและจัดการโปรไฟล์ของคุณ",
    details: [
      "กดที่โปรไฟล์ (มุมขวาบน) > Dashboard",
      "ดูจำนวนรายการทั้งหมด, เสร็จแล้ว, เหลืออยู่",
      "ดูกราฟสรุปผลรายสัปดาห์",
      "แก้ไขชื่อ, เบอร์โทร, อีเมลในโปรไฟล์ได้",
    ],
    accent: "text-indigo-600",
    accentBg: "bg-indigo-500",
  },
  {
    number: 7,
    icon: Bell,
    title: "การแจ้งเตือนผ่าน LINE",
    description: "รับการแจ้งเตือนรายการที่ใกล้ครบกำหนดผ่าน LINE Bot",
    details: [
      "ใส่ LINE User ID ในหน้า Dashboard",
      "เพิ่ม LINE Bot เป็นเพื่อนตาม QR Code",
      "ระบบจะแจ้งเตือนอัตโนมัติก่อนถึงวันกำหนด",
      "สั่ง Bot ดูรายการ, เพิ่ม, หรือเช็คเสร็จผ่าน LINE ได้",
    ],
    accent: "text-green-600",
    accentBg: "bg-green-500",
  },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

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

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  const scrollToSteps = () => {
    stepsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40" />
      <div className="absolute top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-[100px]" />

      {/* Hero — How to use */}
      <section className="relative mx-auto max-w-4xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4" />
          สวัสดี, {user.display_name}!
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
        >
          วิธีใช้งาน{" "}
          <span className="bg-gradient-to-r from-primary via-chart-2 to-violet-500 bg-clip-text text-transparent">
            Todolish
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto"
        >
          ทำตามขั้นตอนด้านล่างเพื่อเริ่มจัดการงาน บันทึก และสะสมคะแนนของคุณ
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
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
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToSteps}
            className="gap-2"
          >
            <MousePointerClick className="h-4 w-4" />
            ดูขั้นตอนทั้งหมด
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </section>

      {/* Steps */}
      <section
        ref={stepsRef}
        className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8"
      >
        {/* Timeline line */}
        <div className="absolute left-[2.15rem] sm:left-[2.4rem] top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary/30 via-violet-400/20 to-transparent hidden sm:block" />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isExpanded = expandedStep === step.number;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : step.number)
                  }
                  className="w-full text-left"
                >
                  <div
                    className={`group relative flex items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                      isExpanded
                        ? "border-primary/30 bg-white shadow-lg shadow-primary/5"
                        : "border-border/40 bg-white/60 hover:bg-white hover:shadow-md hover:border-border/60"
                    }`}
                  >
                    {/* Step Number Circle */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm shadow-md transition-transform duration-300 ${
                        isExpanded
                          ? `${step.accentBg} scale-110`
                          : `${step.accentBg} group-hover:scale-105`
                      }`}
                    >
                      {step.number}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4.5 w-4.5 ${step.accent} shrink-0`} />
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>

                      {/* Expanded Details */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: isExpanded ? "auto" : 0,
                          opacity: isExpanded ? 1 : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-3 space-y-2 border-t border-border/30 pt-3">
                          {step.details.map((detail, di) => (
                            <motion.li
                              key={di}
                              initial={{ opacity: 0, x: -8 }}
                              animate={
                                isExpanded
                                  ? { opacity: 1, x: 0 }
                                  : { opacity: 0, x: -8 }
                              }
                              transition={{
                                duration: 0.2,
                                delay: isExpanded ? di * 0.06 : 0,
                              }}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span
                                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${step.accentBg}`}
                              />
                              {detail}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    {/* Expand indicator */}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-violet-500/5 to-chart-2/5 p-8 backdrop-blur-sm"
        >
          <h2 className="text-xl font-bold text-foreground">
            พร้อมเริ่มใช้งานแล้วหรือยัง?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            กดปุ่มด้านล่างเพื่อเข้าสู่หน้า Todolist และเริ่มจัดการงานของคุณ
          </p>
          <Link href="/todolist#list" passHref>
            <Button
              size="lg"
              className="mt-5 bg-gradient-to-r from-primary to-chart-2 px-8 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              เริ่มต้นใช้งาน
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
