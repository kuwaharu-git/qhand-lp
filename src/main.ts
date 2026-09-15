import "./style.css";
import "./explanation-visuals";
import "./hero.css";

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
      alt: "渡す側に開始QRが表示されたQHand画面。",
    },
    receiver: {
      file: "handoff-receiver-camera-placeholder.png",
      alt: "相手の標準カメラで、送信側に表示された最初のQRを読み取るイメージ。",
    },
  },
  connecting: {
    sender: {
      file: "handoff-sender-start-placeholder.png",
      alt: "相手の受信準備を待つ、渡す側のQHand画面。",
    },
    receiver: {
      file: "handoff-receiver-connecting-placeholder.png",
      alt: "相手のブラウザで安全な接続を準備しているQHand画面。",
    },
  },
  encrypted: {
    sender: {
      file: "handoff-sender-encrypted-placeholder.png",
      alt: "渡す側に暗号化された情報の最終QRが表示されたQHand画面。",
    },
    receiver: {
      file: "handoff-receiver-scanner-placeholder.png",
      alt: "相手がQHand内のカメラで最終QRを読み取る画面。",
    },
  },
  received: {
    sender: {
      file: "handoff-sender-complete-placeholder.png",
      alt: "情報を渡し終えた送信側のQHand画面。",
    },
    receiver: {
      file: "handoff-receiver-card-placeholder.png",
      alt: "受け取ったプロフィールが表示された相手側のQHand画面。",
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
        "01 つながる。相手が最初のQRを標準カメラで読み取ると、QHandの受信ページが開きます。このQRに情報本文は含まれていません。";
      advance.textContent = "次へ：02 たしかめる →";
      break;
    case "connecting":
      channel = "接続準備を確認";
      narration.textContent =
        "02 たしかめる。渡す側は接続を、受け取る側は最終QRを読む画面を確認します。現行の通常版では、両端末で比較する確認コードは使用しません。";
      advance.textContent = "次へ：03 手渡す →";
      break;
    case "encrypted":
      channel = "暗号化した情報 →";
      bodyLocation = "最終QRで、<br />情報が相手へ。";
      narration.textContent =
        "03 手渡す。相手がQHandの画面でもう一度読み取ります。選んだ情報はブラウザ内で暗号化され、最終QRを通して相手へ直接渡ります。";
      advance.textContent = "次へ：04 受け取る →";
      break;
    case "received":
      channel = "受け渡し完了";
      bodyLocation = "相手の端末で、<br />内容を確認。";
      narration.textContent =
        "04 受け取る。受け渡し完了です。渡す側には完了画面が表示され、受け取る側では内容の確認や端末への保存を選べます。";
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
