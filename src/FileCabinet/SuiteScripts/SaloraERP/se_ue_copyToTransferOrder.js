/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 *
 * @NFileName se_ue_copyToTransferOrder.js
 * @NDate March 8, 2022
 */
define(['N/record', 'N/search'],

	(record, search) => {
	   
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
			var { newRecord, type, request } = scriptContext;
			if(!request)
				return;

			var params = request.parameters;

			if(!type.match(/create/gi))
				return true;

			if(!params.fromtype || !params.fromid)
				return true;

			var fromRecord = record.load({ type: params.fromtype, id: params.fromid });

			// Map header fields
			([
				'subsidiary', 'memo'
			]).forEach(fieldId=>{
				var value = fromRecord.getValue({ fieldId });
				if(value)
					newRecord.setValue({ fieldId, value });
			});

			newRecord.setValue({ fieldId: 'custbody_se_createdfrom', value: params.fromid });
          	
          	var poNo = fromRecord.getValue({ fieldId: 'otherrefnum' });
          if(poNo)
			newRecord.setValue({ fieldId: 'custbody_po_no_quote', value: poNo });

			if(fromRecord.getValue({ fieldId: 'entity' }))
				newRecord.setValue({ fieldId: 'custbody_se_entity', value: fromRecord.getValue({ fieldId: 'entity' }) })

			var sublistId = 'item';

			var lineCount = fromRecord.getLineCount({ sublistId });

			for(var line=0;line<lineCount;line++){
				var fieldsToMap = ['item', 'quantity', 'description', 'rate', 'units', 'amount'];

				fieldsToMap.forEach(fieldId=>{
					var value = fromRecord.getSublistValue({ sublistId, fieldId, line });
					if(value)
						newRecord.setSublistValue({ sublistId, fieldId, value, line});
				});

				if(params.fromtype == 'purchaseorder')
					newRecord.setSublistValue({ sublistId, fieldId: 'custcol_as_po_number', value: params.fromid, line});
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
			var { newRecord, type } = scriptContext;

			if(!type.match(/create/gi))
				return true;

			var id = newRecord.getValue({ fieldId: 'custbody_se_createdfrom' });
			if(!id)
				return true;

			var cfType = search.lookupFields({
				type: 'transaction', id,
				columns: ['type']
			}).type;
			cfType = cfType? cfType[0].value: '';

			var type = cfType.match(/estimate/gi)? 'estimate': cfType.match(/purchord/gi)? 'purchaseorder': '';
			if(type)
				record.submitFields({
					type, id,
					values: {
						custbody_related_to: newRecord.id
					}
				});
		}

		return {
			beforeLoad,
//			beforeSubmit,
			afterSubmit
		};
		
	});
