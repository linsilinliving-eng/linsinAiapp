import { z } from "zod";

export const withholdingTaxSchema = z.object({
  whtax_id: z.string().optional(),
  whtax_index: z.number().optional(),
  whtax_name: z.string().min(1, "กรุณาระบุชื่อรายการ"),
  whtax_rate: z.number().min(0, "อัตราภาษีต้องไม่ติดลบ"),
  wht_condition: z.string().optional(),
  updated_by: z.string().optional(),
  created_by: z.string().optional(),
});
