import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Tables to include in backup. Order matters for dependency clarity only.
const TABLES = [
  'user_roles',
  'profiles',
  'student_profiles',
  'investor_profiles',
  'pitches',
  'pitch_attachments',
  'deals',
  'messages',
  'conversations',
  'bookmarks',
  'admin_activity_logs',
  'database_backups',
] as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token)
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userId = claims.claims.sub as string

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Verify superadmin role
    const { data: roleRows } = await admin
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'superadmin')
    if (!roleRows || roleRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const type = String(body?.type || 'FULL').toUpperCase()
    if (!['FULL', 'INCREMENTAL', 'SCHEMA_ONLY'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const started = Date.now()
    const name = `${type.toLowerCase().replace('_', '-')}-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`

    // Insert IN_PROGRESS row
    const { data: inserted, error: insErr } = await admin
      .from('database_backups')
      .insert({ name, type, status: 'IN_PROGRESS' })
      .select().single()
    if (insErr || !inserted) {
      return new Response(JSON.stringify({ error: insErr?.message || 'insert failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const dump: Record<string, unknown> = {
      _meta: { name, type, created_at: new Date().toISOString(), tables: TABLES },
    }

    const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    let totalRows = 0

    for (const tbl of TABLES) {
      try {
        if (type === 'SCHEMA_ONLY') {
          const { count } = await admin.from(tbl).select('*', { count: 'exact', head: true })
          dump[tbl] = { row_count: count ?? 0 }
          continue
        }
        let q = admin.from(tbl).select('*')
        if (type === 'INCREMENTAL') {
          // best-effort filter on created_at; fall back to full if column missing
          q = q.gte('created_at', sinceIso)
        }
        const { data, error } = await q
        if (error && type === 'INCREMENTAL') {
          const full = await admin.from(tbl).select('*')
          dump[tbl] = full.data || []
          totalRows += (full.data?.length || 0)
        } else {
          dump[tbl] = data || []
          totalRows += (data?.length || 0)
        }
      } catch (e) {
        dump[tbl] = { error: String(e) }
      }
    }

    const json = JSON.stringify(dump, null, 2)
    const sizeBytes = new TextEncoder().encode(json).byteLength
    const durationMs = Date.now() - started

    await admin
      .from('database_backups')
      .update({ status: 'COMPLETED', size_bytes: sizeBytes, duration_ms: durationMs })
      .eq('id', inserted.id)

    return new Response(JSON.stringify({
      backup: { ...inserted, status: 'COMPLETED', size_bytes: sizeBytes, duration_ms: durationMs },
      file: json,
      rows: totalRows,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})