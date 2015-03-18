module.exports = function(grunt) {
    // Project configuration
    grunt.initConfig({
        uglify: {
            options: {
                mangle: false,
//                beautify: true
            },
            my_target: {
                files: {
                    'parse/combined.min.js': [
                        'parse/utils.js',
                        'parse/user/extend.js',
                        'parse/user/location_coarse.js',
                        'parse/user/location_precise.js',
                        'parse/user/private_data.js',
                        'parse/user/public_profile.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
};
