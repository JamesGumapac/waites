/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/format', 'N/record', 'N/search'],

	(format, record, search) => {

		const fields = [
			'custbody_alpha_projected_install_date',
			'custbody_alpha_projected_completion_da',
			'custbody_alpha_projected_applications_'
		];
	   
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
			try{
				var { newRecord, type } = scriptContext;

				if(type != 'create' || newRecord.type != 'salesorder' )
					return;

				var oppId = newRecord.getValue({ fieldId: 'opportunity' });

				if(!oppId)
					return;

				var oppDates = search.lookupFields({
					type: 'opportunity',
					id: oppId,
					columns: fields
				});

				fields.forEach(fieldId=>{
					newRecord.setValue({ fieldId, value: oppDates[fieldId] });
				});
			}catch(e){
				log.debug('ERROR', e);
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
			try{
				var { newRecord, oldRecord, type, } = scriptContext;
		log.debug('type', type);

				if( newRecord.type == 'opportunity' && type.match(/(edit)/gi) ){
					
					var values = {};
					var dateChanged = 0;
					fields.forEach(fieldId=>{
						var oldDate = oldRecord.getValue({ fieldId });
						var newDate = newRecord.getValue({ fieldId });

						oldDate = oldDate? format.format({ type: format.Type.DATE, value: oldDate }): '';
						newDate = newDate? format.format({ type: format.Type.DATE, value: newDate }): '';

						if(oldDate != newDate)
							dateChanged = 1;

						values[fieldId] = newRecord.getValue({ fieldId });
					});
		log.debug('dateChanged', dateChanged);

					if(dateChanged)
						search.create({
							type: 'salesorder',
							filters: [
								['mainline', 'is', 'T'], 'AND',
								['opportunity', 'anyof', newRecord.id]
							],
							columns: [{ name: 'internalid', sort: search.Sort.DESC }]
						}).run().getRange(0,80).forEach(res=>{
		log.debug(res.recordType, res.id);
							record.submitFields({
								type: res.recordType,
								id: res.id,
								values
							});
						});

				}else if( newRecord.type == 'salesorder' ){
					
					var oppId = newRecord.getValue({ fieldId: 'opportunity' });

					if(!oppId)
						return;

					var values = search.lookupFields({
						type: 'opportunity',
						id: oppId,
						columns: fields
					});

					var hasDiff = 0;
					fields.forEach(fieldId => {
						var soDate = newRecord.getValue({ fieldId });

						if(soDate != values[fieldId]){
							hasDiff = 1;
							values[fieldId] = soDate;
						}
					});

					if(hasDiff)
						record.submitFields({
							type: 'opportunity',
							id: oppId,
							values
						});
						
				}

			}catch(e){
				log.debug('ERROR', e);
			}
		}

		return {
			beforeLoad,
//			beforeSubmit,
			afterSubmit
		};
		
	});
