import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Section,
  Button,
} from "npm:@react-email/components@0.0.22";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Partner Reward Validation Email Template
const PartnerRewardValidationEmail = ({ 
  partnerName,
  rewardTitle,
  rewardDescription,
  redemptionCode,
  pointsSpent,
  validationUrl,
  userEmail
}: { 
  partnerName: string;
  rewardTitle: string;
  rewardDescription: string;
  redemptionCode: string;
  pointsSpent: number;
  validationUrl: string;
  userEmail: string;
}) => (
  React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          React.createElement(Heading, { style: headerTitle }, "CIARA"),
          React.createElement(Text, { style: headerSubtitle }, "Validation de Récompense Partenaire | Partner Reward Validation")
        ),
        React.createElement(Section, { style: content },
          React.createElement("div", { style: rewardIcon }, "🎟️"),
          React.createElement(Heading, { style: h1 }, "Nouvelle Demande de Validation | New Validation Request"),
          
          // French Section
          React.createElement(Section, { style: languageSection },
            React.createElement(Heading, { style: languageTitle }, "🇫🇷 FRANÇAIS"),
            React.createElement(Text, { style: text }, 
              `Bonjour ${partnerName},`
            ),
            React.createElement(Text, { style: text }, 
              "Un client souhaite utiliser une récompense CIARA dans votre établissement."
            ),
            React.createElement(Section, { style: rewardCard },
              React.createElement(Heading, { style: rewardTitle }, rewardTitle),
              React.createElement(Text, { style: rewardDesc }, rewardDescription),
              React.createElement("div", { style: codeContainer },
                React.createElement("span", { style: codeLabel }, "Code de rédemption: "),
                React.createElement("span", { style: codeValue }, redemptionCode)
              ),
              React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Points dépensés: "),
                React.createElement("span", { style: pointsValue }, `${pointsSpent} points`)
              ),
              React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Email client: "),
                React.createElement("span", { style: pointsValue }, userEmail)
              )
            ),
            React.createElement(Text, { style: text }, 
              "Cette récompense a été automatiquement validée dans le système. Vous pouvez l'honorer directement dans votre établissement."
            ),
            React.createElement(Text, { style: smallText }, 
              "Si vous avez des questions, contactez-nous à info@ciara.city"
            )
          ),

          // English Section
          React.createElement(Section, { style: languageSection },
            React.createElement(Heading, { style: languageTitle }, "🇬🇧 ENGLISH"),
            React.createElement(Text, { style: text }, 
              `Hello ${partnerName},`
            ),
            React.createElement(Text, { style: text }, 
              "A customer wants to use a CIARA reward at your establishment."
            ),
            React.createElement(Section, { style: rewardCard },
              React.createElement(Heading, { style: rewardTitle }, rewardTitle),
              React.createElement(Text, { style: rewardDesc }, rewardDescription),
              React.createElement("div", { style: codeContainer },
                React.createElement("span", { style: codeLabel }, "Redemption code: "),
                React.createElement("span", { style: codeValue }, redemptionCode)
              ),
              React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Points spent: "),
                React.createElement("span", { style: pointsValue }, `${pointsSpent} points`)
              ),
              React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Customer email: "),
                React.createElement("span", { style: pointsValue }, userEmail)
              )
            ),
            React.createElement(Text, { style: text }, 
              "This reward has been automatically validated in the system. You can honor it directly at your establishment."
            ),
            React.createElement(Text, { style: smallText }, 
              "If you have any questions, contact us at info@ciara.city"
            )
          )
        ),
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText }, 
            "Merci pour votre partenariat ! | Thank you for your partnership!",
            React.createElement("br", {}),
            "L'équipe CIARA | The CIARA Team",
            React.createElement("br", {}),
            React.createElement("br", {}),
            "📧 info@ciara.city"
          )
        )
      )
    )
  )
);

