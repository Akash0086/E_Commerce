
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/mongo/user.model.js";

async function migrateUserReferences() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({
      mysqlId: { $exists: true, $ne: null },
    }).select("_id mysqlId");

    const idMap = new Map(
      users.map((user) => [
        Number(user.mysqlId),
        user._id,
      ]),
    );

    const db = mongoose.connection.db;

    for (const collectionName of ["carts", "orders"]) {
      const collection = db.collection(collectionName);
      const cursor = collection.find({});

      let updated = 0;
      let skipped = 0;

      for await (const document of cursor) {
        // Only convert legacy numeric IDs.
        if (typeof document.userId !== "number") {
          continue;
        }

        const mongoUserId = idMap.get(document.userId);

        if (!mongoUserId) {
          console.warn(
            `No migrated user found for ${collectionName} document ${document._id}, legacy userId ${document.userId}`,
          );
          skipped++;
          continue;
        }

        await collection.updateOne(
          { _id: document._id, userId: document.userId },
          { $set: { userId: mongoUserId } },
        );

        updated++;
      }

      console.log(
        `${collectionName}: converted ${updated}, skipped ${skipped}`,
      );
    }

    console.log("User reference migration completed.");
  } catch (error) {
    console.error("Reference migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateUserReferences();
