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
                path: '10.1.254.12/',
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

const   findUser = (user_name) => {
    let user;
    for ( let i = 0 ; i < USER.length ; i += 1 )    {
        if  ( USER[i].name == user_name )    {
            user = USER[i];
            break;
        }
    }
    return  (user);
}
const   getProfile = (user, profile_name) => {
    let profile;

    if  ( user )    {
        if  ( !profile_name )   {
            profile = Object({
                name: 'default',
                path: `10.1.254.11/${user.name}`
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

const   delProfile = (user, profile_name) => {
    let profile;
    if  ( user )    {
        for ( let i = 0; i < user.profiles.length ; i += 1) {
            if  ( user.profiles[i].name == profile_name )   {
                profile = user.profiles[i];
                user.profiles.splice(i, 1);
                break;
            }
        }
    }
    return  (profile)
}

const   validateProfile = (user, profile)  => {
    return  (true);
}

const   putProfile = (user, profile) => {
    let find;
    let ok;
    if  ( user )    {
        if  ( validateProfile(user, profile) )  {
            for ( let i = 0; i < user.profiles.length; i += 1 ) {
                if  ( user.profiles[i].name == profile.name )   {
                    find = i;
                    break;
                }
            }
            if  ( find )    {
                user.profiles[find] = profile;
                ok = find;
            } else {
                user.profiles.push(profile);
                ok = user.profiles.length - 1;
            }
        }
    }
    return  (ok);
}

const   passwd = (user, old_pass, new_pass) => {
    let ok;
    if  ( user )    {
        if  ( user.password == old_pass )    {
            user.password = new_pass;
            ok = true;
        }
    }
    return  (ok);
}

module.exports = {
    auth: auth,
    passwd: passwd,
    getProfile: getProfile,
    delProfile: delProfile,
    putProfile: putProfile
};