"use client";

import { Callout } from "@/components/Callout";
import { BookOpen, ExternalLink } from "lucide-react";

export function ResearchColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-lg font-bold">コラム：世界の研究ではどう扱っているか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          GL以下NCUに対して、奥村・秦モデルのアンテナ高へマイナス値を入れる、という扱いは主流ではありません。
          近い研究・標準では、地上側の伝搬、侵入損失、内部深さ、周辺構造、実測補正を分けて扱います。
        </p>
        <ul className="space-y-2">
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3173"
              target="_blank"
              rel="noreferrer"
            >
              3GPP TR 38.901
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            は0.5〜100GHzのチャネルモデル体系で、屋外・屋内・侵入損失・ばらつきを分けて考える土台になります。
          </li>
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://arxiv.org/abs/2006.00880"
              target="_blank"
              rel="noreferrer"
            >
              深部屋内NB-IoT実測研究
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            では、距離や深さだけでは減衰を十分説明できず、近傍通路・構造条件が効くことが示されています。
          </li>
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://arxiv.org/abs/2605.23483"
              target="_blank"
              rel="noreferrer"
            >
              2026年のLPWAN深部屋内比較
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            は、スマートメーターの地下空間でmioty、LoRaWAN、Sigfox、NB-IoT、LTE-Mを実測比較しています。
          </li>
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://arxiv.org/abs/2508.19350"
              target="_blank"
              rel="noreferrer"
            >
              地下センサー向けLoRaWAN研究
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            では、埋設深さや土壌含水率が接続確率に大きく効くことが扱われています。
          </li>
        </ul>
        <p className="rounded-lg border border-sky-200 bg-white/70 p-3 text-xs">
          実務上の落としどころは、万能な「地下距離式」を探すことではなく、蓋・BOX・水分・開口・アンテナ位置を分解し、現地測定で補正することです。
        </p>
      </div>
    </Callout>
  );
}

