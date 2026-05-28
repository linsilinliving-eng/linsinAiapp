@AGENTS.md

## Reference files

- `public/boq/BOQ680315.html` — ต้นฉบับ BOQ จริง (static HTML ของ LinSiLin Living) ใช้เปรียบเทียบ layout/ข้อมูล
- `boq_calc.js` — formula engine (CommonJS): `computeQty`, `computePrice`, `calcBoqItem`, `f2`
- `test-boq.js` — unit tests สำหรับ formula engine

## Dev commands

```bash
# เปิด BOQ ต้นฉบับใน browser
start http://localhost:3000/boq/BOQ680315.html

# รัน formula tests
node test-boq.js

# ตรวจ syntax
node -c boq_calc.js

# ดู exports
node -e "const b = require('./boq_calc.js'); console.log(Object.keys(b))"
```

## BOQ formulas

| กลุ่ม | ประเภท | สูตร | หน่วย |
|-------|--------|------|-------|
| G1 | wave, lon, sfold | `(W × faceW × (H + 0.5)) / 0.9144` | yd |
| G2 | roller, wood, net | `W × H × 1.196` | sqy |
| G4 | roman | `W × H × 1.196` | sqy |

- **faceW default**: wave/lon = 1.20, sfold = 1.40 (สามารถ override จาก `face_width` ของ product)
- **discount default**: 30%
- `f2(n)` — format Thai number 2 decimal places
