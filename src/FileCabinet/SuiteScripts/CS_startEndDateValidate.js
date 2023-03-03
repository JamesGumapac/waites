/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

function() {

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
     function validateLine(scriptContext) {
        var sublist = scriptContext.sublistId;
        var currentRecord = scriptContext.currentRecord;

        if(sublist == "item"){
            var revStart = currentRecord.getCurrentSublistValue({
                sublistId: sublist,
                fieldId: "custcol_wst_revstart"
            });

            var revEnd = currentRecord.getCurrentSublistValue({
                sublistId: sublist,
                fieldId: "custcol_wst_revend"
            });

            // if(!revStart && revEnd){
            //     alert("WSStart Date cannot be empty.");
            //     return false;
            // }
            // console.log("revStart: "+revStart);
            // console.log("revEnd: "+revEnd);
            if(new Date(revStart) > new Date(revEnd)){
                alert("WST Rev Start cannot be after WST Rev End.");
                return false;
            }
        }

        return true;
    }

    return {
        validateLine: validateLine,
    };
    
});
