define([
    'adaptivejs/context',
    '$',
    'dust-core'
],
function(Context, $, dust) {

    return {
        
        render: function(data, target, template, context, callback){
            var $body          = $('body'),
                $tempContainer = $('<div>', { id: 'reajax-temp-container' }),
                newContext     = $.extend(true, {}, context),
                remixedData;
            
            $tempContainer
                .appendTo($body)
                .html(data);
            
            remixedData = Context.process(newContext);
            
            $tempContainer.remove();
            
            dust.render(template, remixedData, function(err, output){
                var $output = $(output);
                $(target).html($output);

                // @todo this should be calling the callback with this argument set
                //       as the panel
                if( typeof callback === "function" )
                    callback.call($output, remixedData, data.data);

                $(document).trigger('reAjax:done', [ $output, remixedData ]);
            });
        }
    
    };

});