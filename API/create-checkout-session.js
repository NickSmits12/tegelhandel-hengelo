const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Prijzen in centen
const PRODUCTS = {
  vloertegel:  { name: "Vloertegel Sample",   amount: 250,  description: "Keramische vloertegel 10×10 cm" },
  wandtegel:   { name: "Wandtegel Sample",    amount: 250,  description: "Metro wandtegel 7,5×15 cm" },
  mozaiek:     { name: "Mozaïek Sample",      amount: 250,  description: "Mozaïektegel op matje 30×30 cm" },
  buitentegel: { name: "Buitentegel Sample",  amount: 350,  description: "Slipbestendige buitentegel 20×20 cm" },
  natuursteen: { name: "Natuursteen Sample",  amount: 500,  description: "Echte natuursteen 10×10 cm" },
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product } = req.body;

  if (!product || !PRODUCTS[product]) {
    return res.status(400).json({ error: "Ongeldig product" });
  }

  const item = PRODUCTS[product];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name,
              description: item.description,
            },
            unit_amount: item.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/shop.html?status=success`,
      cancel_url:  `${req.headers.origin}/shop.html?status=cancel`,
    });

    res.status(200).json({ id: session.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};