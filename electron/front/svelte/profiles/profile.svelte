<div class="card">
    <div class="card-header" on:click={click}>
        <h3 class="card-title">{profile.name}</h3>
    </div>
    <ProfileCard {profile}></ProfileCard>
    <div class="card-footer">
        <div class="row">
            <div class="form-check col-sm-4" id="check" style="padding-top:7px;">
                <input type="checkbox" class="form-check-input"
                    bind:checked={web} value=true
                    on:change={change}>
                <label class="form-check-label" for="start">
                    web
                </label>
            </div>
            <div class="col-4">
                <input type="text" class="form-control number"
                    disabled={web}
                    bind:value={profile.localPort} >
            </div>
            {#if (run) }
            <button type="button" class="btn btn-danger col-4"
                on:click={start}>Stop</button>
            {:else}
            <button type="button" class="btn btn-primary col-4"
                on:click={start}>Start</button>
            {/if}
        </div>
    </div>
</div>

<script>
export  let profile;

import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import ProfileCard from './profile-card.svelte';
let web = ( profile.localPort == env.webServer.port ) ? true : false;
let run;

onMount(()=> {
    console.log('profile:onMount');
    api.checkProxy(profile.name).then((ret) => {
        console.log('ret', profile.name, ret);
        run = ret;
    })
});

const change = () => {
    console.log('web', web);
    if  ( web ) {
        profile.localPort = env.webServer.port;
    }
}
const   click = (event) => {
    dispatch('open', profile);
}
const start = (event) => {
    console.log('start', profile.name);
    if  ( !run )  {
        api.startProxy(profile.name, profile.localPort).then(() => {
            api.setConf().then(() => {
                run = true;
            });
        });
        if  ( web ) {
            api.checkWebServer().then((ret) => {
                if  ( !ret )    {
                    api.startWebServer();
                }
            });
        }
    } else {
        api.stopProxy(profile.name).then(() => {
            run = false;
        });
/*
        if  ( web ) {
            api.checkWebServer().then((ret) => {
                if  ( ret )    {
                    api.stopWebServer();
                }
            });
        }
*/
    }
}
</script>