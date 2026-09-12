import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const route=process.env.COMPARISON_BASE_PATH ? '/rf-basic-link-calculator/tools/cable-position-comparison/' : '/tools/cable-position-comparison/';
test.beforeEach(async({page})=>{page.on('dialog',d=>d.accept());await page.goto(route);});
async function example(page:import('@playwright/test').Page){await page.getByRole('button',{name:'説明例を試す（編集を置換）'}).click();}
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
 await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();await page.getByRole('button',{name:'自分の条件で始める（編集を置換）'}).click();await page.getByRole('button',{name:'保存した1件を復元'}).click();await expect(page.getByLabel('現在の長さ（mm）',{exact:true})).toHaveValue('1000');await expect(page.locator('.result')).toContainText('1 dB');
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
 await page.evaluate(()=>localStorage.setItem('other-app','keep'));await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();await page.getByRole('button',{name:'保存した1件を削除'}).click();expect(await page.evaluate(()=>localStorage.getItem('other-app'))).toBe('keep');
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked');};});await page.getByRole('button',{name:'このブラウザーに1件保存',exact:true}).click();await expect(page.getByRole('status')).toContainText('保存できません');await expect(page.locator('.result')).toContainText('1.2 dB');
});
test('B25/B26 画面幅・200%相当・キーボード・axe',async({page})=>{
 await example(page);for(const width of [320,375,768,1280]){await page.setViewportSize({width,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 await page.setViewportSize({width:640,height:450});await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe('BODY');
 const results=await new AxeBuilder({page}).analyze();expect(results.violations).toEqual([]);await page.screenshot({path:'test-results/comparison-mobile.png',fullPage:true});
});
