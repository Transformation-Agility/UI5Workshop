sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/DisplayListItem",
	"sap/m/MessageToast"
], function(Controller, DisplayListItem, MessageToast) {
	"use strict";

	return Controller.extend("ZWS_COMMENT_DEMO.controller.Comment", {
		onInit: function() {
			var sWorkPackId = this.getView().byId("inputWorkPack").getValue();
			this._loadComments(sWorkPackId);
		},

		onDeleteItem: function(oEvent) {
			this._deleteListItem(oEvent.getParameter("listItem"));
		},

		onPressGo: function(oEvent) {
			var oInputWorkPackId = this.getView().byId("inputWorkPack");
			var sWorkPackId = oInputWorkPackId.getValue();
			var oListComment = this.getView().byId("listComment");

			oListComment.removeAllItems();
			this._loadComments(sWorkPackId);
		},

		onPressAddComment: function(oEvent) {
			var oInputAddComment = this.getView().byId("inputAddComment");
			var oButtonAddComment = this.getView().byId("buttonAddComment");

			var sCommentTxt = oInputAddComment.getValue();

			if (sCommentTxt) {
				var id = Date.now();

				this._addComment(sCommentTxt, id);
				oInputAddComment.setValue("");
				oButtonAddComment.setEnabled(false);
			}
		},

		onPressSave: function(oEvent) {
			var sWorkPackId = this.getView().byId("inputWorkPack").getValue();
			var oModel = this.getOwnerComponent().getModel();
			var aList = this.getView().byId("listComment").getItems();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			
			sap.ui.core.BusyIndicator.show();
		
			if (!sWorkPackId) {
				MessageToast.show(oBundle.getText("commentEmptyWorkpack"));
			} else {
				sap.ui.core.BusyIndicator.show();
				oModel.remove("/CommentSet(WorkPackId='" + sWorkPackId + "',CommentNo=1)", {
					method: "DELETE",
					success: function(data) {
						var oEntry;
						var mParameters = {batchGroupId:"batchGroup"};
						
						oModel.setDeferredGroups(["batchGroup"]);
						for (var i in aList) {
							oEntry = {};
						    mParameters = {batchGroupId:"batchGroup", changeSetId:"change " + i};
							oEntry.WorkPackId = sWorkPackId;
							oEntry.CommentNo = parseInt(i) + 1;
							oEntry.CommentTxt = aList[i].getProperty("label");

							oModel.create('/CommentSet', oEntry, mParameters);
						}
						mParameters = {batchGroupId:"batchGroup"};
						oModel.submitChanges(mParameters);
						
						MessageToast.show(oBundle.getText("commentAdded"));
						sap.ui.core.BusyIndicator.hide();
					}.bind(this),
					error: function(e) {
						MessageToast.show(oBundle.getText("commentDeleteError"));
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
		},

		onLiveChangeAddComment: function(oEvent) {
			var oButtonAddComment = this.getView().byId("buttonAddComment");
			oButtonAddComment.setEnabled(!!oEvent.getParameter("value"));
		},

		_loadComments: function(workPackId) {
			var sFilter = "WorkPackId eq '" + workPackId + "'";
			var oResults = [];

			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/CommentSet", {
				urlParameters: {
					"$filter": sFilter
				},
				success: function(oData, oResponse) {
					oResults = oData.results;

					for (var i in oResults) {
						this._addComment(oResults[i].CommentTxt, oResults[i].CommentNo);
					}

				}.bind(this),
				error: function(response) {

				}
			});
		},

		_addComment: function(CommentTxt, CommentNo) {
			var oListComment = this.getView().byId("listComment");
			var listItem = new DisplayListItem({
				label: CommentTxt
			}).data("id", CommentNo);
			oListComment.addAggregation("items", listItem);
		},

		_deleteListItem: function(oListItem) {
			var oListComment = this.getView().byId("listComment");
			oListComment.removeAggregation("items", oListItem);
		}

	});
});