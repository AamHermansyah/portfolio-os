import { ImageResponse } from "next/og";

export const alt =
  "Aam Hermansyah fullstack developer portfolio presented as PortfolioOS 98";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const technologies = ["NEXT.JS", "REACT", "TYPESCRIPT", "NODE.JS", "POSTGRESQL"];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#007b7b",
          color: "#111",
          display: "flex",
          flexDirection: "column",
          fontFamily: "monospace",
          height: "100%",
          justifyContent: "center",
          padding: "42px 52px 34px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#c0c0c0",
            border: "5px solid #e8e8e8",
            boxShadow: "10px 12px 0 #004f4f",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#000080",
              color: "white",
              display: "flex",
              fontSize: 25,
              fontWeight: 700,
              justifyContent: "space-between",
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex" }}>PortfolioOS 98 — Developer Profile</div>
            <div style={{ display: "flex" }}>_ [] X</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "34px 40px 31px",
            }}
          >
            <div style={{ color: "#000080", display: "flex", fontSize: 62, fontWeight: 800 }}>
              Aam Hermansyah
            </div>
            <div style={{ display: "flex", fontSize: 31, marginTop: 9 }}>
              Fullstack Developer · Indonesia
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 30 }}>
              {technologies.map((technology) => (
                <div
                  key={technology}
                  style={{
                    background: "#fff",
                    border: "3px solid #707070",
                    color: "#222",
                    display: "flex",
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 10,
                    marginRight: 12,
                    padding: "8px 13px",
                  }}
                >
                  {technology}
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              borderTop: "3px solid #777",
              display: "flex",
              fontSize: 21,
              justifyContent: "space-between",
              padding: "10px 15px",
            }}
          >
            <div style={{ display: "flex" }}>Projects · Skills · Experience · Publications</div>
            <div style={{ display: "flex" }}>READY</div>
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            color: "#eaffff",
            display: "flex",
            fontSize: 18,
            justifyContent: "space-between",
            marginTop: 25,
            width: "100%",
          }}
        >
          <div style={{ display: "flex" }}>Interactive Windows 98-inspired portfolio</div>
          <div style={{ display: "flex" }}>aamhermansyah.vercel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
