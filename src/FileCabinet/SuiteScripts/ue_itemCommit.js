/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record','N/runtime','N/search'],
    /**
 * @param{log} log
 * @param{record} record
 */
    (log, record,runtime, search) => {

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            const eventType = scriptContext.type;
            const recId = scriptContext.newRecord.id;
            const recType = scriptContext.newRecord.type;
            // var doNotCommitItems = runtime.getCurrentScript().getParameter({
            //     name: 'custscript_not_commit_items'
            // });
            

            if(eventType != "delete"){
                try{
                    //doNotCommitItems = doNotCommitItems.split(",");
                    var recordObj = record.load({
                        type: recType,
                        id: recId,
                        //isDynamic: true,
                    });

                    const lineCount = recordObj.getLineCount({
                        sublistId: "item"
                    });

                    for(var i=0; i<lineCount; i++){
                        const itemId = recordObj.getSublistValue({
                            sublistId: "item",
                            fieldId: "item",
                            line: i
                        });

                        var itemSearchObj = search.create({
                            type: "item",
                            filters:
                            [
                               ["internalid","anyof",itemId]
                            ],
                            columns:
                            [
                               "custitem_do_not_commit"
                            ]
                         });
                         var searchResultCount = itemSearchObj.runPaged().count;
                         //log.debug("itemSearchObj result count",searchResultCount);
                         var itemSearch = itemSearchObj.run().getRange({start:0,end:1});
                         var commitSetting = itemSearch[0].getValue("custitem_do_not_commit");

                        //log.error("params",commitSetting);
                           
                        if(commitSetting){
                            // set the line item to DO NOT COMMIT
                            recordObj.setSublistValue({
                                sublistId: "item",
                                fieldId: "commitinventory",
                                line: i,
                                value: 3
                            });
                        }
                        

                        /**
                         * 3 - DO NOT COMMIT
                         * 2 - COMPLETE QTY
                         * 1 - AVAILABLE QTY
                         */
                        //log.error("params",doNotCommitItems);
                        //doNotCommitItems.forEach(function(a){
                            //if(a){
                                //if(itemName.indexOf(a) == 0){
                                    
                                    
                                //}
                            //}
                        //})
                    }

                    var id = recordObj.save();
                    log.debug("SAVED",id);
                }catch(e){
                    log.error("ERROR",e);
                }
            }
        }

        return {afterSubmit}

    });
