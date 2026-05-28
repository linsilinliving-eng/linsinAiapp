import db from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import { hookSizeSchema } from "@/lib/validations/hookSize";

export async function GET() {
  try {
    const data = await db("hooksize")
      .select("*")
      .orderBy("hook_size", "asc");
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to fetch hook sizes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = hookSizeSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { hook_size, desc, hook_status, created_by } = result.data;
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    
    await db("hooksize").insert({
      uuid: uuidv4().replace(/-/g, ''),
      hook_size,
      desc: desc || '',
      hook_status: hook_status || 'Y',
      created_at: now,
      created_by: created_by || 'system',
      updated_at: now,
      updated_by: created_by || 'system'
    });

    return Response.json({ message: "เพิ่มข้อมูลขนาดห่วง/ตะขอสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = hookSizeSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { uuid, hook_size, desc, hook_status, updated_by } = result.data;

    if (!uuid) {
      return Response.json({ error: "Missing uuid" }, { status: 400 });
    }

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    await db("hooksize")
      .where("uuid", uuid)
      .update({
        hook_size,
        desc: desc || '',
        hook_status: hook_status || 'Y',
        updated_at: now,
        updated_by: updated_by || 'system'
      });

    return Response.json({ message: "อัปเดตข้อมูลขนาดห่วง/ตะขอสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return Response.json({ error: "Missing uuid" }, { status: 400 });
    }

    await db("hooksize").where("uuid", uuid).del();

    return Response.json({ message: "ลบข้อมูลขนาดห่วง/ตะขอสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
