import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase.rpc('execute_sql', { query: 'SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = \'objects\';' })
  
  if (error) {
    console.error('Cannot execute SQL via RPC. Let us just try to fetch policies differently or create one.')
  } else {
    console.log(data)
  }
}

main()
