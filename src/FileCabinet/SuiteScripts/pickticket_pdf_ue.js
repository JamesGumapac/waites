/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/
define(['N/record', 'N/runtime', 'N/search', 'N/format'],
/**
* @param{record} record
* @param{runtime} runtime
* @param{search} search
* @param{format} format
*/
(record, runtime, search, format) => {
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
        
        const { newRecord, form } = scriptContext
        
        let str = ""
        
        let lineCount = newRecord.getLineCount({ sublistId: "item" })
        let itemIds = []
        
        for (let i = 0; i < lineCount; i++) {
            itemIds.push(newRecord.getSublistValue({ sublistId: "item", fieldId: "item", line: i }))
        }

        const kitItemComponentsMap = _kitItemComponentsMap(itemIds)
        
        for (let i = 0; i < lineCount; i++) {
            let itemId = newRecord.getSublistValue({ sublistId: "item", fieldId: "item", line: i })
            let item = newRecord.getSublistText({ sublistId: "item", fieldId: "item", line: i })
            let description = newRecord.getSublistValue({ sublistId: "item", fieldId: "description", line: i })
            let quantity = newRecord.getSublistValue({ sublistId: "item", fieldId: "quantity", line: i })
            let units = newRecord.getSublistText({ sublistId: "item", fieldId: "units", line: i })
            let type = newRecord.getSublistValue({ sublistId: "item", fieldId: "custcol_serp_item_type", line: i })

            if (!kitItemComponentsMap[itemId]) {
                str += `<tr border-bottom="1">
                    <td colspan="4" border-right="1"><p align="left">${item}</p></td>
                    <td colspan="8" border-right="1"><p align="left">${description}</p></td>
                    <td colspan="3" border-right="1"><p align="right">${addCommas(quantity)}</p></td>
                    <td colspan="3" border-right="1"><p align="left">${units}</p></td>
                    <td colspan="2"><p align="left">${type}</p></td>
                </tr>`
            } else {
                str += `<tr>
                    <td colspan="4" border-right="1"><p align="left">${item}</p></td>
                    <td colspan="8" border-right="1"><p align="left">${description}</p></td>
                    <td colspan="3" border-right="1"></td>
                    <td colspan="3" border-right="1"></td>
                    <td colspan="2"><p align="left">${type}</p></td>
                </tr>`
                for (let j in kitItemComponentsMap[itemId]) {
                    let component = kitItemComponentsMap[itemId][j]
                    str += (j == kitItemComponentsMap[itemId].length-1) ? '<tr border-bottom="1">' : '<tr>'
                    str += `<td colspan="4" border-right="1"><p align="left" text-indent="15px">${component.item}</p></td>
                        <td colspan="8" border-right="1"><p align="left">${component.description}</p></td>
                        <td colspan="3" border-right="1"><p align="right">${addCommas(component.quantity)}</p></td>
                        <td colspan="3" border-right="1"><p align="left">${component.units}</p></td>
                        <td colspan="2"><p align="left">${component.type}</p></td>
                    </tr>`
                }
            }
        }

        str = str.replace(/null|undefined/g, '')
        str = str.replace(/&/gi, '&amp;')

        log.debug("str length", str.length)
        
        form.addField({
            id: "custpage_rows",
            label: " ",
            type: "richtext"
        }).defaultValue = str
    }
    
    const _kitItemComponentsMap = ids => {
        if (!ids.length) return {}

        ids = Array.from(new Set(ids)) // Remove dups
        
        var kititemSearchObj = search.create({
            type: "kititem",
            filters:
            [
                ["type","anyof","Kit"], 
                "AND", 
                ["internalid","anyof",ids]
            ],
            columns:
            [
                search.createColumn({
                    name: "itemid",
                    sort: search.Sort.ASC,
                    label: "Name"
                }),
                search.createColumn({name: "memberitem", label: "Member Item"}),
                search.createColumn({
                    name: "salesdescription",
                    join: "memberItem",
                    label: "Description"
                }),
                search.createColumn({name: "memberbasequantity", label: "Member Quantity in Base Units"}),
                search.createColumn({name: "memberbaseunit", label: "Member Base Unit"}),
                search.createColumn({
                    name: "type",
                    join: "memberItem",
                    label: "Type"
                 }),
            ]
        });
        var searchResultCount = kititemSearchObj.runPaged().count;
        log.debug("kititemSearchObj result count",searchResultCount);

        let map = {}

        kititemSearchObj.run().each(function(result){
            if (!map[result.id]) {
                map[result.id] = []
            }
            
            map[result.id].push({
                item: result.getText({ name: "memberitem" }),
                description: result.getValue({ name: "salesdescription", join: "memberItem" }),
                quantity: parseFloatOrZero(result.getValue({ name: "memberbasequantity" })),
                units: result.getText({ name: "memberbaseunit" }),
                type: result.getValue({ name: "type", join: "memberItem" }),
            })

            return true;
        });
        log.debug("kitItemComponentsMap", map)

        return map
    }

    const parseFloatOrZero = a => parseFloat(a) || 0

    const addCommas = n => format.format({ value: n, type: format.Type.FLOAT })
    
    return {beforeLoad}
    
});
