/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
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

//			if( !type.match(/create/gi) )
//				return;

			var locationId = ''
			var sublistId = 'item';
			var lineCount = newRecord.getLineCount({ sublistId });
			for(var line=0;line < lineCount && !locationId; line++){
				locationId = newRecord.getSublistValue({
					sublistId, line,
					fieldId: 'location'
				});
			}

			if(!locationId)
				return;

			var locationZip = search.lookupFields({
				type: 'location',
				id: locationId,
				columns: ['zip']
			}).zip;

			var shippingZip = newRecord.getValue({ fieldId: 'shipzip' });

			search.create({
				type: 'customrecord_safco_ups_shipping_zones',
				filters: [['custrecord_origin_zip', 'is', locationZip], 'AND', ['custrecord_destination_zip', 'is', shippingZip]],
				columns: [{ name: 'custrecord_tnt_days' }]
			}).run().getRange(0,1).forEach(res=>{

				record.submitFields({
					type: newRecord.type,
					id: newRecord.id,
					values: {
						custbody_tnt_days: res.getValue({ name: 'custrecord_tnt_days' })
					}
				});

			});
		}

		return {
//			beforeLoad,
//			beforeSubmit,
			afterSubmit
		};
		
	});
