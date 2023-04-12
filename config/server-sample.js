module.exports = {
    HTTP_PORT: 8000,
//    HTTPS_PORT: 8443,
    WS_PORT: 8001,
    LOCAL_PORT_RANGE: [9000, 9100],
    APPL_PORT: 3331,
    MY_DOMAIN: 'shibuya.local',
    home: process.env.HOME,
	session_ttl: 3600 * 24 * 7,
	session_path: `${process.env.PWD}/sessions`,
    //cert_path: `${process.env.PWD}/certs`,
    content_path: `${process.env.PWD}/page`,
    makeDefaultPath: (domain, user) => {
        //return  `${user.name}.${domain}`;
        return  `${domain}:8000/${user.name}`;
    }
};
