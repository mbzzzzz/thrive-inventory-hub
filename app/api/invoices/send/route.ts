import { NextResponse } from "next/server"
import { Resend } from "resend"
import { RESEND_API_KEY } from "@/lib/env"

const resend = new Resend(RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { to, subject, htmlContent, textContent } = await request.json()

    if (!to || !subject || (!htmlContent && !textContent)) {
      return NextResponse.json({ success: false, error: "Missing required email fields." }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Resend API key not configured." }, { status: 500 })
    }

    const { data, error } = await resend.emails.send({
      from: "Thrive Inventory Hub <onboarding@resend.dev>", // Replace with your verified Resend domain
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
    })

    if (error) {
      console.error("Resend email error:", error)
      return NextResponse.json({ success: false, error: error.message || "Failed to send email." }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data, message: "Invoice email sent successfully!" })
  } catch (error: any) {
    console.error("API Error sending invoice email:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 },
    )
  }
}
