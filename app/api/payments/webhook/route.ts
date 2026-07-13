import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET
  const suppliedSecret = request.headers.get('x-webhook-secret')

  if (!expectedSecret || suppliedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { orderId?: string; provider?: string; reference?: string; status?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload.orderId || payload.status !== 'PAID') {
    return NextResponse.json({ error: 'orderId and PAID status are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('finalize_ecommerce_order_service', {
    p_order_id: payload.orderId,
    p_provider: payload.provider ?? 'GENERIC_WEBHOOK',
    p_provider_reference: payload.reference ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, invoiceId: data })
}
