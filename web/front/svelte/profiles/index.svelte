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
    {modal}
    {profile}
    {api}
    on:close={close_}></ProfileModal>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
import Profile from './profile.svelte';
import ProfileModal from './profile-modal.svelte';
import Modal from 'bootstrap/js/dist/modal';

export let mode;
export let api;

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
    api.getProfiles().then((body) => {
            console.log('body', {body});
            profiles = body.profiles;
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

console.log('mode', mode);

beforeUpdate(() => {
    if  ( !profiles)    {
        profiles = [];
        updateProfiles();
    }
})
</script>