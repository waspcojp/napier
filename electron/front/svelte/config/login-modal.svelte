<div class="modal" id="login-modal" tabindex="-1" data-bs-backdrop="static">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="modalLabel">Server login</h5>
				<button type="button" class="btn-close" id="close-button" area-label="Close"
					on:click={close_}></button>
			</div>
			<div class="modal-body">
                <div class="input-group mb-3">
                    <input type="text" bind:value={user_name} class="form-control" placeholder="User name">
                </div>
                <div class="input-group mb-3">
                    <input type="password" bind:value={password} class="form-control" placeholder="Password">
                </div>
            </div>
			<div class="modal-footer">
                <button type="button" class="btn btn-primary"
                    on:click={Login}>
                    Sign In
                </button>
			</div>
		</div>
	</div>
</div>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();

export let alert;
export let alert_level;

let user_name;
let password;

const close_ = (event) => {
    console.log('close');
	loginModal.hide();
};

const Login = () => {
    try {
        api.login(user_name, password).then(() => {
            alert = 'login OK';
            alert_level = 'alert-success';
            api.setConf({
                user: user_name,
                password: password
            }).then(() => {
                dispatch('login');
            });
        }).catch((msg) => {
            alert = msg;
            alert_level = 'alert-danger'
        });
    } catch(e) {
        console.log('login fail', e);
    }
    close_();
}

</script>