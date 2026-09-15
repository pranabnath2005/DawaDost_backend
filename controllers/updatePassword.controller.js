export const sendUpdatePasswordLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

    await user.save();
    console.log("TOKEN SAVED");

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log("RESET LINK:", resetLink);

    await sendEmail({
      to: email,
      subject: "Update Password",
      html: `
        <h2>Password Update</h2>
        <p>Copy & paste this link:</p>
        <p>${resetLink}</p>
        <p>Valid for 5 minutes</p>
      `,
    });

    console.log("EMAIL SENT");

    res.json({ message: "Reset link sent" });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
