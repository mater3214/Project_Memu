import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase";

// 5 ข้อความให้กำลังใจ สำหรับแสดงในเว็บ
const MOTIVATIONAL_MESSAGES = [
  "💪 ลุกขึ้นมาทำเลย! ทำเสร็จวันนี้ พรุ่งนี้สบายใจ!",
  "🔥 อย่าปล่อยให้ความขี้เกียจชนะ! ลงมือทำเดี๋ยวนี้เลย!",
  "⚡ แค่เริ่มลงมือทำ ที่เหลือจะง่ายเอง! สู้ๆ!",
  "🎯 คุณเก่งกว่าที่คิด! ลุกขึ้นมาพิสูจน์ตัวเองเลย!",
  "🏆 ทุกรายการที่ทำเสร็จ คือก้าวสู่ความสำเร็จ! เริ่มเลย!",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const now = new Date();
    const thaiNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    // Find pending todos that are due within the next 6 minutes (for ~5 min advance warning)
    const sixMinLater = new Date(thaiNow.getTime() + 6 * 60000);

    const { data, error } = await getAdmin()
      .from("todos")
      .select("id, title, location, points_reward, due_date, is_important")
      .eq("user_id", userId)
      .eq("status", "pending")
      .gte("due_date", thaiNow.toISOString())
      .lte("due_date", sixMinLater.toISOString());

    if (error) {
      console.error("notifications API error:", error);
      return NextResponse.json({ notifications: [] });
    }

    const notifications = (data || []).map((todo: any) => ({
      id: todo.id,
      title: todo.title,
      location: todo.location,
      points_reward: todo.points_reward,
      due_date: todo.due_date,
      is_important: todo.is_important,
      motivation: MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
    }));

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("notifications API error:", error);
    return NextResponse.json({ notifications: [] });
  }
}
