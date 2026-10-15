import {db} from "../../config/mysql.js";

export const User = {
  create: async(userdata)=>{
    const sql=` insert into users(name,email,password,role)
    values(?,?,?,?)
    `;
    
    const [result]=await db.execute(sql,[
      userdata.name,
      userdata.email,
      userdata.password,
      userdata.role || "user",
    ]);

    return result;
  },

  findByEmail: async (email) => {
    const sql = `select * from users where email = ?`;

    const [rows] = await db.execute(sql, [email]);

    return rows[0];
  },

  findById: async (id) => {
    const sql = `
      SELECT id, name, email, role
      FROM users
      WHERE id = ?
    `;

    const [rows] = await db.execute(sql, [id]);

    return rows[0];

  },
};

