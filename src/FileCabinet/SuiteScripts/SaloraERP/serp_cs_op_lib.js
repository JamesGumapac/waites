/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    "N/search",
    "N/currentRecord",
    "N/ui/dialog",
    "N/ui/message",

], function (search, currentRecord, dialog, message) {
    let curRec;
    let isClicked = false
    let previousLineCount = 0
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        curRec = scriptContext.currentRecord
    }

    function populateLineItems() {

        const itemList = [{
            itemId: 7,
            quantity: 100,
            rate: 550
        }, {
            itemId: 9,
            quantity: 100,
            rate: 60
        }, {
            itemId: 271,
            quantity: 1,
            rate: 600
        }, {
            itemId: 334,
            quantity: 1,
            rate: 1800
        }, {
            itemId: 11,
            quantity: 100,
            rate: 100
        }, {
            itemId: 1526,
            quantity: 1,
            rate: 4995
        }, {
            itemId: 375,
            quantity: 5,
            rate: 720
        }]

        const curRec = currentRecord.get()
        console.log("Is Clicked", isClicked)
        if(curRec.getLineCount("item") !== previousLineCount && isClicked === true){
            isClicked = false
        }
        if(curRec.getLineCount("item") > 0 && isClicked === true || curRec.getLineCount("item") === 7 && isClicked === false){
           alert("You have entered already the default items")
            return
        }

        if(curRec.getValue("entity")!== "" && isClicked == false) {
            isClicked = true
            itemList.forEach(item => {
                console.log(item)
                curRec.selectNewLine({
                    sublistId: 'item'
                })
                curRec.setCurrentSublistValue(({
                    sublistId: "item",
                    fieldId: "item",
                    value: item.itemId,
                    fireSlavingSync: true
                }));
                curRec.setCurrentSublistValue(({
                    sublistId: "item",
                    fieldId: "quantity",
                    value: item.quantity
                }))
                curRec.setCurrentSublistValue(({
                    sublistId: "item",
                    fieldId: "pricelevels",
                    value: -1
                }))
                curRec.setCurrentSublistValue(({
                    sublistId: "item",
                    fieldId: "rate",
                    value: item.rate
                }))
                curRec.commitLine("item")
                curRec.selectNewLine({sublistId: "item"})
                previousLineCount  += 1
            })

        }else{
            alert("Please enter values for company")
        }
    }

    /**
     * Show response to the user if the was successfully uploaded or not
     * @param {*} response
     */


    return {
        pageInit: pageInit,
        populateLineItems: populateLineItems,
    };
});
