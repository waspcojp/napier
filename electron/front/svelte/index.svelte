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
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
import User from '../../../web/front/svelte/user/index.svelte';
import Profiles from './profiles/index.svelte';
import CommonNav from './common/nav.svelte';
import SideBar from './common/sidebar.svelte';
import Config from './config/index.svelte';
import CommonFooter from '../../../web/front/svelte/common/footer.svelte';

let current;
let user_name;

const loggedIn = () => {
    console.log('logged in')
}

onMount(() => {
    user_name = user_name || env.user;
    current = current || ( user_name ? 'profile' : 'config');
});

</script>
