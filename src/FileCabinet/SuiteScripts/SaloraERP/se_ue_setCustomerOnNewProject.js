/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Kae Enriquez
 *
 * @NFileName se_ue_setCustomerOnNewProject.js
 * @NDate Jan 24, 2023
 */
define(['N/url', 'N/record'],

	(url, record) => {
	   
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

			if(type.match(/delete/gi)) return;

			if(type.match(/create/gi)) {
				// Set Customer field if entity is available on url parameter
				if(!!scriptContext.request.parameters['entity']) {
					newRecord.setValue({ fieldId: 'parent', value: scriptContext.request.parameters['entity'] });
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

		}

		return {
			beforeLoad,
//			beforeSubmit,
//			afterSubmit
		};
		
	});
