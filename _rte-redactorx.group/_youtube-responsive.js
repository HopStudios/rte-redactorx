(function() {
    RedactorX.add("plugin", "youtubeEmbed", {
        translations: {
            en: {
                youtubeEmbed: {
                    "youtubeEmbed": "Embed YouTube",
                    "youtubeUrl": "Enter YouTube URL",
                    "save": "Save",
                    "cancel": "Cancel"
                }
            }
        },
        defaults: {
            icon: '<svg height="16" width="16" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 461.001 461.001" xml:space="preserve"><g><path style="fill:#F61C0D;" d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728 c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137 C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607 c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"/></g></svg>'
        },
        start: function() {
            let button = {
                title: "## youtubeEmbed.youtubeEmbed ##",
                icon: this.opts.youtubeEmbed.icon,
                command: "youtubeEmbed.popup",
                observer: 'youtubeEmbed.observe'
            };
            this.app.toolbar.add("youtubeEmbed", button);
        },
        observe: function (obj, name) {
            let instance = this.app.block.get();
            let isEditable = instance.isEditable(); // Basically, any text.
            let currentIframe = this._getCurrentYoutubeIframe();
            // Show the button if the block is editable (text) or contains the youtube embed
            if (!isEditable && !currentIframe) {
                return false;
            }

            return obj; // Doesn't seem to be needed as specified in the documentation: https://imperavi.com/redactor/legacy/redactorx/docs/api/button/
        },
        _getCurrentYoutubeIframe: function() {
            let instance = this.app.block.get();
            let iframe = instance.getBlock().find('iframe');
            return iframe.length && iframe.attr('class').includes('youtube-embed') ? iframe : false;
        },
        popup: function(params, button) {
            let popup = this.app.popup.create("youtubeEmbed", {
                width: "369px",
                form: {
                    youtube_url: { type: 'input', label: '## youtubeEmbed.youtubeUrl ##' }
                },
                footer: {
                    save: {
                        title: '## youtubeEmbed.save ##',
                        command: 'youtubeEmbed.insert',
                        type: 'primary'
                    },
                    cancel: {
                        title: '## youtubeEmbed.cancel ##',
                        command: 'popup.close'
                    }
                }
            });

            let currentIframe = this._getCurrentYoutubeIframe();
            let currentUrl = '';
            if (currentIframe) {
                currentUrl = currentIframe.attr('src');
            }

            popup.setData({ youtube_url: currentUrl }); // To display current data for editing link

            this.app.popup.open({
                button: button
            });
        },
        insert: function(popupStack) {
            this.app.popup.close();
            let formData = popupStack.getData();
            let videoId = this._extractVideoID(formData['youtube_url']);
            let currentIframe = this._getCurrentYoutubeIframe();

            if (videoId) {
                let instance = this.app.block.get();
                let iframeHtml = '<iframe class="youtube-embed" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

                let $source = this.dom('<div class="youtube-embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000;">').html(iframeHtml);

                if (instance.getType() === 'embed' && currentIframe) {
                    instance.setHtml(iframeHtml);
                } else {
                    instance = this.app.create('block.embed', $source);
                    this.app.block.add({ instance: instance });
                }
            } else {
                alert("Invalid YouTube URL. Please enter a valid YouTube URL.");
            }
        },
        _extractVideoID: function(url) {
            let regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            let matches = url.match(regex);
            return matches ? matches[1] : null;
        }
    });
})();