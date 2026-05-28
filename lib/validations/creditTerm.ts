import { z } from "zod";

export const creditTermSchema = z.object({
  uuid: z.string().optional(),
  credit_id: z.string().min(1, "กรุณาระบุรหัสประเภทการจ่าย"),
  credit_name: z.string().min(1, "กรุณาระบุชื่อประเภทการจ่าย"),
  credit_day: z.number().min(0, "จำนวนวันต้องจำกัดเป็นบวก"),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type CreditTerm = z.infer<typeof creditTermSchema>;
