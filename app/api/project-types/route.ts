import db from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { projectTypeSchema } from "@/lib/validations/projectType";

export async function GET() {
  try {
    const data = await db("projecttype")
      .select("*")
      .orderBy("created_at", "desc");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = projectTypeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { project_type, created_by } = result.data;
    const uuid = uuidv4();

    await db("projecttype").insert({
      uuid,
      project_type,
      created_by,
      created_at: new Date().toISOString(),
      updated_by: created_by,
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, uuid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uuid, project_type, updated_by } = body;

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    await db("projecttype")
      .where("uuid", uuid)
      .update({
        project_type,
        updated_by,
        updated_at: new Date().toISOString()
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    await db("projecttype").where("uuid", uuid).del();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
