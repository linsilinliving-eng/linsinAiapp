import { z } from "zod";

export const productSchema = z.object({
  uuid: z.string().optional(),
  product_code: z.string().min(1, "กรอกรหัสสินค้า"),
  product_name: z.string().optional().default(""),
  product_group: z.string().min(1, "เลือกกลุ่มสินค้า"),
  supplier_code: z.string().optional().default(""),
  stock_status: z.string().optional().default("N"),
  sale_price: z.number().min(0).optional().default(0),
  purchase_price: z.number().min(0).optional().default(0),
  cloth_face: z.number().min(0).optional().default(0),
  product_unit: z.string().min(1, "เลือกหน่วยสินค้า"),
  type_price: z.string().optional().default("UNIT"),
  product_status: z.string().optional().default("Y"),
  product_lower: z.number().min(0).optional().default(0),
  width_start: z.number().min(0).optional().default(0),
  width_end: z.number().min(0).optional().default(0),
  item_kg: z.number().min(0).optional().default(0),
  item_type: z.string().optional().default(""),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;
