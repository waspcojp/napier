<div class="card">
    <div class="card-header" on:click={click}>
        <h3 class="card-title">{profile.name}</h3>
    </div>
    <ProfileCard {profile}></ProfileCard>
    <div class="card-footer">
        <div class="row">
            <div class="col-8">
                <input type="text" class="form-control" bind:value={profile.localPort} >
            </div>
            {#if (button) }
            <button type="button" class="btn btn-primary col-4"
                on:click={start}>Start</button>
            {:else}
            <button type="button" class="btn btn-danger col-4"
                on:click={start}>Stop</button>
            {/if}
        </div>
    </div>
</div>

<script>
export  let profile;

import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import ProfileCard from '../../../../web/front/svelte/profiles/profile-card.svelte';

let button = true;

const   click = (event) => {
    dispatch('open', profile);
}
const start = (event) => {
    console.log('start', profile.name);
    if  ( button )  {
        api.startProxy(profile.name, profile.localPort).then(() => {
            api.setConf().then(() => {
                button = false;
            });
        });
    } else {
        api.stopProxy(profile.name).then(() => {
            button = true;
        });
    }
}
</script>