<Alert bind:alert={alert} {alert_level}></Alert>
<div class="row">
    <div class="col-8" style="padding:10px;">
        <WebServer
        ></WebServer>
    </div>
</div>

<script>
import WebServer from './info.svelte';
import Alert from '../components/alert.svelte';

let alert;
let alert_level;

</script>
