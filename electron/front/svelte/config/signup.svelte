<div class="card">
    <div class="card-header">
        <h3 class="card-title">Napier signup</h3>
    </div>
    <div class="card-body login-card-body">
        <div class="row full-height">
            <div class="row mb-3">
                <label for="user_name" class="col-sm-4 col-form-label">User Name</label>
                <div class="input-group mb-8">
                    <input type="text" class="form-control" placeholder="User name"
                        id="user_name"
                        bind:value={user_name}>
                </div>
            </div>
            <div class="input-group mb-3">
                <label for="password" class="col-sm-4 col-form-label">Password</label>
                <div class="input-group mb-8">
                    <input type="password"class="form-control" placeholder="Password"
                        id="password"
                        bind:value={password}>
                </div>
            </div>
        </div>
        <button type="button" class="btn btn-primary"
            on:click={SignUp}>
            Sign Up
        </button>
    </div>
</div>

<script>

let user_name;
let password;
export let alert;
export let alert_level;

const SignUp = () => {
    try {
        api.signup(user_name, password).then((res) => {
            alert = 'signup ok';
            alert_level = 'alert-success'
        }).catch((msg) => {
            alert = msg;
            alert_level = 'alert-danger'
        });
    } catch(e) {
        console.log('signup fail', e);
    }
}

</script>