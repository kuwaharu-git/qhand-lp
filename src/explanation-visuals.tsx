import { createRoot } from "react-dom/client";
import "./explanation-visuals.css";

function Connection({ bold = false }: { bold?: boolean }) {
  return (
    <svg
      className={bold ? "ev-link ev-link--direct" : "ev-link"}
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 12 H96 M88 5 L96 12 L88 19" />
    </svg>
  );
}

function Paper() {
  return (
    <span className="ev-paper" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function Phone({ received = false }: { received?: boolean }) {
  return (
    <span className="ev-phone" aria-hidden="true">
      <Paper />
      {received && <i className="ev-check">✓</i>}
    </span>
  );
}

function QR() {
  return (
    <span className="ev-qr">
      <img
        src="/qr/qr-demo.png"
        width="87"
        height="87"
        alt="説明用のQRコード"
      />
    </span>
  );
}

function Server() {
  return (
    <span className="ev-server" aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

function AboutVisual() {
  return (
    <div
      className="ev-about"
      role="group"
      aria-label="プロフィール、メモ、URL、案内から今回渡す内容を選び、QRで相手へ手渡す"
    >
      <div className="ev-sources">
        {["Profile", "Memo", "URL", "Info"].map((label) => (
          <span key={label}>
            <i
              className={
                "ev-source-icon ev-source-icon--" + label.toLowerCase()
              }
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
      <Connection />
      <div className="ev-node ev-bundle">
        <div className="ev-bundle-art">
          <Paper />
          <Paper />
        </div>
        <strong>今回渡す内容</strong>
      </div>
      <Connection bold />
      <div className="ev-node">
        <QR />
        <strong>QRで手渡す</strong>
      </div>
      <Connection bold />
      <div className="ev-node">
        <Phone received />
        <strong>目の前の相手</strong>
      </div>
    </div>
  );
}

function PrivacyVisual() {
  return (
    <div className="ev-comparison">
      <div
        className="ev-lane ev-lane--general"
        role="group"
        aria-label="一般的な共有：情報本文はあなたからサーバーを経由して相手へ"
      >
        <div className="ev-lane-title">
          <strong>一般的な共有</strong>
          <span>本文をサーバーへ</span>
        </div>
        <div className="ev-route">
          <div className="ev-node">
            <Phone />
            <span>あなた</span>
          </div>
          <Connection />
          <div className="ev-node">
            <Server />
            <span>サーバー</span>
          </div>
          <Connection />
          <div className="ev-node">
            <Phone received />
            <span>相手</span>
          </div>
        </div>
      </div>
      <div
        className="ev-lane ev-lane--qhand"
        role="group"
        aria-label="QHand：情報本文はQRであなたから相手へ直接渡す。一時セッションや公開鍵はサーバーと通信する"
      >
        <div className="ev-lane-title">
          <strong>
            QHand
          </strong>
          <span>本文はQRで、直接。</span>
        </div>
        <div className="ev-route ev-route--qhand">
          <div className="ev-node">
            <Phone />
            <span>あなた</span>
          </div>
          <Connection bold />
          <div className="ev-node">
            <QR />
            <span>暗号化した本文</span>
          </div>
          <Connection bold />
          <div className="ev-node">
            <Phone received />
            <span>相手</span>
          </div>
          <div className="ev-support">
            <svg
              viewBox="0 0 600 64"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M48 0 V32 Q48 45 62 45 H538 Q552 45 552 32 V0" />
            </svg>
            <div>
              <span className="ev-support-server">
                <Server />
                サーバー
              </span>
              <small>接続準備のみ：一時セッション・公開鍵など</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const about = document.getElementById("about-visual");
const privacy = document.getElementById("privacy-visual");
if (about) createRoot(about).render(<AboutVisual />);
if (privacy) createRoot(privacy).render(<PrivacyVisual />);