// User Confirmation Email Template
const UserRewardConfirmationEmail = ({ 
  rewardTitle,
  partnerName,
  redemptionCode,
  partnerAddress
}: { 
  rewardTitle: string;
  partnerName: string;
  redemptionCode: string;
  partnerAddress: string;
}) => (
  React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          React.createElement(Heading, { style: headerTitle }, "CIARA"),
          React.createElement(Text, { style: headerSubtitle }, "Confirmation d'utilisation | Usage Confirmation")
        ),
        React.createElement(Section, { style: content },
          React.createElement("div", { style: rewardIcon }, "✅"),
          React.createElement(Heading, { style: h1 }, "Récompense utilisée avec succès ! | Reward used successfully!"),
          
          // French Section
          React.createElement(Section, { style: languageSection },
            React.createElement(Heading, { style: languageTitle }, "🇫🇷 FRANÇAIS"),
            React.createElement(Text, { style: text }, 
              "Félicitations ! Votre récompense a été utilisée avec succès."
            ),
            React.createElement(Section, { style: rewardCard },
              React.createElement(Heading, { style: rewardTitle }, rewardTitle),
              React.createElement("div", { style: codeContainer },
                React.createElement("span", { style: codeLabel }, "Chez: "),
                React.createElement("span", { style: codeValue }, partnerName)
              ),
              partnerAddress && React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Adresse: "),
                React.createElement("span", { style: pointsValue }, partnerAddress)
              ),
              React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Code utilisé: "),
                React.createElement("span", { style: pointsValue }, redemptionCode)
              )
            ),
            React.createElement(Text, { style: text }, 
              "Profitez bien de votre récompense ! N'hésitez pas à explorer d'autres parcours pour gagner plus de points."
            ),
            React.createElement(Text, { style: smallText }, 
              "Merci d'utiliser CIARA pour découvrir votre région !"
            )
          ),

          // English Section
          React.createElement(Section, { style: languageSection },
            React.createElement(Heading, { style: languageTitle }, "🇬🇧 ENGLISH"),
            React.createElement(Text, { style: text }, 
              "Congratulations! Your reward has been used successfully."
            ),
            React.createElement(Section, { style: rewardCard },
              React.createElement(Heading, { style: rewardTitle }, rewardTitle),
              React.createElement("div", { style: codeContainer },
                React.createElement("span", { style: codeLabel }, "At: "),
                React.createElement("span", { style: codeValue }, partnerName)
              ),
              partnerAddress && React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Address: "),
                React.createElement("span", { style: pointsValue }, partnerAddress)
              ),
              React.createElement("div", { style: pointsContainer },
                React.createElement("span", { style: pointsLabel }, "Code used: "),
                React.createElement("span", { style: pointsValue }, redemptionCode)
              )
            ),
            React.createElement(Text, { style: text }, 
              "Enjoy your reward! Don't hesitate to explore other journeys to earn more points."
            ),
            React.createElement(Text, { style: smallText }, 
              "Thank you for using CIARA to discover your region!"
            )
          )
        ),
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText }, 
            "À bientôt sur CIARA ! | See you soon on CIARA!",
            React.createElement("br", {}),
            "L'équipe CIARA | The CIARA Team",
            React.createElement("br", {}),
            React.createElement("br", {}),
            "📧 info@ciara.city"
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

const text = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const smallText = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const rewardCard = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f8f6ff",
  border: "2px solid #7C3AED",
  borderRadius: "12px",
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

const codeContainer = {
  margin: "16px 0",
  padding: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e9ecef",
  borderRadius: "6px",
};

const codeLabel = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: "bold",
};

const codeValue = {
  color: "#007bff",
  fontSize: "18px",
  fontWeight: "bold",
  fontFamily: "monospace",
};

const pointsContainer = {
  margin: "16px 0",
};

const pointsLabel = {
  color: "#666666",
  fontSize: "14px",
};

