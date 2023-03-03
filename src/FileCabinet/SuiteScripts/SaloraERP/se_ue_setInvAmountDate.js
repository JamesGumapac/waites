/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Kae Enriquez
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

				var newRecord = scriptContext.newRecord;

				if (!newRecord.id) return;

				// Run on Create only
				/**if(!type.match(/create/gi)) return;*/

				// For Invoice records
				if (newRecord.type == 'invoice') {

					// Get entity and check type; if project/job, proceed
					let entity = newRecord.getValue({ fieldId: 'entity' });

					let recordTypeLookup = search.lookupFields({
					    type: 'entity',
					    id: entity,
					    columns: 'type'
					});
					log.debug('Record type', JSON.stringify(recordTypeLookup.type[0].text));

					if (recordTypeLookup.type[0].text != 'Project') return;

					// Search for Invoice and get sum and most recent billed date
					var amountBilled = '';
					var recentDate = '';
					search.create({
					type: 'transaction',
					filters: [['mainline', 'is', 'T'],
						'AND', 
				    	['type', 'anyof', 'CustInvc'], 
				    	'AND', 
				    	['customermain.internalid', 'anyof', entity]],
					columns: [
						search.createColumn({
	         				name: 'amount',
				        	summary: 'SUM',
				        	sort: search.Sort.ASC
	      				}),
	      				search.createColumn({
	         				name: 'trandate',
	         				summary: 'MAX'
	      				})
					]
					}).run().getRange(0,1000).forEach(res=>{
						amountBilled = res.getValue(res.columns[0]);
						recentDate = res.getValue(res.columns[1]);
					});

					log.debug('Amount Billed and Most Recent Billed Date', amountBilled + ' and ' + recentDate);

					record.submitFields({
						type: 'job',
						id: entity,
						values: {
							custentity_serp_amount_billed: amountBilled,
							custentity_serp_most_recent_billed_date: recentDate
						}
					});
				}

				// For Journal Entry, Vendor Bill, Expense Report records
				if (newRecord.type == 'journalentry' || newRecord.type == 'vendorbill' || newRecord.type == 'expensereport') {

					var recEntity = '';
					// Get entity
					if (newRecord.type == 'journalentry') {
						var lineCount = newRecord.getLineCount({ sublistId: 'line' });
						if (lineCount > 0) {
							for (var a = 0; a < lineCount; a++) {
								recEntity = newRecord.getSublistValue({ sublistId: 'line', fieldId: 'entity', line: a });
								if (recEntity != '') {
									break;
								}
							}
						}
					}
					if (newRecord.type == 'vendorbill') {
						var lineCount = newRecord.getLineCount({ sublistId: 'expense' });
						if (lineCount > 0) {
							for (var a = 0; a < lineCount; a++) {
								recEntity = newRecord.getSublistValue({ sublistId: 'expense', fieldId: 'customer', line: a });
								if (recEntity != '') {
									break;
								}
							}
						}
					}
					if (newRecord.type == 'expensereport') {
						var lineCount = newRecord.getLineCount({ sublistId: 'expense' });
						if (lineCount > 0) {
							for (var a = 0; a < lineCount; a++) {
								recEntity = newRecord.getSublistValue({ sublistId: 'expense', fieldId: 'customer', line: a });
								if (recEntity != '') {
									break;
								}
							}
						}
					}

					if (!recEntity) return;

					let recordTypeLookup = search.lookupFields({
					    type: 'entity',
					    id: recEntity,
					    columns: 'type'
					});
					log.debug('Record type', JSON.stringify(recordTypeLookup.type[0].text));

					if (recordTypeLookup.type[0].text != 'Project') return;

					// Search for VendorBills, Journals, and Expense Report and get sum and most recent billed date
					var amount = '';
					search.create({
					type: 'transaction',
					filters: [
				    	['type', 'anyof', 'VendBill', 'Journal', 'ExpRept'], 
				    	'AND',
				    	['accounttype', 'anyof', 'Expense', 'OthExpense'],
				    	'AND',
				    	['job.internalid', 'anyof', recEntity]],
					columns: [
						search.createColumn({
	         				name: 'debitamount',
				        	summary: 'SUM',
				        	sort: search.Sort.ASC
	      				})
					]
					}).run().getRange(0,1000).forEach(res=>{
						expenseTotal = res.getValue(res.columns[0]);
					});

					log.debug('Expense Total', expenseTotal);

					record.submitFields({
						type: 'job',
						id: recEntity,
						values: {
							custentity_serp_expense_total: expenseTotal,
						}
					});
				}

				// For Sales Order records
				if (newRecord.type == 'salesorder') {

					// Get entity and check type; if project/job, proceed
					let entity = newRecord.getValue({ fieldId: 'entity' });

					let recordTypeLookup = search.lookupFields({
					    type: 'entity',
					    id: entity,
					    columns: 'type'
					});
					log.debug('Record type', JSON.stringify(recordTypeLookup.type[0].text));

					if (recordTypeLookup.type[0].text != 'Project') return;

					// Search for Sales Order and get sum
					var orderAmount = '';
					search.create({
					type: 'transaction',
					filters: [['mainline', 'is', 'T'],
						'AND', 
				    	['type', 'anyof', 'SalesOrd'], 
				    	'AND', 
				    	['job.internalid', 'anyof', entity]],
					columns: [
						search.createColumn({
	         				name: 'amount',
				        	summary: 'SUM',
				        	sort: search.Sort.ASC
	      				})
					]
					}).run().getRange(0,1000).forEach(res=>{
						orderAmount = res.getValue(res.columns[0]);
					});

					log.debug('Order Amount', orderAmount);

					record.submitFields({
						type: 'job',
						id: entity,
						values: {
							custentity_serp_salesorder_amount: orderAmount,
						}
					});
				}
	
		}

		return {
//			beforeLoad,
//			beforeSubmit,
			afterSubmit
		};
		
	});
