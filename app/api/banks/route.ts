import { NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { bankSchema } from "@/lib/validations/bank";

export async function GET() {
  try {
    const banks = await db("bank").select("*").orderBy("bank_id", "asc");
    return NextResponse.json(banks);
  } catch (error) {
    console.error("GET Bank Error:", error);
    return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = bankSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { bank_id, bank_name, created_by } = result.data;
    const newUuid = uuidv4();

    await db("bank").insert({
      uuid: newUuid,
      bank_id,
      bank_name,
      created_by,
      updated_by: created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Bank created successfully" });
  } catch (error) {
    console.error("POST Bank Error:", error);
    return NextResponse.json({ error: "Failed to create bank" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uuid, ...updateData } = body;

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const result = bankSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    await db("bank")
      .where({ uuid })
      .update({
        bank_id: updateData.bank_id,
        bank_name: updateData.bank_name,
        updated_by: updateData.updated_by,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ message: "Bank updated successfully" });
  } catch (error) {
    console.error("PUT Bank Error:", error);
    return NextResponse.json({ error: "Failed to update bank" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    await db("bank").where({ uuid }).delete();

    return NextResponse.json({ message: "Bank deleted successfully" });
  } catch (error) {
    console.error("DELETE Bank Error:", error);
    return NextResponse.json({ error: "Failed to delete bank" }, { status: 500 });
  }
}
