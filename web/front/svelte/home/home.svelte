<div class="row">
    <div class="col-5" style="padding:10px;">
    </div>
    <div class="col-3" style="padding:10px;">
    </div>
</div>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';

beforeUpdate(() => {
	console.log('home beforeUpdate');
	let args = location.pathname.split('/');
    console.log('locations', args);
});

</script>
