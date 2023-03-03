/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Kae Enriquez
 *
 * @NFileName se_ue_setTransferOrderFields.js
 * @NDate Jan 14, 2023
 */
define(['N/url', 'N/record', 'N/search'],

	(url, record, search) => {
	   
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

			if(type.match(/view/gi)) return;

			if(type.match(/create/gi)) {
				// Set Source Quote field if Transfer Order is created from Quote/Estimate and fromid has value
				if(scriptContext.request.parameters['fromtype'] == 'estimate' && !!scriptContext.request.parameters['fromid']) {
					newRecord.setValue({ fieldId: 'custbody_source_quote', value: scriptContext.request.parameters['fromid'] });
				}
				// Set Linked Project field if Transfer Order is created from Quote/Estimate and linkedproject has value
				if(scriptContext.request.parameters['fromtype'] == 'estimate' && !!scriptContext.request.parameters['linkedproject']) {
					newRecord.setValue({ fieldId: 'custbody_wst_linked_project', value: scriptContext.request.parameters['linkedproject'] });
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
			var { newRecord, type, form } = scriptContext;

			if (!newRecord.id) return;

			if (type.match(/create/gi)) {
				// Set Transfer Order # field on Source Quote record
				let sourceQuote = newRecord.getValue({ fieldId: 'custbody_source_quote' });

				if (!sourceQuote) return;

				// Get current Transfer Order #s linked to Source Quote
				var existingTOs = search.lookupFields({
					type: 'estimate',
					id: sourceQuote,
					columns: 'custbody_se_transferorder'
				});

				var arrayTOs = new Array;
				if (existingTOs.custbody_se_transferorder.length > 0) {
					for (var a = 0; a < existingTOs.custbody_se_transferorder.length; a++) {
						arrayTOs.push(existingTOs.custbody_se_transferorder[a].value);
					}
				}

				// Add current TO id to array of existing TOs
				arrayTOs.push(newRecord.id);

				record.submitFields({
					type: 'estimate',
					id: sourceQuote,
					values: {
						custbody_se_transferorder: arrayTOs
					}
				});
			}

		}

		return {
			beforeLoad,
//			beforeSubmit,
			afterSubmit
		};
		
	});
