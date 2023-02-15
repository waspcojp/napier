<div class="card">
    <div class="card-header">
        <h3 class="card-title">ウェブサーバ設定</h3>
    </div>
    <div class="card-body">
        <div class="form-check">
            <input class="form-check-input" type="checkbox"
                bind:checked={conf.directoryListing} value=true id="directoryListing">
            <label class="form-check-label" for="directroyListing">
                Disable directory listing or restrict it to certain paths
            </label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="checkbox"
                bind:checked={conf.symlinks} value=true id="symlinks">
            <label class="form-check-label" for="symlinks">
                Resolve symlinks instead of rendering a 404 error
            </label>
        </div>
        <div class="row">
            <label for="root" class="col-sm-4 col-form-label">
                document root
            </label>
            <div class="col-sm-8">
                <input type="text" class="form-control"
                    disabled={run}
                    on:click={openDialog}
                    bind:value={conf.public}>
            </div>
        </div>
        <div class="row">
            <label for="root" class="col-sm-4 col-form-label">
                web port
            </label>
            <div class="col-sm-2">
                <input type="text" class="form-control number"
                    disabled={run}
                    bind:value={conf.port}>
            </div>
        </div>
    </div>
    <div class="card-footer">
        {#if (run) }
        <button type="button" class="btn btn-danger"
            on:click={start}>Stop</button>
        {:else}
        <button type="button" class="btn btn-primary"
            on:click={start}>Start</button>
        {/if}
    </div>
</div>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';

let conf = {};
let run;

onMount(()=> {
    console.log('web-server:onMount');
    if  ( env.webServer )   {
        conf = {
            public: env.webServer.public,
            port: env.webServer.port,
            directoryListing: env.webServer.directoryListing,
            symlinks: env.webServer.symlinks
        };
    } else {
        conf = {};
    }

    api.checkWebServer().then((ret) => {
        run = ret;
    })
});
beforeUpdate(() => {
    console.log('web-server:beforeUpdate');
})
afterUpdate(() => {
    console.log('web-server:afterUpdate');
})

const start = () => {
    if  ( !run )    {
        console.log('conf', conf);
        api.setConf({
            webServer: conf
        }).then(() => {
            console.log('env', env);
            api.startWebServer().then(() => {
                run = true;
            });
        });
    } else {
        api.stopWebServer().then(() => {
            run = false;
        }).catch(() => {
        });
    }
}

const openDialog = async () => {
    let path = await api.openDialog();
    console.log('path', path);
    if  ( path ) {
        conf.public = path;
    }
}
</script>
