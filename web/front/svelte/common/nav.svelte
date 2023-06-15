<nav class="main-header navbar navbar-expand-lg navbar-light bg-light p-3">
	<div class="container-fluid">
		<a href="home" class="navbar-brand">Home</a>
			<ul class="navbar-nav ms-auto">
				<li class="nav-item dropdown">
					<a href="#" class="nav-link"
							on:click|preventDefault={Logout}>
						<span class="d-none d-md-inline">{user}</span>
					</a>
				</li>
			</ul>
	</div>
</nav>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';

export	let	user;
export let current;

const Logout = () => {
	try	{
		api.logout().then(() => {
			user = undefined;
			current = 'login';
		});
	} catch(e) {
		console.log('logout fail', e)
	}
}
beforeUpdate(() => {
});
</script>
