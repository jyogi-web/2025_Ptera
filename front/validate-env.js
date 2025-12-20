const fs = require("node:fs");
const path = require("node:path");

const envPath = path.join(process.cwd(), ".env.local");

try {
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found!");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/^FIREBASE_SERVICE_ACCOUNT_KEY=(.*)$/m);

  if (!match) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local");
    process.exit(1);
  }

  let rawValue = match[1].trim();

  // Handle quotes like dotenv/Next.js would
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    rawValue = rawValue.slice(1, -1);
  }
  console.log("Found FIREBASE_SERVICE_ACCOUNT_KEY...");
  console.log(`First 20 chars: ${rawValue.substring(0, 20)}`);

  // Check specifically for single quotes wrapping the whole value which might be common if copy-pasted incorrectly from some guides
  if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
    console.log(
      "⚠️ Value appears to be wrapped in single quotes. This might be okay if processed by dotenv, but let's check content.",
    );
  }

  try {
    JSON.parse(rawValue);
    console.log("✅ Valid JSON format!");
  } catch (e) {
    console.error("❌ Invalid JSON format:");
    console.error(e.message);

    // Heuristic checks
    if (rawValue.includes("'")) {
      console.log(
        "💡 Hint: The string contains single quotes ('). JSON standard requires double quotes (\") for keys and string values.",
      );
    }
    if (!rawValue.includes('"')) {
      console.log(
        "💡 Hint: The string does not contain any double quotes. Valid JSON must use double quotes.",
      );
    }

    // Show where it likely failed
    const matchPos = e.message.match(/position (\d+)/);
    if (matchPos) {
      const pos = parseInt(matchPos[1], 10);
      const start = Math.max(0, pos - 10);
      const end = Math.min(rawValue.length, pos + 10);
      console.log(`Context at error position ${pos}:`);
      console.log(rawValue.substring(start, end));
      console.log(`${" ".repeat(pos - start)}^`);
    }
  }
} catch (err) {
  console.error("Unexpected error:", err);
}
