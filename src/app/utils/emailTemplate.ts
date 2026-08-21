interface ISentOTPPayload {
	name: string;
	otp: number;
}

interface ISentChangedPasswordPayload {
	name: string;
}
export const sentOTPEmailTemplate = (payload: ISentOTPPayload) => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#f4f7fb;
  font-family:Arial, Helvetica, sans-serif;
  color:#1f2937;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f4f7fb; padding:40px 15px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 8px 30px rgba(0,0,0,0.08);
          ">

          <!-- Header -->
          <tr>
            <td style="
              background:linear-gradient(135deg,#2563eb,#4f46e5);
              padding:35px 30px;
              text-align:center;
            ">

              <div style="
                width:60px;
                height:60px;
                line-height:60px;
                margin:0 auto 15px;
                background:rgba(255,255,255,0.15);
                border-radius:50%;
                font-size:28px;
                color:#ffffff;
              ">
                🔐
              </div>

              <h1 style="
                margin:0;
                color:#ffffff;
                font-size:26px;
                font-weight:700;
              ">
                Verify Your Account
              </h1>

              <p style="
                margin:10px 0 0;
                color:#dbeafe;
                font-size:14px;
              ">
                One-time verification code
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px;">

              <p style="
                margin:0 0 18px;
                font-size:16px;
                line-height:1.6;
              ">
                Hi <strong>${payload.name}</strong>,
              </p>

              <p style="
                margin:0 0 25px;
                font-size:15px;
                line-height:1.7;
                color:#4b5563;
              ">
                We received a request to verify your account.
                Use the verification code below to continue.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">

                    <div style="
                      display:inline-block;
                      background:#f0f5ff;
                      border:2px dashed #2563eb;
                      border-radius:12px;
                      padding:18px 35px;
                      margin:5px 0 25px;
                    ">

                      <div style="
                        font-size:12px;
                        color:#64748b;
                        text-transform:uppercase;
                        letter-spacing:2px;
                        margin-bottom:8px;
                      ">
                        Verification Code
                      </div>

                      <div style="
                        font-size:36px;
                        font-weight:800;
                        letter-spacing:8px;
                        color:#1d4ed8;
                      ">
                        ${payload.otp}
                      </div>

                    </div>

                  </td>
                </tr>
              </table>

              <p style="
                margin:0 0 10px;
                text-align:center;
                font-size:14px;
                color:#6b7280;
              ">
                This code will expire in <strong>5 minutes</strong>.
              </p>

              <p style="
                margin:25px 0 0;
                font-size:14px;
                line-height:1.6;
                color:#6b7280;
              ">
                If you didn't request this code, you can safely ignore
                this email. Never share your verification code with anyone.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background:#f8fafc;
              padding:25px 30px;
              text-align:center;
              border-top:1px solid #e5e7eb;
            ">

              <p style="
                margin:0;
                font-size:13px;
                color:#94a3b8;
              ">
                © ${new Date().getFullYear()} PH Healthcare. All rights reserved.
              </p>

              <p style="
                margin:8px 0 0;
                font-size:12px;
                color:#cbd5e1;
              ">
                This is an automated email. Please do not reply.
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

export const sentPasswordChangedEmailTemplate = (
	payload: ISentChangedPasswordPayload,
) => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Changed Successfully</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#f4f7fb;
  font-family:Arial, Helvetica, sans-serif;
  color:#1f2937;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f4f7fb; padding:40px 15px;">

    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 8px 30px rgba(0,0,0,0.08);
          ">

          <!-- Header -->
          <tr>
            <td style="
              background:linear-gradient(135deg,#16a34a,#059669);
              padding:38px 30px;
              text-align:center;
            ">

              <div style="
                width:64px;
                height:64px;
                line-height:64px;
                margin:0 auto 15px;
                background:rgba(255,255,255,0.18);
                border-radius:50%;
                font-size:30px;
                color:#ffffff;
              ">
                ✓
              </div>

              <h1 style="
                margin:0;
                color:#ffffff;
                font-size:26px;
                font-weight:700;
              ">
                Password Changed Successfully
              </h1>

              <p style="
                margin:10px 0 0;
                color:#dcfce7;
                font-size:14px;
              ">
                Your account password has been updated
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px;">

              <p style="
                margin:0 0 18px;
                font-size:16px;
                line-height:1.6;
              ">
                Hi <strong>${payload.name}</strong>,
              </p>

              <p style="
                margin:0 0 25px;
                font-size:15px;
                line-height:1.7;
                color:#4b5563;
              ">
                Your account password was changed successfully.
                You can now use your new password to sign in to your account.
              </p>

              <!-- Success Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="
                    background:#f0fdf4;
                    border:1px solid #bbf7d0;
                    border-radius:10px;
                    padding:20px;
                  ">

                    <p style="
                      margin:0 0 8px;
                      font-size:14px;
                      font-weight:700;
                      color:#166534;
                    ">
                      ✓ Password Update Complete
                    </p>

                    <p style="
                      margin:0;
                      font-size:13px;
                      line-height:1.6;
                      color:#4b5563;
                    ">
                      Your old password is no longer valid.
                      Please use your new password the next time you sign in.
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top:25px;">

                <tr>
                  <td style="
                    background:#fff7ed;
                    border-left:4px solid #f97316;
                    padding:16px;
                    border-radius:6px;
                  ">

                    <p style="
                      margin:0 0 6px;
                      font-size:14px;
                      font-weight:700;
                      color:#9a3412;
                    ">
                      Didn't change your password?
                    </p>

                    <p style="
                      margin:0;
                      font-size:13px;
                      line-height:1.6;
                      color:#9a3412;
                    ">
                      If you did not make this change, your account may
                      be compromised. Please reset your password immediately
                      and contact our support team.
                    </p>

                  </td>
                </tr>

              </table>

              <p style="
                margin:28px 0 0;
                font-size:14px;
                line-height:1.6;
                color:#6b7280;
              ">
                For your security, we recommend using a strong, unique
                password and never sharing it with anyone.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background:#f8fafc;
              padding:25px 30px;
              text-align:center;
              border-top:1px solid #e5e7eb;
            ">

              <p style="
                margin:0;
                font-size:13px;
                color:#94a3b8;
              ">
                © ${new Date().getFullYear()} PH Healthcare. All rights reserved.
              </p>

              <p style="
                margin:8px 0 0;
                font-size:12px;
                color:#cbd5e1;
              ">
                This is an automated security notification.
                Please do not reply.
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
