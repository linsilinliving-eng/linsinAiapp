const knex = require('knex')({client:'mysql2',connection:{host:'127.0.0.1',port:3306,user:'root',password:'',database:'linsilin_nextjs'}});

const data = [
  {code:'C0018',sub:'บึงคำพร้อย',dist:'ลำลูกกา',prov:'ปทุมธานี',postal:'12130'},
  {code:'C0020',sub:'บางเมือง',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10270'},
  {code:'C0021',sub:'ประชาธิปัตย์',dist:'ธัญบุรี',prov:'ปทุมธานี',postal:'12130'},
  {code:'C0031',sub:'บางพลีใหญ่',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0035',sub:'ไทรม้า',dist:'เมืองนนทบุรี',prov:'นนทบุรี',postal:'11000'},
  {code:'C0036',sub:'ไทรม้า',dist:'เมืองนนทบุรี',prov:'นนทบุรี',postal:'11000'},
  {code:'C0040',sub:'ศาลากลาง',dist:'บางกรวย',prov:'นนทบุรี',postal:'11130'},
  {code:'C0052',sub:'คลองเตยเหนือ',dist:'วัฒนา',prov:'กรุงเทพมหานคร',postal:'10110'},
  {code:'C0053',sub:'มหาสวัสดิ์',dist:'บางกรวย',prov:'นนทบุรี',postal:'11130'},
  {code:'C0055',sub:'ธรรมศาลา',dist:'เมืองนครปฐม',prov:'นครปฐม',postal:'73000'},
  {code:'C0061',sub:'คลองเตย',dist:'คลองเตย',prov:'กรุงเทพมหานคร',postal:'10110'},
  {code:'C0064',sub:'จันทนิมิต',dist:'เมืองจันทบุรี',prov:'จันทบุรี',postal:'22000'},
  {code:'C0068',sub:'นาแส่ง',dist:'เกาะคา',prov:'ลำปาง',postal:'52130'},
  {code:'C0069',sub:'พันท้ายนรสิงห์',dist:'เมืองสมุทรสาคร',prov:'สมุทรสาคร',postal:'74000'},
  {code:'C0070',sub:'จอมพล',dist:'จตุจักร',prov:'กรุงเทพมหานคร',postal:'10900'},
  {code:'C0075',sub:'บ้านชี',dist:'บ้านหมี่',prov:'ลพบุรี',postal:'15180'},
  {code:'C0085',sub:'หนองปรือ',dist:'บางละมุง',prov:'ชลบุรี',postal:'20150'},
  {code:'C0088',sub:'บางกระสอ',dist:'เมืองนนทบุรี',prov:'นนทบุรี',postal:'11000'},
  {code:'C0091',sub:'ท่าม่วง',dist:'ท่าม่วง',prov:'กาญจนบุรี',postal:'71110'},
  {code:'C0093',sub:'ไทรใหญ่',dist:'ไทรน้อย',prov:'นนทบุรี',postal:'11150'},
  {code:'C0095',sub:'เทพารักษ์',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10270'},
  {code:'C0096',sub:'บางเขน',dist:'เมืองนนทบุรี',prov:'นนทบุรี',postal:'11000'},
  {code:'C0097',sub:'ราชาเทวะ',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0098',sub:'ลุมพินี',dist:'ปทุมวัน',prov:'กรุงเทพมหานคร',postal:'10330'},
  {code:'C0099',sub:'บางพูน',dist:'เมืองปทุมธานี',prov:'ปทุมธานี',postal:'12000'},
  {code:'C0100',sub:'ลุมพินี',dist:'ปทุมวัน',prov:'กรุงเทพมหานคร',postal:'10330'},
  {code:'C0101',sub:'ศาลากลาง',dist:'บางกรวย',prov:'นนทบุรี',postal:'11130'},
  {code:'C0103',sub:'ศาลากลาง',dist:'บางกรวย',prov:'นนทบุรี',postal:'11130'},
  {code:'C0104',sub:'บางโคล่',dist:'บางคอแหลม',prov:'กรุงเทพมหานคร',postal:'10120'},
  {code:'C0106',sub:'บางขุนกอง',dist:'บางกรวย',prov:'นนทบุรี',postal:'11130'},
  {code:'C0118',sub:'บางซื่อ',dist:'บางซื่อ',prov:'กรุงเทพมหานคร',postal:'10800'},
  {code:'C0119',sub:'ออเงิน',dist:'สายไหม',prov:'กรุงเทพมหานคร',postal:'10220'},
  {code:'C0122',sub:'บางกะดี',dist:'เมืองปทุมธานี',prov:'ปทุมธานี',postal:'12000'},
  {code:'C0124',sub:'บ้านใหม่',dist:'ปากเกร็ด',prov:'นนทบุรี',postal:'11120'},
  {code:'C0131',sub:'สำโรงเหนือ',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10270'},
  {code:'C0132',sub:'บางแก้ว',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0139',sub:'บางปูใหม่',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10280'},
  {code:'C0142',sub:'หนองขาม',dist:'ศรีราชา',prov:'ชลบุรี',postal:'20230'},
  {code:'C0154',sub:'บางแก้ว',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0162',sub:'หนองตาแต้ม',dist:'ปราณบุรี',prov:'ประจวบคีรีขันธ์',postal:'77120'},
  {code:'C0163',sub:'บางเมือง',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10270'},
  {code:'C0169',sub:'บางตลาด',dist:'ปากเกร็ด',prov:'นนทบุรี',postal:'11120'},
  {code:'C0174',sub:'หนองหญ้าลาด',dist:'กันทรลักษ์',prov:'ศรีสะเกษ',postal:'33110'},
  {code:'C0183',sub:'บางรักพัฒนา',dist:'บางบัวทอง',prov:'นนทบุรี',postal:'11110'},
  {code:'C0185',sub:'บางแก้ว',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0187',sub:'บางแก้ว',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0188',sub:null,dist:'แหลมสิงห์',prov:'จันทบุรี',postal:'22130'},
  {code:'C0191',sub:'พันท้ายนรสิงห์',dist:'เมืองสมุทรสาคร',prov:'สมุทรสาคร',postal:'74000'},
  {code:'C0200',sub:'วัดเกต',dist:'เมืองเชียงใหม่',prov:'เชียงใหม่',postal:'50000'},
  {code:'C0208',sub:'ชะอม',dist:'แก่งคอย',prov:'สระบุรี',postal:'18110'},
  {code:'C0215',sub:'บางเมือง',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10270'},
  {code:'C0216',sub:'สะพานสูง',dist:'สะพานสูง',prov:'กรุงเทพมหานคร',postal:'10240'},
  {code:'C0217',sub:'หัวหิน',dist:'หัวหิน',prov:'ประจวบคีรีขันธ์',postal:'77110'},
  {code:'C0221',sub:'คูคต',dist:'ลำลูกกา',prov:'ปทุมธานี',postal:'12130'},
  {code:'C0222',sub:'ท่าระหัด',dist:'เมืองสุพรรณบุรี',prov:'สุพรรณบุรี',postal:'72000'},
  {code:'C0224',sub:'สวนหลวง',dist:'สวนหลวง',prov:'กรุงเทพมหานคร',postal:'10250'},
  {code:'C0227',sub:'บางรักพัฒนา',dist:'บางบัวทอง',prov:'นนทบุรี',postal:'11110'},
  {code:'C0248',sub:'นาหว้า',dist:'นาหว้า',prov:'นครพนม',postal:'48180'},
  {code:'C0254',sub:'ราชาเทวะ',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0262',sub:'ลุมพินี',dist:'ปทุมวัน',prov:'กรุงเทพมหานคร',postal:'10330'},
  {code:'C0264',sub:'บางแก้ว',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0275',sub:'ทรงคนอง',dist:'สามพราน',prov:'นครปฐม',postal:'73210'},
  {code:'C0280',sub:'บางแก้ว',dist:'บางพลี',prov:'สมุทรปราการ',postal:'10540'},
  {code:'C0282',sub:'ชะอม',dist:'แก่งคอย',prov:'สระบุรี',postal:'18110'},
  {code:'C0283',sub:'ปากน้ำ',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10270'},
  {code:'C0285',sub:'ในเมือง',dist:'เมืองอุบลราชธานี',prov:'อุบลราชธานี',postal:'34000'},
  {code:'C0293',sub:'ลุมพินี',dist:'ปทุมวัน',prov:'กรุงเทพมหานคร',postal:'10330'},
  {code:'C0306',sub:'ลำโพ',dist:'บางบัวทอง',prov:'นนทบุรี',postal:'11110'},
  {code:'C0313',sub:'หมูสี',dist:'ปากช่อง',prov:'นครราชสีมา',postal:'30450'},
  {code:'C0320',sub:'เทพารักษ์',dist:'เมืองสมุทรปราการ',prov:'สมุทรปราการ',postal:'10270'},
  {code:'C0324',sub:'คลองสวนพลู',dist:'พระนครศรีอยุธยา',prov:'พระนครศรีอยุธยา',postal:'13000'},
  {code:'C0333',sub:'ถนนพญาไท',dist:'ราชเทวี',prov:'กรุงเทพมหานคร',postal:'10400'},
];

(async () => {
  let updated = 0;
  for (const g of data) {
    const addr = await knex('customer_addresses as a')
      .join('customers as c', 'c.id', 'a.customer_id')
      .where('c.cus_code', g.code).where('a.is_default', 1)
      .select('a.id').first();
    if (!addr) { console.log('not found: ' + g.code); continue; }
    const upd = { district: g.dist, province: g.prov, postal_code: g.postal };
    if (g.sub) upd.sub_district = g.sub;
    await knex('customer_addresses').where('id', addr.id).update(upd);
    console.log('OK ' + g.code + ' -> ' + (g.sub || '-') + ' / ' + g.dist + ' / ' + g.prov);
    updated++;
  }
  console.log('\nTotal: ' + updated + ' / ' + data.length);
  knex.destroy();
})();
