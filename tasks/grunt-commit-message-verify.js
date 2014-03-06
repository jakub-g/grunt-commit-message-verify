/*
 * grunt-commit-message-verify
 * https://github.com/jakub-g/grunt-commit-message-verify
 *
 * Copyright (c) 2014 Aria Templates
 * Licensed under the Apache license.
 */
var exec = require('child_process').exec;

var checkCommit = require("../lib/check-commit-message");

var shellCommand = "git log -1 --pretty=%B";

/**
 * Check if last commit message conforms to standards.<br>
 * Config is read from grunt.config.get('grunt-commit-message-verify')
 */
module.exports = function (grunt) {

    grunt.registerTask('grunt-commit-message-verify', 'Verify that last commit message (HEAD) conforms to the repo standars', function () {

        grunt.log.writeln('Verifying that the commit message is okay...'.cyan);

        var cfg = grunt.config.get('grunt-commit-message-verify');
        if (!cfg) {
            grunt.log.writeln("Warning: no config found under 'grunt-commit-message-verify' node");
            return false;
        }

        cfg.regexes = cfg.regexes || [];
        cfg.minLength = cfg.minLength || 0;
        cfg.maxLength = cfg.maxLength || 0;

        cfg.minFirstLineLength = cfg.minFirstLineLength || 0;
        cfg.maxFirstLineLength = cfg.maxFirstLineLength || 0;

        cfg.maxLineLength = cfg.maxLineLength || 0;

        var done = this.async();
        var childproc = exec(shellCommand, function (error, stdout, stderr) {
            if (error || stderr || this.errorCount) {
                grunt.log.error("Something went wrong when trying to read last Git commit message");
                if (error) {
                    grunt.log.writeln("Error: " + error);
                }
                if (stderr) {
                    grunt.log.writeln("stderr output:" + stderr);
                }
                done(false);
                return;
            }

            // the commit message, string with perhaps newlines
            var sMsg = stdout.trim();
            var asMsg = sMsg.split("\n");

            // let's do the checks
            var errors = [];
            for (var regexName in cfg.regexes) {
                var regexObj = cfg.regexes[regexName];
                checkCommit.regex(sMsg, regexObj, regexName, errors);
            }
            var someRegexFailed = (errors.length > 0);

            checkCommit.maxLineLength(asMsg, cfg.maxLineLength, errors);

            checkCommit.checkLength(asMsg[0], {
                min : cfg.minFirstLineLength,
                max : cfg.maxFirstLineLength
            }, "The first line of commit message", errors);

            checkCommit.checkLength(sMsg, {
                min : cfg.minLength,
                max : cfg.maxLength
            }, "The commit message", errors);

            // error reporting
            var ok = (errors.length == 0);
            if (ok) {
                grunt.log.ok();
            } else {
                grunt.log.warn("Almost there, but the last commit message is not quite okay:".yellow);
                errors.forEach(function (err, idx) {
                    grunt.log.writeln();
                    grunt.log.warn((idx + 1) + ". " + err);
                });
                grunt.log.writeln();
                grunt.log.warn("The commit message was:".yellow);
                grunt.log.writeln(sMsg.cyan);
                grunt.log.writeln();
                grunt.log.warn("Use git commit --amend to improve the commit message.");
                if (someRegexFailed) {
                    grunt.log.warn("Hint: use http://www.regexper.com to visualize the regexes.");
                }
            }
            done(ok);

        });

    });

};
