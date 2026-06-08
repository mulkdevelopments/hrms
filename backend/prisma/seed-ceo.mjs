import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "ceo@hrms.com";
  const passwordHash = await bcrypt.hash("Ceo@123", 10);

  const ceo = await prisma.employee.upsert({
    where: { email },
    update: {
      role: "CEO",
      accessEnabled: true,
      loginEmail: email,
      passwordHash,
      designation: "Chief Executive Officer",
      department: "Executive",
      status: "ACTIVE",
    },
    create: {
      employeeCode: "EMP-CEO01",
      firstName: "Chief Executive",
      lastName: "",
      email,
      loginEmail: email,
      passwordHash,
      role: "CEO",
      accessEnabled: true,
      dateOfJoining: new Date("2020-01-01"),
      designation: "Chief Executive Officer",
      department: "Executive",
      employmentType: "Full-Time",
      workMode: "HYBRID",
      status: "ACTIVE",
      basicSalary: 60000,
      housingAllowance: 20000,
      transportAllowance: 5000,
      wpsEnabled: true,
    },
  });

  console.log("CEO account ready:");
  console.log(`- ${ceo.loginEmail} / Ceo@123  (role: ${ceo.role}, code: ${ceo.employeeCode})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
