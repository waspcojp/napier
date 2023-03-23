<div class="card">
    <div class="card-header">
        <h3 class="card-title">ユーザ情報</h3>
    </div>
    <div class="card-body">
        <form>
            <div class="row full-height">
                <div class="row mb-3">
                    <label for="inputCurrentPassword" class="col-sm-4 col-form-label">Current Password</label>
                    <div class="col-sm-8">
                        <input type="text" class="form-control" id="inputCurrentPassword"
                            bind:value={currentPassword}>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="inputNewPassword" class="col-sm-4 col-form-label">New Password</label>
                    <div class="col-sm-8">
                        <input type="text" class="form-control" id="inputNewPassword"
                            bind:value={newPassword}>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="inputConfirmPassword" class="col-sm-4 col-form-label">Confirm Password</label>
                    <div class="col-sm-8">
                        <input type="text" class="form-control" id="inputConfirmPassword"
                            bind:value={confirmPassword}>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" on:click|preventDefault={updatePassword}>Update</button>
        </form>
        <hr/>
        <form>
            <div class="row full-height">
                <div class="row mb-3">
                    <label for="mail" class="col-sm-4 col-form-label">
                        Mail address
                    </label>
                    <div class="col-sm-8">
                        <input type="text" class="form-control" id="mail"
                            bind:value={mail}>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" on:click|preventDefault={updateUser}>Update</button>
        </form>
    </div>
</div>
<script>

export  let currentPassword;
export  let newPassword;
export  let confirmPassword;
export  let mail;
export  let updatePassword;
export  let updateUser;
</script>