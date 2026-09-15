import Order from "../models/Order.js";

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    res.status(200).json(updatedOrder);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};