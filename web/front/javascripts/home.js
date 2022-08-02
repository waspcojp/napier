import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// mount all the global components found in this page

import Home from '../svelte/home/home.svelte';
import CommonNav from '../svelte/common/nav.svelte';
import SideBar from '../svelte/common/sidebar.svelte';
import CommonFooter from '../svelte/common/footer.svelte';

let target = document.getElementById('body');
let user = target.getAttribute('user');

const home = new Home({
    target: document.getElementById('home'),
    props: {
    }
});
const common = new CommonNav({
    target: document.getElementById('common-nav'),
    props: {
        user: user
    }
});
const sidebar = new SideBar({
    target: document.getElementById('sidebar'),
    props: {

    }
});
const footer = new CommonFooter({
    target: document.getElementById('common-footer'),
});

export default {
    home: home,
    sidebar: sidebar,
    common: common,
    footer: footer
};
