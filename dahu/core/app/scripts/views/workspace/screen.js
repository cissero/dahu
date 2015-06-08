/**
 * Created by barraq on 26/05/14.
 */

define([
    'handlebars',
    'backbone.marionette',
    'fit',
    // modules
    'modules/events',
    'modules/requestResponse',
    // models
    'models/objects/image',
    'models/objects/mouse',
    'models/objects/tooltip',
    // views
    'views/common/objects/image',
    'views/workspace/objects/mouse',
    'views/workspace/objects/tooltip',
    // templates
    'text!templates/views/screen.html',
    // behaviors
    'behaviors/workspace/objects/draggable',
    'modules/kernel/SCI'
], function(
    Handlebars,
    Marionette,
    fit,
    // modules
    events,
    reqres,
    // models
    ImageModel,
    MouseModel,
    TooltipModel,
    // view
    ImageView,
    MouseView,
    TooltipView,
    // templates
    screenTemplate,
    // behaviors
    DraggableBehavior,
    Kernel
) {

    /**
     * Workspace screen view
     */
    return Marionette.CompositeView.extend({
        template: Handlebars.default.compile(screenTemplate),

        //@remove id : function () { return this.model.get("id"); },
        id : function () { return this.screenId; },
        className: 'screen',
        childViewContainer: '.container',

        initialize : function (options) {
            // mandatory arguments
            _.extend(this, _.pick(options, ['screencast', 'screenId']));

            // grab the child collection from the parent model
            // so that we can render the collection as children
            // of this parent node
            this.collection = this.screencast.model.getScreenById(this.screenId).get('objects');
        },

        onAddChild: function(tooltipView) {
            var self = this;

            Kernel.console.log(this);
            Kernel.console.log(tooltipView);

            Kernel.console.log("screen scale");
            Kernel.console.log(self.scale);

            if( tooltipView instanceof TooltipView ) {
                tooltipView.behaviors.DraggableBehavior = {
                    behaviorClass: DraggableBehavior,
                    scale: self.scale
                };

                tooltipView._behaviors[1].scale = self.scale;
            }

            Kernel.console.log(this);
            Kernel.console.log(tooltipView);

            Kernel.console.log("tooltip scale");
            tooltipView._behaviors[1].scale = self.scale;
        },

        // We select the ChildView depending on the object type.
        getChildView: function(item){
            if(item instanceof ImageModel) {
                return ImageView;
            }else if(item instanceof MouseModel){
                return MouseView;
            }else if(item instanceof TooltipModel){
                return TooltipView;
            }
        },

        onShow: function() {
            // setup UI
            //@remove var ctrl = reqres.request('app:screencast:controller');
            var self = this;

            this.$('.container').css({
                //@remove width: ctrl.getScreencastWidth(),
                //@remove height: ctrl.getScreencastHeight()
                width: this.screencast.model.getScreenWidth(),
                height: this.screencast.model.getScreenHeight()
            });

            this.watching = fit(this.$('.container')[0], this.$el[0], {
                hAlign: fit.CENTER,
                vAlign: fit.TOP,
                watch: true,     // refresh on resize
                cover: false     // fit within, do not cover
            }, function( transform, element ) {
                // scale the workspace
                fit.cssTransform(transform, element);
                // notify listener that workspace was scaled
                events.trigger('app:workspace:onScaleChanged', transform.scale);

                self.scale = transform.scale;
            });
        },

        onDestroy: function() {
            // turn off watching before destroying the view
            // otherwise the watcher keeps on being notified.
            if( this.watching ) {
                this.watching.off();
            }
        }
    });
});