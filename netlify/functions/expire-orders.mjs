async function expireOrders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY

  if (!url || !secret) {
    return new Response('Supabase server variables are missing', { status: 500 })
  }

  const response = await fetch(`${url}/rest/v1/rpc/expire_unpaid_orders`, {
    method: 'POST',
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })

  if (!response.ok) {
    return new Response(await response.text(), { status: response.status })
  }

  const count = await response.json()
  return Response.json({ expiredOrders: count })
}

export default expireOrders
