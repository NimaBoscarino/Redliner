L.Control.HatPanelRedliner = L.Control.extend({
    options: {
        redliner: null,
        position: 'bottomright',
        title: {
            'false': 'HatZedPanTo',
            'true': 'Exit Fullscreen'
        }
    },
    initialize: function (options) {
        L.setOptions(this, options);

        // setup constants
        this.TOOL_MOVE_MAP = 1;
        this.TOOL_TEXT = 2;
        this.TOOL_ERASER = 3;
        this.TOOL_PEN_RED = 4;
        this.TOOL_PEN_YELLOW = 5;
        this.TOOL_PEN_BLACK = 6;

        this.redliner = options.redliner;
        if (options.redliner == null)
            alert('HatPanelRedliner Error: You must specify the redliner object on create!');
    }, // initialize()

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-hatzedpanto  leaflet-control');

		container.style= "background-color: rgba(255,255,255,0.5); padding: 2px; border-radius: 5px;";
		var label = L.DomUtil.create('span', '', container);
		label.innerHTML = 'Go to:<br>';
		
		addToHatPanel(null, container, map);
		
		this._map = map;
		alert('do not use HatPanelRedliner.addToMap!')
        return container;
    },

    _panelToggleOpenCloseClick : function(){
        console.log('comment panel is closing. Check to make sure map is in move mode.');
    },

    _setActiveTool: function(toolConstant){
        switch (toolConstant) {
            case this.TOOL_MOVE_MAP: this._moveMapButtonClick(); break;
            case this.TOOL_TEXT: this._addTextButtonClick(); break;
            case this.TOOL_ERASER: this._eraserButtonClick(); break;
            case this.TOOL_PEN_RED: this._drawRedButtonClick(); break;
            case this.TOOL_PEN_YELLOW: this._drawYellowButtonClick(); break;
            case this.TOOL_PEN_BLACK: this._drawBlackButtonClick(); break;
            default:
                alert('HatPanelRedliner: Bad tool sent to _setActiveTool function ');
                break;
        }
    },

    _getActiveToolConstant: function(){
        if (this.MoveMapRadio.checked)
            return this.TOOL_MOVE_MAP;
        else if (this.AddTextRadio.checked)
            return this.TOOL_TEXT;
        else if (this.EraserRadio.checked)
            return this.TOOL_ERASER;
        else if (this.DrawRedRadio.checked)
            return this.TOOL_PEN_RED;
        else if (this.DrawYellowRadio.checked)
            return this.TOOL_PEN_YELLOW;
        else if (this.DrawBlackRadio.checked)
            return this.TOOL_PEN_BLACK;
        else
        {
            alert('HatPanelRedliner: _getActiveToolConstant- Could not find active tool!');
        }
    },

    addToHatPanel: function (hatPanelObj, panelContentContainer, map) {

        this._map = map;
        this.redliner.addTo(map);

        L.DomEvent.on(hatPanelObj._closeButton, 'click', this._panelToggleOpenCloseClick, this);

        var toolRadioGroupName = "commentToolSelect";

        this.panelContents = L.DomUtil.create('div', '', panelContentContainer);

        // -- toolbar row 1
        this.toolbarRow1 = L.DomUtil.create('div', 'btn-toolbar', this.panelContents);

        this.MoveMapButton = L.DomUtil.create('button', 'btn btn-default', this.toolbarRow1);
        this.MoveMapButton.title = "move map (stop commenting)";
        this.MoveMapRadio = L.DomUtil.create('input', '', this.MoveMapButton);
        this.MoveMapRadio.type = "radio";
        this.MoveMapRadio.name = toolRadioGroupName;
        this.MoveMapRadio.value = 'MoveMap';
        this.MoveMapIcon = L.DomUtil.create('i', 'glyphicon glyphicon-move', this.MoveMapButton);
        L.DomEvent.on(this.MoveMapButton, 'click', this._moveMapButtonClick, this);


        this.AddTextButton = L.DomUtil.create('button', 'btn btn-default', this.toolbarRow1);
        this.AddTextButton.title = "Add a Text comment";
        this.AddTextRadio = L.DomUtil.create('input', '', this.AddTextButton);
        this.AddTextRadio.type = "radio";
        this.AddTextRadio.name = toolRadioGroupName;
        this.AddTextRadio.value = 'AddText';
        this.AddTextIcon = L.DomUtil.create('i', 'glyphicon glyphicon-text-size', this.AddTextButton);
        L.DomEvent.on(this.AddTextButton, 'click', this._addTextButtonClick, this);

        this.EraserButton = L.DomUtil.create('button', 'btn btn-default', this.toolbarRow1);
        this.EraserButton.title = "Erase pen or text comments";
        this.EraserRadio = L.DomUtil.create('input', '', this.EraserButton);
        this.EraserRadio.type = "radio";
        this.EraserRadio.name = toolRadioGroupName;
        this.EraserRadio.value = 'Eraser';
        this.EraserIcon = L.DomUtil.create('i', 'glyphicon glyphicon-erase', this.EraserButton);
        L.DomEvent.on(this.EraserButton, 'click', this._eraserButtonClick, this);

        // -- toolbar row 2
        this.toolbarRow2 = L.DomUtil.create('div', 'btn-toolbar', this.panelContents);
        this.DrawRedButton = L.DomUtil.create('button', 'btn btn-default', this.toolbarRow2);
        this.DrawRedButton.title = "Draw with a red pen";
        this.DrawRedRadio = L.DomUtil.create('input', '', this.DrawRedButton);
        this.DrawRedRadio.type = "radio";
        this.DrawRedRadio.name = toolRadioGroupName;
        this.DrawRedIcon = L.DomUtil.create('i', 'glyphicon glyphicon-pencil', this.DrawRedButton);
        this.DrawRedIcon.style = "color: red;";
        L.DomEvent.on(this.DrawRedButton, 'click', this._drawRedButtonClick, this);

        this.DrawYellowButton = L.DomUtil.create('button', 'btn btn-default', this.toolbarRow2);
        this.DrawYellowButton.title = "Draw with a yellow pen";
        this.DrawYellowRadio = L.DomUtil.create('input', '', this.DrawYellowButton);
        this.DrawYellowRadio.type = "radio";
        this.DrawYellowRadio.name = toolRadioGroupName;
        this.DrawYellowIcon = L.DomUtil.create('i', 'glyphicon glyphicon-pencil', this.DrawYellowButton);
        this.DrawYellowIcon.style = "color: rgb(255, 193, 7);";
        L.DomEvent.on(this.DrawYellowButton, 'click', this._drawYellowButtonClick, this);

        this.DrawBlackButton = L.DomUtil.create('button', 'btn btn-default', this.toolbarRow2);
        this.DrawBlackButton.title = "Draw with a black pen";
        this.DrawBlackRadio = L.DomUtil.create('input', '', this.DrawBlackButton);
        this.DrawBlackRadio.type = "radio";
        this.DrawBlackRadio.name = toolRadioGroupName;
        this.DrawBlackIcon = L.DomUtil.create('i', 'glyphicon glyphicon-pencil', this.DrawBlackButton);
        this.DrawBlackIcon.style = "color: black;";
        L.DomEvent.on(this.DrawBlackButton, 'click', this._drawBlackButtonClick, this);

        // -- table showing existing comments
        this.ExistingComments = L.DomUtil.create('div', '', this.panelContents);
        this._updateExistingCommentsDisplay();

        // -- panel footer
        this.panelFooter = L.DomUtil.create('div', '', this.panelContents);
        this.panelFooter.style = 'background-color: rgba(0,0,0,0.2); padding: 5px; margin: 0 auto;';

        
        this.NewCommentButton = L.DomUtil.create('button', 'btn btn-primary btn-xs', this.panelFooter);
        this.NewCommentIcon = L.DomUtil.create('i', 'glyphicon glyphicon-share-alt', this.NewCommentButton);
        this.NewCommentIcon.style = "color: black;";
        this.NewCommentText = L.DomUtil.create('span', '', this.NewCommentButton);
        this.NewCommentText.innerHTML = ' Submit your comments<br>to Hatfield';

        L.DomEvent.on(this.NewCommentButton, 'click', this._submitCommentButtonClick, this);
        
        // -- initialize the display
        this._setActiveTool(this.TOOL_MOVE_MAP);
        
        return this.btnGroup;
    },
    _submitCommentButtonClick: function(){
        this._setActiveTool(this.TOOL_MOVE_MAP);
        alert('Thank you - your comment has been submitted to Hatfield.');
        this.redliner.stopDrawingMode();
    },

    _deselectAllTools: function(){
        this.MoveMapButton.style = '';
        this.AddTextButton.style = '';
        this.EraserButton.style = '';
        this.DrawRedButton.style = '';
        this.DrawYellowButton.style = '';
        this.DrawBlackButton.style = '';

        this.MoveMapRadio.checked = false;
        this.AddTextRadio.checked = false;
        this.EraserRadio.checked = false;
        this.DrawRedRadio.checked = false;
        this.DrawYellowRadio.checked = false;
        this.DrawBlackRadio.checked = false;
    },

    _styleToolAsSelected: function (btn, radio) {
        this._deselectAllTools();
        btn.style = 'background-color: rgba(00,80,00,0.2)';
        radio.checked = true;
    },

    _disableMapInteractions: function(){
        
        this._map.zoomControl.disable();
        this._map.dragging.disable();
        this._map.touchZoom.disable();
        this._map.doubleClickZoom.disable();
        this._map.scrollWheelZoom.disable();
        this._map.boxZoom.disable();
        this._map.keyboard.disable();
        if (this._map.tap) {
            this._map.tap.disable();
        }

    },

    __RedlinerCommentIntitialized: false,
    __currentRedlinerComment: null,

    _setupCurrentRedlinerComment: function(){
        if (!this.__RedlinerCommentIntitialized)
            this.__currentRedlinerComment = this.redliner.startNewComment();

        this.redliner.saveDrawing(this.__currentRedlinerComment, { textSave: false });
        var enterEditMode = true;
        if (enterEditMode)
        {
            var image;
            this.__currentRedlinerComment.getLayers().forEach(function (layer) {
                if (layer.layerType == "drawing") {
                    image = layer;
                }
            });
            this.redliner.editComment(this.__currentRedlinerComment, image);
        }

        this.__RedlinerCommentIntitialized = true;
    },

    _moveMapButtonClick: function () {
        if (this.__RedlinerCommentIntitialized && this.__currentRedlinerComment != null)
        {
            this.redliner.saveDrawing(this.__currentRedlinerComment, { textSave: false }); //
            this.__currentRedlinerComment.addTo(this._map);
            this._map.setView(this.__currentRedlinerComment.coords, this.__currentRedlinerComment.initialZoom);
        }

        this._styleToolAsSelected(this.MoveMapButton, this.MoveMapRadio);

        // enable map interaction
        this._map.zoomControl.enable();
        this._map.dragging.enable();
        this._map.touchZoom.enable();
        this._map.doubleClickZoom.enable();
        this._map.scrollWheelZoom.enable();
        this._map.boxZoom.enable();
        this._map.keyboard.enable();
        if (this._map.tap) {
            this._map.tap.enable();
        }
        if (this.redliner.Tools.currentTool != '') {
            // this.redliner.Tools.off();
        }
    },
    _addTextButtonClick: function () {
        this._styleToolAsSelected(this.AddTextButton, this.AddTextRadio);
        this._disableMapInteractions();
        this._setupCurrentRedlinerComment();
        this.redliner.Tools.setCurrentTool('text');
    },
    _eraserButtonClick: function () {
        this._styleToolAsSelected(this.EraserButton, this.EraserRadio);
        this._disableMapInteractions();
        this._setupCurrentRedlinerComment();
        this.redliner.Tools.setCurrentTool('eraser');
    },
    _drawRedButtonClick: function () {
        this._styleToolAsSelected(this.DrawRedButton, this.DrawRedRadio);
        this._disableMapInteractions();
        this._setupCurrentRedlinerComment();
        this.redliner.Tools.setCurrentTool('pen', {
            colour: 'red'
        });
    },
    _drawYellowButtonClick: function () {
        this._styleToolAsSelected(this.DrawYellowButton, this.DrawYellowRadio);
        this._disableMapInteractions();
        this._setupCurrentRedlinerComment();
        this.redliner.Tools.setCurrentTool('pen', {
            colour: 'yellow'
        });
    },
    _drawBlackButtonClick: function () {
        this._styleToolAsSelected(this.DrawBlackButton, this.DrawBlackRadio);
        this._disableMapInteractions();
        this._setupCurrentRedlinerComment();
        this.redliner.Tools.setCurrentTool('pen', {
            colour: 'black'
        });
    },

    _updateExistingCommentsDisplay: function(){
        var html = '';
        html += "Your comments:";


        html += '<table>';
        html += '<tr>';
        html += '<td><button type="button" class="btn btn-success btn-xs"><i class="glyphicon glyphicon-eye-open"></i></button></td>';
        html += '<td><button type="button" class="btn btn-default btn-xs"><i class="glyphicon glyphicon-unchecked"></i></button></td>';
        html += '<td>Comments made on June 14, 2017</td>';
        html += '</tr>';

        html += '<tr style="border: 1px solid green; background-color: rgba(00,80,00,0.2)">';
        html += '<td><button type="button" class="btn btn-success btn-xs"><i class="glyphicon glyphicon-eye-open"></i></button></td>';
        html += '<td><button type="button" class="btn btn-success btn-xs"><i class="glyphicon glyphicon-edit"></i></button></td>';
        html += '<td>Comments made on June 14, 2017';
        html += '<br><center><button type="button" class="btn btn-danger btn-xs "><i class="glyphicon glyphicon-edit"></i> Done commenting</button></center>';
        html += '</td>';
        html += '</tr>';


        html += '<tr>';
        html += '<td><button type="button" class="btn btn-default btn-xs"><i class="glyphicon glyphicon-eye-close"></i></button></td>';
        html += '<td><button type="button" class="btn btn-default btn-xs"><i class="glyphicon glyphicon-unchecked"></i></button></td>';
        html += '<td>Comments made on June 12, 2017</td>';
        html += '</tr>';


        html += '</table>';

        // this.ExistingComments.innerHTML = html;
    }

    
});





L.control.hatpanelredliner = function (options) {
    return new L.Control.HatPanelRedliner(options);
};
