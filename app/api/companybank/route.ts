import { NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const rows = await db("companybank").select("*").orderBy("code");
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const uuid = uuidv4().replace(/-/g, "");
    await db("companybank").insert({
      uuid,
      code: body.code || "",
      name: body.name || "",
      branch: body.branch || "",
      bookno: body.bookno || "",
      created_by: body.created_by || "",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    const created = await db("companybank").where("uuid", uuid).first();
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
