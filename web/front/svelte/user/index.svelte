<Alert bind:alert={alert} {alert_level}></Alert>
<div class="row">
    <div class="col-6" style="padding:10px;">
        <UserInfo
            bind:currentPassword
            bind:newPassword
            bind:confirmPassword
            update={update}></UserInfo>
    </div>
</div>

<script>
import UserInfo from './info.svelte';
import Alert from '../components/alert.svelte';

let currentPassword;
let newPassword;
let confirmPassword;
let alert;
let alert_level;

const update = (event) => {
    if  (( newPassword ) &&
         ( newPassword == confirmPassword ))    {
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
};

</script>