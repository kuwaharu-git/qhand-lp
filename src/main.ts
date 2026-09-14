import "./style.css";

const appUrl = new URL(
  import.meta.env.VITE_APP_URL || "https://qhand.pages.dev/",
);
if (!["https:", "http:"].includes(appUrl.protocol)) {
  throw new Error("VITE_APP_URL must be an HTTP(S) URL.");
}
document.querySelectorAll<HTMLAnchorElement>(".app-link").forEach((link) => {
  link.href = link.dataset.appPath
    ? new URL(link.dataset.appPath, appUrl).href
    : appUrl.href;
});
const year = document.querySelector<HTMLElement>("#year");
if (year) year.textContent = String(new Date().getFullYear());

const stages = ["start", "connecting", "encrypted", "received"] as const;
type Stage = (typeof stages)[number];
let stage: Stage = "start";
const demo = document.querySelector<HTMLElement>(".handoff-demo")!;
const sender = document.querySelector<HTMLElement>("#sender-screen")!;
const receiver = document.querySelector<HTMLElement>("#receiver-screen")!;
const narration = document.querySelector<HTMLElement>("#narration")!;
const previous = document.querySelector<HTMLButtonElement>("#previous-demo")!;
const advance = document.querySelector<HTMLButtonElement>("#advance-demo")!;
const replay = document.querySelector<HTMLButtonElement>("#replay-demo")!;
const wizardProgress = document.querySelector<HTMLElement>("#wizard-progress")!;
const motionToggle =
  document.querySelector<HTMLButtonElement>("#motion-toggle")!;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = reducedMotion.matches;

const flowScreens: Record<
  Stage,
  {
    sender: { file: string; alt: string };
    receiver: { file: string; alt: string };
  }
> = {
  start: {
    sender: {
      file: "handoff-sender-start-placeholder.png",
      alt: "送信側の開始QR画面を差し替えるための無地の仮画像。",
    },
    receiver: {
      file: "handoff-receiver-camera-placeholder.svg",
      alt: "相手の標準カメラで、送信側に表示された最初のQRを読み取るイメージ。",
    },
  },
  connecting: {
    sender: {
      file: "handoff-sender-start-placeholder.png",
      alt: "受信準備を待つ送信側画面を差し替えるための無地の仮画像。",
    },
    receiver: {
      file: "handoff-receiver-connecting-placeholder.png",
      alt: "受信側の接続準備画面を差し替えるための無地の仮画像。",
    },
  },
  encrypted: {
    sender: {
      file: "handoff-sender-encrypted-placeholder.png",
      alt: "送信側の暗号化された名刺QR画面を差し替えるための無地の仮画像。",
    },
    receiver: {
      file: "handoff-receiver-scanner-placeholder.png",
      alt: "受信側のQHand内QR読取画面を差し替えるための無地の仮画像。",
    },
  },
  received: {
    sender: {
      file: "handoff-sender-complete-placeholder.png",
      alt: "送信側の受け渡し完了画面を差し替えるための無地の仮画像。",
    },
    receiver: {
      file: "handoff-receiver-card-placeholder.png",
      alt: "受信側の名刺受取結果画面を差し替えるための無地の仮画像。",
    },
  },
};

function screenImage(side: "sender" | "receiver") {
  const screen = flowScreens[stage][side];
  return `<img class="flow-screen-image" src="/screens/${screen.file}" width="738" height="1314" alt="${screen.alt}" />`;
}

function renderFlow() {
  demo.dataset.stage = stage;
  const currentStageIndex = stages.indexOf(stage);
  document.querySelectorAll<HTMLElement>("[data-phase]").forEach((phase) => {
    const phaseIndex = stages.indexOf(phase.dataset.phase as Stage);
    if (phase.dataset.phase === stage) {
      phase.setAttribute("aria-current", "step");
      phase.dataset.state = "current";
    } else {
      phase.removeAttribute("aria-current");
      phase.dataset.state =
        phaseIndex < currentStageIndex ? "complete" : "upcoming";
    }
  });
  let channel = "";
  let bodyLocation = "本文は、まだ<br />あなたの端末に。";
  previous.hidden = currentStageIndex === 0;
  advance.hidden = false;
  replay.hidden = true;
  wizardProgress.textContent = `${currentStageIndex + 1} / ${stages.length}`;
  switch (stage) {
    case "start":
      channel = "受信ページを開く →";
      narration.textContent =
        "最初のQRを相手に読み取ってもらいます。このQRにはまだ名刺の本文は含まれていません。相手の標準カメラで読み取ると、受信ページが開きます。";
      advance.textContent = "次へ：ブラウザで準備 →";
      break;
    case "connecting":
      channel = "サーバーで接続準備";
      narration.textContent =
        "相手のブラウザで受信準備が進みます。サーバーは接続準備の情報だけを中継し、本文はまだあなたの端末にあります。";
      advance.textContent = "次へ：次のQRを読む →";
      break;
    case "encrypted":
      channel = "暗号化された名刺 →";
      bodyLocation = "ここで初めて、<br />本文が相手へ。";
      narration.textContent =
        "あなたの画面が次のQRに切り替わります。相手はブラウザのカメラを許可して、もう一度読み取り。暗号化された名刺が、QRを通して相手へ渡ります。";
      advance.textContent = "次へ：受け取り →";
      break;
    case "received":
      channel = "受け取りました";
      bodyLocation = "本文は、<br />相手の画面に。";
      narration.textContent =
        "相手の端末に名刺が表示されました。受け取った人は、このブラウザへの保管や連絡先ファイルへの保存を選べます。";
      advance.hidden = true;
      replay.hidden = false;
      break;
  }
  sender.innerHTML = screenImage("sender");
  receiver.innerHTML = screenImage("receiver");
  document.querySelector<HTMLElement>("#channel-label")!.textContent = channel;
  document.querySelector<HTMLElement>("#channel-body")!.innerHTML =
    bodyLocation;
}
advance.addEventListener("click", () => {
  const nextStage = stages[stages.indexOf(stage) + 1];
  if (!nextStage) return;
  stage = nextStage;
  renderFlow();
  if (stage === "received") replay.focus({ preventScroll: true });
  showUpdatedScreens();
});
previous.addEventListener("click", () => {
  const previousStage = stages[stages.indexOf(stage) - 1];
  if (!previousStage) return;
  stage = previousStage;
  renderFlow();
  showUpdatedScreens();
});
replay.addEventListener("click", () => {
  stage = "start";
  renderFlow();
  advance.focus({ preventScroll: true });
  showUpdatedScreens();
});
function showUpdatedScreens() {
  if (!window.matchMedia("(max-width: 600px)").matches) return;
  document.querySelector<HTMLElement>(".exchange-workspace")?.scrollIntoView({
    behavior: reducedMotion.matches ? "instant" : "smooth",
    block: "start",
  });
}
function setMotion() {
  demo.classList.toggle("motion-paused", motionPaused);
  motionToggle.disabled = reducedMotion.matches;
  motionToggle.setAttribute("aria-pressed", String(motionPaused));
  motionToggle.textContent = reducedMotion.matches
    ? "端末の設定に合わせて動きを停止中"
    : motionPaused
      ? "動きを再生する"
      : "動きを止める";
}
motionToggle.addEventListener("click", () => {
  motionPaused = !motionPaused;
  setMotion();
});
reducedMotion.addEventListener("change", (event) => {
  motionPaused = event.matches;
  setMotion();
});
setMotion();
renderFlow();
