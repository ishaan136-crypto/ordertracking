export default async function handler(req, res) {
  const { order } = req.query;
  
  if (!order) {
    return res.status(400).json({ error: "Order number is required" });
  }

  try {
    const shopifyRes = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2025-01/orders.json?name=${encodeURIComponent(order)}`, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN,
        "Content-Type": "application/json"
      }
    });

    const shopifyData = await shopifyRes.json();
    if (!shopifyData.orders || shopifyData.orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const fulfillment = shopifyData.orders[0].fulfillments[0];
    if (!fulfillment) {
      return res.status(404).json({ error: "No tracking info available yet" });
    }

    res.status(200).json({
      status: fulfillment.shipment_status || "In Transit",
      courier: fulfillment.tracking_company || "Unknown",
      tracking_number: fulfillment.tracking_number || "N/A",
      tracking_url: fulfillment.tracking_url || ""
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
