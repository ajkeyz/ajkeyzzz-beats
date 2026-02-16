// Supabase Edge Function: send-notification
// Sends email notifications for order confirmations and inquiry alerts.
//
// Deploy: supabase functions deploy send-notification
// Set secrets:
//   supabase secrets set RESEND_API_KEY=re_xxxxx
//   supabase secrets set OWNER_EMAIL=ajkeyzzz@gmail.com
//   supabase secrets set SITE_URL=https://your-domain.com

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") || "ajkeyzzz@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") || "https://ajkeyzzz-beats.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderPayload {
  type: "order_confirmation";
  customer_email: string;
  customer_name: string;
  beat_title: string;
  license_tier: string;
  amount: number;
  download_token: string;
}

interface InquiryPayload {
  type: "inquiry_notification";
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  budget?: string;
  timeline?: string;
}

interface ContactPayload {
  type: "contact_notification";
  name: string;
  email: string;
  subject: string;
  message: string;
}

type NotificationPayload = OrderPayload | InquiryPayload | ContactPayload;

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set. Email would be sent to:", to);
    console.log("Subject:", subject);
    return { success: true, mock: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "AJKEYZZZ Beats <noreply@ajkeyzzz.com>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await res.json();
}

function orderConfirmationEmail(payload: OrderPayload): { subject: string; html: string } {
  const downloadUrl = `${SITE_URL}/download/${payload.download_token}`;
  const tierLabels: Record<string, string> = {
    basic: "Basic Lease",
    premium: "Premium Lease",
    unlimited: "Unlimited Lease",
    exclusive: "Exclusive",
  };

  return {
    subject: `Your beat is ready — ${payload.beat_title}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f11; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="padding: 40px 32px; text-align: center; background: linear-gradient(135deg, #E8439322, #6C5CE722);">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #fff;">AJKEYZZZ</h1>
          <p style="margin: 8px 0 0; color: #999; font-size: 14px;">Order Confirmation</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #ccc;">Hey${payload.customer_name ? ` ${payload.customer_name}` : ''},</p>
          <p style="font-size: 14px; color: #999; line-height: 1.6;">
            Thank you for your purchase! Your beat is ready to download.
          </p>
          <div style="background: #1a1a1d; border: 1px solid #2a2a2d; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <div style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px;">${payload.beat_title}</div>
            <div style="font-size: 13px; color: #999;">${tierLabels[payload.license_tier] || payload.license_tier} — $${Number(payload.amount).toFixed(2)}</div>
          </div>
          <a href="${downloadUrl}" style="display: inline-block; padding: 14px 32px; background: #E84393; color: #fff; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 600; margin: 16px 0;">
            Download Your Beat
          </a>
          <p style="font-size: 12px; color: #666; margin-top: 24px;">
            This download link expires in 72 hours. If you need a new link, reply to this email.
          </p>
        </div>
        <div style="padding: 20px 32px; border-top: 1px solid #2a2a2d; text-align: center;">
          <p style="font-size: 11px; color: #555; margin: 0;">AJKEYZZZ Beats — ${SITE_URL}</p>
        </div>
      </div>
    `,
  };
}

function inquiryNotificationEmail(payload: InquiryPayload): { subject: string; html: string } {
  const typeLabels: Record<string, string> = {
    custom_beat: "Custom Beat",
    film_media: "Film & Media",
    artist_development: "Artist Development",
    sound_design: "Sound Design",
    other: "Other",
  };

  return {
    subject: `New inquiry from ${payload.name} — ${typeLabels[payload.inquiry_type] || payload.inquiry_type}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="margin: 0 0 16px;">New Production Inquiry</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666;">Name</td><td style="padding: 8px 0; font-weight: 600;">${payload.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${payload.email}">${payload.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Type</td><td style="padding: 8px 0;">${typeLabels[payload.inquiry_type] || payload.inquiry_type}</td></tr>
          ${payload.budget ? `<tr><td style="padding: 8px 0; color: #666;">Budget</td><td style="padding: 8px 0;">${payload.budget}</td></tr>` : ""}
          ${payload.timeline ? `<tr><td style="padding: 8px 0; color: #666;">Timeline</td><td style="padding: 8px 0;">${payload.timeline}</td></tr>` : ""}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${payload.message}</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">View in admin: ${SITE_URL}/admin/inquiries</p>
      </div>
    `,
  };
}

function contactNotificationEmail(payload: ContactPayload): { subject: string; html: string } {
  return {
    subject: `Contact: ${payload.subject || "New message"} — from ${payload.name}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="margin: 0 0 16px;">New Contact Message</h2>
        <p><strong>From:</strong> ${payload.name} &lt;${payload.email}&gt;</p>
        ${payload.subject ? `<p><strong>Subject:</strong> ${payload.subject}</p>` : ""}
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${payload.message}</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">View in admin: ${SITE_URL}/admin/messages</p>
      </div>
    `,
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();

    let result;

    switch (payload.type) {
      case "order_confirmation": {
        const { subject, html } = orderConfirmationEmail(payload);
        // Send to customer
        result = await sendEmail(payload.customer_email, subject, html);
        // Also notify owner
        await sendEmail(
          OWNER_EMAIL,
          `New order: ${payload.beat_title} — $${Number(payload.amount).toFixed(2)}`,
          `<p>New ${payload.license_tier} order for "${payload.beat_title}" from ${payload.customer_email}.</p>
           <p>Amount: $${Number(payload.amount).toFixed(2)}</p>
           <p><a href="${SITE_URL}/admin/orders">View in admin</a></p>`
        );
        break;
      }

      case "inquiry_notification": {
        const { subject, html } = inquiryNotificationEmail(payload);
        result = await sendEmail(OWNER_EMAIL, subject, html);
        break;
      }

      case "contact_notification": {
        const { subject, html } = contactNotificationEmail(payload);
        result = await sendEmail(OWNER_EMAIL, subject, html);
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown notification type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
