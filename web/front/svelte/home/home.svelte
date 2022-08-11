<!-- svelte-ignore empty-block -->
{#if ( args[3] == 'user' ) }
<h2>User</h2>
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

let args;
beforeUpdate(() => {
	console.log('home beforeUpdate');
	args = location.pathname.split('/');
    console.log('locations', args);
});

</script>
