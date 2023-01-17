<div class="card-body">
    <div class="row fill-height">
        <div class="row mb-3">
            <label for="path" class="col-sm-4 col-form-label">Path</label>
            <div class="col-sm-8">
                <input type="text" class="form-control" value={profile.path} readonly=true>
            </div>
        </div>
        <div class="row mb-3">
            <label for="ssl" class="col-sm-4 col-form-label">SSL</label>
            <div class="col-sm-8">
                <input type="text" class="form-control" value={profile.ssl ? "YES" : "NO"} readonly=true>
            </div>
        </div>
        <div class="row mb-3">
            <label class="col-sm-6 col-form-label">web server</label>
            <div class="form-check col-sm-6" id="check" style="padding-top:7px;">
                    <input type="checkbox" class="form-check-input"
                        bind:value={profile.start}>
                    <label class="form-check-label" for="start">
                        start
                    </label>
            </div>
        </div>
    </div>
</div>
<script>
export  let profile;
</script>    