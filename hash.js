// hash.js
import bcrypt from "bcryptjs";

const run = async () => {
  const password = "Admin@123"; // 👈 your chosen admin password
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
};

run();
