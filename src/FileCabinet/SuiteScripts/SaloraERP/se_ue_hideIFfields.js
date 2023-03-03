/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/runtime', 'N/ui/serverWidget'],

	(runtime, ui) => {
	   
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
			var { form } = scriptContext;

			var script = runtime.getCurrentScript();
			var fieldIds = script.getParameter('custscript_hideiffields_fieldids');

			if(!fieldIds)
				return;

			var sublistId = 'packagefedex';
			var sublist = form.getSublist({ id: sublistId });
log.debug('sublist', sublist);
			fieldIds.split(',').forEach(id=>{
				var field = sublist.getField({ id });
log.debug('field', field);

				field.updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN
				});
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
