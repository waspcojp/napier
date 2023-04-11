<div class="card">
    <div class="card-header">
        <h3 class="card-title">ユーザ情報</h3>
    </div>
    <div class="card-body">
        <form>
            <div class="row mb-3">
                <label for="mail" class="col-sm-5 col-form-label">
                    メールアドレス
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="mail"
                        bind:value={mail}>
                </div>
            </div>
            <button class="btn btn-primary" on:click|preventDefault={update}>
                ユーザ情報更新
            </button>
        </form>
    </div>
</div>
<script>

export  let mail;
export  let update;
</script>