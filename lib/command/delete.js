// Delete folders and files recursively
sync.delete = function(filepath) {
    filepath = String(filepath);

    if (!sync.exists(filepath)) {
        return false;
    }

    rimraf.sync(filepath);

    return true;
};