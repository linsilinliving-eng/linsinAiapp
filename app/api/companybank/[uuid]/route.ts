import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    const body = await request.json();
    await db("companybank").where("uuid", uuid).update({
      code: body.code,
      name: body.name,
      branch: body.branch,
      bookno: body.bookno,
      updated_by: body.updated_by || "",
      updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    const updated = await db("companybank").where("uuid", uuid).first();
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    await db("companybank").where("uuid", uuid).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
