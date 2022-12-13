# Napier

Japanese document is [here](README_jp.md)

Napier is on demand proxy system, using websocket.

## Summary

Napier is a reverse proxy system that uses web sockets for forwarding connections.

![](./contents/network.png)

Therefore, as long as Napier is visible on the network, you can place a proxy destination.

## Structure

When Napier server starts, it opens ports for web (port 80, port 443) and port for forwarding (port 8000).

If the path part of the URL connected to the web port is `/manage`, the web UI for settings will be sent.

For any other URL, search for a forwarding rule corresponding to that URL. If it matches the transfer rule, it will be transferred to that transfer destination.

A forwarding connection is created by a proxy client connecting to a forwarding port. This connection is made by a (secure) web socket.

A proxy client opens a port for local connections and brokers connections to a local web server.

The proxy client has a built-in web server, and when enabled, it is possible to publish the specified directory and below via the proxy.

## Quick Start

### Install

No release packages currently exist. So get the source and run it.

```shell
$ git clone https://github.com/waspcojp/napier.git
$ npm update
```

### Settings

#### Server

```shell
$ cd napier
$ sudo chown root .
$ sudo npm run server
```

The server loads at startup config/server.js.

First of all , please try `config/server-sample.js` to `config/server.js`, using `ln -s` or `mv`.

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

Of these, only one must be fixed `MY_DOMAIN`. Others can be left as they are if there is no particular inconvenience.

To use https, you need a certificate. self-signed certificate is fine if you just try it locally, but you need to get it correctly to put it globally. In the case of default setting `./cert`, certificate and private key appear directly under it. This part is complicated for a "quick start", so I'll explain it later.

If you allow only https connection, `HTTP_PORT` is not required. Similarly, if you allow connections only with http, `HTTPS_PORT` is not required.

### Create account

**Note** There is no default account.

Once the server is up and ready to connect, create an account.

`www.${MY_DOMAIN}/manage` When accessing in non-login state ,

![](./contents/login.png)

Click 'Register a new membership'.

![](./contents/register.png)

Currently, there is no such thing as e-mail authentication. It will be registered as is.

### Client

To connect the client,

```shell
$ npm run cli -- <options>
```

Run like The boot options are:

```
Usage: napier-cli [options] [profileName]

Arguments:
  profileName                        profile name (default: "default")

Options:
  --config <config filename>         config file
  --user <user>                      user name
  --pass <pass>                      password
  --host <host>                      tunnel host
  --port <port>                      tunnel port
  --local-port <localPort>           local port
  --re-connect                       re-connect server
  --web-server                       start web server
  --server-config <config filename>  web server config file
  --document-root <path>             web server document root
  --index                            list index
```

Of these, the ones that must be specified are `--user`, `--pass` and `--host`.

Options specified on the command line are

```javascript
{
    "host": "www.napier-net.com",
    "localPort": 4001,
    "reConnect": true,
    "webServer": false,
    "user": "****",
    "pass": "****",
    "documentRoot": "."
}
```

It is also possible to store it in a file and `--config` specify it with.

At the end of the command line is the "profile" specification, which will be explained later. If not specified, it will be the default, but the URL where the proxy is started at this time is

```
(http|https)://<server URL>/<user name>
```

`--web-serve` rwill start the embedded web server. `--document-root` A web server is started with the directory specified in , as the document root, and can be accessed from outside via the proxy.

## demo site

We've created a [demo site](https://www.napier-net.com), so you can try it without setting up a server.

You can try it by starting the client after accessing the site and registering as a user.

Please note that the site of this URL will be released as an official service in the future, but user information will not be taken over at that time.

## Commentary

### About certificates

The files to be placed in certs are as follows.

* `${MY_DOMAIN}-cert.pem`

  It's called a certificate. This uses the one containing the intermediate certificate. For Let's Encrypt, it's `fullchain.pem`.

  Please note that if you use a certificate that does not include an intermediate certificate, it will cause a situation where "there is no problem with the web, but the web socket cannot be connected".

* `${MY_DOMAIN}.pem`

  This is the private key.

Note that if a route containing a certificate is started at runtime, a certificate pair named `{number}-cert.pem`, `{number}.pem` will be placed in this directory. Since these create an entity from the database each time they start, there is no problem even if you delete them if you think they are in the way.