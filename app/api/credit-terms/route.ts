import db from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import { creditTermSchema } from "@/lib/validations/creditTerm";

export async function GET() {
  try {
    const data = await db("creditterm")
      .select("*")
      .orderBy("credit_id", "asc");
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to fetch credit terms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = creditTermSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { credit_id, credit_name, credit_day, created_by } = result.data;
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    
    await db("creditterm").insert({
      uuid: uuidv4().replace(/-/g, ''),
      credit_id,
      credit_name,
      credit_day: credit_day || 0,
      created_at: now,
      created_by: created_by || 'system',
      updated_at: now,
      updated_by: created_by || 'system'
    });

    return Response.json({ message: "เพิ่มประเภทการจ่ายสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = creditTermSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { uuid, credit_id, credit_name, credit_day, updated_by } = result.data;

    if (!uuid) {
      return Response.json({ error: "Missing uuid" }, { status: 400 });
    }

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    await db("creditterm")
      .where("uuid", uuid)
      .update({
        credit_id,
        credit_name,
        credit_day: credit_day || 0,
        updated_at: now,
        updated_by: updated_by || 'system'
      });

    return Response.json({ message: "อัปเดตประเภทการจ่ายสำเร็จ" });
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

    await db("creditterm").where("uuid", uuid).del();

    return Response.json({ message: "ลบประเภทการจ่ายสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
