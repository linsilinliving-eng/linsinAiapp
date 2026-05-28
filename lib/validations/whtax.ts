import { z } from "zod";

export const whtaxSchema = z.object({
  uuid: z.string().optional(),
  wht_docno: z.string().min(1, "กรุณาระบุเลขที่เอกสาร"),
  wht_date: z.string().optional(),
  wht_suppname: z.string().min(1, "กรุณาระบุชื่อผู้รับเงิน"),
  total_amount: z.number().optional(),
  whtax_amount: z.number().optional(),
  updated_by: z.string().optional(),
  created_by: z.string().optional(),
});
