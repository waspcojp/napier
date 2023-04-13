<style>

</style>

<div class="modal" id="profile-modal" tabindex="-1" data-bs-backdrop="static">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="modalLabel">Proxy Profile</h5>
				<button type="button" class="btn-close" id="close-button" area-label="Close"
					on:click={close_}></button>
			</div>
			<div class="modal-body">
                <div class="row fill-height">
                    <div class="row mb-3">
                        <label for="name" class="col-sm-2 col-form-label">Name</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control"
                                disabled={ profile.name === 'default' }
                                bind:value={profile.name}>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="path" class="col-sm-2 col-form-label">Path</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control"
                                disabled={ !specs || !specs.newProfile || ( profile.name === 'default')}
                                bind:value={profile.path}>
                        </div>
                    </div>
                    {#if ( specs && specs.useSSL )}
                    <div class="row mb-3">
                        <label for="ssl" class="col-sm-2 col-form-label">SSL</label>
                        <div class="col-sm-10">
                            <input type="checkbox" class="form-checkbox-input" bind:checked={profile.ssl} id="ssl">
                            <label class="form-checkbox-label" for="ssl">
                                Use SSL
                            </label>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="key" class="col-sm-2 col-form-label">Private key</label>
                        <div class="col-sm-10">
                            <textarea class="form-control monospace" bind:value={profile.key} rows="5"></textarea>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="key" class="col-sm-2 col-form-label">Certificate</label>
                        <div class="col-sm-10">
                            <textarea class="form-control monospace" bind:value={profile.cert} rows="5"></textarea>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="key" class="col-sm-2 col-form-label">Certificate</label>
                        <div class="col-sm-10">
                            <textarea class="form-control monospace" bind:value={profile.ca} rows="5"></textarea>
                        </div>
                    </div>
                    {/if}
                </div>
            </div>
			<div class="modal-footer">
				<button type="button" class="btn btn-info" id="close-button"
						on:click={close_}>取消</button>
				{#if ( profile && profile.name !== 'default' ) }
					<button type="button" class="btn btn-danger" id="delete-button"
						on:click={delete_}>Delete</button>
				    <button type="button" class="btn btn-primary" id="save-button"
						on:click={save}>Save</button>
                {/if}
            </div>
		</div>
	</div>
</div>
<script>

import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();

export let modal;
export let profile;
export let specs;

const clean_popup = () => {
	dispatch('close');
	modal.hide();
}

beforeUpdate(() => {
	console.log('beforeUpdate profile-modal', profile);
});
afterUpdate(() => {
	console.log('afterUpdate profile-modal');
});

const save = (event) => {
	console.log("save", profile);
    if  (( !profile.key ) ||
         ( !profile.key.match(/^---/) ))    {
        profile.key = undefined;
    }
    if  (( !profile.cert ) ||
         ( !profile.cert.match(/^---/) ))    {
        profile.cert = undefined;
    }
    if  ( !profile.ssl )    {
        profile.ssl = false;
    }
	api.updateProfile(profile).then(() => {
		close_();
	}).catch((e) => {
		console.log(e);
	});
};

const close_ = (event) => {
    console.log('close');
	clean_popup();
};

const delete_ = (event) => {
	api.deleteProfile(profile.id).then(() => {
		clean_popup();
	});
}

</script>
