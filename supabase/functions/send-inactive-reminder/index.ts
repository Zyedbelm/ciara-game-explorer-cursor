
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

// Inactive Reminder Email Template
const InactiveReminderEmail = ({ 
  userName, 
  daysSinceLastActivity,
  incompleteJourneys,
  continueUrl 
}: { 
  userName: string; 
  daysSinceLastActivity: number;
  incompleteJourneys: Array<{name: string; progress: number}>;
  continueUrl: string; 
}) => (
  React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Preview, {}, "Your adventure is waiting for you!"),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          React.createElement(Heading, { style: headerTitle }, "CIARA"),
          React.createElement(Text, { style: headerSubtitle }, "Intelligent Tourism Platform")
        ),
        React.createElement(Section, { style: content },
          React.createElement("div", { style: adventureIcon }, "🗺️"),
          React.createElement(Heading, { style: h1 }, `We miss you, ${userName}!`),
          React.createElement(Text, { style: text }, 
            `It's been ${daysSinceLastActivity} days since your last adventure with CIARA. Your destinations are waiting for you to return!`
          ),
          incompleteJourneys.length > 0 && React.createElement(Section, { style: journeySection },
            React.createElement(Heading, { style: h2 }, "Your Incomplete Journeys:"),
            ...incompleteJourneys.map((journey, index) => 
              React.createElement("div", { style: journeyItem, key: index },
                React.createElement("div", { style: journeyName }, journey.name),
                React.createElement("div", { style: progressContainer },
                  React.createElement("div", { style: progressBar },
                    React.createElement("div", { 
                      style: { 
                        ...progressFill, 
                        width: `${journey.progress}%` 
                      } 
                    })
                  ),
                  React.createElement("span", { style: progressText }, `${journey.progress}% complete`)
                )
              )
            )
          ),
          React.createElement(Text, { style: motivationalText }, 
            "🌟 Every step you take brings you closer to amazing discoveries and exciting rewards!"
          ),
          React.createElement(Text, { style: text }, 
            "Ready to continue your exploration? Your next adventure is just a click away."
          ),
          React.createElement(Section, { style: buttonContainer },
            React.createElement(Button, {
              href: continueUrl,
              style: button
            }, "Continue Your Journey")
          )
        ),
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText }, 
            "Adventure awaits!",
            React.createElement("br", {}),
            "The CIARA Team",
            React.createElement("br", {}),
            React.createElement("br", {}),
            "📧 info@ciara.city | 📞 +41 79 301 79 15"
          ),
          React.createElement(Text, { style: unsubscribeText }, 
            React.createElement(Link, { 
              href: "#", 
              style: unsubscribeLink 
            }, "Unsubscribe from these reminders")
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

const adventureIcon = {
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
};

const text = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const motivationalText = {
  color: "#7C3AED",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#f8f6ff",
  borderRadius: "8px",
};

const journeySection = {
  margin: "32px 0",
};

const journeyItem = {
  margin: "16px 0",
  padding: "16px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "1px solid #e9ecef",
};

const journeyName = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333333",
  marginBottom: "8px",
};

const progressContainer = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const progressBar = {
  flex: "1",
  height: "8px",
  backgroundColor: "#e9ecef",
  borderRadius: "4px",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  backgroundColor: "#059669",
  borderRadius: "4px",
  transition: "width 0.3s ease",
};

const progressText = {
  fontSize: "14px",
  color: "#666666",
  minWidth: "80px",
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
  margin: "0 0 16px",
};

const unsubscribeText = {
  margin: "16px 0 0",
};

const unsubscribeLink = {
  color: "#999999",
  fontSize: "12px",
  textDecoration: "underline",
};

interface InactiveReminderRequest {
  email: string;
  userName: string;
  daysSinceLastActivity: number;
  incompleteJourneys: Array<{name: string; progress: number}>;
  continueUrl?: string;
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
      daysSinceLastActivity,
      incompleteJourneys,
      continueUrl 
    }: InactiveReminderRequest = await req.json();

    if (!email || !userName || daysSinceLastActivity === undefined) {
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

    const defaultContinueUrl = continueUrl || `${new URL(req.url).origin}/my-journeys`;

    const emailHtml = await renderAsync(
      React.createElement(InactiveReminderEmail, {
        userName,
        daysSinceLastActivity,
        incompleteJourneys: incompleteJourneys || [],
        continueUrl: defaultContinueUrl,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: "Your adventure is waiting for you! 🗺️",
      html: emailHtml,
    });

    console.log("Inactive reminder email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Inactive reminder email sent successfully",
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
    console.error("Error in send-inactive-reminder function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send inactive reminder email",
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
