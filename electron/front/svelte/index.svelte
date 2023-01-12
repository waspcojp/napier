<div  class="wrapper">
    <CommonNav
        bind:user_name={user_name}
        bind:current={current}></CommonNav>
    <SideBar bind:current={current}
        user_name={user_name}></SideBar>
    <main class="content-wrapper">
        <div class="content">
            <div class="container-fluid">
            {#if ( current == 'user' ) }
                <User></User>
            {:else if ( current == 'profile' ) }
                <Profiles></Profiles>
            {:else if ( current == 'config' ) }
                <Config
                    bind:user_name={user_name}
                    on:login={loggedIn}
                    ></Config>
            {:else}
                <div class="row">
                    <div class="col-5" style="padding:10px;">
                    </div>
                    <div class="col-3" style="padding:10px;">
                    </div>
                </div>
            {/if}
            </div>
        </div>
    </main>
    <CommonFooter></CommonFooter>
</div>

<script>
import User from './user/index.svelte';
import Profiles from './profiles/index.svelte';
import CommonNav from './common/nav.svelte';
import SideBar from './common/sidebar.svelte';
import Config from './config/config.svelte';
import CommonFooter from './common/footer.svelte';

let user_name = env.user;
let current = ( user_name ? 'profile' : 'config');

const loggedIn = () => {
    console.log('logged in')
}
/*
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
beforeUpdate(() => {
});
onMount(() => {
	console.log('index beforeUpdate');
});
*/
</script>
