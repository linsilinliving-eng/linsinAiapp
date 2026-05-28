import { NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { groupMainSchema } from "@/lib/validations/groupMain";

export async function GET() {
  try {
    const groups = await db("groupmain").select("*").orderBy("groupmain_id", "asc");
    return NextResponse.json(groups);
  } catch (error) {
    console.error("GET GroupMain Error:", error);
    return NextResponse.json({ error: "Failed to fetch main groups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = groupMainSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { groupmain_id, groupmain_name, groupmain_max, item_index, created_by } = result.data;
    const newUuid = uuidv4();

    await db("groupmain").insert({
      uuid: newUuid,
      groupmain_id,
      groupmain_name,
      groupmain_max,
      item_index,
      created_by,
      updated_by: created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Main group created successfully" });
  } catch (error) {
    console.error("POST GroupMain Error:", error);
    return NextResponse.json({ error: "Failed to create main group" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uuid, ...updateData } = body;

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const result = groupMainSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    await db("groupmain")
      .where({ uuid })
      .update({
        groupmain_id: updateData.groupmain_id,
        groupmain_name: updateData.groupmain_name,
        groupmain_max: updateData.groupmain_max,
        item_index: updateData.item_index,
        updated_by: updateData.updated_by,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ message: "Main group updated successfully" });
  } catch (error) {
    console.error("PUT GroupMain Error:", error);
    return NextResponse.json({ error: "Failed to update main group" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    await db("groupmain").where({ uuid }).delete();

    return NextResponse.json({ message: "Main group deleted successfully" });
  } catch (error) {
    console.error("DELETE GroupMain Error:", error);
    return NextResponse.json({ error: "Failed to delete main group" }, { status: 500 });
  }
}
