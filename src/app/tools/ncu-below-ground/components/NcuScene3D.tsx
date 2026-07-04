"use client";

import { Canvas } from "@react-three/fiber";
import type { NcuBelowGroundInput } from "@/lib/rf/ncuBelowGround";

/**
 * NCU地下BOXの3Dプレビュー（Track H6 技術検証スパイク）。
 * 蓋材質・アンテナ位置を3Dで直感表示する最小シーン。next/dynamic(ssr:false) で遅延読込され、
 * このモジュール（three/@react-three/fiber）はNCUページのチャンクにのみ含まれる。
 * WebGL不可・読み込み中は呼び出し側のフォールバック（既存2D断面図）が表示される。
 */

type NcuScene3DProps = {
  input: Pick<NcuBelowGroundInput, "coverMaterial" | "antennaPosition">;
};

// 蓋材質→色（2D断面図・DiagramDefs の素材対応と揃える）。
const LID_COLORS: Record<string, string> = {
  open: "#94A3B8",
  resin: "#FDE68A",
  concrete: "#CBD5E1",
  cast_iron: "#64748B",
  steel: "#475569",
  metal: "#64748B",
  unknown: "#94A3B8"
};

// アンテナ位置→BOX内のY座標（GL=0、BOX深さ0.9）。
const ANTENNA_Y: Record<string, number> = {
  near_lid: -0.2,
  middle: -0.45,
  bottom: -0.75,
  near_metal: -0.75
};

export default function NcuScene3D({ input }: NcuScene3DProps) {
  const lidColor = LID_COLORS[input.coverMaterial] ?? LID_COLORS.unknown;
  const antennaY = ANTENNA_Y[input.antennaPosition] ?? ANTENNA_Y.middle;

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <Canvas
        camera={{ position: [2.4, 1.6, 2.8], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />

        {/* 地面（土）: GL面。中央にBOX開口の穴は簡略化し、蓋で覆う */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6, 6]} />
          <meshStandardMaterial color="#8B6B3F" roughness={1} />
        </mesh>

        {/* 地中のBOX（ピット）: 壁4面を箱で表現 */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[1.2, 0.9, 1.2]} />
          <meshStandardMaterial color="#B8C1CC" roughness={0.8} transparent opacity={0.55} />
        </mesh>

        {/* 蓋（材質で色が変わる） */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[1.32, 0.06, 1.32]} />
          <meshStandardMaterial
            color={lidColor}
            metalness={input.coverMaterial === "steel" || input.coverMaterial === "cast_iron" ? 0.7 : 0.1}
            roughness={0.35}
          />
        </mesh>

        {/* NCUアンテナ（位置が入力に追従・ブランド青） */}
        <mesh position={[0.25, antennaY, 0.15]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color="#0071BD" emissive="#0071BD" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.25, antennaY - 0.12, 0.15]}>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </Canvas>
    </div>
  );
}
