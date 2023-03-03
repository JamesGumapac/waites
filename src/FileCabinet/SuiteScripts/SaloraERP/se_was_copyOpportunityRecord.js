/**
 * @NApiVersion 2.1
 * @NScriptType workflowactionscript
 *
 * @NAuthor Jerome Morden
 */
define(['N/record'],

	(record) => {
	   
		/**
		 * Definition of the Suitelet script trigger point.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @Since 2016.1
		 */
		const onAction = scriptContext => {
			var { newRecord } = scriptContext;

			var date = newRecord.getValue({ fieldId: 'expectedclosedate' });
			date.setFullYear( date.getFullYear() + 1 );

			var copyRecord = record.copy({
				type: newRecord.type,
				id: newRecord.id,
				isDynamic: true
			});
			
			copyRecord.setValue({ fieldId: 'expectedclosedate', value: date });

			copyRecord.save();
		}

		return {
			onAction
		};
		
	});
