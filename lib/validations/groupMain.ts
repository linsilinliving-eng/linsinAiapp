import { z } from "zod";

export const groupMainSchema = z.object({
  uuid: z.string().optional(),
  groupmain_id: z.string().min(1, "กรุณากรอกรหัสกลุ่มหลัก"),
  groupmain_name: z.string().min(1, "กรุณากรอกชื่อกลุ่มหลัก"),
  groupmain_max: z.number().int().optional().default(0),
  item_index: z.number().int().optional().default(0),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type GroupMain = z.infer<typeof groupMainSchema>;
