const generateOTPEmailTemplate = (firstName, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f7fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
        .title {
          color: #2d3748;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(90deg, #3182ce 0%, #805ad5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: #718096;
          font-size: 16px;
          margin-bottom: 30px;
        }
        .otp-container {
          background: linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%);
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin: 30px 0;
          border: 1px dashed #cbd5e0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #3182ce;
          font-family: 'Courier New', monospace;
          text-shadow: 0 2px 4px rgba(49, 130, 206, 0.1);
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #718096;
          text-align: center;
          border-top: 1px solid #edf2f7;
          padding-top: 20px;
        }
       
        .note {
          background-color: #fffaf0;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #dd6b20;
          margin: 25px 0;
          font-size: 14px;
        }
        .social-icons {
          margin: 30px 0;
          text-align: center;
        }
        .social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%);
          border-radius: 50%;
          margin: 0 8px;
          color: #4a5568;
          text-decoration: none;
          font-size: 18px;
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          transform: translateY(-3px);
          color: #3182ce;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #cbd5e0, transparent);
          margin: 25px 0;
        }
        .highlight {
          font-weight: 600;
          color: #3182ce;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- Replace with your actual logo URL -->
          <img src="https://via.placeholder.com/200x60?text=Homeasy" alt="Company Logo" class="logo">
          <h1 class="title">OTP Verification</h1>
          <p class="subtitle">Secure access to your homeasy account</p>
        </div>
        
        <p>Hello <span class="highlight">${firstName}</span>,</p>
        <p>Thank you for registering with Homeasy Automation. To complete your registration, please enter the following One-Time Password (OTP):</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
      
        <div class="note">
          <strong>Important:</strong> This OTP is valid for <span class="highlight">10 minutes</span>. For your security, please do not share this code with anyone, including Ghosi Community representatives.
        </div>
        
        <p>If you didn't request this OTP, please ignore this email or contact our support team immediately at <a href="mailto:noreply@homeasy.io">noreply@homeasy.io</a>.</p>
        
        <div class="divider"></div>
        
        <div class="social-icons">
          <a href="#" class="social-icon" title="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social-icon" title="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" class="social-icon" title="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" class="social-icon" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" class="social-icon" title="YouTube"><i class="fab fa-youtube"></i></a>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Homeasy Automation Pvt. Ltd. All rights reserved.</p>
          <p>Ho, India</p>
          <p>
            <a href="#" style="color: #3182ce; text-decoration: none;">Privacy Policy</a> | 
            <a href="#" style="color: #3182ce; text-decoration: none;">Terms of Service</a> | 
            <a href="#" style="color: #3182ce; text-decoration: none;">Contact Us</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = generateOTPEmailTemplate;