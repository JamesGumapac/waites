/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],
	/**
	 * @param{record} record
	 */
	(record) => {
		/**
		 * Defines the function definition that is executed before record is loaded.
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
		 * @param {Form} scriptContext.form - Current form
		 * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
		 * @since 2015.2
		 */
		const beforeLoad = (context) => {
			try {
				
				const curRec = context.newRecord;
				log.debug("isDynamic",curRec.isDynamic)
				
				let i
				for (i = 0; i < curRec.getLineCount("item"); i++) {
					log.debug("Line start", i)
					const itemType = curRec.getSublistValue({
						sublistId: "item",
						fieldId: "itemtype",
						line: i
					})
					const item = curRec.getSublistValue({
						sublistId: "item",
						fieldId: "item",
						line: i
					})
                    	const quantityremaining = curRec.getSublistValue({
						sublistId: "item",
						fieldId: "quantityremaining",
						line: i
					})
					log.debug("Line start", i + " item " + itemType)
					
					if (itemType !== "Kit") {
						curRec.setSublistValue({
							sublistId: "item",
							fieldId: "custcol_serp_qty_remaining",
							line: i,
							value: quantityremaining
						})
					}else{
                      curRec.setSublistValue({
							sublistId: "item",
							fieldId: "quantityremaining",
							line: i,
							value: ""
						})
                    }
				
				}
				
			} catch (e) {
				log.error("beforeLoad", e.message)
			}
		}
		
		
		return {beforeLoad}
		
	});
