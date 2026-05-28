import { z } from "zod";

export const deliveryToSchema = z.object({
  uuid: z.string().optional(),
  dl_code: z.string().min(1, "กรุณาระบุรหัสสถานที่จัดส่ง"),
  dl_name: z.string().min(1, "กรุณาระบุชื่อสถานที่จัดส่ง"),
  dl_index: z.number().optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type DeliveryTo = z.infer<typeof deliveryToSchema>;
