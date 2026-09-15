import Notification from "../models/Notification.js";

const placeOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    // ✅ Create notification
    await Notification.create({
      userId: req.body.userId,
      message: "Your order placed successfully",
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
