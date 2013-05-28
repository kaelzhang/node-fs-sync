// @returns true if the file path exists.
sync.exists = function() {
    var filepath = node_path.join.apply(node_path, arguments);
    return node_fs.existsSync(filepath);
};