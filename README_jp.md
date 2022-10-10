# Napier

Napier は websocketを使った逆プロキシのシステムです。

## 仕組み

Napierは転送用のコネクションにweb socketを使った逆プロキシシステムです。

このため、ネットワーク的にNapierが見えてさえいれば、プロキシ先を置くことができます。

## 動作

Napier serverは、起動するとweb用のポート(port 80, port 443)と転送用のポート(port 8000)を開きます。

web用ポートに接続されたURLのパス部が`/manage`の場合は設定用のウェブUIを送信します。

それ以外のURLの場合、そのURLに対応した転送ルールを検索します。転送ルールに合致した場合、その転送先に転送を行います。

転送のためのコネクションは、転送用ポートにプロキシのクライアントが接続することによって生成されます。この接続は(secure) web socketによって作られています。

プロキシのクライアントはローカル接続のためのポートを開き、ローカルにあるウェブサーバに接続を仲介します。

プロキシのクライアントにはウェブサーバが組み込まれており、有効にすると指定したディレトリ以下をプロキシ経由で公開することが可能になっています。

## クイックスタート

### インストール

現在のところ、リリースパッケージは存在していません。そのため、ソースを取り寄せて実行して下さい。

```shell
$ git clone https://github.com/waspcojp/napier.git
$ npm update
```

### 設定

#### サーバ

```shell
$ cd napier
$ sudo chown root .
$ sudo npm run server
```

サーバは起動時に`config/server.js`を読み込みます。

まずは、`config/server-sample.js`を`config/server.js`として読み込むように`ln -s`するか`mv`して下さい。

```javascript
module.exports = {
    HTTP_PORT: 8000,
    HTTPS_PORT: 8443,
    WS_PORT: 8001,
    LOCAL_PORT_RANGE: [9000, 9100],
    APPL_PORT: 3331,
    MY_DOMAIN: 'shibuya.local',
    home: process.env.HOME,
	session_ttl: 3600 * 24 * 7,
	session_path: `${process.env.PWD}/sessions`,
    cert_path: `${process.env.PWD}/certs`,
    content_path: `${process.env.PWD}/page`
};
```

このうち、必ず修正しなければならないのは、`MY_HOST`だけです。他は特に不都合がなければそのままで構いません。

httpsを使うためには、証明書が必要です。ローカルで試すだけならオレオレ証明書(自己署名証明書)でも構いませんが、グローバルに置くためには、正しく取得する必要があります。デフォルトの設定の場合は、`./cert`直下に証明書と秘密鍵を起きます。この辺は「クイックスタート」にしては厄介なので、後程説明します。

httpだけで

## CAUTION this system is not practical.

This project is just getting started.

The current code is just a code for demonstrating operation. For those who can read and understand the code.

In the future, we plan to make it a practical system.
