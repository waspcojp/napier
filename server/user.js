//
//  このコードはあくまでもスタブのようなものです
//
const   USER = [
    {
        name: 'ogochan',
        password: '***',
        profiles: [
            {
                name: 'vhost1',
                path: 'shibuya',
                ssl: {
                    key:  "./certs/10.1.254.12-key.pem",
                    cert: "./certs/10.1.254.12-cert.pem"
                }
            },
            {
                name: 'real',
                path: '10.1.254.11',
                ssl: true
            },
            {
                name: 'vhost2',
                path: 'www2.wasp.co.jp'
            }
        ]
    }
];

const   auth = (name, password) => {
    let user;
    for ( let i = 0 ; i < USER.length ; i += 1 )    {
        if  ( USER[i].name == name )    {
            if  ( USER[i].password == password )    {
                user = USER[i];
                break;
            }
        }
    }
    return  (user);
}
const   getProfile = (user_name, profile_name) => {
    let user;
    let profile;
    for ( let i = 0 ; i < USER.length ; i += 1 )    {
        if  ( USER[i].name == user_name )    {
            user = USER[i];
            break;
        }
    }
    if  ( user )    {
        if  ( !profile_name )   {
            profile = Object({
                name: 'default',
                path: `localhost/${user.name}`
            });
        } else {
            for ( let i = 0 ; i < user.profiles.length ; i += 1 )   {
                if  ( user.profiles[i].name == profile_name )   {
                    profile = user.profiles[i];
                    break;
                }
            }
        }
    }
    return  (profile);
}

module.exports = {
    auth: auth,
    getProfile: getProfile
};