import { ImageResponse } from "next/og";

export const alt = "Meridian Recruitment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0d2733", color: "#f3f5f3", padding: 80 }}>
        <div style={{ fontSize: 40, fontWeight: 700, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, border: "3px solid #f3f5f3", display: "flex" }} />
          Meridian
        </div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05, maxWidth: 940, display: "flex" }}>
          The right people, checked before you meet them.
        </div>
        <div style={{ fontSize: 30, color: "#4cc0a8", display: "flex" }}>Recruitment for every industry, built in Australia.</div>
      </div>
    ),
    size,
  );
}
