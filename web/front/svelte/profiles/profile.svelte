<div class="card">
    <div class="card-header" on:click={click}>
        {profile.name}
    </div>
    <ProfileCard 
        {specs}
        {profile}></ProfileCard>
</div>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import ProfileCard from './profile-card.svelte';

export  let profile;
export  let specs;

const   click = (event) => {
    dispatch('open', profile);
}
</script>