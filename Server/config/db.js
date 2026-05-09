const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const initializeDatabase = async () => {
  try {
    // Test connection by querying a simple table
    const { error } = await supabase
      .from("recipes")
      .select("*", { count: "short", head: true });

    if (error) {
      throw new Error(`Database test query failed: ${error.message}`);
    }

    console.log("✅ Supabase Connected successfully");
    return supabase;
  } catch (error) {
    console.error(`❌ Supabase Connection Warning: ${error.message}`);
    console.log("⚠️  Could not verify table access. The server will continue to run, but database queries might fail until the schema is ready.");
  }
};

module.exports = { supabase, initializeDatabase };