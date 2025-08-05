
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from "npm:@react-email/components@0.0.22";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security Alert Email Template
const SecurityAlertEmail = ({ 
  userName, 
  alertType,
  alertMessage,
  timestamp,
  ipAddress,
  location,
  deviceInfo,
  supportUrl
}: { 
  userName: string; 
  alertType: string;
  alertMessage: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  supportUrl: string;
}) => (
  React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Preview, {}, "Security alert for your CIARA account"),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          React.createElement(Heading, { style: headerTitle }, "CIARA"),
          React.createElement(Text, { style: headerSubtitle }, "Security Alert")
        ),
        React.createElement(Section, { style: content },
          React.createElement("div", { style: alertIcon }, "🔒"),
          React.createElement(Heading, { style: h1 }, "Security Alert"),
          React.createElement(Text, { style: text }, 
            `Hello ${userName}, we detected important activity on your CIARA account.`
          ),
          React.createElement(Section, { style: alertCard },
            React.createElement(Heading, { style: alertTitle }, alertType),
            React.createElement(Text, { style: alertDesc }, alertMessage),
            React.createElement("div", { style: detailsContainer },
              React.createElement("div", { style: detailRow },
                React.createElement("strong", {}, "When: "),
                React.createElement("span", {}, timestamp)
              ),
              ipAddress && React.createElement("div", { style: detailRow },
                React.createElement("strong", {}, "IP Address: "),
                React.createElement("span", {}, ipAddress)
              ),
              location && React.createElement("div", { style: detailRow },
                React.createElement("strong", {}, "Location: "),
                React.createElement("span", {}, location)
              ),
              deviceInfo && React.createElement("div", { style: detailRow },
                React.createElement("strong", {}, "Device: "),
                React.createElement("span", {}, deviceInfo)
              )
            )
          ),
          React.createElement(Text, { style: actionText }, 
            "If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately."
          ),
          React.createElement(Section, { style: buttonContainer },
            React.createElement(Button, {
              href: supportUrl,
              style: button
            }, "Secure My Account")
          ),
          React.createElement(Section, { style: securityTips },
            React.createElement(Heading, { style: tipsTitle }, "Security Tips:"),
            React.createElement("ul", { style: tipsList },
              React.createElement("li", { style: tipItem }, "Use a strong, unique password"),
              React.createElement("li", { style: tipItem }, "Enable two-factor authentication"),
              React.createElement("li", { style: tipItem }, "Don't share your login credentials"),
              React.createElement("li", { style: tipItem }, "Log out from shared devices")
            )
          )
        ),
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText }, 
            "Stay secure!",
            React.createElement("br", {}),
            "The CIARA Security Team",
            React.createElement("br", {}),
            React.createElement("br", {}),
            "📧 info@ciara.city | 📞 +41 79 301 79 15"
          ),
          React.createElement(Text, { style: footerNote }, 
            "This alert was sent to protect your account. If you have questions, contact our support team."
          )
        )
      )
    )
  )
);

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
};

const header = {
  background: "linear-gradient(135deg, #dc2626, #7C3AED)",
  padding: "40px 20px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
};

const headerSubtitle = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "8px 0 0 0",
  opacity: "0.9",
};

const content = {
  padding: "40px 20px",
};

const alertIcon = {
  fontSize: "48px",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const h1 = {
  color: "#333333",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const actionText = {
  color: "#dc2626",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  border: "1px solid #fecaca",
};

const alertCard = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#fff7ed",
  border: "2px solid #fed7aa",
  borderRadius: "12px",
};

const alertTitle = {
  color: "#ea580c",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const alertDesc = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const detailsContainer = {
  margin: "16px 0",
};

const detailRow = {
  margin: "8px 0",
  fontSize: "14px",
  color: "#666666",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "16px",
  display: "inline-block",
};

const securityTips = {
  margin: "32px 0",
  padding: "20px",
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  border: "1px solid #bae6fd",
};

const tipsTitle = {
  color: "#0c4a6e",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const tipsList = {
  margin: "0",
  paddingLeft: "20px",
  color: "#374151",
};

const tipItem = {
  margin: "6px 0",
  fontSize: "14px",
};

const footer = {
  borderTop: "1px solid #eeeeeee",
  paddingTop: "20px",
  margin: "40px 20px 0",
  textAlign: "center" as const,
};

const footerText = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const footerNote = {
  color: "#999999",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};

interface SecurityAlertRequest {
  email: string;
  userName: string;
  alertType: string;
  alertMessage: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  supportUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { 
      email, 
      userName, 
      alertType,
      alertMessage,
      timestamp,
      ipAddress,
      location,
      deviceInfo,
      supportUrl
    }: SecurityAlertRequest = await req.json();

    if (!email || !userName || !alertType || !alertMessage || !timestamp) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const defaultSupportUrl = supportUrl || `${new URL(req.url).origin}/help`;

    const emailHtml = await renderAsync(
      React.createElement(SecurityAlertEmail, {
        userName,
        alertType,
        alertMessage,
        timestamp,
        ipAddress,
        location,
        deviceInfo,
        supportUrl: defaultSupportUrl,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "CIARA Security <info@ciara.city>",
      to: [email],
      subject: `🔒 Security Alert: ${alertType}`,
      html: emailHtml,
    });

    console.log("Security alert email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Security alert email sent successfully",
        messageId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-security-alert function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send security alert email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
