/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */

define(["N/ui/serverWidget", "N/url"], function(serverWidget, url) {
    function beforeLoad(context) {
        if (context.type == context.UserEventType.VIEW) {
            let transaction = context.newRecord;
            if (["B", "E"].includes(transaction.getValue("orderstatus"))) {
                let printOutUrl = url.resolveScript({
                    scriptId: "customscript_partial_pick_form",
                    deploymentId: "customdeploy_partial_pick_form",
                    params: {
                        type: transaction.type,
                        internalid: transaction.id,
                    },
                });

                let form = context.form;

                form.addButton({
                    id: "custpage_print_document",
                    label: "Print Partial Picking Ticket",
                    functionName: `window.open("${printOutUrl}","","width=950,height=800")`,
                });
            }
        }
    }

    return {
        beforeLoad: beforeLoad,
    };
});