

**Leaflet Redliner**
----------------

*A Leaflet plugin used to add markup to maps. Requires the [PanelManager](https://github.com/NimaBoscarino/leaflet.panelManager) plugin.*

**[Demo](https://hatfieldconsultants.github.io/leaflet.redliner/)**

**Installation**:

**Step 1 - Add PanelManager to the map**

 - Link `panelManager.css` in the head section
 - Link `panelManager.js` in the body section after instantiating a map
   in a "map" div
 - After `panelManager.js`, add PanelManager to the map:
 `var panelManager = L.PanelManager.addTo(map);`

**Step 2  - Add Redliner to the map**

 - Link `redliner.css` in the head section (after `panelManager.css`)
 - Link `redliner.js` in the body section (after `panelManager.js`)
 - Add Redliner to map with:
 `var redliner = L.Redliner.addTo(map);`

**Step 3 - Load Redliner into PanelManager**
 - `map.PanelManager.loadPlugin(map.Redliner);`

See `index.html` for an example.


**Note About Structure**

There are two modules to keep in mind: the GUI module and the Events module. The GUI module offers a loadPanels() function that can be used to load the required PanelManager panels. If you want to use Redliner without PanelManager, you can use the structure of the loadPanels function as a starting point by copying the callbacks that it provides for things like starting/saving comments and selecting tools. The Events module is used to set up event dispatchers and listeners. Events are fired by Redliner when comments are saved (or cancelled, etc.). There are also events that let Redliner communicate with the RedlinerNetworking plugin, which enables shared comment states through web socket connections.

To use Redliner networking, you must include the RedlinerNetworking script, and must use something such as SignalR or Socket.IO. The code in redliner-networking.js is written for SignalR, but it can be modified to work with Socket.IO (or something similar).
