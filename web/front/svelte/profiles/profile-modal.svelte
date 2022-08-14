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
                        <label for="path" class="col-sm-4 col-form-label">Path</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" bind:value={profile.path}>
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
			<div class="modal-footer">
				{#if ( profile && profile.id ) }
					<button type="button" class="btn btn-danger" id="delete-button"
						on:click={delete_}>Delete</button>
				{/if}
				<button type="button" class="btn btn-primary" id="save-button"
						on:click={save}>Save</button>
			</div>
		</div>
	</div>
</div>
<script>

import axios from 'axios';
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();

export let modal;
export let profile;

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
	try {
		let pr;
		if ( profile.id  ) {
			pr = axios.put('/manage/api/profile', profile);
		} else {
			pr = axios.post('/manage/api/profile', profile);
		}
		pr.then(() => {
			close_();
		});
	} catch(e) {
		console.log(e);
		// can't save
		//	TODO alert
	}
};

const close_ = (event) => {
	clean_popup();
};

const delete_ = (event) => {
	try {
		console.log('delete');
		axios.delete('/manage/api/profile', {
			data: {
				id: profile.id
			}
		}).then((result) => {
			clean_popup();
		});
	} catch(e) {
		console.log(e);
		// can't delete
		//	TODO alert
	}
}

</script>
