import { z } from "zod";

export const productUnitSchema = z.object({
  uuid: z.string().optional(),
  unitname: z.string().min(1, "กรุณาระบุชื่อหน่วยสินค้า").max(200, "ชื่อหน่วยสินค้าต้องไม่เกิน 200 ตัวอักษร"),
  unit_index: z.coerce.number().int().default(0),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type ProductUnitInput = z.infer<typeof productUnitSchema>;
