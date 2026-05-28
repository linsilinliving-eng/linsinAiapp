import { z } from "zod";

export const projectTypeSchema = z.object({
  uuid: z.string().optional(),
  project_type: z.string().min(1, "กรุณากรอกชื่อประเภทคู่ค้า"),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type ProjectType = z.infer<typeof projectTypeSchema>;
