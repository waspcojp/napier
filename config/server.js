module.exports = {
    HTTP_PORT: 8000,
    HTTPS_PORT: 8443,
    WS_PORT: 8001,
    LOCAL_PORT_RANGE: [9000, 9100],
    APPL_PORT: 3331,
	home: process.env.HOME,
	session_ttl: 3600 * 24 * 7,
	session_path: `${process.env.HOME}/git/napier/sessions`
};
