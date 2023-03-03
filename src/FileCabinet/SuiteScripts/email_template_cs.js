/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

() => {
    
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
        let { mode, currentRecord } = scriptContext
        let shipcarrier = currentRecord.getText({ fieldId: 'shipcarrier' }) || "" 

        currentRecord.setValue({ fieldId: "custbody_shipcarrier", value: shipcarrier, ignoreFieldChange: true })
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        let { fieldId, currentRecord } = scriptContext

        if (fieldId == "shipcarrier") {
            let shipcarrier = currentRecord.getText({ fieldId: "shipcarrier" }) || "" 
            currentRecord.setValue({ fieldId: "custbody_shipcarrier", value: shipcarrier, ignoreFieldChange: true })
        }
    }

    return {
        pageInit,
        fieldChanged
    };
    
});
