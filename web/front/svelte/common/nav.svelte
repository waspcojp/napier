<div class="container-fluid">
	<ul class="navbar-nav">
		<li class="nav-item">
			<a href="home" class="nav-link">Home</a>
		</li>
	</ul>
	<span class="havbar-text">
	</span>
	<ul class="navbar-nav ms-auto">
		<li class="nav-item dropdown">
			<a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" id="user_menu"
					role="button" aria-expanded="false">
				<span class="d-none d-md-inline">{user}</span>
			</a>
			<ul class="dropdown-menu"
					aria-labelledby="user_menu">
				<li>
					<a href="/manage/logout" class="dropdown-item">Sign out</a>
				</li>
			</ul>
		</li>
		<li class="nav-item">
			<a class="nav-link" data-lte-toggle="sidebar-full" href="#" role="button">
				<i class="fas fa-expand-arrows-alt"></i>
			</a>
		</li>
	</ul>
</div>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';

export	let	user;

beforeUpdate(() => {
});
</script>
