import { NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { productSchema } from "@/lib/validations/product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const category = searchParams.get('category')?.trim() ?? '';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    let query = db('products')
      .select('id', 'code', 'name', 'category', 'ptype', 'price', 'unit', 'face_width', 'status', 'description', 'supplier')
      .where('status', 'active');

    if (category) query = query.where('category', category);
    if (q) {
      query = query.where((b: any) =>
        b.whereILike('code', `%${q}%`).orWhereILike('name', `%${q}%`)
      );
    }

    query = query.orderBy('name', 'asc');
    if (limit) query = query.limit(limit);

    const products = await query;
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;
    const newUuid = uuidv4().replace(/-/g, ''); // Table seems to use 32-char hex without dashes based on your example

    await db("product").insert({
      ...data,
      uuid: newUuid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Product created successfully" });
  } catch (error) {
    console.error("POST Product Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uuid, ...updateData } = body;

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const result = productSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    await db("product")
      .where({ uuid })
      .update({
        ...result.data,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("PUT Product Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    await db("product").where({ uuid }).delete();

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
