# QHand Landing Page

QHandのオンライン版を紹介するVite + TypeScript + CSSのページです。本番依存パッケージ・外部フォント・画像の外部読み込みはありません。

## 開発

```sh
source "$HOME/.nvm/nvm.sh"
nvm use
npm ci
npm run dev
```

開発URL: http://127.0.0.1:5174

```sh
npm run typecheck
npm run format:check
npm run build
npm run preview
```

ビルド結果は `dist/`。プレビューは http://127.0.0.1:4174 です。

## 編集箇所

- `index.html`: コピー、非対称なセクション構成、実画面、FAQ
- `src/style.css`: 紙色・朱色の配色、既存の書体、端末間の移動モーション、レスポンシブ表示
- `src/main.ts`: オンライン版の受け渡しデモ、段階ごとの画面画像、リンク先設定
- `public/screens/`: 公開QHandから取得した実画面と、差し替え用の画面プレースホルダー
- `public/qr/`: 既存の説明用QR素材（現在の画面画像構成では未使用）

リンク先の既定値は https://qhand.pages.dev/ 。変更する場合は `.env.example` を `.env` にコピーして `VITE_APP_URL` を設定し、再ビルドします。JavaScript無効時のリンクも変える場合は、`index.html` の `.app-link` の `href` も更新してください。

## デザインと紹介の範囲

ファーストビューでは、2台のスマートフォン間でQRを使って、その場で情報を直接手渡す体験を主役にしています。渡す項目の選択はHero直下で説明し、プロフィール作成や名刺管理ではなく、対面での受け渡しが第一印象になる構成です。メモとWi-Fiは応用用途として分離します。

**今回の紹介はオンライン版のみです。** 開始QR → ブラウザで受信準備 → 暗号化された本文のQR → 受け取り、という流れです。オフライン版の数字照合や受信者公開鍵QRの読み返しは含めません。

## 実画面・デモの出典

2026-09-14に、隣接QHandリポジトリと公開中の https://qhand.pages.dev/ を確認しました。

| 素材・内容                         | 根拠                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `screens/memo-preview.png`         | 公開アプリの「メモ・案内 → 内容確認」を440px幅で撮影。展示会URLとひとことの架空の入力例                         |
| `screens/wifi-preview.png`         | 同画面の内容部分を撮影。Guest-WiFiと説明専用パスワードの伏せ字                                                  |
| 共有項目のON/OFF                   | `frontend/src/pages/ShareEditorPage.tsx` のUI・説明文を抜粋して再構成                                           |
| 開始QR・受信準備・次のQR・受け取り | `frontend/src/pages/SenderHandoffPage.tsx`、`ReceiverStartPage.tsx`、`components/HandoffSteps.tsx` を元に再構成 |
| 端末保管、コピー、連絡先ファイル   | `ReceiverStartPage.tsx`、`components/StructuredDataView.tsx`                                                    |
| 本文をサーバーへ送らない境界       | QHandの `AGENTS.md`、`docs/qhand_project_proposal.md`                                                           |

名刺の項目調整と受け渡しデモには、実画面へ差し替えるための440×850pxの無地画像を配置しています。公開アプリでの撮影には説明用の一時データだけを使用し、実在する個人情報を含めません。

Heroの受け渡しイメージは、2台のスマートフォン、QR、暗号化された情報の移動をHTMLとCSSで構成しています。画面スクリーンショットの差し替え対象は `card-selection-placeholder.png`、`card-selection-result-placeholder.png` と、`handoff-` で始まる7ファイルで、すべて横440px・縦850pxです。LP自体は受け渡しAPIやカメラを使いません。

## 操作と検証

- 名刺項目の選択結果は、実画面スクリーンショットとLP上の説明を並べて示します。
- 受け渡しデモはボタンで進行・リセットし、段階ごとの送信側・受信側画像を切り替えます。
- モーションは停止・再生できます。`prefers-reduced-motion` が有効な場合は停止します。
- モバイルで工程を進めると、更新された画面までスクロールします。
- FAQはネイティブの `details` を使用します。

ビルドは型チェックを含みます。実際の端末間でのカメラ・QR受け渡しの検証は、LPの表示・操作確認とは別です。
