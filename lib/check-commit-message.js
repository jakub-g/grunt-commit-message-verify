module.exports = {
    /**
     * Checks is $str has length between oLen.min and oLen.max.<br>
     * If $str is a version update commit (like 1.2.3, v4.5.6) the check is not performed.<br>
     * In case of failure, pushes the failure message to $errors1
     * @param {String} sMsg
     * @param {Object} oLen Pass null / empty object to skip the checks
     * @param {String} errorMsgStart
     * @param {Array} errors
     * @return {Boolean} true if test passed
     */
    checkLength : function (str, oLen, errorMsgStart, errors) {
        oLen = oLen || {};
        iMinLen = oLen.min || 0;
        iMaxLen = oLen.max || 0;

        if (iMaxLen > 0 && iMinLen > 0 && iMinLen > iMaxLen) {
            errors.push("Misconfiguration: minlen > maxlen! Check your settings!");
            return false;
        }

        if (/^v?\d+\.\d+\.\d+/.test(str)) {
            // version update commits are exempted from checks
            return true;
        }

        var strlen = str.length;
        var tooShort = (iMinLen > 0 && strlen < iMinLen);
        var tooLong = !tooShort && (iMaxLen > 0 && strlen > iMaxLen);

        if (tooShort || tooLong) {
            var p1 = tooShort ? "short" : "long";
            var p2 = tooShort ? ("least " + iMinLen) : ("most " + iMaxLen);
            var errMsg = errorMsgStart + " is too " + p1 + ", should be at " + p2 + " chars but it is " + strlen;
            errors.push(errMsg);
            return false;
        }
        return true;
    },

    /**
     * Checks if each line of the commit message is no longer than limit.<br>
     * In case of failure, pushes the failure message to $errors
     * @param {Array<String>} asMsg
     * @param {Integer} iMaxLen Pass zero/null to skip the check
     * @param {Array} errors
     * @return {Boolean} true if test passed
     */
    maxLineLength : function (asMsg, iMaxLen, errors) {
        iMaxLen = iMaxLen || 0;
        if (iMaxLen <= 0) {
            return true;
        }

        var sLongestLine = asMsg.reduce(function (prev, curr, idx, arr) {
            return prev.length > curr.length ? prev : curr;
        });

        if (sLongestLine.length > iMaxLen) {
            var errMsg = "The commit message has some very long lines. The longest line has " + sLongestLine.length
                    + " chars while max. " + iMaxLen + " are allowed.\nSplit your message with newlines.";
            errors.push(errMsg);
            return false;
        }
        return true;
    },

    /**
     * @param {String} sMsg
     * @param {Object|RegExp} regexObj either {regex:.., explanation:""} or pure regex
     * @param {String} regexName
     * @param {Array} errors
     */
    regex : function (sMsg, regexObj, regexName, errors) {
        var regex = (regexObj instanceof RegExp) ? regexObj : regexObj.regex;
        var explanation = regexObj.explanation || "";

        var ok = regex.test(sMsg);
        if (!ok) {
            var err = "The regex '" + regexName + "' failed on the commit message.\n" + explanation + "\n"
                    + "Failed regex: " + regex.toString().cyan;
            errors.push(err);
        }
        return ok;
    }
};
