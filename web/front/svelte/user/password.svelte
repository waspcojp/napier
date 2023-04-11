<div class="card">
    <div class="card-header">
        パスワード
    </div>
    <div class="card-body">
        <form>
            <div class="row mb-3">
                <label for="inputCurrentPassword" class="col-sm-5 col-form-label">
                    現在のパスワード
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="inputCurrentPassword"
                        bind:value={currentPassword}>
                </div>
            </div>
            <div class="row mb-3">
                <label for="inputNewPassword" class="col-sm-5 col-form-label">
                    新しいパスワード
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="inputNewPassword"
                        bind:value={newPassword}>
                </div>
            </div>
            <div class="row mb-3">
                <label for="inputConfirmPassword" class="col-sm-5 col-form-label">
                    新しいパスワードの再入力
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="inputConfirmPassword"
                        bind:value={confirmPassword}>
                </div>
            </div>
            <button class="btn btn-primary" on:click|preventDefault={update}>
                パスワード更新
            </button>
        </form>
    </div>
</div>
<script>

export  let currentPassword;
export  let newPassword;
export  let confirmPassword;
export  let update;
</script>