const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Inserts seed entries
  await knex('users').insert([
    { 
      name: 'Admin Desktop', 
      email: 'admin@linsirin.com', 
      password: hashedPassword,
      role: 'Admin', 
      status: 'Active' 
    },
    { 
      name: 'Somsak Manager', 
      email: 'somsak@example.com', 
      password: hashedPassword,
      role: 'Editor', 
      status: 'Active' 
    },
    { 
      name: 'Jane User', 
      email: 'jane@example.com', 
      password: hashedPassword,
      role: 'User', 
      status: 'Inactive' 
    }
  ]);
};
