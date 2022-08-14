<div class="card">
    <div class="card-header" on:click={click}>
        <h3 class="card-title">{profile.name}</h3>
    </div>
    <div class="card-body">
        <div class="row fill-height">
            <div class="row mb-3">
                <label for="path" class="col-sm-4 col-form-label">Path</label>
                <div class="col-sm-8">
                    <input type="text" class="form-control" value={profile.path} readonly=true>
                </div>
            </div>
            <div class="row mb-3">
                <label for="ssl" class="col-sm-4 col-form-label">SSL</label>
                <div class="col-sm-8">
                    <input type="text" class="form-control" value={profile.ssl ? "YES" : "NO"} readonly=true>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
export  let profile;
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();

const   click = (event) => {
    dispatch('open', profile);
}
</script>