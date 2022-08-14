<div class="row">
{#if alert_success}
    <div class="alert alert-success" role="alert">
        <button type="button" class="btn-close" aria-label="Close"
            on:click="{() => {alert_success = undefined}}"></button>
        <strong>{alert_success}</strong>
        </div>
{/if}
{#if alert_warning}
    <div class="alert alert-warning fade show" role="alert">
        <button type="button" class="btn-close" aria-label="Close"
            on:click="{() => {alert_warning = undefined}}"></button>
        <stroing>{alert_warning}</stroing>
    </div>
{/if}
{#if alert_danger}
    <div class="alert alert-danger fade show" role="alert">
        <button type="button" class="btn-close" aria-label="Close"
            on:click="{() => {alert_danger = undefined}}"></button>
        <strong>{alert_danger}</strong>
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
            console.log({ret});
            if  ( ret.data.status == 'OK' )    {
                alert_success = 'password update success';
                alert_danger = undefined;
            } else {
                alert_success = undefined;
                alert_danger = 'password update fail';
            }
        });
    }
};

</script>