"use client";

import { useIsomorphicEffect } from "@mantine/hooks";

export default function ScriptClean() {
  useIsomorphicEffect(() => {
    // ป้องกันการทำงานของ script ในโหมด hydration ที่ไม่จำเป็น
  }, []);
  return null;
}
