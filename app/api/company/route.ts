import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const company = await db("company").first();
    return NextResponse.json(company || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      company_name,
      company_taxid,
      branch_name,
      branch_no,
      company_address1,
      company_sing,
      company_tel,
      company_email,
      company_fax,
      purchase_tel,
      purchase_email,
      purchase_address,
      purchase_confirm,
      updated_by,
    } = body;

    await db("company").where("uuid", body.uuid).update({
      company_name,
      company_taxid,
      branch_name,
      branch_no,
      company_address1,
      company_sing,
      company_tel,
      company_email,
      company_fax,
      purchase_tel,
      purchase_email,
      purchase_address,
      purchase_confirm,
      updated_by,
      updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    });

    const updated = await db("company").where("uuid", body.uuid).first();
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
