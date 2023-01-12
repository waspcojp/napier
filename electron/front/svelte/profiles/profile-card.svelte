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
    </div>
</div>
<script>
export  let profile;
</script>    