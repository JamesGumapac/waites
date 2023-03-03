/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/
define(['N/runtime', 'N/record', 'N/search', 'N/format'],
/**
* @param{runtime} runtime
* @param{record} record
* @param{search} search
* @param{format} format
*/
(runtime, record, search, format) => {
    /**
    * Defines the function definition that is executed before record is loaded.
    * @param {Object} scriptContext
    * @param {Record} scriptContext.newRecord - New record
    * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
    * @param {Form} scriptContext.form - Current form
    * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
    * @since 2015.2
    */
    const beforeLoad = (scriptContext) => {
        try {
            if (scriptContext.type.match(/create|edit/g)) {
                let { form, newRecord, request } = scriptContext
                let { type, id } = newRecord
                let params = request.parameters
                
                if (params && params.transaction && type == 'message') {
                    log.debug('BEFORELOAD', { type, id, eventType: scriptContext.type, params })

                    let trxId = parseFloatOrZero(params.transaction)
                    let trx = search.lookupFields({
                        type: 'transaction',
                        id: trxId,
                        columns: ['recordtype']
                    })
                    if (trx.recordtype.match(/itemfulfillment|transferorder|invoice/g)) {
                        updateEmailTemplateField(trx.recordtype, trxId)
                        // record.load({ type: trx.recordtype, id: trxId })
                        //     .save({ ignoreMandatoryFields: true })
                    }
                }
            }
        } catch(e) {
            log.error('beforeLoad error', e.message)
        }
    }
    
    /**
    * Defines the function definition that is executed after record is submitted.
    * @param {Object} scriptContext
    * @param {Record} scriptContext.newRecord - New record
    * @param {Record} scriptContext.oldRecord - Old record
    * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
    * @since 2015.2
    */
    const afterSubmit = (scriptContext) => {
        try {
            if (scriptContext.type == 'delete') return
            let { newRecord, oldRecord } = scriptContext
            let { type, id } = newRecord
            log.debug("AFTERSUBMIT")
            
            updateEmailTemplateField(type, id)
        } catch(e) {
            log.debug('afterSubmit error', e.message)
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////
    const updateEmailTemplateField = (type, id) => {
        let rec = record.load({ type, id })
        // let shipcarrierObj = search.lookupFields({ type, id, columns: ['shipcarrier'] }).shipcarrier
        let shipcarrier = rec.getText({ fieldId: 'shipcarrier' }) || ""

        /* if (!shipcarrier) 
            if (shipcarrierObj && shipcarrierObj.length)
                shipcarrier = shipcarrierObj[0].text */

        log.debug('updateEmailTemplateField args', { type, id/* , shipcarrierObj */, shipcarrier })
        let items = []
        
        for (let i=0;i<rec.getLineCount({ sublistId: 'item' });i++) {
            items.push({
                orderline       : rec.getSublistValue({ sublistId: 'item', fieldId: 'orderline', line: i }),
                itemname        : rec.getSublistValue({ sublistId: 'item', fieldId: 'itemname', line: i }) || rec.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }),
                description     : rec.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }),
                order_qty       : 0,
                shipped_qty     : parseFloatOrZero(rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i })),
                backordered_qty : 0,
                remaining_qty   : 0
            })
        }
        let createdFromType = rec.getText({ fieldId: 'createdfrom' }) || ""
        let createdFromId = rec.getValue({ fieldId: 'createdfrom' }) || ""
        // if (!createdFromId) return
        
        if (createdFromType.match(/sales order|transfer/gi)) {
            let cf = null
            try {
                cf = record.load({
                    type: 'salesorder',
                    id: createdFromId
                })
            } catch(e) {
                cf = record.load({
                    type: 'transferorder',
                    id: createdFromId
                })
            }
            for (let i=0;i<cf.getLineCount({ sublistId: 'item' });i++) {
                let line = cf.getSublistValue({ sublistId: 'item', fieldId: 'line', line: i })
                let idx = -1

                if (createdFromType.match(/sales order/gi)) 
                    idx = items.findIndex(fi => fi.orderline == line)
                else if (createdFromType.match(/transfer/gi)) 
                    idx = items.findIndex(fi => parseFloatOrZero(fi.orderline) == (parseFloatOrZero(line)+1)) // In TO orderline in IF is incremented by 1
                
                if (idx > -1) {
                    items[idx].order_qty = parseFloatOrZero(cf.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }))
                    items[idx].backordered_qty = parseFloatOrZero(cf.getSublistValue({ sublistId: 'item', fieldId: 'quantitybackordered', line: i }))
                    items[idx].remaining_qty = parseFloatOrZero(cf.getSublistValue({ sublistId: 'item', fieldId: 'custcol_remaining_qty', line: i }))
                    
                }
            }
        }
        log.debug('ITEMS', { createdFromId, items })
        
        let html = `<table align="center" border="1" cellpadding="1" cellspacing="1" style="margin-left: 0px; margin-right: 0px; width: 966px;">
        <thead>
        <tr>
        <th style="text-align: center;"><b>ITEM NAME</b></th>
        <th style="text-align: center;"><b>ITEM DESCRIPTION</b></th>
        <th style="text-align: center;"><b>ORDERED QTY</b></th>
        <th style="text-align: center;"><b>SHIPPED QTY</b></th>
        <th style="text-align: center; width: 187px;"><b>BACKORDERED QTY</b></th>
        <th style="text-align: center; width: 114px;"><b>REMAINING QTY</b></th>
        </tr>
        </thead>
        <tbody>
        ${(() => {
            let str = ""
            for (item of items) {
                str += `
                <tr>
                <td style="text-align: center;" width="120px">${item.itemname}</td>
                <td style="text-align: center;" width="120px">${item.description}</td>
                <td style="text-align: center;" width="120px">${addCommas(item.order_qty)}</td>
                <td style="text-align: center;" width="120px">${addCommas(item.shipped_qty)}</td>
                <td style="text-align: center;" width="120px">${addCommas(item.backordered_qty)}</td>
                <td style="text-align: center;" width="120px">${addCommas(item.remaining_qty)}</td>
                </tr>
                `
            }
            return str
        })()}
        </tbody>
        </table>
        `
        log.debug('html', html)
        
        try {
            rec.setValue({ fieldId: 'custbody_email_template', value: html })
            /* if (shipcarrier) 
                rec.setValue({ fieldId: 'custbody_shipcarrier', value: shipcarrier  }) */
            rec.save({ ignoreMandatoryFields: true })
        } catch(e) {
            log.debug('Submitting fields', { e: e.message })

            let vars = {
                custbody_email_template: html
            }
            /* if (shipcarrier)
                vars.custbody_shipcarrier = shipcarrier */
                
            record.submitFields({
                type,
                id,
                values: vars,
                options: {
                    ignoreMandatoryFields: true
                }
            })
        }
    }

    const parseFloatOrZero = n => parseFloat(n) || 0
    
    const addCommas = n => format.format({
        value: n,
        type: format.Type.FLOAT
    })
    
    return {beforeLoad, afterSubmit}
    
});
