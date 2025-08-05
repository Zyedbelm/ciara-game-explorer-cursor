
import * as React from "npm:react@18.2.0";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.12";

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
}

export const ContactFormEmail: React.FC<ContactFormEmailProps> = ({
  name,
  email,
  subject,
  message,
  priority,
}) => {
  const priorityColor = () => {
    switch (priority) {
      case "urgent":
        return "#ef4444";
      case "high":
        return "#f97316";
      case "normal":
        return "#3b82f6";
      case "low":
        return "#10b981";
      default:
        return "#3b82f6";
    }
  };

  const priorityLabel = () => {
    switch (priority) {
      case "urgent":
        return "🚨 URGENTE";
      case "high":
        return "🔴 ÉLEVÉE";
      case "normal":
        return "🔵 NORMALE";
      case "low":
        return "🟢 FAIBLE";
      default:
        return "🔵 NORMALE";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Nouveau message de {name}: {subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header with CIARA branding */}
          <div style={styles.header}>
            <Heading style={styles.brandHeading}>CIARA</Heading>
            <Text style={styles.headerSubtitle}>Plateforme de Tourisme Intelligent</Text>
          </div>
          
          <Heading style={styles.heading}>Nouveau message via le formulaire de contact</Heading>
          
          <Section style={styles.infoSection}>
            <div style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 De:</Text>
              <Text style={styles.infoValue}>{name}</Text>
            </div>
            
            <div style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Email:</Text>
              <Text style={styles.infoValue}>
                <a href={`mailto:${email}`} style={styles.emailLink}>{email}</a>
              </Text>
            </div>
            
            <div style={styles.infoRow}>
              <Text style={styles.infoLabel}>📋 Sujet:</Text>
              <Text style={styles.infoValue}>{subject}</Text>
            </div>
            
            <div style={styles.infoRow}>
              <Text style={styles.infoLabel}>⚡ Priorité:</Text>
              <Text style={{...styles.priorityBadge, backgroundColor: priorityColor()}}>
                {priorityLabel()}
              </Text>
            </div>
          </Section>
          
          <Hr style={styles.hr} />
          
          <Section>
            <Text style={styles.messageLabel}>💬 Message:</Text>
            <div style={styles.messageBox}>
              <Text style={styles.message}>{message}</Text>
            </div>
          </Section>
          
          <Hr style={styles.hr} />
          
          {/* Action buttons */}
          <Section style={styles.actionsSection}>
            <Text style={styles.actionsLabel}>Actions rapides:</Text>
            <div style={styles.buttonContainer}>
              <a href={`mailto:${email}?subject=Re: ${subject}`} style={{...styles.button, ...styles.replyButton}}>
                📧 Répondre
              </a>
            </div>
          </Section>
          
          <Text style={styles.footer}>
            Ce message a été envoyé depuis le formulaire de contact sur <strong>ciara.city</strong><br/>
            📅 Reçu le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}<br/>
            📧 info@ciara.city | 📞 +41 79 301 79 15
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: "#f8fafc",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: "0",
    padding: "20px",
  },
  container: {
    margin: "0 auto",
    padding: "0",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "32px 24px",
    textAlign: "center" as const,
  },
  brandHeading: {
    fontSize: "32px",
    color: "#ffffff",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    letterSpacing: "2px",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#e2e8f0",
    margin: "0",
    fontWeight: "300",
  },
  heading: {
    fontSize: "24px",
    color: "#1e293b",
    textAlign: "center" as const,
    margin: "32px 24px 24px 24px",
    fontWeight: "600",
  },
  infoSection: {
    padding: "24px",
    backgroundColor: "#f8fafc",
    margin: "0 24px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
  },
  infoLabel: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0",
    fontWeight: "500",
    minWidth: "80px",
  },
  infoValue: {
    fontSize: "16px",
    color: "#1e293b",
    fontWeight: "600",
    margin: "0",
    flex: "1",
  },
  emailLink: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  priorityBadge: {
    fontSize: "12px",
    color: "#ffffff",
    fontWeight: "bold",
    padding: "4px 12px",
    borderRadius: "20px",
    textAlign: "center" as const,
    display: "inline-block",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  messageLabel: {
    fontSize: "18px",
    color: "#374151",
    marginTop: "24px",
    marginBottom: "16px",
    fontWeight: "600",
    padding: "0 24px",
  },
  messageBox: {
    margin: "0 24px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    borderLeft: "4px solid #3b82f6",
  },
  message: {
    fontSize: "16px",
    color: "#374151",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap" as const,
    margin: "0",
  },
  actionsSection: {
    padding: "0 24px",
    marginTop: "24px",
  },
  actionsLabel: {
    fontSize: "16px",
    color: "#374151",
    fontWeight: "600",
    marginBottom: "12px",
  },
  buttonContainer: {
    display: "flex",
    gap: "12px",
  },
  button: {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "center" as const,
    transition: "all 0.2s ease",
  },
  replyButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  hr: {
    borderColor: "#e2e8f0",
    margin: "32px 24px",
  },
  footer: {
    textAlign: "center" as const,
    color: "#64748b",
    fontSize: "12px",
    margin: "32px 24px 24px 24px",
    lineHeight: "1.5",
  },
};
