(function() {
    RedactorX.add('plugin', 'mention', {
        translations: {
            en: {
                "mention": {
                    "mention": "Mention"
                }
            }
        },
        defaults: {
            url: 'http://example.localhost/example.php',
            start: 1,
            trigger: '@'
        },
        subscribe: {
            // https://imperavi.com/redactor/docs/events/
            'editor.keyup': function(event) {
                if (!this.opts.mention.url) return;
                this._mention(event);
            }
        },
        start() {
            this.mentionLen = this.opts.mention.start;
        },
        stop() {
            this._hide();
        },
    
        // private
        _mention(event) {
            let e = event.get('e');
            let key = e.which;
            let ctrl = e.ctrlKey || e.metaKey;
            let arrows = [37, 38, 39, 40];
            let ks = this.app.keycodes;
    
            if (key === ks.ESC) {
                this.app.editor.restore();
                return;
            }
            if (key === ks.DELETE || key === ks.SHIFT || ctrl || (arrows.indexOf(key) !== -1)) {
                return;
            }
    
            if (key === ks.SPACE) {
                this.mentionLen = this.opts.mention.start;
                this._hide();
                return;
            }
    
            if (key === ks.BACKSPACE) {
                this.mentionLen = this.mentionLen - 2;
                if (this.mentionLen <= this.opts.mention.start) {
                    this._hide();
                }
            }
    
            this._emit();
        },
        _emit() {
            let block = this.app.block.get();
            if (!block || !block.isEditable()) return;
    
            let selection = this.app.create('selection');
            let trigger = this.opts.mention.trigger;
            let str = selection.getText('before', block.getBlock());

            if (!str) return;
    
            let lastIndex = str.lastIndexOf(trigger);
            let partAfter = str.substring(lastIndex + 1);
    
            let cutStart = str;
            let replacement = '';
            let what = trigger + partAfter;
            let n = str.lastIndexOf(what);
            if (n >= 0) {
                cutStart = str.substring(0, n) + replacement + str.substring(n + what.length);
            }
    
            // it is the start of str, trigger has space before, past after length more than option start
            if ((cutStart === '' || cutStart.search(/\s$/) !== -1) && lastIndex !== -1 && partAfter.length >= this.opts.mention.start) {
                this.mentionLen = partAfter.length;
                this.mentionStr = partAfter;
                this._load();
            }
        },
        _load() {
            this.ajax.post({
                url: this.opts.mention.url,
                data: 'mention=' + this.mentionStr,
                success: this._parse.bind(this)
            });
        },
        _parse(json) {
            if (json === '' || (Array.isArray(json) && json.length === 0)) {
                this.app.panel.close();
                return;
            }
            let data = (typeof json === 'object') ? json : JSON.parse(json);
    
            this._build(data);
        },
        _build(data) {
            this.data = data;
            this.$panel = this.app.$body.find(`.${this.prefix}-panel`);
        
            if (this.$panel.length === 0) {
                this.$panel = this.dom("<div>").addClass(`${this.prefix}-panel`);
                this.app.$body.append(this.$panel);
            } else {
                this.$panel.html("");
            }
        
            this._stopEvents();
            this._startEvents();
        
            Object.keys(data).forEach(e => {
                const $item = this.dom("<div>").addClass(`${this.prefix}-panel-item`);
                const $link = this.dom("<a>").attr("href", "#");
        
                $link.html(data[e].item);
                $link.attr("data-key", e);
                $link.on("click", this._replace.bind(this));
        
                $item.append($link);
                this.$panel.append($item);
            });
        
            const scrollTop = this.app.$doc.scrollTop();
            const position = this.app.selection.getPosition();
        
            this.$panel.addClass("open");
            // Position at caret
            this.$panel.css({
                top: `${position.bottom + scrollTop}px`,
                left: `${position.left}px`
            });
        
            this.app.selection.save();
        },
        _replace(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const key = this.dom(event.target).attr("data-key");
            const replacement = this.data[key].replacement;
        
            this.app.marker.insert("start");
        
            const marker = this.app.marker.find("start");
            if (marker !== false) {
                let previousSibling = marker.previousSibling;
        
                const regex = new RegExp(this.opts.mention.trigger + this.mentionStr + "$");
                previousSibling.textContent.replace(regex, "");
        
                marker.previousSibling.textContent = previousSibling.textContent.replace(regex, "");
                this.dom(marker).before(replacement);
                this.app.selection.restoreMarker();
                this._hide();
            }
        },
        _reset: function() {
            this.mentionStr = !1,
            this.mentionLen = this.opts.mention.start,
            this.$panel = !1
        },
        _hide: function(t) {
            let e = t && t.which
              , i = this.app.keycodes;
            t && "click" !== t.type && e !== i.ESC && e !== i.SPACE || this._hideForce()
        },
        _hideForce: function() {
            this.$panel && this.$panel.remove(),
            this._reset(),
            this._stopEvents()
        },
        _startEvents: function() {
            let t = "click." + this.prefix + "-plugin-mention keydown." + this.prefix + "-plugin-mention";
            this.app.$doc.on(t, this._hide.bind(this)),
            this.app.editor.getEditor().on(t, this._hide.bind(this))
        },
        _stopEvents: function() {
            let t = "." + this.prefix + "-plugin-mention";
            this.app.$doc.off(t),
            this.app.editor.getEditor().off(t)
        }
    });
})();