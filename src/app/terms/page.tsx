export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">利用規約</h1>
      
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
        <p>
          この利用規約（以下，「本規約」といいます。）は，Sontakun（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
        </p>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第1条（適用）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本規約は，ユーザーと本サービス運営者（以下，「運営者」といいます。）との間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
            <li>運営者は本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。</li>
            <li>本規約の規定が前項の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第2条（利用登録）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本サービスにおいては，登録希望者が本規約に同意の上，運営者の定める方法によって利用登録を申請し，運営者がこれを承認することによって，利用登録が完了するものとします。</li>
            <li>運営者は，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他，運営者が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第3条（Googleアカウントの連携とデータ利用）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本サービスは，Google Calendar APIを利用して機能を提供します。ユーザーは，本サービスの利用にあたり，Googleアカウントとの連携を行うものとします。</li>
            <li>本サービスは，Google Calendar APIを通じて以下の情報にアクセスし，利用します。
               <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>カレンダーの予定リスト（空き時間の判定のため）</li>
                <li>予定の作成（日程調整後の予定登録のため）</li>
               </ul>
            </li>
            <li>本サービスがGoogleユーザーデータにアクセスし，使用，保存，または共有する方法については，<a href="/privacy" className="text-primary underline">プライバシーポリシー</a>および<a href="https://policies.google.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Googleのプライバシーポリシー</a>に準拠します。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第4条（禁止事項）</h2>
          <p>ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為</li>
            <li>運営者，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為</li>
            <li>本サービスによって得られた情報を商業的に利用する行為</li>
            <li>運営者のサービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし，またはこれを試みる行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>不正な目的を持って本サービスを利用する行為</li>
            <li>本サービスの他のユーザーまたはその他の第三者に不利益，損害，不快感を与える行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>運営者が許諾しない本サービス上での宣伝，広告，勧誘，または営業行為</li>
            <li>その他，運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第5条（本サービスの提供の停止等）</h2>
          <p>運営者は，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他，運営者が本サービスの提供が困難と判断した場合</li>
          </ul>
          <p className="mt-2">運営者は，本サービスの提供の停止または中断により，ユーザーまたは第三者が被ったいかなる不利益または損害についても，一切の責任を負わないものとします。</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第6条（免責事項）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>運営者の債務不履行責任は，運営者の故意または重過失によらない場合には免責されるものとします。</li>
            <li>運営者は，本サービスに関して，ユーザーと他のユーザーまたは第三者との間において生じた取引，連絡または紛争等について一切責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第7条（サービス内容の変更等）</h2>
          <p>運営者は，ユーザーに通知することなく，本サービスの内容を変更し，または本サービスの提供を中止することができるものとし，これによってユーザーに生じた損害について一切の責任を負いません。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第8条（利用規約の変更）</h2>
          <p>運営者は，必要と判断した場合には，ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお，本規約の変更後，本サービスの利用を開始した場合には，当該ユーザーは変更後の規約に同意したものとみなします。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mt-8 mb-4">第9条（準拠法・裁判管轄）</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>本規約の解釈にあたっては，日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には，運営者の所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>
        </section>

        <div className="mt-12 pt-8 border-t text-sm text-muted-foreground">
           <p>2025年1月27日 制定</p>
        </div>
      </div>
    </div>
  );
}
