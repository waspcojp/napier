<div class="card">
    <div class="card-header">
        <h3 class="card-title">Server configuration</h3>
    </div>
    <div class="card-body login-card-body">
        <div class="row full-height">
            <div class="row mb-3">
                <label for="server_name" class="col-sm-4 col-form-label">server API address</label>
                <div class="input-group mb-8">
                    <input type="text" class="form-control" placeholder="Server API address"
                        id="server_name"
                        bind:value={host}>
                </div>
            </div>
            <div class="input-group mb-3">
                <label for="port" class="col-sm-4 col-form-label">server websocket port</label>
                <div class="input-group mb-8">
                    <input type="text"class="form-control" placeholder="websocket port"
                        id="port"
                        bind:value={port}>
                </div>
            </div>
        </div>
        <button type="button" class="btn btn-primary"
            on:click={Update}>
            Update
        </button>
        {#if ( !user_name || ( user_name == '' )) }
        <button type="button" class="btn btn-primary"
            on:click={Connect}>
            Connect
        </button>
        {:else}
        <a on:click|preventDefault={Logout} href="#" class="btn btn-secondary">
            Disconnect
        </a>
        {/if}
    </div>
</div>
<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';

export let alert;
export let alert_level;
export let user_name;

let host;
let port;

const Update = () => {
    console.log('host', host);
    api.setConf({
        host: host,
        port: port
    }).then(() => {
        api.logout().then(() => {
        });
    })
}

onMount(() => {
    //console.log('beforeUpdate server.svelte', host, port);
    if  ( !host )   {
        host = env.host;
    }
    if  ( !port )   {
        port = env.port;
    }
})
const Connect = () => {
    console.log('Connect');
    api.setConf({
        host: host,
        port: port
    }).then(() => {
        loginModal.show();
    });
}
const Logout = () => {
	try	{
		api.logout().then(() => {
			user_name = undefined;
		});
	} catch(e) {
		console.log('logout fail', e)
	}
}

</script>