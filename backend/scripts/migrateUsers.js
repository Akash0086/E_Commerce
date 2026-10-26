
import "dotenv/config";
import mongoose from "mongoose";
import { db } from "../config/mysql.js";
import { User } from "../models/mongo/user.model.js";

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const [rows] = await db.execute(
      "SELECT id, name, email, password, role, phone FROM users",
    );

    console.log(`Found ${rows.length} users in MySQL`);

    for (const row of rows) {
      const email = row.email?.trim().toLowerCase();

      if (!email || !row.password || !row.name) {
        console.warn(`Skipping incomplete user ID ${row.id}`);
        continue;
      }

      const existingById = await User.findOne({
        mysqlId: Number(row.id),
      });

      const existingByEmail = await User.findOne({ email });

      if (
        existingById &&
        existingByEmail &&
        !existingById._id.equals(existingByEmail._id)
      ) {
        throw new Error(
          `Conflict: MySQL ID ${row.id} and email ${email} match different MongoDB users`,
        );
      }

      const existing = existingById || existingByEmail;

      if (existing && existing.mysqlId != null &&
          existing.mysqlId !== Number(row.id)) {
        throw new Error(`MySQL ID conflict for ${email}`);
      }

      const userData = {
        mysqlId: Number(row.id),
        name: row.name,
        email,
        password: row.password, // Preserve the existing bcrypt hash
        role: row.role || "user",
        phone: row.phone || "",
      };

      if (existing) {
        Object.assign(existing, userData);
        await existing.save();
      } else {
        await User.create(userData);
      }

      console.log(`Migrated MySQL user ID ${row.id}`);
    }

    console.log("User migration completed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end().catch(() => {});
    await mongoose.disconnect().catch(() => {});
  }
}

migrateUsers();
