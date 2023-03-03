/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 *
 * @NFileName se_ue_addTransferOrderButton.js
 * @NDate March 8, 2022
 */
define(['N/url'],

	(url) => {
	   
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
			var { newRecord, type, form } = scriptContext;

			if(!type.match(/view/gi))
				return;
			
			var href = url.resolveRecord({
				recordType: 'transferorder',
				isEditMode: true,
				params: {
					fromtype: newRecord.type,
					fromid: newRecord.id,
					linkedproject: newRecord.getValue('custbody_customer_project'),
				}
			});

			form.addButton({
				id: 'custpage_transferorder',
				label: newRecord.type == 'purchaseorder'? 'Create Transfer Order': 'Transfer Order',
				functionName: `(function(){ window.open("${href}", "_self") })()`
			});
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

		}

		return {
			beforeLoad,
//			beforeSubmit,
//			afterSubmit
		};
		
	});
