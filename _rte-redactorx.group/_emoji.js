(function() {
    RedactorX.add("plugin", "emojis", {
        translations: {
            en: {
                emojis: {
                    "emojis": "Emojis"
                }
            }
        },
        defaults: {
            icon: '<svg height="16" viewBox="0 0 16 16" width="16" style="fill: #ffcb4c" xmlns="http://www.w3.org/2000/svg"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zM4 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-3 5.2c-1.7 0-3.2-1.4-3.2-3.2h6.4c0 1.8-1.5 3.2-3.2 3.2z"/></svg>',
            items: ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🥳", "🥴", "🥺", "🤠", "🤡", "🤥", "🤫", "🤭", "🧐", "🤓", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "👾", "🤖", "💩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"]
        },
        start: function() {
            let button = {
                title: "## emojis.emojis ##",
                icon: this.opts.emojis.icon,
                command: "emojis.popup",
                blocks: {
                    all: "editable"
                }
            };
            this.app.toolbar.add("emojis", button);
        },
        popup: function(params, button) {
            let emojiItems = {};
            let availableEmojis = this.opts.emojis.items;
            let totalEmojis = availableEmojis.length;

            for (let index = 0; index < totalEmojis; index++) {
                emojiItems[index] = {
                    html: this.dom('<div>').addClass('rx-popup-item').html(availableEmojis[index]),
                    command: "emojis.insert",
                    params: {
                        emoji: availableEmojis[index]
                    }
                };
            }

            this.app.popup.create("emojis", {
                width: "369px",
                type: "grid",
                items: emojiItems
            });

            this.app.popup.open({
                button: button
            });
        },
        insert: function(popupStack) {
            this.app.popup.close();  // For some unknown reason, this won't work if you put it at the end when inserting like this
            this.app.insertion.insertHtml(popupStack.emoji, "after");
        }
    });
})();