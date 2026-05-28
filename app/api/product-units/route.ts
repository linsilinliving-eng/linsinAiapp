import db from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import { productUnitSchema } from "@/lib/validations/productUnit";

export async function GET() {
  try {
    const units = await db("productunit")
      .select("*")
      .orderBy("unit_index", "asc");
    return Response.json(units);
  } catch (error) {
    return Response.json({ error: "Failed to fetch product units" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = productUnitSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { unitname, unit_index, created_by } = result.data;

    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    
    await db("productunit").insert({
      uuid: uuidv4(),
      unitname,
      unit_index: unit_index || 0,
      created_at: now,
      created_by: created_by || 'system',
      updated_at: now,
      updated_by: created_by || 'system'
    });

    return Response.json({ message: "เพิ่มหน่วยสินค้าสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = productUnitSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { uuid, unitname, unit_index, updated_by } = result.data;

    if (!uuid) {
      return Response.json({ error: "Missing uuid" }, { status: 400 });
    }

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    await db("productunit")
      .where("uuid", uuid)
      .update({
        unitname,
        unit_index,
        updated_at: now,
        updated_by: updated_by || 'system'
      });

    return Response.json({ message: "อัปเดตหน่วยสินค้าสำเร็จ" });
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

    await db("productunit").where("uuid", uuid).del();

    return Response.json({ message: "ลบหน่วยสินค้าสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
