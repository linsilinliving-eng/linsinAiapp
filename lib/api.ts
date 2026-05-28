import db from './db';

// ฟังก์ชันดึงข้อมูลผู้ใช้
export async function getUsers() {
  return await db('users').select('*');
}

// ฟังก์ชันดึงข้อมูลสินค้า
export async function getProducts() {
  return await db('products').select('*');
}

// ฟังก์ชันเพิ่มสินค้า
export async function createProduct(productData: any) {
  return await db('products').insert(productData);
}

// ฟังก์ชันลบสินค้า
export async function deleteProductById(id: number) {
  return await db('products').where('id', id).del();
}

// ฟังก์ชันดึงข้อมูลคำสั่งซื้อ พร้อมรายละเอียด
export async function getOrders() {
  return await db('orders')
    .select('orders.*', 'users.name as customer_name')
    .leftJoin('users', 'orders.user_id', 'users.id');
}
