# Napier

Napier は websocketを使った逆プロキシのシステムです。

## 概要

Napierは転送用のコネクションにweb socketを使った逆プロキシシステムです。

![](./contents/network.png)

このため、ネットワーク的にNapierが見えてさえいれば、プロキシ先を置くことができます。

Napierは現在[Napier-NET](https://www.napier-net.com)でサービスが公開されていますが、セルフホストすることも可能です。Napier-NETだけではポリシー的に多様なニーズには応え切れないので、多くの人がNapierのサービスが行われることを期待します。

## 仕組み

Napier serverは、起動するとweb用のポート(port 80, port 443)と転送用のポート(port 8000 変更可能)を開きます。

web用ポートに接続されたURLのパス部が`/manage`の場合は設定用のウェブUIを送信します。

それ以外のURLの場合、そのURLに対応した転送ルールを検索します。転送ルールに合致した場合、その転送先に転送を行います。

転送のためのコネクションは、転送用ポートにプロキシのクライアントが接続することによって生成されます。この接続は(secure) web socketによって作られています。

プロキシのクライアントはローカル接続のためのポートを開き、ローカルにあるウェブサーバに接続を仲介します。

プロキシのクライアントにはウェブサーバが組み込まれており、**有効にすると**指定したディレトリ以下をプロキシ経由で公開することが可能になっています。

## クイックスタート

### インストール

現在のところ、リリースパッケージは存在していません。そのため、ソースを取り寄せて実行して下さい。

```shell
$ git clone https://github.com/waspcojp/napier.git
$ npm update
```

Let's Encryptの自動証明書更新機能を使うためには、`npm update`の後、`node_modules/le-store-certbot`にパッチを当てる必要があります。

詳しいことは、`redbird`のissueである、

[[ERR_INVALID_ARG_TYPE]: The \"data\" argument must be of type string or an instance of Buffer, TypedArray, or DataView #259](https://github.com/OptimalBits/redbird/issues/259)

を見て下さい。`node_modules/le-store-certbot/index.js`に、以下のように修正します。

```
/*   ............ around line 288 ................. */
var privkeyArchive = path.join(archiveDir, 'privkey' + checkpoints + '.pem'); 
//var bundleArchive = path.join(archiveDir, 'bundle' + checkpoints + '.pem'); //no longer used

return mkdirpAsync(archiveDir).then(function () { 
 return PromiseA.all([ 
   sfs.writeFileAsync(certArchive, pems.cert, 'ascii') 
 , sfs.writeFileAsync(chainArchive, pems.chain, 'ascii') 
 , sfs.writeFileAsync(fullchainArchive, [ pems.cert, pems.chain ].join('\n'), 'ascii') 
 , sfs.writeFileAsync(privkeyArchive, pems.privkey, 'ascii') 
//, sfs.writeFileAsync(bundleArchive, pems.bundle, 'ascii') // <-- comment this line
 ]); 
}).then(function () { 
 return mkdirpAsync(liveDir); 
}).then(function () { 
```

2箇所コメントアウトするだけです。

### 設定

#### サーバ

```shell
$ cd napier
$ sudo chown root .
$ sudo npm run server
```

サーバは起動時に`config/server.js`を読み込みます。

なお、この例ではNapierを置いているフォルダを`chown`しています。これは、`npm`の仕様によりポート番号が1024以下のポートを開く場合、フォルダのオーナにsudoしてから実行する(一種の`suexec`)という仕様によるためです。詳しくは、

[Macos Big Sur port 80 permission denied with root](https://apple.stackexchange.com/questions/413257/macos-big-sur-port-80-permission-denied-with-root)

の会話を見て下さい。

まずは、`config/server-sample.js`を`config/server.js`として読み込むように`ln -s`するか`mv`して下さい。

```javascript
module.exports = {
	HTTP_PORT: 800,
	HTTPS_PORT: 443,
	WS_PORT: 8001,
	LOCAL_PORT_RANGE: [9000, 9100],
	APPL_PORT: 3010,
	MY_DOMAIN: 'napier-net.com',
	MY_HOST: 'www.napier-net.com',
	home: process.env.HOME,
	session_ttl: 3600 * 24 * 7,
	session_path: `${process.env.PWD}/sessions`,
	cert_path: `${process.env.PWD}/certs`,
	content_path: `${process.env.PWD}/../napier-web`,
	makeDefaultPath: (domain, user) => {
		return  `${user.name}.${domain}`;
	}
};
```

このうち、必ず修正しなければならないのは、`MY_DOMAIN`と`MY_HOST`です。他は特に不都合がなければそのままで構いません。

httpsを使うためには、証明書が必要です。ローカルで試すだけならオレオレ証明書(自己署名証明書)でも構いませんが、グローバルに置くためには、正しく取得する必要があります。デフォルトの設定の場合は、`./cert`直下に証明書と秘密鍵を起きます。この辺は「クイックスタート」にしては厄介なので、後程説明します。

httpsのみ接続許可する場合は、`HTTP_PORT`は不要です。同様にhttpのみで接続許可する場合は、`HTTPS_PORT`は不要です。

### アカウント作成

**注** デフォルトアカウントは存在しません。

サーバを起動して接続可能になったら、アカウントを作成します。

非login状態で`www.${MY_DOMAIN}/manage`にアクセスすると、

![](./contents/login.png)

のように表示されますので、'Register a new membership'をクリックして下さい。

![](./contents/register.png)

現在は特にメール認証のようなものは行っていません。そのまま登録されます。

### クライアント

クライアントを接続するには、

```shell
$ npm run cli -- <options>
```

のように実行します。起動オプションは、

```
Usage: napier-cli [options] [profileName]

Arguments:
  profileName                        profile name (default: "default")

Options:
  --config <config filename>         config file
  --user <user>                      user name
  --password <password>              password
  --url <URL>                        server URL
  --local-port <localPort>           local port
  --re-connect                       re-connect server
  --web-server                       start web server
  --server-config <config filename>  web server config file
  --document-root <path>             web server document root
  --index                            list index
  --markdown                         markdown SSR
  --javascript                       server side Javascript execution
  --authenticate                     password authentication
  -h, --help                         display help for command
```

このうち、必ず指定するものは、`--user`, `--password`, `--url`です。

コマンドラインで指定するオプションは、

```javascript
{
    "host": "www.napier-net.com",
    "localPort": 4001,
    "reConnect": true,
    "webServer": false,
    "user": "****",
    "password": "****",
    "documentRoot": "."
}
```

のようにファイルに格納して`--config`で指定することも可能です。

コマンドラインの最後は「プロファイル」の指定となっていますが、これについては後程説明します。指定しない場合はデフォルトとなりますが、この時にプロキシが起動されるURLは、

```
(http|https)://<ユーザ名>.<HOST_NAME>/
```

となります(この命名ルールはカスタマイズ可能です)

`--web-server`を指定すると、組み込みウェブサーバが起動します。`--document-root`で指定したディレクトリをdocument rootとするウェブサーバが起動され、プロキシ経由で外からアクセス可能になります。

### デモサイト

[Napier-NET](https://www.napier-net.com)にてクライアントを試してみることができます。

サイトにアクセスしてユーザ登録を行った後にクライアント起動すると試すことが可能です。

## 解説

### 証明書について

`certs`に置くファイルは以下になります。

* `${MY_DOMAIN}-cert.pem`

  いわゆる証明書です。これは中間証明書を含んだものを使います。Let's Encryptで言えば、`fullchain.pem`です。

  中間証明書を含まない証明書を使うと、「webでは問題ないがweb socketがつながらない」という事態が起きるので注意してください。

* `${MY_DOMAIN}.pem`

  秘密鍵です。

なお、実行時に証明書を含んだrouteがstartされた場合には、`数字-cert.pem`, `数字.pem`という名前のの証明書ペアがこのディレクトリに置かれます。これらはstartする度にデータベースから実体を作るので、邪魔だと思ったら消してしまっても問題ありません(start時に必要なら作られます)。

### `--config`で指定するファイルのの内容について

`--config`で指定するファイルに起動パラメータを入れておくことが出来ます。

このファイルはCommon JSのモジュールの形式となっています。

参考用に同根している、`config/server-sample.js`の内容を以下に示します。

```
module.exports = {
	HTTP_PORT: 80,
	HTTPS_PORT: 443,
	WS_PORT: 8001,
	LOCAL_PORT_RANGE: [9000, 9100],
	APPL_PORT: 3010,
	MY_DOMAIN: 'napier-net.com',
	MY_HOST: 'www.napier-net.com',
	home: process.env.HOME,
	session_ttl: 3600 * 24 * 7,
	session_path: `${process.env.PWD}/sessions`,
	cert_path: `${process.env.PWD}/certs`,
	content_path: `${process.env.PWD}/../napier-web`,
	makeDefaultPath: (domain, user) => {
		return  `${user.name}.${domain}`;
	}
};
```

それぞれのパラメータについて、以下に説明します。

<dl>
	<dt>HTTP_PORT</dt>
  <dd>
    <p>HTTPで使うポート番号を指定します。</p>
    <p>指定しない場合はHTTPを使いません。</p>
    <p>任意のポート番号を指定できますが、ローカルで試してみる以外の理由で<code>80</code>以外を指定する必要はないはずです。</p>
  </dd>
	<dt>HTTPS_PORT</dt>
  <dd>
    <p>HTTPSで使うポート番号を指定します。</p>
    <p>指定しない場合はHTTPSを使いません。</p>
    <p>任意のポート番号を指定できますが、ローカルで試してみる以外の理由で<code>443</code>以外を指定する必要はないはずです。</p>
  </dd>
	<dt>WS_PORT</dt>
  <dd>
    <p>プロキシクライアントの接続するトンネル用web socketのポート番号を指定します。</p>
    <p>任意のポート番号が指定できます。</p>
  </dd>
	<dt>LOCAL_PORT_RANGE</dt>
  <dd>
    <p>プロキシクライアントのトンネルとプロキシを接続するために使われるポート範囲を指定します。</p>
    <p>2要素の<code>Array</code>です。最初の要素が下限、後の要素が上限です。この範囲のポート番号が使用されます。</p>
    <p>このポートは新しいプロキシ先毎に使われるので、この数が同時に<code>start</code>できるプロキシ数となります。
    </p>
    <p>番号自体には特に意味はないので、他で使っているポートと衝突しない範囲を任意に指定します。</p>
  </code>
  <dt>APPL_PORT</dt>
  <dd>
    <p><code>/manage</code>以下のウェブサービスが起動されるポート番号です。</p>
    <p>これ自体は何であってもアプリケーションの動作には関係がありませんが、他のアプリケーションで使っているポートと衝突する場合には他の番号を指定して下さい。
    </p>
  </dd>
	<dt>MY_DOMAIN</dt>
  <dd>
    <p>Napierサービスを運用するドメイン名です。</p>
    <p>どのようなドメインでも構いませんが、利用者にサブドメインを払い出すタイプの運用にする場合は、他のウェブサービスで使っていない、Napierサービス専用のドメインである方が都合が良いことが多いです。</p>
  </dd>
  <dt>MY_HOST</dt>
  <dd>
    <p>Napierサービスを運用するサーバのホスト名です。</p>
    <p>利用者にサブドメインを払い出す処理に使われます。</p>
  </dd>
	<dt>cert_path</dt>
  <dd>
    <p>証明書の置かれているフォルダのパス名を指定します。</p>
    <p>指定されていない場合はHTTPSでの待機が出来ません。また、トンネルも平文のweb socketとなります。</p>
    <p>通常はサンプルにある<code>`${process.env.PWD}/certs`</code>で問題ないはずです。</p>
  </dd>
  <dt>content_path</dt>
  <dd>
    <p><code>MY_HOST</code>をアクセスした時に表示されるコンテンツがあるフォルダを指定します。</p>
    <p>Napierの動作とは直接関係はありませんが、説明等のコンテンツは用意しておいた方が良いでしょう。</p>
  </dd>
	<dt>session_path</dt>
  <dd>
    <p><code>/manage/</code>のセション情報を保存するフォルダです。</p>
  </dd>
	<dt>session_ttl</dt>
  <dd>
    <p>セション情報の生存期間を設定します(秒単位)。</p>
    <p>通常はサンプルのままで問題ないはずです。</p>
  </dd>
	<dt>home</dt>
  <dd>
    <p>プロセスが実行されるホームディレクトリを指定します。</p>
    <p>通常はサンプルのままで問題ないはずです。と言うか、サンプル以外にして問題なく動くかどうかを確認していません。
    </p>
  </dd>
  <dt>makeDefaultPath</dt>
  <dd>
    <p>ユーザのデフォルトプロファイルのルーティングパス名を生成する関数を定義します。</p>
    <p>通常はサンプルのままで問題がないはずなので、そのままにしておいて下さい。この場合はサブドメインを払い出す形式になります。
    </p>
    <p>他の払い出しにしたい場合は、ソースコードを見て考えて下さい。</p>
  </dd>
</dl>