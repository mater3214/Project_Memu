import { NextRequest, NextResponse } from "next/server";
import { getUpcomingNotifications, markNotified } from "@/lib/supabase";
import { pushMessage } from "@/lib/line";

// 5 ข้อความให้กำลังใจ สุ่มส่งแต่ละครั้ง
const MOTIVATIONAL_MESSAGES = [
  "💪 ลุกขึ้นมาทำเลย! ทำเสร็จวันนี้ พรุ่งนี้สบายใจ!",
  "🔥 อย่าปล่อยให้ความขี้เกียจชนะ! ลงมือทำเดี๋ยวนี้เลย!",
  "⚡ แค่เริ่มลงมือทำ ที่เหลือจะง่ายเอง! สู้ๆ!",
  "🎯 คุณเก่งกว่าที่คิด! ลุกขึ้นมาพิสูจน์ตัวเองเลย!",
  "🏆 ทุกรายการที่ทำเสร็จ คือก้าวสู่ความสำเร็จ! เริ่มเลย!",
];

function getRandomMotivation(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && cronSecret !== "your-random-secret-here" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todos = await getUpcomingNotifications();
    let sent = 0;

    for (const todo of todos) {
      const lineUserId = (todo as any).users?.line_user_id || (todo as any).user_line_id;
      if (!lineUserId) continue;

      // Skip web-only users (placeholder LINE IDs)
      if (lineUserId.startsWith("web_")) continue;

      const title = (todo as any).title;
      const points = (todo as any).points_reward || 20;
      const location = (todo as any).location;
      const motivation = getRandomMotivation();

      // Build notification message
      let message = `⏰ ใกล้ถึงเวลาแล้ว!\n\n`;
      message += `📋 รายการ: ${title}\n`;
      if (location) message += `📍 สถานที่: ${location}\n`;
      message += `⭐ รางวัล: +${points} pts\n\n`;
      message += `ให้เตรียมตัวหรือเริ่มปฏิบัติตามรายการได้แล้ว!\n`;
      message += `ทำเสร็จแล้วจะได้รับ ${points} คะแนน 🎉\n\n`;
      message += motivation;

      await pushMessage(lineUserId, message);
      await markNotified((todo as any).id);
      sent++;
    }

    return NextResponse.json({ success: true, sent, checked: todos.length });
  } catch (error: any) {
    console.error("Cron notify error:", error);
    return NextResponse.json(
      { error: error.message || "Cron failed" },
      { status: 500 }
    );
  }
}
