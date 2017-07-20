// findIndex polyfill
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            'use strict';
            if (this === null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        },
        enumerable: false,
        configurable: false,
        writable: false
    });
}

(function (factory, window) {
    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

        // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.RedlinerNetworking = factory(L);
    }
}(function (L) {
    var RedlinerNetworking = {
        options: {
        },

        getMessage: function () {
            return 'Map Comment Tool Networking for SignalR';
        },

        addTo: function (map) {
            var self = this;
            var title = document.getElementsByTagName("title")[0].innerHTML;
            self.ownMap = map;
            map.RedlinerNetworking = RedlinerNetworking;

            var redlinerNetworkProxy = $.connection.redlinerNetwork;

            redlinerNetworkProxy.client.newClientConnection = function () {
                //console.log('a new client has connected to this site!');
            };

            redlinerNetworkProxy.client.acknowledgeConnection = function () {
                //console.log('requesting comment info');
                redlinerNetworkProxy.server.loadCommentsFromRedlinerJson(title);
            }

            redlinerNetworkProxy.client.loadCommentsFromRedlinerJson = function (siteRedlinerDef) {
                // HEHEHEHEH sneaky reuse of code
                siteRedlinerDef.comments.forEach(function (comment) {
                    var event = document.createEvent("CustomEvent");
                    event.initCustomEvent("remote-new-comment-saved", true, false,
                        {
                            comment: comment
                        });
                    // Dispatch the event.
                    window.dispatchEvent(event);
                });
                //console.log('loaded comment data from server!');
            };

            redlinerNetworkProxy.client.newCommentCreated = function () {
                // fire event to be caught by redliner
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("remote-new-comment-created", true, false, {});
                // Dispatch the event.
                window.dispatchEvent(event);

            };
            redlinerNetworkProxy.client.newCommentSaved = function (comment) {
                // fire event to be caught by redliner
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("remote-new-comment-saved", true, false,
                    {
                        comment: comment
                    });
                // Dispatch the event.
                window.dispatchEvent(event);
            };
            redlinerNetworkProxy.client.commentEditStart = function (comment) {
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("remote-comment-edit-start", true, false, comment);
                window.dispatchEvent(event);

            };
            redlinerNetworkProxy.client.commentEditEnd = function (comment) {
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("remote-comment-edit-end", true, false, comment);
                //console.log('NORMIES GET OUUUTTTTT');
                window.dispatchEvent(event);
            };

            /*
                Listeners for Redliner.js:
                new-comment-created
                new-comment-saved
                comment-edit-start
                comment-edit-end
            */

            self.ownMap._container.addEventListener('new-comment-created', function (e) {
                //console.log('notifying server of new comment created');
                redlinerNetworkProxy.server.newCommentCreated(title);
            }, false);
            self.ownMap._container.addEventListener('new-comment-saved', function (e) {
                //console.log('notifying server of new comment saved');
                var comment = e.detail;
                var payload = {
                    comment: comment,
                    mapTitle: title
                }
                redlinerNetworkProxy.server.newCommentSaved(payload);
            }, false);
            self.ownMap._container.addEventListener('comment-edit-start', function (e) {
                //console.log('notifying server of a comment now being edited');
                var comment = e.detail;
                var payload = {
                    title: title,
                    comment: comment
                };
                redlinerNetworkProxy.server.commentEditStart(payload);
            }, false);
            self.ownMap._container.addEventListener('comment-edit-end', function (e) {
                var comment = e.detail;
                var payload = {
                    title: title,
                    comment: comment
                };
                //console.log('notifying server of a comment no longer being edited');
                redlinerNetworkProxy.server.commentEditEnd(payload);
            }, false);

            $.connection.hub.start().done(function () {
                //console.log('registering connection');
                redlinerNetworkProxy.server.registerConnection(title);
            });
        },
    };

    // return your plugin when you are done
    return RedlinerNetworking;
}, window));
