import { NextRequest, NextResponse } from "next/server";
import {
  getTodosByUser,
  createTodo,
  updateTodo,
  deleteTodo,
  getDashboardStats,
  getAdmin,
} from "@/lib/supabase";

// Helper: resolve "demo-user" to a real UUID from the database
async function resolveUserId(rawId: string | null): Promise<string | null> {
  if (!rawId) return null;
  if (rawId === "demo-user") {
    const admin = getAdmin();
    // Try to find existing demo user
    const { data: existing } = await admin
      .from("users")
      .select("id")
      .eq("line_user_id", "demo-user")
      .single();
    if (existing) return existing.id;
    // Create demo user if not exists
    const { data: created, error } = await admin
      .from("users")
      .insert({
        line_user_id: "demo-user",
        display_name: "Demo User",
        total_points: 0,
      })
      .select("id")
      .single();
    if (error) {
      console.error("Failed to create demo user:", error);
      return null;
    }
    return created?.id ?? null;
  }
  return rawId;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUserId = searchParams.get("userId");
  const stats = searchParams.get("stats");

  try {
    if (stats === "true") {
      // Global stats for home page
      if (!rawUserId) {
        const { data, error } = await getAdmin()
          .from("todos")
          .select("status");
        if (error) throw error;
        const completed = (data || []).filter(
          (t: { status: string }) => t.status === "completed"
        ).length;
        return NextResponse.json({ totalCompleted: completed });
      }
      const userId = await resolveUserId(rawUserId);
      if (!userId) {
        return NextResponse.json(
          { error: "Could not resolve user" },
          { status: 400 }
        );
      }
      const dashboardStats = await getDashboardStats(userId);
      return NextResponse.json(dashboardStats);
    }

    const userId = await resolveUserId(rawUserId);
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const todos = await getTodosByUser(userId);
    return NextResponse.json({ todos });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, title, description, location, due_date, is_important } =
      body;

    if (!user_id || !title) {
      return NextResponse.json(
        { error: "user_id and title are required" },
        { status: 400 }
      );
    }

    const resolvedUserId = await resolveUserId(user_id);
    if (!resolvedUserId) {
      return NextResponse.json(
        { error: "Could not resolve user" },
        { status: 400 }
      );
    }

    const insertData: any = {
      user_id: resolvedUserId,
      title,
      description,
      priority: 1,
      due_date: due_date || undefined,
      points_reward: 20,
      is_important: !!is_important,
    };
    if (location) insertData.location = location;

    const todo = await createTodo(insertData);

    return NextResponse.json({ todo });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create todo" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, title, description, due_date, is_important } = body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (due_date !== undefined) updates.due_date = due_date;
    if (is_important !== undefined) updates.is_important = is_important;

    // If status is changing, handle dynamic points
    if (status !== undefined) {
      // Get current todo to check old status and get all fields
      const { data: currentTodo } = await getAdmin()
        .from("todos")
        .select("status, points_reward, user_id, is_important, due_date, created_at")
        .eq("id", id)
        .single();

      if (currentTodo && currentTodo.status !== status) {
        // Get user's current points
        const { data: userData } = await getAdmin()
          .from("users")
          .select("total_points")
          .eq("id", currentTodo.user_id)
          .single();

        if (userData) {
          let newPoints = userData.total_points;
          if (status === "completed") {
            // If marking as completed, calculate points based on is_important and due_date
            const now = new Date();
            let calculatedPoints = 20; // base points

            const dueDate = currentTodo.due_date ? new Date(currentTodo.due_date) : null;

            if (!dueDate) {
              // No due date set - only 5 pts to encourage setting deadlines
              calculatedPoints = 5;
            } else {
              // Has due date
              const isLate = now > dueDate;

              if (currentTodo.is_important) {
                // Starred todo
                if (isLate) {
                  calculatedPoints = 15; // -5 penalty for late
                } else {
                  calculatedPoints = 25; // +5 bonus for on-time
                }
              } else {
                // Unstarred todo
                if (isLate) {
                  calculatedPoints = 18; // -2 penalty for late (unstarred)
                } else {
                  calculatedPoints = 20; // base points on-time
                }
              }
            }

            updates.points_reward = calculatedPoints;
            updates.completed_at = now.toISOString();

            newPoints += calculatedPoints;
          } else if (status === "pending" && currentTodo.status === "completed") {
            // Reverting: subtract what was actually awarded
            newPoints = Math.max(0, newPoints - currentTodo.points_reward);
            // Reset points_reward to base 20 and clear completed_at
            updates.points_reward = 20;
            updates.completed_at = null;
          }

          await getAdmin()
            .from("users")
            .update({ total_points: newPoints })
            .eq("id", currentTodo.user_id);

          // Log the action
          if (status === "completed") {
            const awarded = updates.points_reward;
            await getAdmin().from("todo_logs").insert({
              todo_id: id,
              user_id: currentTodo.user_id,
              action: `completed (+${awarded}pts)`,
            });
          }
        }
      }
    }

    const todo = await updateTodo(id, updates);
    return NextResponse.json({ todo });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const success = await deleteTodo(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete todo" },
      { status: 500 }
    );
  }
}
