export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
      
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
        <p>
          Sontakun（以下，「本サービス」といいます。）は，本ウェブサイト上で提供するサービスにおける，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
        </p>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第1条（個人情報）</h2>
          <p>「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第2条（個人情報の収集方法）</h2>
          <p>本サービスは，ユーザーが利用登録をする際に氏名，メールアドレスなどの個人情報をお尋ねすることがあります。また，ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を,本サービスの提携先（情報提供元，広告主，広告配信先などを含みます。以下，｢提携先｣といいます。）などから収集することがあります。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第3条（個人情報を収集・利用する目的）</h2>
          <p>本サービスが個人情報を収集・利用する目的は，以下のとおりです。</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本サービスの提供・運営のため</li>
            <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
            <li>ユーザーが利用中のサービスの新機能，更新情報，キャンペーン等及び本サービスが提供する他のサービスの案内のメールを送付するため</li>
            <li>メンテナンス，重要なお知らせなど必要に応じたご連絡のため</li>
            <li>利用規約に違反したユーザーや，不正・不当な目的で本サービスを利用しようとするユーザーの特定をし，ご利用をお断りするため</li>
            <li>上記の利用目的に付随する目的</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第4条（Google Calendar APIの利用について）</h2>
          <p>本サービスは，日程調整機能を提供するためにGoogle Calendar APIを利用します。Google Calendar APIを通じて取得した情報の取り扱いは以下の通りです。</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>情報の取得:</strong> ユーザーの許可に基づき，Googleカレンダーの予定リスト（タイトル，日時）を取得します。</li>
            <li><strong>情報の利用:</strong> 取得した予定情報は，日程調整における空き時間の判定にのみ利用します。それ以外の目的で利用することはありません。</li>
            <li><strong>情報の共有:</strong> 取得したユーザーのGoogleカレンダー情報を，ユーザーの同意なく第三者に共有・販売することはありません。</li>
            <li><strong>予定の作成:</strong> 日程調整が完了した際に，ユーザーの許可に基づき，Googleカレンダーに新しい予定を作成します。</li>
          </ul>
          <p className="mt-4">
            本サービスの利用および他のアプリへの情報の転送は、<a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>（Limited Use requirementsを含む）に準拠します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第5条（利用目的の変更）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本サービスは，利用目的が変更前と関連性を有すると合理的に認められる場合に限り，個人情報の利用目的を変更するものとします。</li>
            <li>利用目的の変更を行った場合には，変更後の目的について，本サービス所定の方法により，ユーザーに通知し，または本ウェブサイト上に公表するものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第6条（個人情報の第三者提供）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本サービスは，次に掲げる場合を除いて，あらかじめユーザーの同意を得ることなく，第三者に個人情報を提供することはありません。ただし，個人情報保護法その他の法令で認められる場合を除きます。
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>人の生命，身体または財産の保護のために必要がある場合であって，本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって，本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって，本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第7条（プライバシーポリシーの変更）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本ポリシーの内容は，法令その他本ポリシーに別段の定めのある事項を除いて，ユーザーに通知することなく，変更することができるものとします。</li>
            <li>本サービスが別途定める場合を除いて，変更後のプライバシーポリシーは，本ウェブサイトに掲載したときから効力を生じるものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第8条（お問い合わせ窓口）</h2>
          <p>本ポリシーに関するお問い合わせは，以下の連絡先までお願いいたします。</p>
          <p className="mt-4">
            お問い合わせ: <a href="https://www.burst.style/#contact" target="_blank" rel="noreferrer" className="text-primary underline">https://www.burst.style/#contact</a>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t text-sm text-muted-foreground">
           <p>2025年1月27日 制定</p>
        </div>
      </div>
    </div>
  );
}
