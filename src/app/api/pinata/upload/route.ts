import { NextRequest, NextResponse } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";

export async function POST(request: NextRequest) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return NextResponse.json(
        { error: "Pinata API keys not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Step 1: Upload the file to Pinata
    const fileFormData = new FormData();
    fileFormData.append("file", file);
    fileFormData.append(
      "pinataMetadata",
      JSON.stringify({ name: `${name}-file` })
    );

    const fileRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        body: fileFormData,
      }
    );

    if (!fileRes.ok) {
      const errorText = await fileRes.text();
      console.error("Pinata file upload error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload file to IPFS" },
        { status: 500 }
      );
    }

    const fileData = await fileRes.json();
    const imageUrl = `${PINATA_GATEWAY}/ipfs/${fileData.IpfsHash}`;

    // Step 2: Upload metadata JSON to Pinata
    const metadata = {
      name,
      description,
      image: imageUrl,
      properties: {
        creator: "FanFunding NEAR",
        platform: "NEAR Protocol",
      },
    };

    const metadataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: { name: `${name}-metadata` },
        }),
      }
    );

    if (!metadataRes.ok) {
      const errorText = await metadataRes.text();
      console.error("Pinata metadata upload error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload metadata to IPFS" },
        { status: 500 }
      );
    }

    const metadataData = await metadataRes.json();
    const metadataUrl = `${PINATA_GATEWAY}/ipfs/${metadataData.IpfsHash}`;

    return NextResponse.json({ imageUrl, metadataUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
