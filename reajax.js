(function(XHR) {
    "use strict";

    var open = XHR.prototype.open,
        send = XHR.prototype.send;

    XHR.prototype.open = function(method, url, async, user, pass) {
        this._url = url;
        open.call(this, method, url, async, user, pass);
    };

    XHR.prototype.send = function(data) {
        var self = this,
            oldOnReadyStateChange,
            url = this._url;

        Remix.$(document).trigger('ajaxBefore', self);
        
        function onReadyStateChange() {
            if(self.readyState === 4) { // complete
                Remix.$(document).trigger('ajaxReceived', self);
            }

            if(oldOnReadyStateChange) {
                oldOnReadyStateChange();
            }
        }

        /* Set xhr.noIntercept to true to disable the interceptor for a particular call */
        if(!this.noIntercept) {            
            if(this.addEventListener) {
                this.addEventListener("readystatechange", onReadyStateChange, false);
            } else {
                oldOnReadyStateChange = this.onreadystatechange; 
                this.onreadystatechange = onReadyStateChange;
            }
        }

        send.call(this, data);
    }
})(XMLHttpRequest);

// @todo  most of this stuff shouldn't be public API
ReAjax = {
    /*
     * Handles the AJAX response.
     *
     * Parses the response, seeing if it matches with any of the panels and, if so,
     * applies the appropriate transformation and renders the appropriate template.
     *
     * @return  void
     */
    ajaxHandler: function(data){
        var matched = ReAjax.getMatchedPanel(),
            context = { content: {} },
            remixedData;
        
        if( matched ){
            // @todo matched.selector should also be maybe a function
            if( !Remix.$(matched.selector).length ){
                console.warn("Missing container element for panel " + matched.selector);
                return false;
            }
            
            remixedData = matched.transform(Remix.$);                
            context.content[matched.context] = remixedData;

            /*
             * We render the template and replace the panel element with the template data.
             * After that, we trigger the registered callback. Finally we trigger
             * a `reAjaxDone` event on `document`, passing the panel DOM object and the panel
             * object as arguments.
             */
            dust.render(matched.template, context, function(err, output){
                var $output = Remix.$(output);
                Remix.$(matched.selector).replaceWith($output);

                if( typeof matched.callback === "function" )
                    matched.callback.call($output, matched, remixedData, data.data);

                Remix.$(document).trigger('reAjaxDone', [ $output, matched ]);
            });
            
            console.group("AJAX response received");
            console.log("Original data:", data.data);
            console.log("Matched panel:", matched);
            console.log("Processed data:", remixedData);
            console.groupEnd();
        }
        else
            console.warn("Some AJAX was received, but no panel matched the response");
    },
    /*
     * Binds the Ajax transformation handler to the `ajaxReceived` event.
     *
     * @return  void
     */
    bindAjaxTransform: function(){
        Remix.$(document).on('ajaxReceived', function(data){
            ReAjax.ajaxHandler(data);
        });
    },
    config: {},
    getMatchedPanel: function(){
        var currentPanels = ReAjax.config.panels,
            matched;
        
        // Iterates through each defined panel and see if the response matches.
        // If it does, render the template in the appropriate element.
        matched = currentPanels.filter(function(panel){
            var context = { content: {} };
            
            // We check if the panel matcher is a function, in that case, we call it
            // and see if it returns true. Otherwise, if it's a string, we query the
            // DOM and see if the matcher is present.
            //
            // @todo we should query the response, though, no?
            if( typeof panel.matcher === 'function' && panel.matcher.call(panel) ||
                typeof panel.matcher === 'string' && Remix.$(panel.matcher).length )
                return true;
            else
                return false;
        });
        
        return matched[0];
    },
    getPanelsForTemplate: function(template){
        if( !ReAjax.templates[template] ){
            console.warn("No configuration for current template: " + template);
            return [];
        };
        
        var panelsConfiguration = ReAjax.templates[template].panels,
            panels              = [];

        // If it's a string, we assume it's just one panel with the
        // default configuration
        if( typeof panelsConfiguration === 'string' ){
            panels.push( ReAjax.panelDefaults( panelsConfiguration, template ) );
        }
        // If it's an array, we iterate through each of the elements
        else if( Array.isArray(panelsConfiguration) ){
            panelsConfiguration.forEach(function(panel){
                panels.push( ReAjax.panelDefaults( panel, template ) );
            })
        }
        // We throw an error in the console if it's neither
        else {
            console.error("Error in panels configuration for " + template + " template: expecting String or Array")
        }

        return panels;
    },
    /*
     * Initialization function.
     *
     * Parses the configuration and binds the transformation event.
     *
     * @return  void
     */
    init: function(){
        if( ReAjax.initialized ) return false; // Don't initialize twice
        
        var config = ReAjax.parseConfiguration();

        ReAjax.config = Remix.$.extend( ReAjax.config, config );
        ReAjax.bindAjaxTransform();
        
        ReAjax.initialized = true;
    },
    /*
     * Already initialized
     */
    initialized: false,
    /*
     * Returns a default panel object.
     *
     * The `panel` argument can either be a string or an object. In the case of it
     * being a string, ReAjax will look for an element with the Id of the string
     * as the container element to fill up with the Remixed data from AJAX (Remixed
     * through a function of the same name under `Remix.$`, and a template partial
     * of the same name, starting with an underscore).
     *
     * Otherwise, if the argument provided is an object, the object **must** contain
     * all three properties `selector`, `template` and `transform`.
     *
     * Panel data will be accessible through the `context` property once properly
     * transformed. Said property defaults to the string passed, or to the `template`.
     *
     * The `matcher` property of the object is the element to compare the AJAX response
     * against before applying the transformation function. If not specified, ReAjax will
     * look for a parameter called `globalMatcher` under the current template, which is
     * the default fallback matcher. If none is provided, the panel will basically be
     * never updated.
     *
     * The callback is called after the panel is updated. It can be defined as a global
     * callback valid for the whole template, or as a local callback valid only for the
     * specified panel (in which case it overrides the global callback, if you want to
     * keep it, you'll need to call it manually inside your callback). The callback value
     * for `this` is the DOM element, and two other arguments are passed: the remixed data
     * and the original data. @see ajaxHandler.
     *
     * @todo  Check if template is registered.
     * @param  {str/obj}  panel  A string for the panel name or a fully defined object.
     * @return {obj}  The panel object.
     */
    panelDefaults: function(panel, template){
        var Panel = function(args){
            if( typeof args === 'string' ){
                var str = args; // Should sanitize

                this.callback  = ReAjax.templates[template].callback || null;
                this.context   = str;
                this.matcher   = ReAjax.templates[template].globalMatcher || null;
                this.selector  = '#' + str;
                this.template  = '_' + str;
                this.transform = Remix.$[this.template];
            }
            else if( args.selector && args.template && args.transform ){
                this.callback  = args.callback || ReAjax.templates[template].callback || null;
                this.context   = args.context || args.template;
                this.matcher   = args.matcher || args.selector || ReAjax.templates[template].globalMatcher || null;
                this.selector  = args.selector;
                this.template  = args.template;
                this.transform = args.transform;
            }
            else{
                console.error("Missing or invalid properties of panel", args);
            }
            
            if( !this.matcher )
                console.warn("No matcher found for panel " + this.selector + ", it will never be updated on AJAX.");
        }
        
        return new Panel(panel);
    },
    /*
     * Parses the configuration file
     *
     * Stores the following information inside the `config` property:
     *    - {str}    `currentTemplate`    The name of the current template.
     *    - {arr}    `panels`             An array of panels objects.
     *
     * @return {obj}  The config object.
     */
    parseConfiguration: function(){
        // This should be done more reliably through the use of Remix parameters
        var currentTemplate = Remix.$('html').first().data('remix-template'),
            config = {
                currentTemplate: currentTemplate,
                panels: ReAjax.getPanelsForTemplate(currentTemplate)
            }
        
        return config;
    }
};

Remix.$(document).ready(function($){
    ReAjax.init();
});
