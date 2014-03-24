# grunt-commit-message-verify

Verifies that the last commit message [1] of the Git repo [2] is compliant to your requirements.
This is a Grunt plugin [3], useful mostly in continuous-integration environments (like Travis CI) - since it
only checks the latest commit.

Tested with NodeJS 0.8 / Grunt 0.4.2.

Notes:

1. To be precise, **youngest non-merge** commit. See the default shell command.
2. You can customize the shell command to be run, to use it with any VCS or actually any string fed to the program via `stdin`
3. You can also use it outside Grunt in pure NodeJS script:
`require('grunt-commit-message-verify/lib/check-commit-message.js')` and then use the methods exposed.

### Rationale

Why would you need it? For instance, to make sure that each commit contains a number of the pull request so that
the GitHub PR can be closed when the code lands in `master` branch (if you don't use explicit merging, but rebasing / cherry-picking).
It can be useful to have those numbers in the commits so that you can easily come back to the linked
issue/pull request in the future to look at the discussion.

Also, to impose certain restrictions on minimum / maximum lengths of the commit messages etc.

You should probably run this check at the very end of the build, so that the functional tests can still be run
even if the commit message is to be improved.

## Getting Started
Install this grunt plugin next to your project's Gruntfile with: `npm install --save grunt-commit-message-verify`

Then add this line to your project's `Gruntfile.js`:

    grunt.loadNpmTasks('grunt-commit-message-verify');

## Config options

The names of the entries should be self-explanatory.

    grunt.config.set('grunt-commit-message-verify', {
        minLength : 0,
        maxLength : 3000,

        // first line should be both concise and informative
        minFirstLineLength : 20,
        maxFirstLineLength : 60,

        // this is a good default to prevent overflows in shell console and Github UI
        maxLineLength : 80,

        regexes : {
            "check start of the commit" : {
                // the commit is either a fix, a feature, a documentation fix, a refactoring, new release commit, or
                // Work-In-Progress temporary commit
                regex : /^((refactor|doc) |((fix|feat) #\d+ )|(v?\d+\.\d+\.\d+)|WIP)/,
                explanation : "The commit should start with sth like fix #123, feat #123, doc, refactor, or WIP for test commits"
            },
            "is github compliant" : {
                // https://help.github.com/articles/closing-issues-via-commit-messages
                regex : /(((close|resolve)(s|d)?)|fix(e(s|d))?) #\d+/i,
                explanation : "The commit should contain sth like fix #123 or close #123 somewhere"
            }
        },

        // If true, then lines starting with a tab or two spaces won't be checked for length
        // This is to allow embedding of unchanged source code etc.
        // This setting does not apply to the first line. Default is false
        skipCheckAfterIndent : false,

        // this is the default used if nothing is passed
        shellCommand : "git log --format=%B --no-merges -n 1"
    });

The commit message will be checked for its length according to min/max settings. `0` means to skip the check (this is the default for all the min/max length settings).

**The automagical exception is that commit messages of a format `1.2.3` or `v1.2.3` will never be checked for length.**

Also, the commit will be checked against the regexes defined in `regexes` node. The key in this object is a short user-friendly
name of the check, and the value can either be a `RegExp` or an object literal with `regex` (RegExp) and `explanation` (String).
The key, the regex, and the explanation (if present) will be printed in case of failure to guide the user how to fix the problem.

`shellCommand` is the command that will be run by your shell to obtain the commit message
(it should print it to `stdout`).

## Output

A typical log in case of failure will look like this (will be colored):

    Running "grunt-commit-message-verify" task
    Verifying that the commit message is okay...
    >> Almost there, but the last commit message is not quite okay:

    >> 1. The regex 'check start of the commit' failed on the commit message.
    >> The commit should start with sth like fix #123, feat #123, doc, refactor, or WIP for test commits
    >> Failed regex: /^((refactor|doc) |((fix|feat) #\d+ )|(v?\d+\.\d+\.\d+)|WIP)/

    >> 2. The regex 'is github compliant' failed on the commit message.
    >> The commit should contain sth like fix #123 or close #123 somewhere
    >> Failed regex: /(((close|resolve)(s|d)?)|fix(e(s|d))?) #\d+/i

    >> 3. The commit message has some very long lines. The longest line has 90 chars while max. 80 are allowed.
    >> Split your message with newlines.

    >> The commit message was:
    this commit message has some very very very extremely long lines

    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore

    >> Use git commit --amend to improve the commit message.
    >> Hint: use http://www.regexper.com to visualize the regex.
    Warning: Task "grunt-commit-message-verify" failed. Use --force to continue.

## Using this checker as a Git hook

Have a look at `./git-hooks/commit-msg` file. Customize the `cfgOrigin` variable, and then put the file in your
`./.git/hooks` folder.

The mentioned file contains a hack to read the config straight from your Gruntfile, provided it's written in a
certain way. You may of course tweak it to read the config directly from some other file.

## Contributing
Feel invited to contribute to the project.
In lieu of a formal styleguide, take care to maintain the existing coding style.

## License
Copyright (c) 2014 Aria Templates
Licensed under the Apache 2.0 license.
