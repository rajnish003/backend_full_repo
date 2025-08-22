const generateOTPEmailTemplate = (firstName, otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f7fa; font-family: 'Segoe UI', Tahoma, sans-serif; color:#333;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin: 0 auto; padding: 20px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff; border-radius:16px; box-shadow:0 6px 18px rgba(0,0,0,0.08); padding: 40px;">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <img src="https://res.cloudinary.com/dupfzlwcc/image/upload/v1754999748/home-button_h66doy.png" alt="Homeasy Logo" width="200" style="margin-bottom: 20px;" />
                <h1 style="margin: 0; font-size: 26px; font-weight: bold; background: linear-gradient(90deg, #3182ce, #805ad5); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  OTP Verification
                </h1>
                <p style="color: #718096; font-size: 16px; margin-top: 8px;">Secure access to your Homeasy account</p>
              </td>
            </tr>

            <tr>
              <td style="font-size: 16px; padding-bottom: 20px;">
                Hello <strong style="color:#3182ce;">${firstName}</strong>,
              </td>
            </tr>

            <tr>
              <td style="font-size: 16px;">
                Thank you for registering with Homeasy Automation. Use the following One-Time Password (OTP) to verify your identity:
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace; color: #3182ce; background-color: #f0f4f8; padding: 20px 30px; border-radius: 10px; border: 1px dashed #cbd5e0;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
                <strong>Note:</strong> This OTP is valid for <strong style="color:#3182ce;">10 minutes</strong>. Please do not share it with anyone, including Homeasy representatives.
              </td>
            </tr>

            <tr>
              <td style="font-size: 14px; padding-top: 20px;">
                If you didn’t request this OTP, please ignore this email or contact our support team at <a href="mailto:support@homeasy.io" style="color:#3182ce;">support@homeasy.io</a>.
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 40px 0;">
                <a href="https://homeasy.io" style="display: inline-block; padding: 14px 28px; background-color: #3182ce; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Go to Homeasy
                </a>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top: 20px;">
                <div style="margin-top: 20px; text-align: center;">
                  <a href="#" style="margin: 0 10px; color: #4a5568; font-size: 18px;"><i class="fab fa-facebook-f"></i></a>
                  <a href="#" style="margin: 0 10px; color: #4a5568; font-size: 18px;"><i class="fab fa-twitter"></i></a>
                  <a href="#" style="margin: 0 10px; color: #4a5568; font-size: 18px;"><i class="fab fa-instagram"></i></a>
                  <a href="#" style="margin: 0 10px; color: #4a5568; font-size: 18px;"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="font-size: 12px; color: #718096; padding-top: 30px; border-top: 1px solid #edf2f7;">
                <p style="margin: 6px 0;">© ${new Date().getFullYear()} Homeasy Automation Pvt. Ltd.</p>
                <p style="margin: 6px 0;">Bhubaneswar, India</p>
                <p style="margin: 6px 0;">
                  <a href="#" style="color: #3182ce; text-decoration: none;">Privacy Policy</a> | 
                  <a href="#" style="color: #3182ce; text-decoration: none;">Terms</a> | 
                  <a href="#" style="color: #3182ce; text-decoration: none;">Contact</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

module.exports = generateOTPEmailTemplate;
