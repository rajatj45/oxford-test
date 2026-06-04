import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const clientKey = process.env.NEXT_PUBLIC_GRAVITY_FORMS_KEY;
  const secretKey = process.env.GRAVITY_FORMS_SECRET_KEY;
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const authHeader = `Basic ${Buffer.from(`${clientKey}:${secretKey}`).toString("base64")}`;

  try {
    const captchaToken = req.headers.get("X-Captcha-Token");

    if (captchaToken && captchaToken !== "null" && captchaToken !== "") {
      const verifyRes = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${recaptchaSecret}&response=${captchaToken}`,
        },
      );

      const verification = await verifyRes.json();

      if (!verification.success) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed" },
          { status: 401 },
        );
      }
    }

    const incomingData = await req.formData();
    const formId = incomingData.get("form_id");

    if (!formId) {
      return NextResponse.json({ error: "Missing form_id" }, { status: 400 });
    }

    const outFormData = new FormData();

    for (const [key, value] of incomingData.entries()) {
      if (value instanceof File) {
        outFormData.append(key, value, value.name);
      } else {
        outFormData.append(key, value);
      }
    }

    const targetUrl = `${backendUrl}/wp-json/gf/v2/forms/${formId}/submissions`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: outFormData,
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const htmlError = await res.text();
      console.error("WordPress returned HTML instead of JSON:", htmlError);
      return NextResponse.json(
        { error: "WordPress Server Error", details: htmlError },
        { status: 500 },
      );
    }
    const data = await res.json();

    if (!res.ok || data.is_valid === false) {
      console.error("Gravity Forms Error Response:", data);
      return NextResponse.json(
        {
          error: "Form submission rejected",
          validation_messages: data.validation_messages || "Unknown error",
        },
        { status: res.status || 400 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Server Error:", error);

    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 },
    );
  }
}
