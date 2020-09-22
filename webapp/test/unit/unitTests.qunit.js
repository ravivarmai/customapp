/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/autodesk/zutlity_analyzer/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});