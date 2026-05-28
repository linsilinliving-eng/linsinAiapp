import { z } from "zod";

export const hookSizeSchema = z.object({
  uuid: z.string().optional(),
  hook_size: z.union([z.string(), z.number()]).refine((val) => val !== "", {
    message: "กรุณาระบุขนาดห่วง/ตะขอ",
  }),
  desc: z.string().optional().nullable(),
  hook_status: z.string().default("Y"),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type HookSize = z.infer<typeof hookSizeSchema>;
