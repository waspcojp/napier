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
