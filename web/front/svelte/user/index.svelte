<div class="row">
{#if alert_success}
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>{alert_success}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
{:else if alert_warning}
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <stroing>{alert_warning}</stroing>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
{:else if alert_danger}
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>{alert_danger}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
{/if}
</div>
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
import axios from 'axios';

let currentPassword;
let newPassword;
let confirmPassword;
let alert_success;
let alert_warning;
let alert_danger;

const passwd = (old_pass, new_pass) => {
    return  axios.put('/manage/api/password', {
        currentPassword: old_pass,
        newPassword: new_pass 
    });
}

const update = (event) => {
    if  (( newPassword ) &&
         ( newPassword == confirmPassword ))    {
        passwd(currentPassword, newPassword).then((ret) => {
            if  ( ret.data.status == 'OK' )    {
                alert_success = 'password update success';
            } else {
                alert_danger = 'password update fail';
            }
        });
    }
};

</script>