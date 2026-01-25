export default function ThankYouPage() {
  return (
    <div className="container min-h-screen flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-4xl font-bold text-primary">承りました。</h1>
      <p className="text-xl text-muted-foreground max-w-md">
        ソンタくんがあなたのメッセージを分析し、最も思いやりのある日時を探しています。<br/>
        採用担当者にお知らせします。
      </p>
      <div className="pt-8">
          <p className="text-sm text-muted-foreground mb-4">Powered by ソンタくん</p>
      </div>
    </div>
  );
}
