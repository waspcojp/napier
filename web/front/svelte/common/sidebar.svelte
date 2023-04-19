<aside class="main-sidebar sidebar-bg-dark sidebar-color-primary shadow">
	<div class="brand-container">
        <a href="" class="brand-link">
            <img src="public/logo.svg" alt="Logo" class="brand-image opacity-80 shadow">
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
				    <a class={(current == 'profile')  ? 'nav-link active': 'nav-link'}
                            on:click="{() => {current = 'profile'}}">
                        <i class="nav-icon fas fa-circle"></i>
                        プロファイル
                    </a>
			    </li>
			    <li class="nav-item">
    				<a class={(current == 'user' )  ? 'nav-link active': 'nav-link'}
                            on:click="{() => {current = 'user'}}">
                        <i class="nav-icon fas fa-circle"></i>
                        ユーザ情報
                    </a>
			    </li>
            </ul>
        </nav>
    </div>
</aside>

<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';

export let current;
export let specs;
</script>
