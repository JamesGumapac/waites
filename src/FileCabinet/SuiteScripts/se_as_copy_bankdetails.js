/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(["N/record"], function(record) {
    function onAction(scriptContext){

        log.debug('se_as_copy_bankdetails.js', scriptContext);
        // return;
        var newRecord = scriptContext.newRecord;
        var bankDetAcctNo = newRecord.getValue('custrecord_2663_entity_acct_no');
        var bankDetRouteNo = newRecord.getValue('custrecord_2663_entity_bank_no');
        var bankDetBankType = newRecord.getValue('custrecord_2663_entity_bank_type');
        var bankDetVendor = newRecord.getValue('custrecord_2663_parent_vendor');
        var bankDetName = newRecord.getValue('name');

        var vBankRec = record.create({
            type: 'customrecord_fispan_vendor_bank_details',
            isDynamic: true,
        });

        vBankRec.setValue({
            fieldId: 'name',
            value: bankDetName
        });

        vBankRec.setValue({
            fieldId: "custrecord_fispan_vbd_vendor",
            value: bankDetVendor,
            ignoreFieldChange: true,
        });

        vBankRec.setValue({
            fieldId: "custrecord_fispan_vbd_label",
            value: "US-DOMESTIC-USD",
            ignoreFieldChange: true,
        });

        vBankRec.setValue({
            fieldId: "custrecord_fispan_vbd_method",
            value: "DOMESTIC",
            ignoreFieldChange: true,
        });

        vBankRec.setValue({
            fieldId: "custrecord_fispan_vbd_country",
            value: "US",
            ignoreFieldChange: true,
        });

        vBankRec.setValue({
            fieldId: "custrecord_fispan_vbd_currency",
            value: "USD",
            ignoreFieldChange: true,
        });

        if(bankDetBankType == '1'){
            vBankRec.setValue({
                fieldId: "custrecord_fispan_vbd_primary",
                value: true,
                ignoreFieldChange: true,
            });
        }else{
            vBankRec.setValue({
                fieldId: "custrecord_fispan_vbd_primary",
                value: false,
                ignoreFieldChange: true,
            });
        }

        paymentDataObj = {
            "accountType":"CHECKING"
        ,   "accountNumber":bankDetAcctNo
        ,   "routingNumber":bankDetRouteNo
        };


        vBankRec.setValue({
            fieldId: "custrecord_fispan_vbd_payment_data",
            value: JSON.stringify(paymentDataObj),
            ignoreFieldChange: true,
        });

        try {
            var recId = vBankRec.save();
            log.debug({
                title: "Vendor Bank Details created successfully",
                details: "Id: " + recId,
            });
            return recId;
        } catch (e) {
            log.error({
                title: e.name,
                details: e.message,
            });
        }

    }
    return {
        onAction: onAction
    }
});