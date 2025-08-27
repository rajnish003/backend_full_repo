const generateOTPEmailTemplate = (firstName, otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, sans-serif; color:#333; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">

    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" 
      style="max-width:600px; margin: 40px auto; padding: 20px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" 
            style="background-color:#fff; border-radius:16px; 
            box-shadow:0 8px 20px rgba(0,0,0,0.12); padding: 40px;">

            <!-- Header -->
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <img src="https://res.cloudinary.com/dupfzlwcc/image/upload/v1754999748/home-button_h66doy.png" 
                     alt="Homeasy Logo" width="160" style="margin-bottom: 20px;" />
                <h1 style="margin: 0; font-size: 28px; font-weight: bold; 
                  background: linear-gradient(90deg, #3182ce, #805ad5); 
                  -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  OTP Verification
                </h1>
                <p style="color: #718096; font-size: 16px; margin-top: 8px;">
                  Secure access to your Homeasy account
                </p>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="font-size: 16px; padding-bottom: 20px;">
                Hello <strong style="color:#3182ce;">${firstName}</strong>,
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="font-size: 16px; line-height: 1.6;">
                Thank you for registering with <strong>Homeasy Automation</strong>. 
                Use the following One-Time Password (OTP) to verify your identity:
              </td>
            </tr>

            <!-- OTP -->
            <tr>
              <td align="center" style="padding: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                  font-family: 'Courier New', monospace; color: #fff; 
                  background: linear-gradient(90deg, #3182ce, #805ad5);
                  padding: 20px 30px; border-radius: 12px; 
                  box-shadow: inset 0 0 8px rgba(0,0,0,0.15);">
                  ${otp}
                </div>
              </td>
            </tr>

            <!-- Note -->
            <tr>
              <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; 
                padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
                <strong>Note:</strong> This OTP is valid for <strong style="color:#3182ce;">10 minutes</strong>. 
                Please do not share it with anyone, including Homeasy representatives.
              </td>
            </tr>

            <!-- Support -->
            <tr>
              <td style="font-size: 14px; padding-top: 20px;">
                If you didn’t request this OTP, please ignore this email or contact our support team at 
                <a href="mailto:support@homeasy.io" style="color:#3182ce;">support@homeasy.io</a>.
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding: 40px 0;">
                <a href="https://homeasy.io" 
                   style="display: inline-block; padding: 14px 28px; 
                   background: linear-gradient(90deg, #3182ce, #805ad5); 
                   color: #fff; text-decoration: none; border-radius: 8px; 
                   font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                  Go to Homeasy
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="font-size: 12px; color: #718096; 
                padding-top: 30px; border-top: 1px solid #edf2f7;">
                <p style="margin: 6px 0;">© ${new Date().getFullYear()} Homeasy Automation Pvt. Ltd.</p>
                <p style="margin: 6px 0;">Patna , Bihar, India</p>
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
