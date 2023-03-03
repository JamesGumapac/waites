/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record'], function(record) {
    function onAction(scriptContext){
        log.debug({
            title: 'Start WFA Script'
        });
        var newRecord = scriptContext.newRecord;
        var parent = newRecord.getValue({
            fieldId: 'parent'
        });
        if (!!parent) {
            var parentRec = record.load({
                type: 'customer',
                id: parent
            });
            var salesTeamCount = parentRec.getLineCount({
                sublistId: 'salesteam'
            });
            log.debug({
                title: 'Sales Team Count',
                details: salesTeamCount
            });
            var salesTeam = [];
            for (var i = 0; i < salesTeamCount; i++){
                var salesLine = {};
                salesLine.employee = parentRec.getSublistValue({
                    sublistId: 'salesteam',
                    fieldId: 'employee',
                    line: i
                });
                salesLine.salesRole = parentRec.getSublistValue({
                    sublistId: 'salesteam',
                    fieldId: 'salesrole',
                    line: i
                });
                salesLine.contribution = parentRec.getSublistValue({
                    sublistId: 'salesteam',
                    fieldId: 'contribution',
                    line: i
                });
                salesLine.isprimary = parentRec.getSublistValue({
                    sublistId: 'salesteam',
                    fieldId: 'isprimary',
                    line: i
                });
                salesTeam.push(salesLine);
            }
            log.debug({
                title: 'Sales Team',
                details: salesTeam
            });

            if (salesTeam.length > 0) {
                for (var x = 0; x < salesTeam.length; x++) {
                    var lineNum = newRecord.selectNewLine({
                        sublistId: 'salesteam'
                    });
                    newRecord.setSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'employee',
                        line: lineNum,
                        value: salesTeam[x].employee
                    });
                    newRecord.setSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'salesrole',
                        line: lineNum,
                        value: salesTeam[x].salesrole
                    });
                    newRecord.setSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'contribution',
                        line: lineNum,
                        value: salesTeam[x].contribution
                    });
                    newRecord.setSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'isprimary',
                        line: lineNum,
                        value: salesTeam[x].isprimary
                    });
                    newRecord.commitLine({
                        sublistId: 'salesteam'
                    });
                }
            }
        }
        
        
        log.debug({
            title: 'End Script'
        });
    }
    return {
        onAction: onAction
    }
});