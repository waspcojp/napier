{#if ( user && user !== 'null' )}
<div  class="wrapper">
    <CommonNav bind:user={user} bind:current={current}></CommonNav>
    <SideBar bind:current={current} paidService={paidService}></SideBar>
    <main class="content-wrapper">
        <div class="content">
            <div class="container-fluid">
            {#if ( current == 'user' ) }
                <User></User>
            {:else if ( current == 'profile' ) }
                <Profiles></Profiles>
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
{:else}
    {#if ( current == 'signup' ) }
    <SignUp bind:user={user} bind:current={current}></SignUp>
    {:else}
    <Login bind:user={user} bind:current={current}></Login>
    {/if}
{/if}

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
import User from './user/index.svelte';
import Profiles from './profiles/index.svelte';
import CommonNav from './common/nav.svelte';
import SideBar from './common/sidebar.svelte';
import Login from './login/login.svelte';
import SignUp from './login/signup.svelte';
import CommonFooter from './common/footer.svelte';

let current;
let mode;
export let user;
export let paidService;


beforeUpdate(() => {
	console.log('index beforeUpdate', user);
    current = current || ( user ? null : 'profile');
});

</script>
