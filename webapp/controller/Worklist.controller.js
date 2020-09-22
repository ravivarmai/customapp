sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	// 'sap/suite/ui/commons/sample/ChartContainerActionGroups/ChartContainerSelectionDetails',
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/m/ColumnListItem',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	'sap/m/Column',
	"sap/m/Label",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, FlattenedDataset,
	ColumnListItem, FeedItem, Column, Label, Export, ExportTypeCSV) {
	"use strict";

	return BaseController.extend("com.autodesk.zutlity_analyzer.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// var oViewModel,
			// 	iOriginalBusyDelay,
			// 	oTable = this.byId("table"); test

			// // Put down worklist table's original value for busy indicator delay,
			// // so it can be restored later on. Busy handling on the table is
			// // taken care of by the table itself.
			// iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// // keeps the search state
			// this._aTableSearchState = [];

			// // Model used to manipulate control states
			// oViewModel = new JSONModel({
			// 	worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
			// 	shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
			// 	shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
			// 	shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
			// 	tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
			// 	tableBusyDelay: 0
			// });
			// this.setModel(oViewModel, "worklistView");

			// // Make sure, busy indication is showing immediately so there is no
			// // break after the busy indication for loading the view's meta data is
			// // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			// oTable.attachEventOnce("updateFinished", function () {
			// 	// Restore original busy indicator delay for worklist's table
			// 	oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			// });
			var oModel1 = new JSONModel("model/data.json");
			this.getView().setModel(oModel1, "m1");
			var oModel = new JSONModel();
			var arrayData = [];
			var that = this;
			this.getOwnerComponent().getModel().read("/zutility_analyzer", {
				success: function (oData, response) {
					var datavalue = that.getModel("m1").getData().ROW;
					for (var i = 0; i < datavalue.length; i++) {
						if (datavalue[i].VALUE1) {
							var apps = JSON.parse(datavalue[i].VALUE1);
							if (apps.recentUsageArray) {
								for (var j = 0; j < apps.recentUsageArray.length; j++) {
									var apptypeValue = apps.recentUsageArray[j].oItem.appType;
									if (apps.recentUsageArray[j].oItem.url.includes("sap-ui-tech-hint=GUI")) {
										apptypeValue = "TR";
									}
									var today = new Date(apps.recentUsageArray[j].oItem.timestamp);
									var dd = String(today.getDate()).padStart(2, '0');
									var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
									var yyyy = today.getFullYear();
									today = mm + '/' + dd + "/" + yyyy;
									var data = {
										"user": datavalue[i].VALUE,
										//	"FullName": oData.results[i].name_textc,
										"title": apps.recentUsageArray[j].oItem.title,
										"appType": apptypeValue,
										"url": apps.recentUsageArray[j].oItem.url,
										"appId": apps.recentUsageArray[j].oItem.appId,
										"timestamp": today
									};
									arrayData.push(data);
								}
							}
						}
					}
					// var appsListArray = [];
					// for (var k = 0; k < arrayData.length; k++) {
					// 	for (var h = 0; k < arrayData.length; h++) {
					// 		if (arrayData[h].title === arrayData[k].title) {

					// 		} else {

					// 		}
					// 	} 
					// var uniqueCount = ["a", "b", "c", "d", "d", "e", "a", "b", "c", "f", "g", "h", "h", "h", "e", "a"];
					var appsArray = that.compressArray(arrayData, "title");
					appsArray.sort(function (a, b) {
						return b.count - a.count;
					});
					oModel.setData(arrayData);
					that.setModel(oModel);

					// var oVizFrame = that.getView().byId(that._constants.vizFrame.id);
					// var oTable1 = that.getView().byId(that._constants.table.id);
					// // var oChartContainer = that.getView().byId(that._constants.chartContainer.id);

					// that._updateVizFrame(oVizFrame);
					// that._updateTable(oTable1);
					// ChartContainerSelectionDetails.initializeSelectionDetails(oChartContainer.getContent()[0]);
				}
			});
		},
		compressArray: function (original, column) {
			var compressed = [];
			var copy = original.slice(0);
			for (var i = 0; i < original.length; i++) {
				var myCount = 0;
				for (var w = 0; w < copy.length; w++) {
					if (original[i] && copy[w]) {
						if (original[i][column] === copy[w][column]) {
							myCount++;
							delete copy[w];
						}
					}
				}
				if (myCount > 0) {
					var a = {};
					a.value = original[i][column];
					a.count = myCount;
					compressed.push(a);
				}
			}
			return compressed;
		},
		// usage example:
		//var a = ['a', 1, 'a', 2, '1'];

		// _updateTable: function (table) {
		// 	var oTable = this._constants.table;
		// 	var oDataPath = jQuery.sap.getModulePath(this._constants.sampleName, oTable.dataPath);
		// 	var oModel = new JSONModel(oDataPath);

		// 	var aColumns = this._createTableColumns(oTable.columnLabelTexts);
		// 	for (var i = 0; i < aColumns.length; i++) {
		// 		table.addColumn(aColumns[i]);
		// 	}

		// 	var oTableTemplate = new ColumnListItem({
		// 		type: sap.m.ListType.Active,
		// 		cells: this._createLabels(oTable.templateCellLabelTexts)
		// 	});

		// 	table.bindItems(oTable.itemBindingPath, oTableTemplate, null, null);
		// 	table.setModel(oModel);
		// },

		/**
		 * Adds the passed feed items to the passed Viz Frame.
		 *
		 * @private
		 * @param {sap.viz.ui5.controls.VizFrame} vizFrame Viz Frame to add feed items to
		 * @param {Object[]} feedItems Feed items to add
		 */

		/**
		 * Creates table columns with labels as headers.
		 *
		 * @param {String[]} labels Column labels
		 * @returns {sap.m.Column[]} Array of columns
		 */
		_createTableColumns: function (labels) {
			var aLabels = this._createLabels(labels);

			return this._createControls(Column, "header", aLabels);
		},
		onDataExport: sap.m.Table.prototype.exportData || function (oEvent) {

			var oExport = new Export({
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ",",
					charset: "utf-8"
				}),
				// Pass in the model created above
				models: this.getModel(),
				// binding information for the rows aggregation
				rows: {
					path: "/"
				},
				// column definitions with column name and binding info for the content
				columns: [{
					name: "User",
					template: {
						content: "{user}"
					}
				}, {
					name: "Title",
					template: {
						content: "{title}"
					}
				}, {
					name: "URL",
					template: {
						content: "{url}"
					}
				}, , {
					name: "App Type",
					template: {
						content: "{appType}"
					}
				}, {
					name: "Date",
					template: {
						content: "{timestamp}"
					}
				}]
			});
			// download exported file
			var excelFileName = "Apps List";

			oExport.saveFile(excelFileName).catch(function (oError) {
				sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		/**
		 * Creates label control array with the specified texts.
		 *
		 * @private
		 * @param {String[]} labelTexts Text array
		 * @returns {sap.m.Column[]} Array of columns
		 */
		_createLabels: function (labelTexts) {
			return this._createControls(Label, "text", labelTexts);
		},

		/**
		 * Creates an array of controls with the specified control type, property name and value.
		 *
		 * @private
		 * @param {function} constructor Contructor function of the control to be created.
		 * @param {String} prop Property name.
		 * @param {Array} propValues Values of the control's property.
		 * @returns {sap.ui.core.control[]} Array of the new controls
		 */
		_createControls: function (constructor, prop, propValues) {
			var aControls = [];
			var oProps = {};

			for (var i = 0; i < propValues.length; i++) {
				oProps[prop] = propValues[i];
				aControls.push(new constructor(oProps));
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		// onUpdateFinished: function (oEvent) {
		// 	// update the worklist's object counter after the table update
		// 	var sTitle,
		// 		oTable = oEvent.getSource(),
		// 		iTotalItems = oEvent.getParameter("total");
		// 	// only update the counter if the length is final and
		// 	// the table is not empty
		// 	if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
		// 		sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
		// 	} else {
		// 		sTitle = this.getResourceBundle().getText("worklistTableTitle");
		// 	}
		// 	this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		// },

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("user_id", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("id")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});