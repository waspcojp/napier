<Alert bind:alert={alert} {alert_level}></Alert>
<div class="row">
    <div class="col-6" style="padding:10px;">
        <UserInfo
            bind:mail
            update={updateUser}></UserInfo>
    </div>
</div>
<div class="row">
    <div class="col-6" style="padding:10px;">
        <Password
            bind:currentPassword
            bind:newPassword
            bind:confirmPassword
            bind:mail
            update={updatePassword}></Password>
    </div>
</div>

<script>
import Password from './password.svelte';
import UserInfo from './info.svelte';
import Alert from '../components/alert.svelte';
import {onMount} from 'svelte';

let currentPassword;
let newPassword;
let confirmPassword;
let mail;
let alert;
let alert_level;

onMount(() => {
    api.getUser().then((user) => {
        console.log({user});
        mail = user.mail;
    });
})
const updatePassword = (event) => {
    if  ( newPassword ) {
        if  ( newPassword == confirmPassword )    {
            api.password(currentPassword, newPassword).then((ret) => {
                alert = 'password update success';
                alert_level = 'alert-success';
            }).catch ((e) => {
                alert = 'password update fail';
                alert_level = 'alert-danger';
            });
        } else {
            alert = 'invalid password';
            alert_level = 'alert-danger';
        }
    }
}

const updateUser = (event) => {
    api.putUser({
        mail: mail
    }).then((ret) => {
        alert = 'user info update success';
        alert_level = 'alert-success';
    }).catch ((e) => {
        alert = 'user info update fail';
        alert_level = 'alert-danger';
    });
}
</script>