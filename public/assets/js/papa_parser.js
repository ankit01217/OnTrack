/**
 * Created by vivekfitkariwala on 08/06/15.
 */
/*!
 Papa Parse
 v4.1.1
 https://github.com/mholt/PapaParse
 */
!function (e) {
    "use strict";
    function t(t, r) {
        if (r = r || {}, r.worker && w.WORKERS_SUPPORTED) {
            var n = h();
            return n.userStep = r.step, n.userChunk = r.chunk, n.userComplete = r.complete, n.userError = r.error, r.step = m(r.step), r.chunk = m(r.chunk), r.complete = m(r.complete), r.error = m(r.error), delete r.worker, void n.postMessage({
                input: t,
                config: r,
                workerId: n.id
            })
        }
        var o = null;
        return "string" == typeof t ? o = r.download ? new i(r) : new a(r) : (e.File && t instanceof File || t instanceof Object) && (o = new s(r)), o.stream(t)
    }

    function r(e, t) {
        function r() {
            "object" == typeof t && ("string" == typeof t.delimiter && 1 == t.delimiter.length && -1 == w.BAD_DELIMITERS.indexOf(t.delimiter) && (u = t.delimiter), ("boolean" == typeof t.quotes || t.quotes instanceof Array) && (o = t.quotes), "string" == typeof t.newline && (f = t.newline))
        }

        function n(e) {
            if ("object" != typeof e)return [];
            var t = [];
            for (var r in e)t.push(r);
            return t
        }

        function i(e, t) {
            var r = "";
            "string" == typeof e && (e = JSON.parse(e)), "string" == typeof t && (t = JSON.parse(t));
            var n = e instanceof Array && e.length > 0, i = !(t[0]instanceof Array);
            if (n) {
                for (var a = 0; a < e.length; a++)a > 0 && (r += u), r += s(e[a], a);
                t.length > 0 && (r += f)
            }
            for (var o = 0; o < t.length; o++) {
                for (var h = n ? e.length : t[o].length, d = 0; h > d; d++) {
                    d > 0 && (r += u);
                    var c = n && i ? e[d] : d;
                    r += s(t[o][c], d)
                }
                o < t.length - 1 && (r += f)
            }
            return r
        }

        function s(e, t) {
            if ("undefined" == typeof e || null === e)return "";
            e = e.toString().replace(/"/g, '""');
            var r = "boolean" == typeof o && o || o instanceof Array && o[t] || a(e, w.BAD_DELIMITERS) || e.indexOf(u) > -1 || " " == e.charAt(0) || " " == e.charAt(e.length - 1);
            return r ? '"' + e + '"' : e
        }

        function a(e, t) {
            for (var r = 0; r < t.length; r++)if (e.indexOf(t[r]) > -1)return !0;
            return !1
        }

        var o = !1, u = ",", f = "\r\n";
        if (r(), "string" == typeof e && (e = JSON.parse(e)), e instanceof Array) {
            if (!e.length || e[0]instanceof Array)return i(null, e);
            if ("object" == typeof e[0])return i(n(e[0]), e)
        } else if ("object" == typeof e)return "string" == typeof e.data && (e.data = JSON.parse(e.data)), e.data instanceof Array && (e.fields || (e.fields = e.data[0]instanceof Array ? e.fields : n(e.data[0])), e.data[0]instanceof Array || "object" == typeof e.data[0] || (e.data = [e.data])), i(e.fields || [], e.data || []);
        throw"exception: Unable to serialize unrecognized input"
    }

    function n(t) {
        function r(e) {
            var t = _(e);
            t.chunkSize = parseInt(t.chunkSize), this._handle = new o(t), this._handle.streamer = this, this._config = t
        }

        this._handle = null, this._paused = !1, this._finished = !1, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this._completeResults = {
            data: [],
            errors: [],
            meta: {}
        }, r.call(this, t), this.parseChunk = function (t) {
            var r = this._partialLine + t;
            this._partialLine = "";
            var n = this._handle.parse(r, this._baseIndex, !this._finished);
            if (!this._handle.paused() && !this._handle.aborted()) {
                var i = n.meta.cursor;
                this._finished || (this._partialLine = r.substring(i - this._baseIndex), this._baseIndex = i), n && n.data && (this._rowCount += n.data.length);
                var s = this._finished || this._config.preview && this._rowCount >= this._config.preview;
                if (k)e.postMessage({results: n, workerId: w.WORKER_ID, finished: s}); else if (m(this._config.chunk)) {
                    if (this._config.chunk(n, this._handle), this._paused)return;
                    n = void 0, this._completeResults = void 0
                }
                return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(n.data), this._completeResults.errors = this._completeResults.errors.concat(n.errors), this._completeResults.meta = n.meta), !s || !m(this._config.complete) || n && n.meta.aborted || this._config.complete(this._completeResults), s || n && n.meta.paused || this._nextChunk(), n
            }
        }, this._sendError = function (t) {
            m(this._config.error) ? this._config.error(t) : k && this._config.error && e.postMessage({
                workerId: w.WORKER_ID,
                error: t,
                finished: !1
            })
        }
    }

    function i(e) {
        function t(e) {
            var t = e.getResponseHeader("Content-Range");
            return parseInt(t.substr(t.lastIndexOf("/") + 1))
        }

        e = e || {}, e.chunkSize || (e.chunkSize = w.RemoteChunkSize), n.call(this, e);
        var r;
        this._nextChunk = k ? function () {
            this._readChunk(), this._chunkLoaded()
        } : function () {
            this._readChunk()
        }, this.stream = function (e) {
            this._input = e, this._nextChunk()
        }, this._readChunk = function () {
            if (this._finished)return void this._chunkLoaded();
            if (r = new XMLHttpRequest, k || (r.onload = g(this._chunkLoaded, this), r.onerror = g(this._chunkError, this)), r.open("GET", this._input, !k), this._config.chunkSize) {
                var e = this._start + this._config.chunkSize - 1;
                r.setRequestHeader("Range", "bytes=" + this._start + "-" + e), r.setRequestHeader("If-None-Match", "webkit-no-cache")
            }
            try {
                r.send()
            } catch (t) {
                this._chunkError(t.message)
            }
            k && 0 == r.status ? this._chunkError() : this._start += this._config.chunkSize
        }, this._chunkLoaded = function () {
            if (4 == r.readyState) {
                if (r.status < 200 || r.status >= 400)return void this._chunkError();
                this._finished = !this._config.chunkSize || this._start > t(r), this.parseChunk(r.responseText)
            }
        }, this._chunkError = function (e) {
            var t = r.statusText || e;
            this._sendError(t)
        }
    }

    function s(e) {
        e = e || {}, e.chunkSize || (e.chunkSize = w.LocalChunkSize), n.call(this, e);
        var t, r, i = "undefined" != typeof FileReader;
        this.stream = function (e) {
            this._input = e, r = e.slice || e.webkitSlice || e.mozSlice, i ? (t = new FileReader, t.onload = g(this._chunkLoaded, this), t.onerror = g(this._chunkError, this)) : t = new FileReaderSync, this._nextChunk()
        }, this._nextChunk = function () {
            this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk()
        }, this._readChunk = function () {
            var e = this._input;
            if (this._config.chunkSize) {
                var n = Math.min(this._start + this._config.chunkSize, this._input.size);
                e = r.call(e, this._start, n)
            }
            var s = t.readAsText(e, this._config.encoding);
            i || this._chunkLoaded({target: {result: s}})
        }, this._chunkLoaded = function (e) {
            this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e.target.result)
        }, this._chunkError = function () {
            this._sendError(t.error)
        }
    }

    function a(e) {
        e = e || {}, n.call(this, e);
        var t, r;
        this.stream = function (e) {
            return t = e, r = e, this._nextChunk()
        }, this._nextChunk = function () {
            if (!this._finished) {
                var e = this._config.chunkSize, t = e ? r.substr(0, e) : r;
                return r = e ? r.substr(e) : "", this._finished = !r, this.parseChunk(t)
            }
        }
    }

    function o(e) {
        function t() {
            if (b && c && (f("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + w.DefaultDelimiter + "'"), c = !1), e.skipEmptyLines)for (var t = 0; t < b.data.length; t++)1 == b.data[t].length && "" == b.data[t][0] && b.data.splice(t--, 1);
            return r() && n(), i()
        }

        function r() {
            return e.header && 0 == y.length
        }

        function n() {
            if (b) {
                for (var e = 0; r() && e < b.data.length; e++)for (var t = 0; t < b.data[e].length; t++)y.push(b.data[e][t]);
                b.data.splice(0, 1)
            }
        }

        function i() {
            if (!b || !e.header && !e.dynamicTyping)return b;
            for (var t = 0; t < b.data.length; t++) {
                for (var r = {}, n = 0; n < b.data[t].length; n++) {
                    if (e.dynamicTyping) {
                        var i = b.data[t][n];
                        b.data[t][n] = "true" == i || "TRUE" == i ? !0 : "false" == i || "FALSE" == i ? !1 : o(i)
                    }
                    e.header && (n >= y.length ? (r.__parsed_extra || (r.__parsed_extra = []), r.__parsed_extra.push(b.data[t][n])) : r[y[n]] = b.data[t][n])
                }
                e.header && (b.data[t] = r, n > y.length ? f("FieldMismatch", "TooManyFields", "Too many fields: expected " + y.length + " fields but parsed " + n, t) : n < y.length && f("FieldMismatch", "TooFewFields", "Too few fields: expected " + y.length + " fields but parsed " + n, t))
            }
            return e.header && b.meta && (b.meta.fields = y), b
        }

        function s(t) {
            for (var r, n, i, s = [",", "	", "|", ";", w.RECORD_SEP, w.UNIT_SEP], a = 0; a < s.length; a++) {
                var o = s[a], f = 0, h = 0;
                i = void 0;
                for (var d = new u({delimiter: o, preview: 10}).parse(t), c = 0; c < d.data.length; c++) {
                    var l = d.data[c].length;
                    h += l, "undefined" != typeof i ? l > 1 && (f += Math.abs(l - i), i = l) : i = l
                }
                h /= d.data.length, ("undefined" == typeof n || n > f) && h > 1.99 && (n = f, r = o)
            }
            return e.delimiter = r, {successful: !!r, bestDelimiter: r}
        }

        function a(e) {
            e = e.substr(0, 1048576);
            var t = e.split("\r");
            if (1 == t.length)return "\n";
            for (var r = 0, n = 0; n < t.length; n++)"\n" == t[n][0] && r++;
            return r >= t.length / 2 ? "\r\n" : "\r"
        }

        function o(e) {
            var t = l.test(e);
            return t ? parseFloat(e) : e
        }

        function f(e, t, r, n) {
            b.errors.push({type: e, code: t, message: r, row: n})
        }

        var h, d, c, l = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i, p = this, g = 0, v = !1, k = !1, y = [], b = {
            data: [],
            errors: [],
            meta: {}
        };
        if (m(e.step)) {
            var R = e.step;
            e.step = function (n) {
                if (b = n, r())t(); else {
                    if (t(), 0 == b.data.length)return;
                    g += n.data.length, e.preview && g > e.preview ? d.abort() : R(b, p)
                }
            }
        }
        this.parse = function (r, n, i) {
            if (e.newline || (e.newline = a(r)), c = !1, !e.delimiter) {
                var o = s(r);
                o.successful ? e.delimiter = o.bestDelimiter : (c = !0, e.delimiter = w.DefaultDelimiter), b.meta.delimiter = e.delimiter
            }
            var f = _(e);
            return e.preview && e.header && f.preview++, h = r, d = new u(f), b = d.parse(h, n, i), t(), v ? {meta: {paused: !0}} : b || {meta: {paused: !1}}
        }, this.paused = function () {
            return v
        }, this.pause = function () {
            v = !0, d.abort(), h = h.substr(d.getCharIndex())
        }, this.resume = function () {
            v = !1, p.streamer.parseChunk(h)
        }, this.aborted = function () {
            return k
        }, this.abort = function () {
            k = !0, d.abort(), b.meta.aborted = !0, m(e.complete) && e.complete(b), h = ""
        }
    }

    function u(e) {
        e = e || {};
        var t = e.delimiter, r = e.newline, n = e.comments, i = e.step, s = e.preview, a = e.fastMode;
        if (("string" != typeof t || w.BAD_DELIMITERS.indexOf(t) > -1) && (t = ","), n === t)throw"Comment character same as delimiter";
        n === !0 ? n = "#" : ("string" != typeof n || w.BAD_DELIMITERS.indexOf(n) > -1) && (n = !1), "\n" != r && "\r" != r && "\r\n" != r && (r = "\n");
        var o = 0, u = !1;
        this.parse = function (e, f, h) {
            function d(e) {
                b.push(e), S = o
            }

            function c(t) {
                return h ? p() : (t || (t = e.substr(o)), w.push(t), o = g, d(w), y && _(), p())
            }

            function l(t) {
                o = t, d(w), w = [], O = e.indexOf(r, o)
            }

            function p(e) {
                return {
                    data: b,
                    errors: R,
                    meta: {delimiter: t, linebreak: r, aborted: u, truncated: !!e, cursor: S + (f || 0)}
                }
            }

            function _() {
                i(p()), b = [], R = []
            }

            if ("string" != typeof e)throw"Input must be a string";
            var g = e.length, m = t.length, v = r.length, k = n.length, y = "function" == typeof i;
            o = 0;
            var b = [], R = [], w = [], S = 0;
            if (!e)return p();
            if (a || a !== !1 && -1 === e.indexOf('"')) {
                for (var E = e.split(r), C = 0; C < E.length; C++) {
                    var w = E[C];
                    if (o += w.length, C !== E.length - 1)o += r.length; else if (h)return p();
                    if (!n || w.substr(0, k) != n) {
                        if (y) {
                            if (b = [], d(w.split(t)), _(), u)return p()
                        } else d(w.split(t));
                        if (s && C >= s)return b = b.slice(0, s), p(!0)
                    }
                }
                return p()
            }
            for (var x = e.indexOf(t, o), O = e.indexOf(r, o); ;)if ('"' != e[o])if (n && 0 === w.length && e.substr(o, k) === n) {
                if (-1 == O)return p();
                o = O + v, O = e.indexOf(r, o), x = e.indexOf(t, o)
            } else if (-1 !== x && (O > x || -1 === O))w.push(e.substring(o, x)), o = x + m, x = e.indexOf(t, o); else {
                if (-1 === O)break;
                if (w.push(e.substring(o, O)), l(O + v), y && (_(), u))return p();
                if (s && b.length >= s)return p(!0)
            } else {
                var I = o;
                for (o++; ;) {
                    var I = e.indexOf('"', I + 1);
                    if (-1 === I)return h || R.push({
                        type: "Quotes",
                        code: "MissingQuotes",
                        message: "Quoted field unterminated",
                        row: b.length,
                        index: o
                    }), c();
                    if (I === g - 1) {
                        var D = e.substring(o, I).replace(/""/g, '"');
                        return c(D)
                    }
                    if ('"' != e[I + 1]) {
                        if (e[I + 1] == t) {
                            w.push(e.substring(o, I).replace(/""/g, '"')), o = I + 1 + m, x = e.indexOf(t, o), O = e.indexOf(r, o);
                            break
                        }
                        if (e.substr(I + 1, v) === r) {
                            if (w.push(e.substring(o, I).replace(/""/g, '"')), l(I + 1 + v), x = e.indexOf(t, o), y && (_(), u))return p();
                            if (s && b.length >= s)return p(!0);
                            break
                        }
                    } else I++
                }
            }
            return c()
        }, this.abort = function () {
            u = !0
        }, this.getCharIndex = function () {
            return o
        }
    }

    function f() {
        var e = document.getElementsByTagName("script");
        return e.length ? e[e.length - 1].src : ""
    }

    function h() {
        if (!w.WORKERS_SUPPORTED)return !1;
        if (!y && null === w.SCRIPT_PATH)throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. You need to set Papa.SCRIPT_PATH manually.");
        var t = new e.Worker(w.SCRIPT_PATH || v);
        return t.onmessage = d, t.id = R++, b[t.id] = t, t
    }

    function d(e) {
        var t = e.data, r = b[t.workerId], n = !1;
        if (t.error)r.userError(t.error, t.file); else if (t.results && t.results.data) {
            var i = function () {
                n = !0, c(t.workerId, {data: [], errors: [], meta: {aborted: !0}})
            }, s = {abort: i, pause: l, resume: l};
            if (m(r.userStep)) {
                for (var a = 0; a < t.results.data.length && (r.userStep({
                    data: [t.results.data[a]],
                    errors: t.results.errors,
                    meta: t.results.meta
                }, s), !n); a++);
                delete t.results
            } else m(r.userChunk) && (r.userChunk(t.results, s, t.file), delete t.results)
        }
        t.finished && !n && c(t.workerId, t.results)
    }

    function c(e, t) {
        var r = b[e];
        m(r.userComplete) && r.userComplete(t), r.terminate(), delete b[e]
    }

    function l() {
        throw"Not implemented."
    }

    function p(t) {
        var r = t.data;
        if ("undefined" == typeof w.WORKER_ID && r && (w.WORKER_ID = r.workerId), "string" == typeof r.input)e.postMessage({
            workerId: w.WORKER_ID,
            results: w.parse(r.input, r.config),
            finished: !0
        }); else if (e.File && r.input instanceof File || r.input instanceof Object) {
            var n = w.parse(r.input, r.config);
            n && e.postMessage({workerId: w.WORKER_ID, results: n, finished: !0})
        }
    }

    function _(e) {
        if ("object" != typeof e)return e;
        var t = e instanceof Array ? [] : {};
        for (var r in e)t[r] = _(e[r]);
        return t
    }

    function g(e, t) {
        return function () {
            e.apply(t, arguments)
        }
    }

    function m(e) {
        return "function" == typeof e
    }

    var v, k = !e.document && !!e.postMessage, y = !1, b = {}, R = 0, w = {};
    if (w.parse = t, w.unparse = r, w.RECORD_SEP = String.fromCharCode(30), w.UNIT_SEP = String.fromCharCode(31), w.BYTE_ORDER_MARK = "﻿", w.BAD_DELIMITERS = ["\r", "\n", '"', w.BYTE_ORDER_MARK], w.WORKERS_SUPPORTED = !!e.Worker, w.SCRIPT_PATH = null, w.LocalChunkSize = 10485760, w.RemoteChunkSize = 5242880, w.DefaultDelimiter = ",", w.Parser = u, w.ParserHandle = o, w.NetworkStreamer = i, w.FileStreamer = s, w.StringStreamer = a, "undefined" != typeof module && module.exports ? module.exports = w : m(e.define) && e.define.amd ? e.define(function () {
            return w
        }) : e.Papa = w, e.jQuery) {
        var S = e.jQuery;
        S.fn.parse = function (t) {
            function r() {
                if (0 == a.length)return void(m(t.complete) && t.complete());
                var e = a[0];
                if (m(t.before)) {
                    var r = t.before(e.file, e.inputElem);
                    if ("object" == typeof r) {
                        if ("abort" == r.action)return void n("AbortError", e.file, e.inputElem, r.reason);
                        if ("skip" == r.action)return void i();
                        "object" == typeof r.config && (e.instanceConfig = S.extend(e.instanceConfig, r.config))
                    } else if ("skip" == r)return void i()
                }
                var s = e.instanceConfig.complete;
                e.instanceConfig.complete = function (t) {
                    m(s) && s(t, e.file, e.inputElem), i()
                }, w.parse(e.file, e.instanceConfig)
            }

            function n(e, r, n, i) {
                m(t.error) && t.error({name: e}, r, n, i)
            }

            function i() {
                a.splice(0, 1), r()
            }

            var s = t.config || {}, a = [];
            return this.each(function () {
                var t = "INPUT" == S(this).prop("tagName").toUpperCase() && "file" == S(this).attr("type").toLowerCase() && e.FileReader;
                if (!t || !this.files || 0 == this.files.length)return !0;
                for (var r = 0; r < this.files.length; r++)a.push({
                    file: this.files[r],
                    inputElem: this,
                    instanceConfig: S.extend({}, s)
                })
            }), r(), this
        }
    }
    k ? e.onmessage = p : w.WORKERS_SUPPORTED && (v = f(), document.body ? document.addEventListener("DOMContentLoaded", function () {
        y = !0
    }, !0) : y = !0), i.prototype = Object.create(n.prototype), i.prototype.constructor = i, s.prototype = Object.create(n.prototype), s.prototype.constructor = s, a.prototype = Object.create(a.prototype), a.prototype.constructor = a
}("undefined" != typeof window ? window : this);