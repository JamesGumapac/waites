define([], function() {
    return {
        toFloat: function(val) {
            return val ? parseFloat(val) : 0;
        },
    };
});