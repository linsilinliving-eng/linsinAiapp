import { z } from "zod";

export const bankSchema = z.object({
  uuid: z.string().optional(),
  bank_id: z.string().min(1, "กรุณากรอกรหัสธนาคาร"),
  bank_name: z.string().min(1, "กรุณากรอกชื่อธนาคาร"),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type Bank = z.infer<typeof bankSchema>;
