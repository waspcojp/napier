<div class="card">
    <div class="card-header" on:click={click}>
        <h3 class="card-title">{profile.name}</h3>
    </div>
    <ProfileCard {profile}></ProfileCard>
</div>

<script>
export  let profile;
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import ProfileCard from './profile-card.svelte';

const   click = (event) => {
    dispatch('open', profile);
}
</script>