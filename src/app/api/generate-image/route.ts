import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    const apiSecret = request.headers.get("X-API-SECRET");
    if (apiSecret !== process.env.API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(
      "https://ihsangokalp--sd-demo-model-generate.modal.run/"
    );
    url.searchParams.set("prompt", text);

    if (!process.env.API_KEY) {
      console.error("Missing API_KEY environment variable");
      throw new Error("API_KEY is required but not set.");
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        X_API_KEY: process.env.API_KEY || "",
        Accept: "image/jpeg",
      },
    });

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response: ", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const imageBuffer = await response.arrayBuffer();

    const filename = `${crypto.randomUUID()} - ${text}.jpeg`;

    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    return NextResponse.json({
      success: true,
      // message: `Received ${text}`,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to process request ${error}` },
      { status: 500 }
    );
  }
}
