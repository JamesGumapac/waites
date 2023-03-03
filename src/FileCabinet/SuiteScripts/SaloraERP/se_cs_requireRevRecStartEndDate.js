/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/runtime', 'N/search'],

	function(runtime, search) {
		
		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		function pageInit(scriptContext) {

		}

		/**
		 * Function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @since 2015.2
		 */
		function fieldChanged(scriptContext) {

		}

		/**
		 * Function to be executed when field is slaved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 *
		 * @since 2015.2
		 */
		function postSourcing(scriptContext) {

		}

		/**
		 * Function to be executed after sublist is inserted, removed, or edited.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function sublistChanged(scriptContext) {

		}

		/**
		 * Function to be executed after line is selected.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function lineInit(scriptContext) {

		}

		/**
		 * Validation function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @returns {boolean} Return true if field is valid
		 *
		 * @since 2015.2
		 */
		function validateField(scriptContext) {

		}

		/**
		 * Validation function to be executed when sublist line is committed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateLine(scriptContext) {
			var script = runtime.getCurrentScript();
			var revRecRule = script.getParameter('custscript_reqrevrecdate_revrecrule');
			var currentRecord = scriptContext.currentRecord;
			var sublistId = scriptContext.sublistId;

			if(sublistId == 'item'){
				var itemId = currentRecord.getCurrentSublistValue({ sublistId: sublistId, fieldId: 'item' });

				var itemRevRecRule = search.lookupFields({
					type: 'item',
					id: itemId,
					columns: ['revenuerecognitionrule']
				}).revenuerecognitionrule;

				if(itemRevRecRule && itemRevRecRule[0].value == revRecRule){
					var startDate = currentRecord.getCurrentSublistValue({ sublistId: sublistId, fieldId: 'custcol_wst_revstart' });
					var endDate = currentRecord.getCurrentSublistValue({ sublistId: sublistId, fieldId: 'custcol_wst_revend' });


					var emptyCols = [];
					if(!startDate)
						emptyCols.push('WST Rev Start');
					if(!endDate)
						emptyCols.push('WST Rev End');

					if(emptyCols.length){
						alert('Please enter values for: ' + emptyCols.join(', '));
						return false;
					}else if( startDate > endDate ){
						alert('WST Rev Start should not be after WST Rev End');
						return false;
					}
				}
			}
			return true;
		}

		/**
		 * Validation function to be executed when sublist line is inserted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateInsert(scriptContext) {

		}

		/**
		 * Validation function to be executed when record is deleted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateDelete(scriptContext) {

		}

		/**
		 * Validation function to be executed when record is saved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @returns {boolean} Return true if record is valid
		 *
		 * @since 2015.2
		 */
		function saveRecord(scriptContext) {
			var currentRecord = scriptContext.currentRecord;

			var script = runtime.getCurrentScript();
			var revRecRequireDate = script.getParameter('custscript_reqrevrecdate_revrecrule');

			var lineCount = currentRecord.getLineCount({ sublistId: 'item' });

			var itemIds = [];
			for(var line=0;line<lineCount;line++)
				itemIds.push( currentRecord.getSublistValue({ sublistId: 'item', line: line, fieldId: 'item' }) );
	
			var requiredRevRecDates = {};
			var itemNames = {};
			search.create({
				type: 'item',
				filters: [['internalid', 'anyof', itemIds]],
				columns: [{ name: 'revenuerecognitionrule' }, { name: 'itemid' }, { name: 'custitem_revequaltoinvoice' }]
			}).run().getRange(0,1000).forEach(function(res){
				requiredRevRecDates[res.id] = res.getValue(res.columns[0]) == revRecRequireDate? 1: 0;
				itemNames[res.id] = res.getValue(res.columns[1]);
			});

			var itemNamesWithNoDate = [];
			for(var line=0; line<lineCount; line++){
				var itemId = currentRecord.getSublistValue({ sublistId: 'item', line: line, fieldId: 'item' });
				var itemName = itemNames[itemId];

				var revRecStart = currentRecord.getSublistValue({ sublistId: 'item',
					line: line, fieldId: 'custcol_wst_revstart' });
				var revRecEnd = currentRecord.getSublistValue({ sublistId: 'item',
					line: line, fieldId: 'custcol_wst_revend' });

				if(requiredRevRecDates[itemId] && (!revRecStart || !revRecEnd))
					itemNamesWithNoDate.push(itemName);

			}

			if(itemNamesWithNoDate.length){
				alert('Please enter WST Rev Start and WST Rev End values for item(s): ' + itemNamesWithNoDate.join(', '));
				return false;
			}

			return true;
		}

		return {
//			pageInit: pageInit,
//			fieldChanged: fieldChanged,
//			postSourcing: postSourcing,
//			sublistChanged: sublistChanged,
//			lineInit: lineInit,
//			validateField: validateField,
			validateLine: validateLine,
//			validateInsert: validateInsert,
//			validateDelete: validateDelete,
			saveRecord: saveRecord
		};
		
	});
