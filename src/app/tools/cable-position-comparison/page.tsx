import type { Metadata } from 'next';
import ComparisonApp from '@/components/comparison/ComparisonApp';
export const metadata: Metadata = { title: 'ケーブル・位置変更の比較', description: '未確認の条件を残しながら、ケーブル損失差・測定記録と次の確認を整理する社内伴走β。' };
export default function Page() { return <ComparisonApp />; }
