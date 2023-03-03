/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/error', 'N/record', 'N/runtime', 'N/search'],

	(error, record, runtime, search) => {
	   
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		const beforeLoad = scriptContext => {
			var { newRecord, type } = scriptContext;

			if(type != 'create')
				return;

			var createdFrom = newRecord.getValue({ fieldId: 'createdfrom' });
			if(!createdFrom)
				return;

			var cfType = search.create({
				type: 'transaction',
				filters: [['internalid', 'anyof', createdFrom]]
			}).run().getRange(0,1)[0].recordType;

//			if(cfType != 'estimate')
//				return;

			var estimateRecord = record.load({
				type: cfType,
				id: createdFrom
			});

			var sublistId = 'item';
			var lineCount = estimateRecord.getLineCount({ sublistId });

			var itemIds = [];
			for(var line=0; line<lineCount; line++)
				itemIds.push( estimateRecord.getSublistValue({ sublistId, line, fieldId: 'item' }) );

			var revEqualToInv = {};
			search.create({
				type: 'item',
				filters: [['internalid', 'anyof', itemIds]],
				columns: [{ name: 'custitem_revequaltoinvoice' }]
			}).run().getRange(0,1000).forEach(res=>{
				revEqualToInv[res.id] = res.getValue(res.columns[0]);
			});

			var value = newRecord.getValue({ fieldId: 'trandate' });
			for(var line=0; line<lineCount; line++){
				var itemId = estimateRecord.getSublistValue({ sublistId, line, fieldId: 'item' });

				if(revEqualToInv[itemId]){
					newRecord.setSublistValue({
						sublistId, line, value,
						fieldId: 'custcol_wst_revstart',
					});
					newRecord.setSublistValue({
						sublistId, line, value,
						fieldId: 'custcol_wst_revend',
					});
				}else{
					newRecord.setSublistValue({
						sublistId, line, value: null,
						fieldId: 'custcol_wst_revstart',
					});
					newRecord.setSublistValue({
						sublistId, line, value: null,
						fieldId: 'custcol_wst_revend',
					});
				}
			}
		}

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		const beforeSubmit = scriptContext => {
			var { newRecord, type } = scriptContext;

			if(type == 'xedit')
				return;

			var script = runtime.getCurrentScript();
			var revRecRequireDate = script.getParameter('custscript_setrevrecdate_revrecreq');

			var sublistId = 'item';
			var lineCount = newRecord.getLineCount({ sublistId });

			var itemIds = [];
			for(var line=0; line<lineCount; line++)
				itemIds.push( newRecord.getSublistValue({ sublistId, line, fieldId: 'item' }) );

			var requiredRevRecDates = {};
			var revEqualToInv = {};
			var itemNames = {};
			search.create({
				type: 'item',
				filters: [['internalid', 'anyof', itemIds]],
				columns: [{ name: 'revenuerecognitionrule' }, { name: 'itemid' }, { name: 'custitem_revequaltoinvoice' }]
			}).run().getRange(0,1000).forEach(res=>{
				requiredRevRecDates[res.id] = res.getValue(res.columns[0]) == revRecRequireDate? 1: 0;
				itemNames[res.id] = res.getValue(res.columns[1]);

				revEqualToInv[res.id] = res.getValue(res.columns[2]);
			});
log.debug('revEqualToInv', revEqualToInv);
log.debug('itemNames', itemNames);

			var itemNamesWithNoDate = [];
			var value = newRecord.getValue({ fieldId: 'trandate' });
			for(var line=0; line<lineCount; line++){
				var itemId = newRecord.getSublistValue({ sublistId, line, fieldId: 'item' });
				var itemName = itemNames[itemId]//newRecord.getSublistText({ sublistId, line, fieldId: 'item' });

				var revRecStart = newRecord.getSublistValue({ sublistId, line, fieldId: 'custcol_wst_revstart' });
				var revRecEnd = newRecord.getSublistValue({ sublistId, line, fieldId: 'custcol_wst_revend' });
log.debug('revRecStart' + line, revRecStart);
log.debug('revRecEnd' + line, revRecEnd);

				if(revEqualToInv[itemId]){
					newRecord.setSublistValue({
						sublistId, line, value,
						fieldId: 'custcol_wst_revstart'
					});
					newRecord.setSublistValue({
						sublistId, line, value,
						fieldId: 'custcol_wst_revend'
					});
				} else if(requiredRevRecDates[itemId] && (!revRecStart || !revRecEnd))
					itemNamesWithNoDate.push(itemName);


			}

			if(itemNamesWithNoDate.length)
				throw(error.create({
					name: 'USER_ERROR',
					message: `Please enter WST Rev Start and WST Rev End values for item(s): ${itemNamesWithNoDate.join(', ')}`
				}));

		}

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		const afterSubmit = scriptContext => {

		}

		return {
			beforeLoad,
			beforeSubmit,
//			afterSubmit
		};
		
	});
