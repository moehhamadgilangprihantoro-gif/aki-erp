import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  if (request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('expire_unpaid_orders')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ expiredOrders: data })
}
