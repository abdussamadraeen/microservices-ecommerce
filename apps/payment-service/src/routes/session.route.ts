import { Hono } from "hono";
import stripe from "../utils/stripe.js";
import { shouldBeUser } from "../middleware/authMiddleware.js";
import { CartItemsType } from "@repo/types";


const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  console.log("Create checkout session request received");
  const body = await c.req.json();
  console.log("Request body:", JSON.stringify(body));
  const { cart, email, discount, shipping }: { cart: CartItemsType; email?: string; discount?: number; shipping?: number } = body;
  const userId = c.get("userId");

  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const unitAmount = item.price * 100; // Convert to cents

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmount as number,
        },
        quantity: item.quantity,
      };
    })
  );

  let discounts = [];
  if (discount && discount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: discount * 100,
      currency: "inr",
      duration: "once",
      name: "Discount",
    });
    discounts.push({ coupon: coupon.id });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId,
      customer_email: email,
      mode: "payment",
      success_url: "http://localhost:3500/return?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3500/cart",
      discounts: discounts,
      shipping_options: shipping
        ? [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: shipping * 100,
                currency: "inr",
              },
              display_name: "Shipping",
            },
          },
        ]
        : [],
    });

    // console.log(session);

    return c.json({ url: session.url });
  } catch (error) {
    console.log(error);
    return c.json({ error });
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["line_items"],
    }
  );

  // console.log(session);

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
  });
});

export default sessionRoute;

