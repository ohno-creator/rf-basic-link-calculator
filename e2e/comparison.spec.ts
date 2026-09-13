import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const route=process.env.COMPARISON_BASE_PATH ? '/rf-basic-link-calculator/tools/cable-position-comparison/' : '/tools/cable-position-comparison/';
test.beforeEach(async({page})=>{await page.goto(route);});
async function confirm(page:import('@playwright/test').Page,label:string){const dialog=page.getByRole('alertdialog');await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:label,exact:true}).click();await expect(dialog).toHaveCount(0);}
async function example(page:import('@playwright/test').Page){await page.getByRole('button',{name:'説明例を試す（編集を置換）'}).click();await confirm(page,'置き換える');}
test('B36 画面内確認はキーボードを閉じ込めず元の操作へ戻る',async({page})=>{
 const trigger=page.getByRole('button',{name:'説明例を試す（編集を置換）'});await trigger.click();const dialog=page.getByRole('alertdialog');const cancel=dialog.getByRole('button',{name:'キャンセル'});const proceed=dialog.getByRole('button',{name:'置き換える'});await expect(cancel).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(proceed).toBeFocused();await page.keyboard.press('Tab');await expect(cancel).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
});
test('A01/A02/A03/A04/A14 入力と未知・0の往復',async({page})=>{
 await example(page);await expect(page.locator('.result')).toContainText('1.2 dB');await expect(page.locator('.result')).toContainText('未算出');
 await page.getByText('配置の効果も仮定してみる',{exact:true}).click();
 const placement=page.locator('.placement');await placement.getByRole('checkbox',{name:'まだ分からない'}).uncheck();
 await placement.getByLabel('配置だけの変化（dB）',{exact:true}).fill('3');await expect(page.locator('#result-title')).toContainText('＋1.8 dB');
 await placement.getByLabel('配置だけの変化（dB）',{exact:true}).fill('1.2');await expect(page.locator('#result-title')).toContainText('計算上同等');
 await placement.getByLabel('配置だけの変化（dB）',{exact:true}).fill('0');await expect(page.locator('#result-title')).toContainText('-1.2 dB');
 await placement.getByRole('checkbox',{name:'まだ分からない'}).check();await expect(page.locator('#result-title')).toContainText('未算出');
});
test('B01/B05/B07/B18 測定記録を再減算しない・方式間に転記しない',async({page})=>{
 await example(page);await page.getByRole('button',{name:'変更前後を測った',exact:true}).click();await expect(page.locator('#result-title')).toContainText('＋3 dB');
 await page.locator('.context .quantity').getByRole('checkbox',{name:'まだ分からない'}).check();await expect(page.locator('#result-title')).toContainText('＋3 dB');await expect(page.locator('.basis')).toContainText('条件未確認');
 await page.getByRole('button',{name:'まだ測っていない',exact:true}).click();await expect(page.locator('#result-title')).toContainText('未算出');
});
test('B19 入力消去・方式往復でも古い値を保存しない',async({page})=>{
 await example(page);await page.getByLabel('現在の長さ（m）',{exact:true}).fill('');await expect(page.locator('#result-title')).toContainText('入力未完了');
 await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();expect(await page.evaluate(()=>localStorage.getItem('staf.cable-position-comparison.v2'))).toBeNull();
 await page.getByRole('button',{name:'変更前後を測った',exact:true}).click();await page.getByRole('button',{name:'まだ測っていない',exact:true}).click();await expect(page.getByLabel('現在の長さ（m）',{exact:true})).toHaveValue('');await expect(page.locator('#result-title')).toContainText('入力未完了');
});
test('B09/B10/B11 単位と連動を保存・復元',async({page})=>{
 await example(page);const unitSelects=page.locator('.units select');await unitSelects.nth(1).selectOption('mm');await expect(page.getByLabel('現在の長さ（mm）',{exact:true})).toHaveValue('1000');
 await unitSelects.nth(0).selectOption('GHz');await expect(page.getByLabel('使用周波数（GHz）',{exact:true})).toHaveValue('2.4');
 await page.getByLabel('現在の損失係数（dB/m）',{exact:true}).fill('0.5');await expect(page.locator('.result')).toContainText('1 dB');
 await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();await confirm(page,'保存する');await page.getByRole('button',{name:'自分の条件で始める（編集を置換）'}).click();await confirm(page,'置き換える');await page.getByRole('button',{name:'保存した1件を復元'}).click();await confirm(page,'復元する');await expect(page.getByLabel('現在の長さ（mm）',{exact:true})).toHaveValue('1000');await expect(page.locator('.result')).toContainText('1 dB');
});
test('B20/B27/B28/B29 出力・印刷・相談の非送信',async({page,context})=>{
 const marker='COMPARISON_SENTINEL_20260912_<script>alert(1)</script>';const requests:string[]=[];context.on('request',r=>requests.push(r.url()+' '+(r.postData()||'')));
 await example(page);await page.getByLabel('目的・品番・位置・構成と未確認事項（任意）').fill(marker);
 await page.getByRole('button',{name:'相談用まとめを作る',exact:true}).click();await expect(page.locator('.report-text')).toContainText(marker);await expect(page.locator('.report-text')).toContainText('説明用の仮定');
 await page.getByRole('button',{name:'内容をコピー'}).click();await expect(page.locator('.report-text')).toContainText('comparison-v2');
 await page.evaluate(()=>{window.print=()=>{document.body.dataset.printCalled='true';};});await page.getByRole('button',{name:'比較シートを印刷'}).click();expect(await page.getAttribute('body','data-print-called')).toBe('true');
 await page.emulateMedia({media:'print'});await page.pdf({path:'test-results/comparison-sheet.pdf',format:'A4'});await page.emulateMedia({media:'screen'});
 await context.route('https://www.staf.co.jp/**',r=>r.fulfill({status:200,contentType:'text/html',body:'問い合わせ窓口（テスト用）'}));const popupPromise=page.waitForEvent('popup');await page.getByRole('link',{name:'既存問い合わせ窓口を開く'}).click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe('https://www.staf.co.jp/contact.html');expect(requests.join('\n')).not.toContain(marker);expect(page.url()).not.toContain('SENTINEL');
});
test('B21/B24/B35 失敗時の保護と対象キーのみ削除',async({page})=>{
 await example(page);await page.getByLabel('JSON読込（1MBまで・確認後に編集を置換）').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{')});await expect(page.getByRole('status')).toContainText('現在の入力は保持');await expect(page.locator('.result')).toContainText('1.2 dB');
 await page.evaluate(()=>localStorage.setItem('other-app','keep'));await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();await confirm(page,'保存する');await page.getByRole('button',{name:'保存した1件を削除'}).click();await confirm(page,'削除する');expect(await page.evaluate(()=>localStorage.getItem('other-app'))).toBe('keep');
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked');};});await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();await confirm(page,'保存する');await expect(page.getByRole('status')).toContainText('保存できません');await expect(page.locator('.result')).toContainText('1.2 dB');
});
test('B37 ファイル選択なしでも保存JSONを確認後に復元する',async({page})=>{
 await example(page);await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();await confirm(page,'保存する');const raw=await page.evaluate(()=>localStorage.getItem('staf.cable-position-comparison.v2'));expect(raw).not.toBeNull();
 await page.getByText('ファイルを選べない場合：JSON内容を貼り付ける',{exact:true}).click();const text=page.locator('#comparison-json-text');await expect(text).toBeVisible();await text.fill('{');await page.getByRole('button',{name:'貼り付けたJSONを読み込む'}).click();await expect(page.getByRole('status')).toContainText('現在の入力は保持');await expect(page.locator('.result')).toContainText('1.2 dB');
 await text.fill(raw!);await page.getByRole('button',{name:'貼り付けたJSONを読み込む'}).click();await confirm(page,'復元する');await expect(page.getByLabel('現在の長さ（m）',{exact:true})).toHaveValue('1');await expect(page.locator('.result')).toContainText('1.2 dB');await expect(text).toHaveValue('');
});
test('B25/B26 画面幅・200%相当・キーボード・axe',async({page})=>{
 await example(page);for(const width of [320,375,768,1280]){await page.setViewportSize({width,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 await page.setViewportSize({width:640,height:450});await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe('BODY');
 const results=await new AxeBuilder({page}).analyze();expect(results.violations).toEqual([]);await page.screenshot({path:'test-results/comparison-mobile.png',fullPage:true});
});

test('C01 経路図と損失バーが入力・単位変更に連動する',async({page})=>{
 await example(page);const workbench=page.locator('.comparison-workbench');await expect(workbench).toContainText('0.6 dB');await expect(workbench).toContainText('1.8 dB');await expect(workbench).toContainText('＋1.2 dB');
 await page.locator('.units select').nth(1).selectOption('cm');await expect(page.getByLabel('変更後の長さ（cm）',{exact:true})).toHaveValue('300');await expect(workbench).toContainText('1.8 dB');
});
test('C02 固定案は編集中の変更から独立し再固定・破棄できる',async({page})=>{
 await example(page);await page.getByRole('button',{name:'この条件を基準に固定'}).click();const fixed=page.getByRole('heading',{name:'固定した基準案'}).locator('..');await expect(fixed).toContainText('3 m の給電経路');
 await page.getByLabel('変更後の長さ（m）',{exact:true}).fill('4');await expect(fixed).toContainText('3 m の給電経路');await page.getByRole('button',{name:'この条件を基準に固定'}).click();await expect(page.getByRole('heading',{name:'固定した基準案'}).locator('..')).toContainText('4 m の給電経路');await page.getByRole('button',{name:'固定した基準を破棄'}).click();await expect(page.getByRole('heading',{name:'固定した基準案'})).toHaveCount(0);
});
test('C03 invalidとunknownは数値バーを作らない',async({page})=>{
 await example(page);await page.getByLabel('現在の長さ（m）',{exact:true}).fill('');const current=page.getByRole('heading',{name:'編集中の案'}).locator('..');await expect(current).toContainText('数値とバーは表示していません');await expect(current.locator('.bar-track')).toHaveCount(0);
 await page.getByLabel('現在の長さ（m）',{exact:true}).fill('1');await page.getByRole('checkbox',{name:'まだ分からない'}).first().check();await expect(current).toContainText('未算出');await expect(current).not.toContainText('現在 0 dB');
});
test('C04 方式・周波数・測定指標が違う案の横断ランキングを保留する',async({page})=>{
 await example(page);await page.getByRole('button',{name:'この条件を基準に固定'}).click();await page.getByLabel('使用周波数（MHz）',{exact:true}).fill('915');await expect(page.locator('.cross-compare')).toContainText('周波数が異なります');
 await page.getByRole('button',{name:'変更前後を測った',exact:true}).click();await expect(page.locator('.cross-compare')).toContainText('比較方式が異なります');await expect(page.locator('.cross-compare')).toContainText('比較を保留');
});
test('C05 実測-80から-74は＋6 dBでケーブル寄与を再控除しない',async({page})=>{
 await example(page);await page.getByRole('button',{name:'変更前後を測った',exact:true}).click();await page.getByLabel('変更後の表示（dBm）',{exact:true}).fill('-74');const workbench=page.locator('.comparison-workbench');await expect(workbench).toContainText('＋6 dB');await expect(workbench).toContainText('現在 -80 dBm → 変更後 -74 dBm');await expect(workbench).toContainText('再控除していません');await expect(workbench).toContainText('ばらつき未評価');
});
test('C06 SVGに図・条件・モデル・根拠・固定案を安全に含める',async({page})=>{
 await example(page);await page.getByLabel('目的・品番・位置・構成と未確認事項（任意）').fill('<unsafe>&条件');await page.getByRole('button',{name:'この条件を基準に固定'}).click();const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'比較図をSVGで保存'}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('staf-cable-position-comparison.svg');const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream)chunks.push(Buffer.from(chunk));const svg=Buffer.concat(chunks).toString('utf8');expect(svg).toContain('<svg');expect(svg).toContain('<line');expect(svg).toContain('comparison-v2');expect(svg).toContain('固定した基準案');expect(svg).toContain('根拠種別');expect(svg).toContain('&lt;unsafe&gt;&amp;条件');expect(svg).not.toContain('<unsafe>');
});

test('C07 PCの入力と結果を並べ、幅変更で編集値を失わない',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await example(page);
 const input=page.getByLabel('変更後の長さ（m）',{exact:true});await expect(input).toHaveCount(1);await input.fill('4');
 await expect(page.locator('.workflow-live')).toBeVisible();await expect(page.locator('.workflow-live')).toContainText('1.8 dB');
 const form=await page.locator('.studio-inputs').boundingBox();const figure=await page.locator('.comparison-workbench').boundingBox();expect(form).not.toBeNull();expect(figure).not.toBeNull();expect(figure!.x).toBeGreaterThan(form!.x+form!.width);
 await page.setViewportSize({width:390,height:844});await expect(input).toHaveValue('4');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('link',{name:'2 結果を確認',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('#comparison-workbench')).toBeFocused();
});
