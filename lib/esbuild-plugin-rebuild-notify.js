
module.exports = () => {
    return {
        name: 'rebuild-notify',
        setup(build) {
            build.onEnd(result => {
                if (result.errors.length === 0) {
                    console.log(`rebuilt app successfully`, new Date().toLocaleTimeString().split(' ')[0]);
                } else {
                    console.log(`build ended with`, result.errors);
                }
            })
        }
    };
};
