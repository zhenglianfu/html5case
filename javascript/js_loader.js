(function(win){
    var doc = document,
    // main js, if existed load it, root is doc_dir
        _main_,
        host = location.host,
        js_dir = function(){
            var scripts = doc.getElementsByTagName('script'),
                script = scripts[scripts.length - 1],
                src = script.src;
            _main_ = script.getAttribute('data-main');
            return src.substr(0, src.lastIndexOf('/'));
        }(),
        needRefreshDepend = false,
        browser = function(ua, browsers){
            var match, t, obj = {};
            for (var i = 0, len = browsers.length; i < len; i++) {
                t = browsers[i];
                if ((match = ua.match(t.reg))) {
                    obj.name = t.name;
                    obj['is' + t.name] = true;
                    obj.version = parseInt(match[1]);
                    return obj;
                }
            }
        }(navigator.userAgent, [{
            name : 'IE',
            reg : /MSIE\s*([\d\.]+;)/i
        },{
            name : 'FireFox',
            reg : /Firefox\/(\d+)/i
        },{
            name : 'Chrome',
            reg : /Chrome\/(\d+)/i
        },{
            name : 'Mobile',
            reg : /mobile/i
        }]),
        paths = {},
        moduleCache = {},
        manifestCache = {},
        moduleManifest = [],
        core_slice = [].slice;

    /* util functions */
    var rtrim = /^\s+|\s+$/g;
    var Util = {
        foo : function(){},
        getFirstStyle : function(){
            var head = doc.head, nodes, len, i, node;
            if (head.querySelectorAll) {
                return head.querySelectorAll('link,style')[0];
            } else {
                nodes = head.childNodes;
                len = nodes.length;
                for (i = 0; i < len; i++) {
                    node = nodes[i];
                    if (node.nodeType == 1 && (node.nodeName.toUpperCase() === 'LINK' || node.nodeName.toUpperCase() === 'STYLE')) {
                        return node;
                    }
                }
            }
        },
        // css样式将在<head>的第一个 <link>/<style> DOM对象之前插入（如果有）
        orderLoadStyle : function(modules){
            /** should not cache style load state **/
            var i = 0, len = modules.length, styleList, j, style_length, link, style, module,
                userStyle = Util.getFirstStyle(), head = doc.head;
            for (; i < len; i++) {
                module = modules[i];
                styleList = Util.getManifeset(module).styleList;
                for (j = 0, style_length = styleList.length; j < style_length; j++) {
                    style = styleList[j];
                    if (style.href) {
                        link = doc.createElement('link');
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        link.href = style.href;
                        head.insertBefore(link, userStyle);
                    }
                }
            }
        },
        orderLoadModule : function(modules, fn, errors){
            /** load files one by one, step as the items defined in modules **/
            /** here I made it load synchronized
             * 	asynchronous load js please see 'http://headjs.com/site/download.html' or 'http://stevesouders.com/controljs/'
             **/
            /**
             * #  bug : wait for parse js file completed, then load the next js file  #
             * js文件解析完成之后再加载下一个(js引擎不够快，文件过大导致)
             * */
            var i = 0, len = modules.length, data = {}, token;
            // reverse it, as a stack LIFO
            modules = modules.reverse();
            errors = errors || [];
            fn = fn || Util.foo;
            for (; i < len; i ++) {
                token = modules[i];
                if (paths[token].url) {
                    fn = function (token, g) {
                        return function(){
                            if (moduleCache[token]) {
                                data[token] = moduleCache[token];
                                g(data, errors);
                            } else {
                                Util.loadJSFile(paths[token].url, token, function(){
                                    var name = this.name;
                                    this.ready = true;
                                    moduleCache[name] = Util.getObjFromNS(name);
                                    data[name] = moduleCache[name];
                                    g(data, errors);
                                }, function(){
                                    errors.push({
                                        msg : 'url of ' + this.name + ' is incorrect : ' + this.src
                                    });
                                    g(data, errors);
                                });
                            }
                        };
                    }(token, fn);
                }
            }
            fn(data, errors);
        },
        // asynchronous load
        asynLoadModule : function(modules, fn, errors){
            var i = 0, len = modules.length, token, url;
            for (; i < len; i++) {
                token = modules[i];
                if ((url = paths[token].url)) {
                    Util.asynInsertJS(url, token);
                }
            }
            Util.parseCJS(fn, errors);
        },
        asynInsertJS : function(url, m_name){
            var script = doc.createElement('script');
            script.type = 'text/cjs';
            script.name = m_name;
            script.src = url;
            doc.head.appendChild(script);
            return script;
        },
        parseCJS : function(fn, errors){
            var scripts = doc.getElementsByTagName('script'),
                len = scripts.length,
                i, script, data = {}, count = 0, times = 0, timestamp = new Date().getTime();
            for (i = 0; i < len; i++) {
                script = scripts[i];
                if (script.type === 'text/cjs') {
                    count += 1;
                    Util.loadJSFile(script.src, script.name, function(){
                        times += 1;
                        var name = this.name;
                        data[name] = Util.getObjFromNS(name);
                    }, function(){
                        times += 1;
                        errors.push({
                            msg : 'url of ' + this.name + ' is incorrect : ' + this.src
                        });
                    }, script);
                }
            }
            Util.defer(function(){
                return times == count;
            }, function(){
                fn && fn(data, errors);
            });

        },
        defer : function(cond, fn, duration){
            var r = typeof cond === 'function' ? cond() : cond;
            duration = duration || 50;
            setTimeout(function(){
                if (r === true) {
                    fn && fn();
                } else {
                    Util.defer(cond, fn, duration);
                }
            }, duration);
        },
        trim : function(str){
            if (str == null) {
                return '';
            }
            return str.trim ? str.trim() : str.replace(rtrim, '');
        },
        getManifeset : function(token){
            var obj = manifestCache[token], i = 0, len = moduleManifest.length;
            if (obj) {
                return obj;
            }
            for (; i < len; i ++) {
                if (moduleManifest[i].name === token) {
                    obj = moduleManifest[i];
                    manifestCache[token] = obj;
                    break;
                }
            }
            return obj;
        },
        getDependModules : function(module, imports){
            var depends = Util.getManifeset(module).depend, i = 0, len = depends.length, item;
            imports = imports || [];
            for (; i < len; i ++) {
                item = moduleManifest[depends[i]];
                if (imports.indexOf(item.name) < 0) {
                    if (item.depend.length) {
                        imports = Util.getDependModules(item.name, imports);
                    }
                    imports.push(item.name);
                }
            }
            return imports;
        },
        loadJSFile : function(url, m_name, onload, onerror, oldScript) {
            var script = doc.createElement('script');
            script.name = m_name;
            if (script.readyState) {
                script.onreadystatechange = function(){
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        script.onreadystatechange = null;
                        onload && onload.call(script);
                    }
                };
            } else {
                script.onload = onload;
                script.onerror = onerror;
            }
            script.type = 'text/javascript';
            script.src = url;
            oldScript ? oldScript.parentNode.replaceChild(script, oldScript) : doc.head.appendChild(script);
            return script;
        },
        getObjFromNS : function(moduleName, root) {
            var ns = paths[moduleName].name_space,
                moduleToken = paths[moduleName].module,
                objTree = ns.split('.'), i = 0, name, len = objTree.length, parent = root || win;
            for (; i < len; i ++) {
                name = objTree[i];
                if (name !== ''){
                    if (parent[name] == null) {
                        break;
                    } else {
                        parent = parent[name];
                    }
                }
            }
            return parent[moduleToken];
        },
        calculateDependence : function(require){
            require = require || [];
            var indexs = [], i = 0, len = require.length, manifest, name;
            for (; i < len; i++) {
                name = require[i];
                manifest = Util.getManifeset(name);
                if (manifest) {
                    indexs.push(manifest.index);
                } else {
                    needRefreshDepend = true;
                }
            }
            return indexs;
        },
        /**
         * load module function
         * @example loadModule('grid, dialog', function(data, error){})
         *
         * */
        loadModule : function(m_name, callback, asyn){
            var ns = m_name.split(','), i = 0, ns_len = ns.length, m, requires = [], errors = [];
            if (typeof callback === 'boolean') {
                asyn = callback;
                callback = Util.foo;
            }
            for (; i < ns_len; i++) {
                m = Util.trim(ns[i]);
                if (paths[m]) {
                    requires = requires.concat(Util.getDependModules(m));
                    requires.push(m);
                } else {
                    errors.push({
                        msg : 'module ' + m + ' is not exist in configuration'
                    });
                }
            }
            // load style resource first
            Util.orderLoadStyle(requires);
            if (asyn) {
                Util.asynLoadModule(requires, callback, errors);
            } else {
                Util.orderLoadModule(requires, callback, errors);
            }
        },
        // add modules, if modules is array the add each item into configuration object
        // if modules is a string, then call addModule method to add one module, parameter obj must be not null
        addModules : function(modules, obj){
            var i, len, token;
            if (typeof modules === 'string') {
                Util.addModule(modules, obj);
            } else {
                modules = modules || [];
                for (i = 0, len = modules.length; i < len; i++) {
                    obj = modules[i];
                    for (token in obj) {
                        Util.addModule(token, obj[token]);
                        break;
                    }
                }
            }
            // recalculate dependences is necessary when all modules added
            if (needRefreshDepend) {
                Util.refreshDependConfig();
            }
        },
        refreshDependConfig : function(){
            var moduleList = moduleManifest, i, len, item, require;
            for (i = 0, len = moduleList.length; i < len; i ++) {
                item = moduleList[i];
                require = item.require;
                if (require.length) {
                    item.depend = Util.calculateDependence(require);
                }
            }
            // rest state
            needRefreshDepend = false;
        },
        referJSPath : function(url, baseDir){
            baseDir = baseDir || js_dir;
            if (url.indexOf('../') == 0) {
                url = url.substring(3);
                baseDir = baseDir.substring(0, baseDir.lastIndexOf('/'));
                return Util.referJSPath(url, baseDir);
            } else if (url.indexOf('./') == 0) {
                url = url.substring(2);
            } else if (url.indexOf('/') == 0) {
                baseDir = host;
            }
            return baseDir + '/' + url;
        },
        addModule : function(token, obj){
            // internal method, only used in Util
            /**
             * token is the identity of the module you add in
             * obj.module is the moduleName in the environment, such as window.$
             * obj.name_space is the module's name space, jquery's name space is window
             * obj.require : the other modules it depends on
             * obj.styleList : the css files of this module
             * */
            paths[token] = {
                url : obj.jsPath ? Util.referJSPath(obj.url) : obj.url,
                name_space : obj.name_space || 'window',
                module : obj.module || 'window'
            };
            var manifest = Util.getManifeset(token),
                t = {
                    name : token,
                    index : moduleManifest.length,
                    depend : Util.calculateDependence(obj.require),
                    styleList : obj.styleList || [],
                    require : obj.require || []
                };
            if (manifest) {
                // override old manifest object
                t.index = manifest.index;
                moduleManifest[manifest.index] = t;
                // clear cache
                Util.clearCache(token);
            } else {
                moduleManifest.push(t);
            }
        },
        clearCache : function(token) {
            if (token) {
                manifestCache[token] = null;
                moduleCache[token] = null;
            } else {
                manifestCache = {};
                moduleCache = {};
            }
        },
        mainMethod : function(){
            // main method loaded if existed
            // url based on path of html
            if (_main_) {
                Util.loadJSFile(_main_);
            }
        }
    };
    // suck IE fix
    if (browser.isIE && browser.version < 9) {
        doc.head = doc.getElementsByTagName('head')[0];
        Array.prototype.indexOf = function(x){
            var i = 0, len = this.length;
            for (; i < len; i++) {
                if (this[i] === x) {
                    return i;
                }
            }
            return -1;
        };
    }
    // interface PManager finished
    win.PManager = {
        load : Util.loadModule,
        add : Util.addModules
    };
    // main
    Util.mainMethod();
}(window));
