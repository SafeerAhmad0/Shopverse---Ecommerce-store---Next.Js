import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to create Supabase admin client
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabaseKey is required. Please check your environment variables.')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the request handler
    const supabaseAdmin = createSupabaseAdminClient()
    const {
      userId,
      customerInfo,
      billingAddress,
      shippingAddress,
      cartItems,
      pricing,
      paymentMethod,
      notes
    } = await request.json()

    // Validate required fields
    if (!userId || !customerInfo || !billingAddress || !cartItems || !pricing) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        customer_email: customerInfo.email,
        customer_first_name: customerInfo.firstName,
        customer_last_name: customerInfo.lastName,
        customer_phone: customerInfo.phone || null,
        customer_company: customerInfo.company || null,

        // Billing Address
        billing_address: billingAddress.address,
        billing_address_2: billingAddress.address2 || null,
        billing_city: billingAddress.city,
        billing_country: billingAddress.country,
        billing_postal_code: billingAddress.postalCode || null,

        // Shipping Address (use billing if not provided)
        shipping_address: shippingAddress?.address || billingAddress.address,
        shipping_address_2: shippingAddress?.address2 || billingAddress.address2 || null,
        shipping_city: shippingAddress?.city || billingAddress.city,
        shipping_country: shippingAddress?.country || billingAddress.country,
        shipping_postal_code: shippingAddress?.postalCode || billingAddress.postalCode || null,
        shipping_method: shippingAddress?.method || 'Standard Shipping',

        // Pricing
        subtotal: pricing.subtotal,
        shipping_fee: pricing.shippingFee || 0,
        tax: pricing.tax || 0,
        discount: pricing.discount || 0,
        total: pricing.total,

        // Payment
        payment_method: paymentMethod || 'Cash on Delivery',
        payment_status: 'pending',

        // Status
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.title || item.name,
      product_image: item.image || item.imageUrl || null,
      product_sku: item.sku || null,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback: delete the order
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError.message },
        { status: 500 }
      )
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete order:', fetchError)
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: completeOrder || order,
      orderNumber: order.order_number
    })

  } catch (error) {
    console.error('Error in create-order API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch orders (for admin)
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the request handler
    const supabaseAdmin = createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })

    // Filter by specific order
    if (orderId) {
      query = query.eq('id', orderId)
    }

    // Filter by user
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders: orders || []
    })

  } catch (error) {
    console.error('Error in create-order GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
