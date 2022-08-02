<div class="brand-container">
    <a href="" class="brand-link">
        <img src="public/logo.png" alt="Logo" class="brand-image opacity-80 shadow">
        <span class="brand-text fw-light">Napier</span>
    </a>
    <a class="pushmenu mx-1" data-lte-toggle="sidebar-mini" href="#" role="button">
        <i class="fas fa-angle-double-left"></i>
    </a>
</div>
<div class="sidebar">
	<nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column">
			<li class="nav-item">
				<a class={pathname.match(/\/manage\/user\//)  ? 'nav-link active': 'nav-link'}
                        href="user">
                    <i class="nav-icon fas fa-circle"></i>
                    ユーザ情報
                </a>
			</li>
        </ul>
    </nav>
</div>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';

let pathname;

beforeUpdate(() => {
	if	( !pathname )	{
    	pathname = location.pathname;
	}
});
</script>
