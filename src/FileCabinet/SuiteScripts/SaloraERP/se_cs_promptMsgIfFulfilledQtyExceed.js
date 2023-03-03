/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/record', 'N/search'],

	function(record, search) {
		
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
			alert('Deployed');
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

			// Get current record id
			var currRecId = currentRecord.id.toString();
			var soRecId = currentRecord.getValue({ fieldId: 'createdfrom' });

			// Gather fulfilled qty
			var qtyData = collectQty(currentRecord, {});

			// Get all related fulfillment records
			var ifIds = search.create({
				type: 'itemfulfillment',
				filters: [[ 'mainline', 'is', 'T' ], 'AND',
					[ 'createdfrom', 'anyof', soRecId ]]
			}).run().getRange(0,1000).map(function(res){
				return res.id;
			});
			if(ifIds.indexOf(currRecId) >= 0)
				ifIds.splice(ifIds.indexOf(currRecId), 1);

			// Load all related fulfillment records and get all qty
			ifIds.forEach(function(id){
				var rec = record.load({ type: 'itemfulfillment', id: id });
				qtyData = collectQty(rec, qtyData, currRecId);
			});

			// Get created from record type
			var cfType = '';
			search.create({
				type: 'transaction',
				filters: [['internalid', 'anyof', soRecId], 'AND', ['mainline', 'is', 'T']],
				columns: [{ name: 'type' }]
			}).run().getRange(0,1).forEach(function(res){ cfType = res.getValue(res.columns[0]) });
			cfType = cfType == 'TrnfrOrd'? 'transferorder': 'salesorder';
			// Load Sales Order record
			var soRec = record.load({
				type: cfType,
				id: soRecId
			});

			var exceedQtyItem = [];
			var lineCount = soRec.getLineCount({ sublistId: 'item' });
			for(var line=0;line<lineCount;line++){
				var itemId = soRec.getSublistValue({
					sublistId: 'item', fieldId: 'item', line: line
				});
				var lineNo = soRec.getSublistValue({
					sublistId: 'item', fieldId: 'line', line: line
				});
				var orderQty = parseFloat(soRec.getSublistValue({
					sublistId: 'item', fieldId: 'quantity', line: line
				}) || 0) * 100;

				if(qtyData[itemId + '*' + lineNo] && qtyData[itemId + '*' + lineNo] > orderQty)
					exceedQtyItem.push(soRec.getSublistText({
					sublistId: 'item', fieldId: 'item', line: line
				}));
			}

			if(exceedQtyItem.length)
				if(!confirm('WARNING: Fulfillment Quantity is greater than Sales Order Quantity for item: ' + exceedQtyItem.join(', ') + '\n\nClick OK if you want to proceed.'))
					return false;

			return true;
		}

		function collectQty( currentRecord, qtyData, currId ){
			var lineCount = currentRecord.getLineCount({ sublistId: 'item' });
			for(var line=0; line<lineCount; line++){
				var isFulfilled = currentRecord.getSublistValue({
					sublistId: 'item', fieldId: 'itemreceive', line: line
				});
				if(!isFulfilled)
					continue;

				var itemId = currentRecord.getSublistValue({
					sublistId: 'item', fieldId: 'item', line: line
				});
				var orderLine = currentRecord.getSublistValue({
					sublistId: 'item', fieldId: 'orderline', line: line
				});
				var fulfilledQty = parseFloat(currentRecord.getSublistValue({
					sublistId: 'item', fieldId: 'quantity', line: line
				}) || 0) * 100;

				if(!qtyData[ itemId + '*' + orderLine ])
					qtyData[ itemId + '*' + orderLine ] = 0;

				qtyData[ itemId + '*' + orderLine ] += fulfilledQty;
			}
			
			return qtyData;
		}

		return {
/*			pageInit: pageInit,
			fieldChanged: fieldChanged,
			postSourcing: postSourcing,
			sublistChanged: sublistChanged,
			lineInit: lineInit,
			validateField: validateField,
			validateLine: validateLine,
			validateInsert: validateInsert,
			validateDelete: validateDelete,
*/			saveRecord: saveRecord
		};
		
	});