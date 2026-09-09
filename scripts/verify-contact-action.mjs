import fs from "fs";

const actionsTs = fs.readFileSync("web/app/(marketing)/contact/actions.ts", "utf8");

// Must not return { success: true } on insert error or catch
if (actionsTs.includes("logged_fallback")) {
  console.error("FAIL: logged_fallback still present");
  process.exit(1);
}

// Must return failure on error
if (!actionsTs.includes("if (error) {") || !actionsTs.includes("return { success: false, error:")) {
  console.error("FAIL: contact action does not check insert error");
  process.exit(1);
}

console.log("CONTACT_ACTION_VERIFIED: durable persistence enforced");
process.exit(0);
