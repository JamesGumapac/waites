/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
*/
define([],

    function () {

        function pageInit(scriptContext) {
            if (scriptContext.mode !== 'create') {
                return;
            }

            var rec = scriptContext.currentRecord;

            rec.setValue({
                fieldId: 'subsidiary',
                value: 2,
                ignoreFieldChange: true
            });
        }

        return {
            pageInit: pageInit
        };

    }); 