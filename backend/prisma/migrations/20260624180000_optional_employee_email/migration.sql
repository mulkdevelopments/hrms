-- Allow employees without an email address (Excel import rows with blank Email ID).
ALTER TABLE "Employee" ALTER COLUMN "email" DROP NOT NULL;
