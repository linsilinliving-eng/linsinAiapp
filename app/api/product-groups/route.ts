import { NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { productGroupSchema } from "@/lib/validations/productGroup";

export async function GET() {
  try {
    const productGroups = await db("productgroup")
      .select("*")
      .orderBy("code", "asc");

    const mainGroups = await db("groupmain").select("groupmain_id", "groupmain_name");
    
    const transformed = productGroups.map(pg => {
      const selectedIds = pg.groupmain_id ? pg.groupmain_id.split(',') : [];
      const names = selectedIds
        .map((id: string) => mainGroups.find((mg: any) => mg.groupmain_id === id)?.groupmain_name)
        .filter(Boolean);
      
      return {
        ...pg,
        groupmain_name: names.length > 0 ? names.join(', ') : '-'
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("GET ProductGroup Error:", error);
    return NextResponse.json({ error: "Failed to fetch product groups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = productGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { code, name, item_index, groupmain_id, created_by } = result.data;
    const newUuid = uuidv4();

    await db("productgroup").insert({
      uuid: newUuid,
      code,
      name,
      item_index,
      groupmain_id: Array.isArray(groupmain_id) ? groupmain_id.join(',') : groupmain_id,
      created_by,
      updated_by: created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Product group created successfully" });
  } catch (error) {
    console.error("POST ProductGroup Error:", error);
    return NextResponse.json({ error: "Failed to create product group" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uuid, ...updateData } = body;

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const result = productGroupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    await db("productgroup")
      .where({ uuid })
      .update({
        code: updateData.code,
        name: updateData.name,
        item_index: updateData.item_index,
        groupmain_id: Array.isArray(updateData.groupmain_id) ? updateData.groupmain_id.join(',') : updateData.groupmain_id,
        updated_by: updateData.updated_by,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ message: "Product group updated successfully" });
  } catch (error) {
    console.error("PUT ProductGroup Error:", error);
    return NextResponse.json({ error: "Failed to update product group" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    await db("productgroup").where({ uuid }).delete();

    return NextResponse.json({ message: "Product group deleted successfully" });
  } catch (error) {
    console.error("DELETE ProductGroup Error:", error);
    return NextResponse.json({ error: "Failed to delete product group" }, { status: 500 });
  }
}
