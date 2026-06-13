export type LinkJudgementLevel = "excellent" | "good" | "caution" | "poor";

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
    throw new Error("リンクマージンを計算できません。入力値を確認してください。");
  }

  if (marginDb >= 20) {
    return {
      level: "excellent",
      label: "余裕あり",
      summary: "初期検討上は十分な余裕があります。ただし量産前の実機評価は必要です。",
      technicalComment:
        "リンクマージンが20dB以上あるため、自由空間損失と設定した環境補正を含めても受信感度に対して余裕があります。",
      recommendation:
        "筐体込みでのS11/VSWR測定、通信評価、必要に応じたOTA評価で量産条件を確認してください。",
      ctaLabel: "量産前の実機評価について相談する"
    };
  }

  if (marginDb >= 10) {
    return {
      level: "good",
      label: "概ね可能性あり",
      summary: "理論上は通信できる可能性がありますが、筐体や設置環境の影響を確認してください。",
      technicalComment:
        "リンクマージンは10dB以上20dB未満です。初期検討としては一定の余裕がありますが、内蔵アンテナや金属近接では追加損失が効きやすくなります。",
      recommendation:
        "アンテナ配置、基板GND、筐体材質、実際の設置環境を早めに確認することをおすすめします。",
      ctaLabel: "筐体込みのアンテナ評価を相談する"
    };
  }

  if (marginDb >= 0) {
    return {
      level: "caution",
      label: "要注意",
      summary: "計算上は届く可能性がありますが、余裕が小さく実機では不安定になる恐れがあります。",
      technicalComment:
        "受信電力は受信感度を上回っていますが、リンクマージンは10dB未満です。筐体、人体、金属、ノイズ、量産ばらつきで余裕がなくなる可能性があります。",
      recommendation:
        "アンテナ利得、配置、ケーブル損失、環境補正、通信距離、モジュール感度を見直してください。",
      ctaLabel: "アンテナ配置・通信余裕の改善を相談する"
    };
  }

  return {
    level: "poor",
    label: "条件見直し推奨",
    summary: "この条件では受信感度を下回り、通信が成立しにくい可能性があります。",
    technicalComment:
      "推定受信電力が受信感度を下回っています。送信出力、アンテナ利得、距離、環境損失、通信方式の条件を見直す必要があります。",
    recommendation:
      "通信方式やアンテナ構成から再検討し、実機条件に合わせた改善案を確認してください。",
    ctaLabel: "通信方式・アンテナ構成の見直しを相談する"
  };
}
