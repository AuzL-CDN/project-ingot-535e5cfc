import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { organizations } = await req.json()
      
      console.log(`Starting import of ${organizations.length} organizations`)
      
      // Batch insert organizations data
      const batchSize = 100
      const results = []
      
      for (let i = 0; i < organizations.length; i += batchSize) {
        const batch = organizations.slice(i, i + batchSize)
        
        const { data, error } = await supabaseClient
          .from('organizations')
          .upsert(batch, { 
            onConflict: 'org_site_id',
            ignoreDuplicates: false 
          })
          .select('id')
        
        if (error) {
          console.error(`Batch ${i / batchSize + 1} failed:`, error)
          throw error
        }
        
        results.push(...(data || []))
        console.log(`Batch ${i / batchSize + 1} completed: ${batch.length} records`)
      }

      console.log(`Import completed successfully: ${results.length} records imported`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          imported: results.length,
          message: `Successfully imported ${results.length} organizations`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET method - return import status or instructions
    const { data: count } = await supabaseClient
      .from('organizations')
      .select('*', { count: 'exact', head: true })
    
    return new Response(
      JSON.stringify({ 
        success: true,
        currentRecords: count || 0,
        message: `Database currently contains ${count || 0} organization records`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Import function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})