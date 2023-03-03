/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 * @NFileName se_ue_defaultUomConvertQty.js
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
			var { newRecord, type } = scriptContext;

			if(!type.match(/create/gi))
				return;


			var createdFromId = newRecord.getValue({ fieldId: 'createdfrom' });
			var createdFromType = '';

			if(!createdFromId)
				return;

			search.create({
				type: 'transaction',
				filters: [[ 'internalid', 'anyof', createdFromId ], 'AND', ['mainline', 'is', 'T']]
			}).run().getRange(0,1).forEach(res=>{
				createdFromType = res.recordType;
			});

			if(createdFromType != 'salesorder')
				return;

			// Load current record
			var createdFromRec = record.load({ type: createdFromType, id: createdFromId });

			var sublistId = 'item';
			var lineCount = createdFromRec.getLineCount({ sublistId });

			// Gather item ids
			var itemIds = [];
			for(var line=0;line<lineCount;line++)
				itemIds.push( createdFromRec.getSublistValue({ sublistId, fieldId: 'item', line }) );

			// Get item unitstype
			var itemUnitsType = {};
			var itemPurchUnit = {};
			var unitsType = {};
			search.create({
				type: 'item',
				filters: [['internalid', 'anyof', itemIds]],
				columns: [{ name: 'unitstype' }, { name: 'purchaseunit' }]
			}).run().getRange(0,1000).forEach(res=>{
				var type = res.getValue(res.columns[0]);
				if(type){
					itemUnitsType[res.id] = type;
					itemPurchUnit[res.id] = res.getValue(res.columns[1]);

					unitsType[type] = {};
				}
			});

			// Gather units conversion rate
			for(var id in unitsType){
				var unitsTypeRec = record.load({
					type: 'unitstype', id
				});

				for(var line=0;line<unitsTypeRec.getLineCount({ sublistId: 'uom' });line++){
					var uomId = unitsTypeRec.getSublistValue({ sublistId: 'uom', fieldId: 'internalid', line});
					var conversionRate = unitsTypeRec.getSublistValue({ sublistId: 'uom', fieldId: 'conversionrate', line});

					unitsType[id][uomId] = parseFloat( conversionRate );
				}
			}

			// Compute and replace unit and quantity
			for(var line=0;line<lineCount;line++){
				var itemId = createdFromRec.getSublistValue({ sublistId, fieldId: 'item', line });
				var unitsId = createdFromRec.getSublistValue({ sublistId, fieldId: 'units', line });
				var quantity = parseFloat(createdFromRec.getSublistValue({ sublistId, fieldId: 'quantity', line })) || 0;
				var rate = parseFloat(newRecord.getSublistValue({ sublistId, fieldId: 'rate', line })) || 0;

				if(itemUnitsType[itemId]){
					var unitsConversion = unitsType[itemUnitsType[itemId]];

					rate = (rate / unitsConversion[unitsId]) * unitsConversion[itemPurchUnit[itemId]];
					quantity = (quantity * unitsConversion[unitsId]) / unitsConversion[itemPurchUnit[itemId]];

					newRecord.setSublistValue({ sublistId, fieldId: 'units', line, value: itemPurchUnit[itemId] });
					newRecord.setSublistValue({ sublistId, fieldId: 'quantity', line, value: quantity });
					newRecord.setSublistValue({ sublistId, fieldId: 'rate', line, value: rate });
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
			var {newRecord, type} = scriptContext;

			if(!type.match(/dropship/gi))
				return;

			var createdFromId = newRecord.getValue({ fieldId: 'createdfrom' });
			var isDropShip = 0;
			search.create({
				type: 'transaction',
				filters: [[ 'internalid', 'anyof', createdFromId ], 'AND', ['mainline', 'is', 'T']]
			}).run().getRange(0,1).forEach(res=>{
				if(res.recordType == 'salesorder')
					isDropShip = 1;
			});

			if(!isDropShip)
				return;

			// Load current record
			newRecord = record.load({ type: newRecord.type, id: newRecord.id });

			var sublistId = 'item';
			var lineCount = newRecord.getLineCount({ sublistId });

			// Gather item ids
			var itemIds = [];
			for(var line=0;line<lineCount;line++) 
				itemIds.push( newRecord.getSublistValue({ sublistId, fieldId: 'item', line }) );

			// Get item unitstype
			var itemUnitsType = {};
			var itemPurchUnit = {};
			var unitsType = {};
			search.create({
				type: 'item',
				filters: [['internalid', 'anyof', itemIds]],
				columns: [{ name: 'unitstype' }, { name: 'purchaseunit' }]
			}).run().getRange(0,1000).forEach(res=>{
				var type = res.getValue(res.columns[0]);
				if(type){
					itemUnitsType[res.id] = type;
					itemPurchUnit[res.id] = res.getValue(res.columns[1]);

					unitsType[type] = {};
				}
			});

			// Gather units conversion rate
			for(var id in unitsType){
				var unitsTypeRec = record.load({
					type: 'unitstype', id
				});

				for(var line=0;line<unitsTypeRec.getLineCount({ sublistId: 'uom' });line++){
					var uomId = unitsTypeRec.getSublistValue({ sublistId: 'uom', fieldId: 'internalid', line});
					var conversionRate = unitsTypeRec.getSublistValue({ sublistId: 'uom', fieldId: 'conversionrate', line});

					unitsType[id][uomId] = parseFloat( conversionRate );
				}
			}

			// Compute and replace unit and quantity
			for(var line=0;line<lineCount;line++){
				var itemId = newRecord.getSublistValue({ sublistId, fieldId: 'item', line });
				var unitsId = newRecord.getSublistValue({ sublistId, fieldId: 'units', line });
				var quantity = parseFloat(newRecord.getSublistValue({ sublistId, fieldId: 'quantity', line })) || 0;

				if(itemUnitsType[itemId]){
					var unitsConversion = unitsType[itemUnitsType[itemId]];

					quantity = (quantity * unitsConversion[unitsId]) / unitsConversion[itemPurchUnit[itemId]];

					newRecord.setSublistValue({ sublistId, fieldId: 'units', line, value: itemPurchUnit[itemId] });
					newRecord.setSublistValue({ sublistId, fieldId: 'quantity', line, value: quantity });
				}
			}

			newRecord.save();
		}

		return {
			beforeLoad,
	//		beforeSubmit,
			afterSubmit
		};
		
	});