import db from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import { deliveryToSchema } from "@/lib/validations/deliveryTo";

export async function GET() {
  try {
    const data = await db("deliveryto")
      .select("*")
      .orderBy("dl_code", "asc");
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to fetch delivery locations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = deliveryToSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { dl_code, dl_name, dl_index, created_by } = result.data;
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    
    await db("deliveryto").insert({
      uuid: uuidv4().replace(/-/g, ''),
      dl_code,
      dl_name,
      dl_index: dl_index || 30,
      created_at: now,
      created_by: created_by || 'system',
      updated_at: now,
      updated_by: created_by || 'system'
    });

    return Response.json({ message: "เพิ่มสถานที่จัดส่งสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = deliveryToSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { uuid, dl_code, dl_name, dl_index, updated_by } = result.data;

    if (!uuid) {
      return Response.json({ error: "Missing uuid" }, { status: 400 });
    }

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    await db("deliveryto")
      .where("uuid", uuid)
      .update({
        dl_code,
        dl_name,
        dl_index: dl_index || 30,
        updated_at: now,
        updated_by: updated_by || 'system'
      });

    return Response.json({ message: "อัปเดตสถานที่จัดส่งสำเร็จ" });
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

    await db("deliveryto").where("uuid", uuid).del();

    return Response.json({ message: "ลบสถานที่จัดส่งสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
