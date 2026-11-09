# 🎉 イベントページの作り方

ここは **居酒家あつこ・イベント特設ページ** の置き場所です。🐔🥞

**AIでHTMLを作る → GitHubに保存 → 自動で公開！**  
Quartoやプログラミングを覚えなくても大丈夫。イベントのアイデアは自由にどうぞ！

> 🔗 公開ページはインターネット上の誰でも閲覧できます。サイトのトップページにはリンクを載せません。URLやQRコードをゲストに直接シェアしてね。

## 🍓 まずはこの4ステップ

### ① AIでページを作る

ChatGPTなどにお願いするときは、これをコピーして使えます。

> 居酒家あつこのイベント用に、スマホでも楽しく見られるWebページを作りたいです。  
> **HTML・CSS・JavaScriptをすべて1つのファイルにまとめて、`index.html` だけで動くようにしてください。**  
> 写真や画像を使う場合は、別ファイルが必要か教えてください。  
> イベント名は「〇〇」、内容は「〇〇」です。  
> 楽しくて使いやすい、日本語のページにしてね！ 🐔

AIが表示したコードの `<!doctype html>` から `</html>` までをコピーします。  
**`\`\`html` や `\`\` `（コードの囲み線）はコピーしなくてOK。**

### ② GitHubでイベント用のファイルを作る

1. このリポジトリの **[events フォルダ](https://github.com/chichacha/wobbly-chicken/tree/main/events)** を開く
2. **Add file → Create new file** を選ぶ
3. ファイル名の入力欄に、例えば `xmas-party-2026/index.html` と入力する  
   （`/` を入力すると、イベント用フォルダも作れます）
4. AIで作ったHTMLコードを貼り付ける
5. **Commit changes** を押して保存する

> GitHubが「Create a new branch and start a pull request」を勧めてきた場合は、PRを作って `main` にマージしてね。公開されるのは **main に変更が入った後** です。

### ③ 自動公開をチェック

- GitHubの **[Actions タブ](https://github.com/chichacha/wobbly-chicken/actions)** を開く
- **Publish Wobbly Chicken** の最新の実行を見る
- ✅ 緑チェックなら公開成功！　❌ 赤ならいったん公開を待って、エラーを確認する

※ 最初にサイト管理者がGitHub Pagesを **GitHub Actions** 公開に切り替える必要があります（下の「管理者向けメモ」参照）。

### ④ URLをゲストにシェア！

`events/xmas-party-2026/index.html` の場合：

**https://chichacha.github.io/wobbly-chicken/events/xmas-party-2026/**

QRコードにして会場に置いても楽しいね。📱🎉  
ホームページにリンクを追加する必要はありません。

---

## 🧁 イベント名のルール

フォルダ名は **英小文字・数字・ハイフン** を使ってね。

✅ `xmas-party-2026` ／ `spring-picnic-2027`  
❌ `Christmas Party!!` ／ `クリスマス パーティー`

各イベントのトップページは必ず **`index.html`** という名前にします。

```text
events/
├── README.md                 ← この説明書
├── sample-party/
│   └── index.html            ← 動作確認用サンプル
├── xmas-party-2026/
│   └── index.html
└── spring-picnic-2027/
    ├── index.html
    └── images/
        └── picnic.jpg
```

## 🖼️ 写真や画像を入れたいとき

**全部入りのHTML** は管理が簡単でおすすめ！

写真を別ファイルとして使う場合は、イベントフォルダの中に `images/` などを作って、写真も一緒にアップロードしてね。HTMLからは `images/picnic.jpg` のような**相対パス**で読み込みます。

大きなHTMLファイルをAIからダウンロードした場合も、まずGitHubでイベント用フォルダを作ってから、そのフォルダ内の **Add file → Upload files** でファイルをアップロードできます。

### ページを直したいとき

同じ `index.html` をGitHub上で編集して、再度Commitするだけ。自動で最新版に更新されます。

### 開かない／写真が見えないとき

- URLにイベントのフォルダ名が正しく入っている？
- `index.html` の大文字・小文字は合っている？
- 変更は `main` に入った？
- Actionsの実行は ✅ 緑？
- 写真はアップロード済み？　HTMLの画像パスは正しい？

困ったら、画面のスクリーンショットを取っておくと相談しやすいよ。

## 🔒 公開するときの約束

- **URLを知っている人以外にも閲覧できる公開サイト**です（検索結果に載る可能性もあります）。
- 住所・電話番号・個人情報・パスワードなどは載せないでね。
- ゲストの写真は、掲載してよいか確認してね。

---

## 🛠️ 管理者向けメモ（最初の1回だけ）

- `_quarto.yml` の `project.resources` で `events/**` を公開用 `docs/events/` にコピーします。
- `.github/workflows/publish.yml` が `main` の更新時に `quarto render` し、GitHub Pagesに成果物をデプロイします。
- 初回の切り替え：GitHub **Settings → Pages → Build and deployment → Source = GitHub Actions**。
- **`docs/` は生成物**です。イベントHTMLの原本は必ず `events/` に置き、`docs/` に直接追加しないでください。
- サンプルの `events/sample-party/` は動作確認用。必要なければあとで削除してOKです。

**さあ、次はどんなパーティーにする？🐔🎉**
