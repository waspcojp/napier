<Alert bind:alert={alert} {alert_level}></Alert>
{#if ( specs && specs.newProfile )}
<div class="row justify-content-end">
    <div class="col-1" style="padding:10px;">
        <button type="button" class="btn btn-primary"
            on:click={newProfile}>New</button>
    </div>
</div>
{/if}
<div class="row">
{#each profiles as profile}
    <div class="col-3" style="padding:10px;">
        <Profile
            {specs}
            bind:profile={profile}
            on:open={openProfile}
        ></Profile>
    </div>
{/each}
</div>

<ProfileModal
    {modal}
    {profile}
    {specs}
    on:close={close_}></ProfileModal>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
import Profile from './profile.svelte';
import ProfileModal from './profile-modal.svelte';
import Modal from 'bootstrap/js/dist/modal';
import Alert from '../components/alert.svelte';

export let specs;

let alert;
let alert_level;

let profiles;
let modal;
const _profile = {
    path: ''
}
let profile = _profile;

const   openProfile = (event) => {
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

onMount(() => {
    console.log({specs});
})

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