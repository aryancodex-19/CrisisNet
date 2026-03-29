const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { email: "admin@crisisnet.in" }});
  if (!user) return console.log("User not found");
  
  const valid = await bcrypt.compare("password123", user.passwordHash);
  console.log("Is valid?", valid);
  console.log("Hash in DB:", user.passwordHash);
  
}
check().catch(console.error).finally(() => prisma.$disconnect());
