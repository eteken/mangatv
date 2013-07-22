module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            development: {
                options: {
                    paths: ["./public/less"],
                    yuicompress: true
                },
                files: {
                    "./public/css/index.css": "./public/less/index.less"
                }
            }
        },
        watch: {
            files: "./public/less/*",
            tasks: ["less"]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
