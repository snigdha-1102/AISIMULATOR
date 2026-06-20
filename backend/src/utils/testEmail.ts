import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const user = process.env.EMAIL_USER || "sakkurisnigdha@gmail.com";
const pass = process.env.EMAIL_APP_PASSWORD || "isxobjpbfzqtittx";

console.log("Using email user:", user);
console.log("Using email app password (masked):", pass ? "********" : "not provided");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("Nodemailer configuration test failed:", err);
    process.exit(1);
  } else {
    console.log("SMTP Connection verified! Nodemailer can send emails successfully.");
    process.exit(0);
  }
});
