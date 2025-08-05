
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

// Reward Notification Email Template
const RewardNotificationEmail = ({ 
  userName, 
  rewardName,
  rewardDescription,
  rewardValue,
  expirationDate,
  redeemUrl,
  qrCode
}: { 
  userName: string; 
  rewardName: string;
  rewardDescription: string;
  rewardValue: string;
  expirationDate?: string;
  redeemUrl: string;
  qrCode?: string;
}) => (
  React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Preview, {}, `You've earned a new reward: ${rewardName}!`),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          React.createElement(Heading, { style: headerTitle }, "CIARA"),
          React.createElement(Text, { style: headerSubtitle }, "Intelligent Tourism Platform")
        ),
        React.createElement(Section, { style: content },
          React.createElement("div", { style: rewardIcon }, "🎁"),
          React.createElement(Heading, { style: h1 }, "Congratulations!"),
          React.createElement(Text, { style: text }, 
            `Great news ${userName}! You've earned a new reward for your exploration efforts.`
          ),
          React.createElement(Section, { style: rewardCard },
            React.createElement(Heading, { style: rewardTitle }, rewardName),
            React.createElement(Text, { style: rewardDesc }, rewardDescription),
            React.createElement("div", { style: rewardValueContainer },
              React.createElement("span", { style: rewardValueLabel }, "Value: "),
              React.createElement("span", { style: rewardValue }, rewardValue)
            ),
            expirationDate && React.createElement(Text, { style: expirationText }, 
              `⏰ Valid until: ${expirationDate}`
            )
          ),
          qrCode && React.createElement(Section, { style: qrSection },
            React.createElement(Heading, { style: h2 }, "Your Reward Code"),
            React.createElement("div", { style: qrContainer },
              React.createElement("img", { 
                src: qrCode, 
                alt: "QR Code for reward redemption",
                style: qrImage 
              })
            ),
            React.createElement(Text, { style: qrInstructions }, 
              "Show this QR code at the partner location to redeem your reward."
            )
          ),
          React.createElement(Text, { style: text }, 
            "Ready to enjoy your reward? Visit the partner location and present your code!"
          ),
          React.createElement(Section, { style: buttonContainer },
            React.createElement(Button, {
              href: redeemUrl,
              style: button
            }, "View Reward Details")
          )
        ),
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText }, 
            "Enjoy your reward!",
            React.createElement("br", {}),
            "The CIARA Team",
            React.createElement("br", {}),
            React.createElement("br", {}),
            "📧 info@ciara.city | 📞 +41 79 301 79 15"
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
  background: "linear-gradient(135deg, #7C3AED, #059669)",
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

const rewardIcon = {
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

const h2 = {
  color: "#333333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "24px 0 16px",
  textAlign: "center" as const,
};

const text = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const rewardCard = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f8f6ff",
  border: "2px solid #7C3AED",
  borderRadius: "12px",
  textAlign: "center" as const,
};

const rewardTitle = {
  color: "#7C3AED",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const rewardDesc = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const rewardValueContainer = {
  margin: "16px 0",
};

const rewardValueLabel = {
  color: "#666666",
  fontSize: "16px",
};

const rewardValue = {
  color: "#059669",
  fontSize: "20px",
  fontWeight: "bold",
};

const expirationText = {
  color: "#e74c3c",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "16px 0 0",
};

const qrSection = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const qrContainer = {
  display: "flex",
  justifyContent: "center",
  margin: "20px 0",
};

const qrImage = {
  width: "200px",
  height: "200px",
  border: "2px solid #e9ecef",
  borderRadius: "8px",
};

const qrInstructions = {
  color: "#666666",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#7C3AED",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "16px",
  display: "inline-block",
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
  margin: "0",
};

interface RewardNotificationRequest {
  email: string;
  userName: string;
  rewardName: string;
  rewardDescription: string;
  rewardValue: string;
  expirationDate?: string;
  redeemUrl?: string;
  qrCode?: string;
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
      rewardName,
      rewardDescription,
      rewardValue,
      expirationDate,
      redeemUrl,
      qrCode
    }: RewardNotificationRequest = await req.json();

    if (!email || !userName || !rewardName || !rewardDescription || !rewardValue) {
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

    const defaultRedeemUrl = redeemUrl || `${new URL(req.url).origin}/rewards`;

    const emailHtml = await renderAsync(
      React.createElement(RewardNotificationEmail, {
        userName,
        rewardName,
        rewardDescription,
        rewardValue,
        expirationDate,
        redeemUrl: defaultRedeemUrl,
        qrCode,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: `🎁 New Reward: ${rewardName}`,
      html: emailHtml,
    });

    console.log("Reward notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reward notification email sent successfully",
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
    console.error("Error in send-reward-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send reward notification email",
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
