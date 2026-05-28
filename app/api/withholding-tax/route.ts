import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { withholdingTaxSchema } from "@/lib/validations/withholdingTax";

export async function GET() {
  try {
    const data = await db("withholdingtax")
      .select("*")
      .orderBy("whtax_index", "asc");
    return Response.json(data);
  } catch (error: any) {
    console.error("GET WHT Error:", error);
    return Response.json({ error: "Failed to fetch data: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = withholdingTaxSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { whtax_name, whtax_rate, whtax_index, wht_condition, created_by } = result.data;
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    
    await db("withholdingtax").insert({
      whtax_id: uuidv4(),
      whtax_name,
      whtax_rate: Number(whtax_rate) || 0,
      whtax_index: Number(whtax_index) || 0,
      wht_condition: wht_condition || "1",
      created_at: now,
      created_by: created_by || "system",
      updated_at: now,
      updated_by: created_by || "system"
    });

    return Response.json({ message: "เพิ่มข้อมูลสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = withholdingTaxSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { whtax_id, whtax_name, whtax_rate, whtax_index, wht_condition, updated_by } = result.data;

    if (!whtax_id) {
      return Response.json({ error: "Missing whtax_id" }, { status: 400 });
    }

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    await db("withholdingtax")
      .where("whtax_id", whtax_id)
      .update({
        whtax_name,
        whtax_rate: Number(whtax_rate),
        whtax_index: Number(whtax_index),
        wht_condition,
        updated_at: now,
        updated_by: updated_by || "system"
      });

    return Response.json({ message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }

    await db("withholdingtax").where("whtax_id", id).del();

    return Response.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
