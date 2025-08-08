import { createClient } from "@supabase/supabase-js";

// Replace with your own Supabase credentials
const supabaseUrl = "https://amslwzvkltsametdgerb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtc2x3enZrbHRzYW1ldGRnZXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjMyOSwiZXhwIjoyMDcwMjQ4MzI5fQ.BPsKSgui-F3mIoqDR7TM7GzfkQH0NMIYD7aA8zOEC5g"
export const supabase = createClient(supabaseUrl, supabaseKey);
