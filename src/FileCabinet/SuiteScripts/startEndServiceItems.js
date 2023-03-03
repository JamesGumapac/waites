/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

 define(['N/format'],
 function (format) {

    function saveRecord(context)
	{
        try{

			var currentRecord = context.currentRecord;
            var currentRecordId = currentRecord.id;
            console.log('currentRecordId: ' + currentRecordId);

            var lineCount = currentRecord.getLineCount({
				sublistId : 'item'
			});

            for (var line = 0; line < lineCount; line++) {

                var formattedRevend = '';
                var formattedRevstart = '';

                currentRecord.selectLine({
                    sublistId: 'item',
                    line: line
                });

                var revend = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId : 'custcol_wst_revend',
                    line : line

                });

                if (revend)
                    formattedRevend = (revend.getMonth() + 1)+ "/" + revend.getDate() + "/" + revend.getFullYear();


                var revstart = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId : 'custcol_wst_revstart',
                    line : line
                });

                if (revstart)
                    formattedRevstart = (revstart.getMonth() + 1)+ "/" + revstart.getDate() + "/" + revstart.getFullYear();

                var itemtype = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId : 'itemtype',
                    line : line
                });

                var item_display = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId : 'item_display',
                    line : line
                });

                var substr = 'service';

                if((itemtype == 'NonInvtPart') && (item_display.toLowerCase().includes(substr) == true)){

                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId : 'description',
                        value : 'Start: ' +
                        formattedRevstart +
                        '\n End: ' +
                        formattedRevend ,
                        line : line
                    });

                }

                //save line
                currentRecord.commitLine({
                    sublistId: 'item'
                });

            }

            return true;
        }catch(e)
		{
			alert('Error:'+e);
		}
    }
     return {
         saveRecord : saveRecord
     }

 }
);
