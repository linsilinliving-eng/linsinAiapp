import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await db("users")
      .select("id", "name", "email", "role", "created_at")
      .orderBy("created_at", "desc");
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db("users").where("email", email).first();
    if (existingUser) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db("users").insert({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    return Response.json({ message: "User created successfully" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
