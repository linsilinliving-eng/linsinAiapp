import { z } from "zod";

export const productGroupSchema = z.object({
  uuid: z.string().optional(),
  code: z.string().min(1, "กรุณากรอกรหัสกลุ่มสินค้า"),
  name: z.string().min(1, "กรุณากรอกชื่อกลุ่มสินค้า"),
  item_index: z.number().int().optional().default(1),
  groupmain_id: z.array(z.string()).optional().default([]),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type ProductGroup = z.infer<typeof productGroupSchema>;
