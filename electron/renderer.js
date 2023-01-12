import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import Index from './front/svelte/index.svelte';

let target = document.getElementById('home');

const index = new Index({
    target: target
});
export default index;