const pointsValue = {
  color: "#059669",
  fontSize: "16px",
  fontWeight: "bold",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#059669",
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

const languageSection = {
  margin: "32px 0",
  padding: "24px",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  backgroundColor: "#fafafa",
};

const languageTitle = {
  color: "#333333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
  borderBottom: "2px solid #7C3AED",
  paddingBottom: "10px",
};

interface RewardRedemptionRequest {
  voucherId: string;
  redemptionCode: string;
  partnerEmail: string;
  partnerName: string;
  partnerAddress?: string;
  rewardTitle: string;
  rewardDescription: string;
  pointsSpent: number;
  userEmail?: string;
  language?: string;
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
      voucherId,
      redemptionCode,
      partnerEmail,
      partnerName,
      partnerAddress,
      rewardTitle,
      rewardDescription,
      pointsSpent,
      userEmail,
      language = 'fr'
    }: RewardRedemptionRequest = await req.json();

    console.log('Received reward redemption request:', {
      voucherId,
      redemptionCode,
      partnerEmail,
      partnerName,
      rewardTitle
    });

    if (!voucherId || !redemptionCode || !partnerEmail || !partnerName || !rewardTitle) {
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update voucher status to 'used' and set used_at timestamp
    const { error: updateError } = await supabase
      .from('reward_redemptions')
      .update({ 
        status: 'used',
        used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('redemption_code', redemptionCode);

    if (updateError) {
      console.error('Error updating voucher status:', updateError);
      throw new Error('Failed to update voucher status');
    }

    console.log('Voucher status updated to "used" for code:', redemptionCode);

    // Get additional data from database including user email and partner address
    let finalUserEmail = userEmail;
    let finalPartnerAddress = partnerAddress;
    
    try {
      // Get voucher data with user and reward information
      const { data: redemptionData, error: fetchError } = await supabase
        .from('reward_redemptions')
        .select(`
          user_id,
          reward_id
        `)
        .eq('redemption_code', redemptionCode)
        .single();

      if (fetchError) {
        console.error('Error fetching redemption data:', fetchError);
      } else if (redemptionData) {
        // Get user email if not provided
        if (!finalUserEmail) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', redemptionData.user_id)
            .single();
          
          if (userData?.email) {
            finalUserEmail = userData.email;
            console.log('Retrieved user email from database:', finalUserEmail);
          }
        }
        
        // Get partner address if not provided
        if (!finalPartnerAddress) {
          const { data: rewardData } = await supabase
            .from('rewards')
            .select(`
              partner_id,
              partners!inner (
                address
              )
            `)
            .eq('id', redemptionData.reward_id)
            .single();
          
          if (rewardData?.partners?.address) {
            finalPartnerAddress = rewardData.partners.address;
            console.log('Retrieved partner address from database:', finalPartnerAddress);
          }
        }
      }
    } catch (dataError) {
      console.error('Error retrieving additional data:', dataError);
      // Continue with provided data
    }

    // Send email to partner
    const partnerEmailHtml = await renderAsync(
      React.createElement(PartnerRewardValidationEmail, {
        partnerName,
        rewardTitle,
        rewardDescription,
        redemptionCode,
        pointsSpent,
        validationUrl: '', // No longer needed
        userEmail: finalUserEmail || 'Non spécifié'
      })
    );

    // Create bilingual subject (French | English)
    const partnerSubject = `🎟️ Validation de récompense CIARA | CIARA Reward Validation - ${rewardTitle}`;

    const partnerEmailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [partnerEmail],
      subject: partnerSubject,
      html: partnerEmailHtml,
    });

    console.log("Partner email sent successfully:", partnerEmailResponse);

    // Send confirmation email to user if email is provided
    if (finalUserEmail) {
      try {
        const userEmailHtml = await renderAsync(
          React.createElement(UserRewardConfirmationEmail, {
            rewardTitle,
            partnerName,
            redemptionCode,
            partnerAddress: finalPartnerAddress
          })
        );

        // Create bilingual subject (French | English)
        const userSubject = `✅ Confirmation d'utilisation | Usage Confirmation - ${rewardTitle}`;

        const userEmailResponse = await resend.emails.send({
          from: "CIARA <info@ciara.city>",
          to: [finalUserEmail],
          subject: userSubject,
          html: userEmailHtml,
        });

        console.log("User confirmation email sent successfully:", userEmailResponse);
      } catch (userEmailError) {
        console.error('Error sending user confirmation email:', userEmailError);
        // Don't fail the whole process if user email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Récompense utilisée avec succès. Emails envoyés.",
        messageId: partnerEmailResponse.data?.id 
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
    console.error("Error in send-reward-redemption function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process reward redemption",
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