import {escapeHTML as esc} from './guides.mjs';
export const CONTACT_EMAIL='jihoon.song@hotmail.com';
export const infoPages={
 about:{
  ko:{title:'사이트 소개',description:'MY POCKET UTILITY의 도구와 운영 방향을 소개합니다.',sections:[
   ['필요한 순간, 바로 쓰는 도구','MY POCKET UTILITY는 이미지 변환, 날짜·시간, 텍스트·경로, 계산 도구를 한곳에서 제공하는 온라인 유틸리티입니다. 복잡한 설치나 회원가입 없이 필요한 작업을 간편하게 끝내는 것을 목표로 합니다.'],
   ['파일은 가능한 한 내 기기에서','이미지·PDF·마크다운 변환과 텍스트 편집은 브라우저에서 처리합니다. 변환할 로컬 파일을 운영 서버에 업로드하지 않습니다. URL 조회, 환율과 서버 시각 확인 등 인터넷 연결이 필요한 기능은 외부 서비스에 요청합니다.'],
   ['세 가지 언어, 다양한 화면','한국어·영어·일본어를 지원하며, PC와 모바일에서 사용할 수 있도록 개선하고 있습니다. 브라우저와 기기에 따라 지원되는 파일 형식, 알림, PIP 기능에 차이가 있을 수 있습니다.'],
   ['조금씩 더 편리하게','사용 중 발견한 오류나 필요한 기능을 문의 페이지로 알려주세요. 계산 결과와 참고 시각은 중요한 업무에 사용하기 전에 원본 자료와 함께 확인해 주세요.']]},
  en:{title:'About',description:'Discover the tools and approach behind MY POCKET UTILITY.',sections:[
   ['Tools for the moment you need them','MY POCKET UTILITY brings image conversion, dates and time, text and paths, and calculators together. Our aim is to help you finish small tasks without installing software or creating an account.'],
   ['Local files stay on your device','Image, PDF and Markdown conversion and text editing run in your browser. Local files selected for conversion are not uploaded to our server. URL lookups, exchange rates and server time require requests to external services.'],
   ['Three languages, different screens','We support Korean, English and Japanese and continue improving the experience on desktop and mobile. Format support, notifications and picture-in-picture vary by browser and device.'],
   ['Improving one detail at a time','Use the contact page to report a problem or suggest a tool. Check calculations and reference times against original sources before using them for important decisions.']]},
  ja:{title:'サイトについて',description:'MY POCKET UTILITYのツールと運営方針をご紹介します。',sections:[
   ['必要なときに、すぐ使えるツール','MY POCKET UTILITYは画像変換、日付・時間、テキスト・パス、計算ツールをまとめたオンラインサービスです。インストールや会員登録なしで、小さな作業を手軽に終えられることを目指しています。'],
   ['ローカルファイルは端末内で処理','画像・PDF・Markdownの変換とテキスト編集はブラウザー内で行います。変換するローカルファイルを運営サーバーにアップロードしません。URL照会、為替レート、サーバー時刻の確認は外部サービスへの通信を伴います。'],
   ['3つの言語とさまざまな画面','韓国語・英語・日本語に対応し、PCとモバイルの使いやすさを改善しています。形式の対応、通知、PIPはブラウザーや端末によって異なります。'],
   ['少しずつ使いやすく','不具合や機能のご希望はお問い合わせページからお知らせください。重要な用途では計算結果や参考時刻を元の資料と照合してください。']]}
 },
 privacy:{
  ko:{title:'개인정보처리방침',description:'파일 처리, 이용 통계, 브라우저 저장 정보와 이메일 문의의 처리 방식을 안내합니다.',sections:[
   ['1. 적용 범위와 연락처','이 방침은 MY POCKET UTILITY에 적용됩니다. 운영 및 개인정보 관련 문의는 jihoon.song@hotmail.com으로 보내주세요. 시행일: 2026년 11월 16일.'],
   ['2. 파일과 입력 내용','로컬 이미지·PDF·마크다운과 텍스트 도구의 입력 내용은 브라우저에서 처리하며, 변환을 위해 운영 서버에 업로드하지 않습니다. 외부 이미지 링크를 불러오거나 미리보기 이미지를 표시하면 해당 이미지 서버에 요청이 전송됩니다. 비밀번호나 민감한 개인정보가 포함된 URL을 입력하지 마세요.'],
   ['3. URL 조회와 외부 서비스','단축 URL 풀기와 메타태그 검사는 입력한 URL을 Cloudflare 서버로 보내 대상 페이지를 조회합니다. 별도의 문의·파일 데이터베이스는 운영하지 않지만, 호스팅·보안 서비스에서 IP 주소와 요청 시각 등 접속 정보를 처리할 수 있습니다. 환율은 Frankfurter, 시각은 선택한 TimeAPI.io·네이버 또는 지정 서버에서 조회합니다. 폰트와 변환 라이브러리를 불러올 때도 외부 제공자에 접속 정보가 전달될 수 있습니다.'],
   ['4. Google Analytics와 쿠키','Google Tag Manager를 통해 Google Analytics 4를 사용하여 페이지 방문, 유입 경로, 기기·브라우저 등 이용 통계를 분석하고 서비스를 개선합니다. Google은 쿠키와 온라인 식별자 등을 사용할 수 있습니다. 파일 본문과 문의 내용을 분석 이벤트에 의도적으로 포함하지 않습니다. 분석 데이터의 보관은 Analytics 속성 설정과 Google의 처리 정책에 따릅니다.'],
   ['5. 브라우저에 저장하는 설정','언어, 화면 테마, 즐겨찾기, 최근 사용 도구, 경로 변환 선택과 알림 설정은 브라우저 저장소에 저장합니다. 타이머·뽀모도로 진행 정보는 탭의 세션 저장소에 보관합니다. 브라우저에서 사이트 데이터를 삭제하면 이 정보가 제거되며 일부 설정과 진행 상태가 초기화됩니다. 알림 권한은 브라우저 사이트 설정에서 변경할 수 있습니다.'],
   ['자체 방문 카운터','중복 집계를 줄이기 위해 한국 시간 기준 하루 단위의 임의 식별자와 집계 여부를 브라우저에 저장합니다. 서버에는 식별자의 해시를 해당 날짜 동안 보관하고 다음 날 삭제하며, 오늘 방문 수와 일별 합계만 유지합니다. 카운터 데이터베이스에는 IP 주소나 기기 지문을 저장하지 않습니다. 브라우저 저장소를 사용할 수 없으면 방문을 집계하지 않습니다. 브라우저·기기 변경이나 사이트 데이터 삭제 시 별도 방문으로 집계될 수 있습니다.'],
   ['6. 이메일 문의','문의 링크는 제목이 입력된 이메일 앱을 엽니다. 사이트에서 문의 내용을 입력받거나 발송하지 않습니다. 실제 발송하면 발신 이메일 주소, 제목, 문의 내용과 첨부한 자료가 수신 메일함에서 처리됩니다. 문의 대응에 필요한 범위에서 사용하며, 대응이 끝나 더 이상 필요하지 않은 내용은 삭제합니다. 보관·전송 과정에는 이용하는 이메일 서비스의 정책이 적용됩니다. 민감한 개인정보나 비밀번호는 보내지 마세요.'],
   ['7. 선택권과 요청','브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있고, Google Analytics 차단 브라우저 부가 기능을 이용할 수 있습니다. 문의로 보낸 정보의 열람·정정·삭제 요청은 위 이메일로 보내주세요. 요청 대상 확인을 위해 필요한 최소한의 정보를 추가로 요청할 수 있습니다.'],
   ['8. 외부 처리와 방침 변경','Google, Cloudflare 및 이메일·외부 API 제공자의 인프라에 따라 정보가 해외에서 처리될 수 있습니다. 각 제공자의 개인정보 정책을 함께 확인해 주세요. 서비스나 처리 방식이 바뀌면 이 페이지와 시행일을 업데이트합니다.']]},
  en:{title:'Privacy Policy',description:'How we handle local files, usage analytics, browser preferences and email inquiries.',sections:[
   ['1. Scope and contact','This policy applies to MY POCKET UTILITY. For service or privacy inquiries, contact jihoon.song@hotmail.com. Effective date: November 16, 2026.'],
   ['2. Files and entered content','Local images, PDFs, Markdown and text-tool inputs are processed in your browser and are not uploaded to our server for conversion. Loading an external image or preview sends a request to its host. Do not enter URLs containing passwords or sensitive personal information.'],
   ['3. URL lookups and external services','The URL expander and meta tag checker send the entered URL to a Cloudflare server to fetch the destination page. We do not operate a separate inquiry or file database, but hosting and security providers may process connection information such as IP addresses and request times. Rates come from Frankfurter; time comes from the selected TimeAPI.io, Naver or custom server. Loading fonts and conversion libraries also involves requests to external providers.'],
   ['4. Google Analytics and cookies','We use Google Analytics 4 through Google Tag Manager to understand page visits, referral sources, devices and browsers and improve the service. Google may use cookies and online identifiers. We do not intentionally include file contents or inquiry text in analytics events. Analytics retention follows the property settings and Google processing policies.'],
   ['5. Browser preferences','Language, theme, favorites, recent tools, path format and notification preferences are stored in your browser. Timer and Pomodoro progress use tab session storage. Clearing site data removes this information and resets some settings and progress. You can change notification permission in browser site settings.'],
   ['Our visitor counter','A random daily identifier and a counted flag are saved in browser storage, using Korea time. The server retains its hash for that day and deletes it the next day, keeping only daily and cumulative totals. The counter database stores no IP address or device fingerprint. Visits are not counted if browser storage is unavailable. Other browsers or devices, or deleting site data, may count as separate visits.'],
   ['6. Email inquiries','The contact link opens your email app with a prefilled subject. This site does not collect or send your message. If you send the email, your sender address, subject, message and any attachments are processed in the receiving mailbox. We use them to respond and delete content that is no longer needed after the inquiry is resolved. Storage and transmission also follow the relevant email provider policies. Do not send sensitive personal information or passwords.'],
   ['7. Choices and requests','You can block or delete cookies in browser settings or use the Google Analytics Opt-out Browser Add-on. Email the contact above to request access, correction or deletion of information you sent us. We may request the minimum information necessary to identify the relevant inquiry.'],
   ['8. External processing and updates','Information may be processed internationally through the infrastructure of Google, Cloudflare, email and external API providers. Please also consult their privacy policies. We update this page and its effective date when the service or processing practices change.']]},
  ja:{title:'プライバシーポリシー',description:'ファイル処理、アクセス解析、ブラウザー保存情報とメールでのお問い合わせについて説明します。',sections:[
   ['1. 適用範囲と連絡先','本方針はMY POCKET UTILITYに適用されます。運営・個人情報に関するお問い合わせはjihoon.song@hotmail.comまでお送りください。施行日：2026年11月16日。'],
   ['2. ファイルと入力内容','ローカルの画像・PDF・Markdownおよびテキストツールの入力はブラウザー内で処理し、変換のために運営サーバーへアップロードしません。外部画像やプレビューの読み込み時には画像の提供元へ通信します。パスワードや機密情報を含むURLは入力しないでください。'],
   ['3. URL照会と外部サービス','短縮URLの展開とメタタグ検査では、入力したURLをCloudflareサーバーに送り、対象ページを取得します。お問い合わせやファイル用のデータベースは運用していませんが、ホスティング・セキュリティ提供者がIPアドレスやリクエスト時刻などを処理する場合があります。為替はFrankfurter、時刻は選択したTimeAPI.io・NAVERまたは指定サーバーから取得します。フォントや変換ライブラリの読み込みにも外部への通信を伴います。'],
   ['4. Google AnalyticsとCookie','Google Tag Managerを通じてGoogle Analytics 4を使用し、ページ閲覧、流入元、端末・ブラウザーなどの利用統計を分析してサービスを改善します。GoogleはCookieやオンライン識別子を使用する場合があります。ファイル本文やお問い合わせ本文を意図的に解析イベントへ含めません。解析データの保存はプロパティ設定とGoogleの処理方針に従います。'],
   ['5. ブラウザーに保存する設定','言語、テーマ、お気に入り、最近使ったツール、パス形式、通知設定をブラウザーに保存します。タイマー・ポモドーロの進行状況はタブのセッションストレージに保存します。サイトデータを削除すると情報が消去され、一部設定と進行状況が初期化されます。通知権限はブラウザーのサイト設定で変更できます。'],
   ['独自の訪問カウンター','韓国時間の日付ごとのランダムな識別子と集計済みフラグをブラウザーに保存します。サーバーでは識別子のハッシュを当日だけ保持し、翌日に削除して、当日と累計の訪問数のみを残します。カウンターのデータベースにIPアドレスや端末のフィンガープリントは保存しません。ブラウザー保存が利用できない場合は集計しません。別の端末やブラウザー、サイトデータの削除は別の訪問として集計される場合があります。'],
   ['6. メールでのお問い合わせ','お問い合わせリンクは件名を入力した状態でメールアプリを開きます。このサイトで本文を入力・送信することはありません。実際に送信すると、送信元アドレス、件名、本文、添付資料が受信メールボックスで処理されます。回答に必要な範囲で使用し、対応終了後に不要となった内容を削除します。保存・転送には利用するメールサービスの方針も適用されます。機密情報やパスワードは送らないでください。'],
   ['7. 選択と請求','ブラウザー設定でCookieをブロック・削除したり、Google Analyticsオプトアウトアドオンを利用したりできます。送付した情報の開示・訂正・削除は上記メールへご連絡ください。対象を確認するため、必要最小限の追加情報をお願いする場合があります。'],
   ['8. 外部での処理と更新','Google、Cloudflare、メール・外部API提供者のインフラにより、情報が国外で処理される場合があります。各提供者の方針もご確認ください。サービスや処理方法の変更時には本ページと施行日を更新します。']]}
 },
 contact:{
  ko:{title:'문의하기',description:'오류 제보, 기능 제안, 운영·개인정보 문의를 이메일로 보내주세요.',sections:[['이메일로 이야기해주세요','어떤 도구에서 무엇을 하다가 문제가 생겼는지 알려주시면 확인에 도움이 됩니다. 브라우저와 기기 종류도 함께 적어주세요. 비밀번호나 민감한 개인정보는 보내지 마세요.'],['발송 방법','이메일 문의 버튼을 누르면 제목에 [MPU]가 입력된 이메일 앱이 열립니다. 앱에서 내용을 작성해 전송해 주세요. 이메일 앱이 연결되어 있지 않으면 아래 주소로 웹메일에서 직접 보내주세요.']]},
  en:{title:'Contact',description:'Email us with bug reports, feature ideas, service or privacy inquiries.',sections:[['Tell us by email','For a bug report, include the tool, what you were doing, and your browser and device. Do not send passwords or sensitive personal information.'],['How to send','Click the email button to open your email app with an [MPU] subject. Write and send your message there. If no email app is configured, use your webmail to contact the address below.']]},
  ja:{title:'お問い合わせ',description:'不具合報告、機能提案、運営・個人情報に関するご質問をメールでお送りください。',sections:[['メールでお知らせください','不具合の場合は、使用したツール、操作内容、ブラウザーと端末の種類をお知らせください。パスワードや機密情報は送らないでください。'],['送信方法','メールボタンを押すと、件名に[MPU]が入ったメールアプリが開きます。アプリで本文を作成して送信してください。アプリが設定されていない場合は、ウェブメールから下記のアドレスにお送りください。']]}
 }
};
export const infoPage=(id,lang='ko')=>infoPages[id]?.[lang]||infoPages[id]?.ko;
export function contactSubject(value){return '[MPU] '+String(value).replace(/[\r\n]/g,' ').replace(/^\s*(?:\[MPU\]\s*)+/i,'').trim()}
export function contactMailto(subject,body){return 'mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent(contactSubject(subject))+'&body='+encodeURIComponent(body)}
export function infoHTML(id,lang='ko'){
 const page=infoPage(id,lang);if(!page)return '';
 return '<article class="info-content">'+page.sections.map(([title,body])=>'<section><h2>'+esc(title)+'</h2><p>'+esc(body)+'</p></section>').join('')+(id==='privacy'?'<div class="info-links"><a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">Google · '+esc({ko:'데이터 사용 안내',en:'How Google uses data',ja:'データの利用について'}[lang])+'</a><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">Google Analytics Opt-out</a><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare Privacy Policy</a></div>':'')+(id==='contact'?'<p class="contact-email-actions"><a class="contact-email-button" href="'+esc(contactMailto(page.title,''))+'">'+esc({ko:'이메일로 문의하기',en:'Contact by email',ja:'メールで問い合わせる'}[lang])+'</a></p>':'')+(id==='contact'||id==='privacy'?'<p><a href="'+esc(contactMailto(page.title,''))+'">'+CONTACT_EMAIL+'</a></p>':'')+'</article>';
}
