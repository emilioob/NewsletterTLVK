async function sendViaResend(subject, html, text, config) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to: [config.emailTo],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    throw new Error(`Resend delivery failed: ${response.status}`);
  }
}

async function sendViaSendgrid(subject, html, text, config) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.sendgridApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: config.emailTo }],
          subject
        }
      ],
      from: { email: config.emailFrom },
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`SendGrid delivery failed: ${response.status}`);
  }
}

export async function deliverEmail(subject, html, text, config) {
  if (config.emailProvider === "none") {
    return { delivered: false, provider: "none" };
  }

  if (!config.emailFrom || !config.emailTo) {
    throw new Error("Email delivery is enabled but EMAIL_FROM or EMAIL_TO is missing.");
  }

  if (config.emailProvider === "resend") {
    if (!config.resendApiKey) {
      throw new Error("RESEND_API_KEY is missing.");
    }
    await sendViaResend(subject, html, text, config);
    return { delivered: true, provider: "resend" };
  }

  if (config.emailProvider === "sendgrid") {
    if (!config.sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY is missing.");
    }
    await sendViaSendgrid(subject, html, text, config);
    return { delivered: true, provider: "sendgrid" };
  }

  throw new Error(`Unsupported EMAIL_PROVIDER: ${config.emailProvider}`);
}
