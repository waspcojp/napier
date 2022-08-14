<!-- svelte-ignore empty-block -->
{#if ( args[2] == 'user' ) }
    <User></User>
{:else if ( args[2] == 'profile' ) }
    <Profiles></Profiles>
{:else}
<div class="row">
    <div class="col-5" style="padding:10px;">
    </div>
    <div class="col-3" style="padding:10px;">
    </div>
</div>
{/if}

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
import User from './user/index.svelte';
import Profiles from './profiles/index.svelte';

let args;
beforeUpdate(() => {
	console.log('index beforeUpdate');
	args = location.pathname.split('/');
    console.log('locations', args);
});

</script>
