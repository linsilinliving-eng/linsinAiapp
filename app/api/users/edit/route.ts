import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, role, password } = body;

    const data: any = { name, email, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    await db("users").where({ id }).update(data);
    return Response.json({ message: "User updated successfully" });
  } catch (error: any) {
    return Response.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("ID is required");

    await db("users").where({ id }).del();
    return Response.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return Response.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
