<div class="row">
    <div class="col-6" style="padding:10px;">
        <Server
            bind:user_name={user_name}
            bind:alert={alert}
            bind:alert_level={alert_level}>
        </Server>
    </div>
    {#if ( !user_name || ( user_name == '' )) }
    <div class="col-6" style="padding:10px;">
        <SignUp bind:alert={alert} bind:alert_level={alert_level}>
        </SignUp>
    </div>
    {/if}
</div>
<Alert bind:alert={alert} {alert_level}></Alert>
<Login
    on:login
    bind:alert={alert}
    bind:alert_level={alert_level}></Login>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
import Modal from 'bootstrap/js/dist/modal';

import SignUp from './signup.svelte';
import Server from './server.svelte';
import Login from './login-modal.svelte';
import Alert from '../../../../web/front/svelte/components/alert.svelte';

export let user_name;

let alert;
let alert_level;

afterUpdate(() => {
    if  ( !window.loginModal )  {
        window.loginModal = new Modal(document.getElementById('login-modal'));
    }
})

</script>