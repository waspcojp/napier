<aside class="main-sidebar sidebar-bg-dark sidebar-color-primary shadow">
	<div class="brand-container">
        <a href="/" class="brand-link">
            <img src="public/logo.svg" alt="Logo" class="brand-image opacity-80 shadow">
        </a>
    </div>
    <div class="sidebar">
	    <nav class="mt-2">
            <ul class="nav nav-sidebar">
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
