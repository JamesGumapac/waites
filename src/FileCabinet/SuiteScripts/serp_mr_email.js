/**
 * @NApiVersion 2.1
 * @NScriptType  MapReduceScript
 * @NModuleScope SameAccount
 */

 define(['N/record', 'N/search', 'N/runtime', 'N/file', 'N/render', 'N/email'],
 function (record, search, runtime, file, render, email) {

    function getInputData() {

        log.debug('getInputData');

        var script = runtime.getCurrentScript();

        return [{
                id: script.getParameter({name:'custscript_record_id'}),
                type: script.getParameter({name:'custscript_record_type'}),
                entityId: script.getParameter({name:'custscript_entity_id'}),
                vendorSendRemitEmail: script.getParameter({name:'custscript_vendor_send_remit_email'}),
                vendorAccountNumber: script.getParameter({name:'custscript_vendor_account_number'}),
                vendorAccountNumberlast4: script.getParameter({name:'custscript_vendor_account_number_last4'}),
                recipient: script.getParameter({name:'custscript_recipient'})
                }];

    }


    function reduce(context){

        try{

            log.debug('Reduce context', context);
            var currentRecord = JSON.parse(context.values[0]);

            var paymentPdf = renderRecordToPdfWithTemplate(
                currentRecord.id,
                currentRecord.type
            );
            paymentPdf.name = "Payment_Advice.pdf";


            var userObj = runtime.getCurrentUser();
            var userId = userObj.id;

            if (runtime.envType == 'SANDBOX') {
                var sender = userId;
            }else{
                var sender = 15989;
            }

            email.send({
                author: sender,
                recipients: currentRecord.recipient,
                subject: "Remittance Advice - Waites Sensor Technologies Inc. - " + currentRecord.vendorAccountNumberlast4,
                body: emailBody(),
                attachments: [paymentPdf],
                relatedRecords: {
                transactionId: currentRecord.id,
                },
            });

            log.audit("Email sent");

            //uncheck the checkbox
            var vendorpayment = record.load({
                type: currentRecord.type,
                id: currentRecord.id,
                isDynamic: true,
            });

            vendorpayment.setValue("custbody_send_remit_email", false);

            var recId = vendorpayment.save();

            log.audit(
                "Bill Payment Record updated",
                "Bill Payment record id::" + recId
            );

        }
        catch(e){
            log.error(e.name, e.message);
        }

    }


    function summarize(summary){

        log.debug({
            title: 'summary',
            details: summary
        });

        log.audit('Map / Reduce END', new Date());

    }

    function renderRecordToPdfWithTemplate(recordId, recordType) {
        var xmlTemplateFile = file.load(
          "SuiteScripts/[Salora] Vendor Payment.xml"
        );
        var renderer = render.create();
        renderer.templateContent = xmlTemplateFile.getContents();
        renderer.addRecord(
          "record",
          record.load({
            type: recordType,
            id: recordId,
          })
        );
        var paymentPdf = renderer.renderAsPdf();

        return paymentPdf;
    }

    function emailBody() {
        var header = "";

        var stylesheet =
          "" + "<thead>" + "</thead>" + "<tbody>" + "</tbody>" + "</table>";

        return (
            '<!DOCTYPE html><html><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width"> <title>EOD Report</title>' +
            "<style>" +
            stylesheet +
            "</style>" +
            '<body> <div class="header">' +
            header +
            "</div><br/>" +
            "<p>The following payment has been made by Waites Sensor Technologies Inc. </p>" +
            "<p>This amount will be deposited directly into your bank account. The payment date reflects the date on which the payment is processed. It can take several days following the payment date for the funds to appear in your account. Please send all inquiries to accounts@waites.net." +
            "</p>" +
            "</body> </html>"
        );
    }

    return {

        getInputData: getInputData,
        reduce: reduce,
        summarize: summarize

    };

 });
