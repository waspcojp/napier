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
<div class="row justify-content-end">
    <div class="col-1" style="padding:10px;">
        <button type="button" class="btn btn-primary"
            on:click={newProfile}>New</button>
    </div>
</div>
<div class="row">
{#each profiles as profile}
    <div class="col-3" style="padding:10px;">
        <Profile
            bind:profile={profile}
            on:open={openProfile}
        ></Profile>
    </div>
{/each}
</div>

<ProfileModal
    modal={modal}
    profile={profile}
    on:close={close_}></ProfileModal>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
import Profile from './profile.svelte';
import ProfileModal from './profile-modal.svelte';
import axios from 'axios';
import Modal from 'bootstrap/js/dist/modal';

let alert_success;
let alert_warning;
let alert_danger;
let profiles;
let modal;
const _profile = {
    path: ''
}
let profile = _profile;

const   openProfile = (event) => {
    event.preventDefault();
    profile = event.detail;
    openModal = true;
}
const   newProfile = (event) => {
    profile = _profile;
    openModal = true;
}

const   close_ = (event) => {
    updateProfiles();
}

const   updateProfiles = () => {
    axios.get('/manage/api/profiles').then((ret) => {
            let body = ret.data;
            console.log({body});
            if  ( body.status == 'OK' ) {
                profiles = body.profiles;
            }
        })
}

let openModal = false;
afterUpdate(() => {
    if  ( !modal )  {
        modal = new Modal(document.getElementById('profile-modal'));
    }
    if  ( openModal )   {
        modal.show();
        openModal = false;
    }
})


beforeUpdate(() => {
    if  ( !profiles)    {
        profiles = [];
        updateProfiles();
    }
})
</script>