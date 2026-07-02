import { RfError, RfErrorCode } from "./errors";

export type LinkJudgementLevel = "excellent" | "good" | "caution" | "unstable" | "poor";

export type LinkJudgement = {
  level: LinkJudgementLevel;
  label: string;
  summary: string;
  technicalComment: string;
  recommendation: string;
  ctaLabel: string;
};

export function judgeLinkMargin(marginDb: number): LinkJudgement {
  if (!Number.isFinite(marginDb)) {
    throw new RfError(RfErrorCode.NonFinite, { field: "link_margin" });
  }

  if (marginDb >= 20) {
    return {
      level: "excellent",
      label: "安定",
      summary:
        "十分なリンクマージンがあります。通常の設置ばらつきや軽微な環境変動があっても、通信が成立しやすい条件です。",
      technicalComment:
        "リンクマージンが20dB以上あるため、設定した伝搬損失、環境損失、端末近傍損失を含めても受信感度に対して十分な余裕があります。",
      recommendation:
        "量産前には筐体込みのアンテナ評価と現地RSSI/RSRP測定で、設置ばらつきや遮蔽条件を確認してください。",
      ctaLabel: "量産前の実機評価について相談する"
    };
  }

  if (marginDb >= 10) {
    return {
      level: "good",
      label: "良好",
      summary:
        "一定のリンクマージンがあります。多くの条件で通信成立が期待できますが、筐体・設置方向・遮蔽物の影響には注意が必要です。",
      technicalComment:
        "リンクマージンは10dB以上20dB未満です。初期検討としては良好ですが、低高度IoT端末では地面反射、筐体、人体、車両、設置方向による追加損失が効きやすくなります。",
      recommendation:
        "アンテナ高、設置方向、筐体材質、周辺遮蔽物、現地RSSI/RSRPを確認することをおすすめします。",
      ctaLabel: "筐体込みのアンテナ評価を相談する"
    };
  }

  if (marginDb >= 3) {
    return {
      level: "caution",
      label: "条件付き",
      summary:
        "通信成立の可能性はありますが、余裕は限定的です。アンテナ高、設置方向、筐体損失、遮蔽物の影響を確認し、実測補正を行うことを推奨します。",
      technicalComment:
        "リンクマージンは3dB以上10dB未満です。計算上は受信感度を上回っていますが、現地環境のばらつきで余裕が失われる可能性があります。",
      recommendation:
        "端末近傍損失を分解して見直し、現地測定値による実測補正を入力して再評価してください。",
      ctaLabel: "アンテナ配置・通信余裕の改善を相談する"
    };
  }

  if (marginDb >= 0) {
    return {
      level: "unstable",
      label: "不安定",
      summary:
        "リンクマージンがほとんどありません。設置環境の変化により通信が不安定になる可能性が高い条件です。",
      technicalComment:
        "リンクマージンは0dB以上3dB未満です。受信感度をわずかに上回る程度で、フェージング、遮蔽、筐体損失、設置ばらつきで通信断が起きやすい状態です。",
      recommendation:
        "アンテナ利得、アンテナ高、送信電力、設置位置、端末近傍損失の見直しを優先してください。",
      ctaLabel: "通信余裕の改善を相談する"
    };
  }

  return {
    level: "poor",
    label: "通信困難",
    summary:
      "受信感度を下回っており、この条件では通信成立が難しい可能性があります。アンテナ利得、設置高さ、送信電力、設置環境の見直しが必要です。",
    technicalComment:
      "受信電力が受信感度を下回っています。現在の伝搬損失、環境損失、端末近傍損失を含めるとリンクマージンが負になっています。",
    recommendation:
      "通信方式、伝搬モデル、アンテナ構成、設置高さ、送信電力、現地環境を再検討してください。",
    ctaLabel: "通信方式・アンテナ構成の見直しを相談する"
  };
}
