/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope public
 */
define([
  "N/search",
  "N/render",
  "N/file",
  "N/record",
  "N/email",
  "N/format",
  "N/error",
  "N/runtime",
  "N/task"
], function (search, render, file, record, email, format, error, runtime, task) {
  function AfterSubmit(context) {
    try {
      var currentRecord = context.newRecord;
      var currentRecordType = currentRecord.type;
      log.debug('currentRecType', currentRecordType);
      log.debug('currentRecord', currentRecord);

      if (
        context.type == context.UserEventType.CREATE ||
        context.type == context.UserEventType.EDIT
      ) {
        var isSendChecked = currentRecord.getValue("custbody_send_remit_email");
        var entityId = currentRecord.getValue("entity");

        var vendorRec = search.lookupFields({
          type: "vendor",
          id: entityId,
          columns: ["custentity_2663_email_address_notif", "custentity_send_remit_email", "accountnumber"]
        });

        var recipient = vendorRec.custentity_2663_email_address_notif
        , vendorSendRemitEmail = vendorRec.custentity_send_remit_email
        , vendorAccountNumber = vendorRec.accountnumber
        , vendorAccountNumberlast4 = vendorAccountNumber.substr(vendorAccountNumber.length - 4);
        ;

        log.debug('vendorSendRemitEmail', vendorSendRemitEmail);
        log.debug('vendorAccountNumber', vendorAccountNumber);
        log.debug('vendorAccountNumberlast4', vendorAccountNumberlast4);

        if (!isSendChecked) return;

        if (!recipient || !vendorSendRemitEmail) {
          var emailCustomError = error.create({
            name: "EMAIL_MISSING_RECIPIENT",
            message: "Email address of recipient is missing or the Send Remittance Email checkbox is unchecked.",
            notifyOff: false,
          });

          // This will write 'Error: WRONG_PARAMETER_TYPE Wrong parameter type selected' to the log
          log.error(
            "Error: " + emailCustomError.name,
            emailCustomError.message
          );
          throw emailCustomError;
        }

        if (currentRecordType == "vendorprepayment") {
          var hasApplyFieldsUpdated = updateApplyCustomFields(currentRecord);
          log.debug("hasApplyFieldsUpdated", hasApplyFieldsUpdated);

          if(!hasApplyFieldsUpdated)
              return;

        }

        // continue sending email through MR script
        try {

          var mrTask = task.create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: 'customscript_serp_mr_email',
            deploymentId: 'customdeploy_serp_mr_email',
            params: {
              custscript_record_id: currentRecord.id,
              custscript_record_type: currentRecordType,
              custscript_entity_id: entityId,
              custscript_vendor_send_remit_email: vendorSendRemitEmail,
              custscript_vendor_account_number: vendorAccountNumber,
              custscript_vendor_account_number_last4: vendorAccountNumberlast4,
              custscript_recipient: recipient
            },
          });
          mrTask.submit();
        } catch (e) {
          log.debug({ title: "ERR AFS MR", details: e });
        }



        return;




        var paymentPdf = renderRecordToPdfWithTemplate(
          currentRecord.id,
          currentRecord.type
        );
        paymentPdf.name = "Payment_Advice.pdf";

        //send email
        if (isSendChecked) {
          if (!recipient || !vendorSendRemitEmail) {
            var emailCustomError = error.create({
              name: "EMAIL_MISSING_RECIPIENT",
              message: "Email address of recipient is missing or the Send Remittance Email checkbox is unchecked.",
              notifyOff: false,
            });

            // This will write 'Error: WRONG_PARAMETER_TYPE Wrong parameter type selected' to the log
            log.error(
              "Error: " + emailCustomError.name,
              emailCustomError.message
            );
            throw emailCustomError;
          }

          var userObj = runtime.getCurrentUser();
          var userId = userObj.id;

          if (runtime.envType == 'SANDBOX') {
            var sender = userId;
          }else{
            var sender = 15989;
          }

          email.send({
            author: sender,
            recipients: recipient,
            subject: "Remittance Advice - Waites Sensor Technologies Inc. - " + vendorAccountNumberlast4,
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

        return true;
      }
    } catch (err) {
      log.error("AfterSubmit : " + currentRecord.id, err);
    }
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

  function updateApplyCustomFields(currentRecord) {
    var vPrepaymentId = currentRecord.id;

    var applyObjArr = [];

    //get Vendor Prepayment Application record ID
    var searchObj = search
      .create({
        type: "vendorprepaymentapplication",
        filters: [
          ["appliedtotransaction", "is", vPrepaymentId],
          "AND",
          ["type", "anyof", "VPrepApp"],
        ],
        columns: ["trandate", { name: "amount", join: "appliedtotransaction" }],
      })
      .run()
      .getRange(0, 1000)
      .map(function (row) {
        log.debug("row", row);
        return {
          id: row.id,
          applyDate: row.getValue("trandate"),
          appliedAmt: row.getValue({
            name: "amount",
            join: "appliedtotransaction",
          }),
        };
      });
    log.debug("searchObj", searchObj);
    // log.debug('searchObj.applyDate', searchObj[0].applyDate);

    searchObj.forEach(function (rec) {
      var vPrepaymentApplicationRec = record.load({
        type: "vendorprepaymentapplication",
        id: rec.id,
      });

      var lineCount = vPrepaymentApplicationRec.getLineCount({
        sublistId: "bill",
      });

      for (var i = 0; i < lineCount; i++) {
        var applyObj = {};
        applyObj.id = rec.id;
        applyObj.applyDate = format.format({
          value: rec.applyDate,
          type: format.Type.DATE,
        });

        var apply = vPrepaymentApplicationRec.getSublistValue({
          sublistId: "bill",
          fieldId: "apply",
          line: i,
        });

        log.debug("apply", apply);
        applyTruecount = 0;

        if (apply == true) {
          applyTruecount++;

          applyObj.origAmt = parseFloat(
            vPrepaymentApplicationRec.getSublistValue({
              sublistId: "bill",
              fieldId: "amount",
              line: i,
            })
          )
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

          applyObj.billdate = format.format({
            value: vPrepaymentApplicationRec.getSublistValue({
              sublistId: "bill",
              fieldId: "billdate",
              line: i,
            }),
            type: format.Type.DATE,
          });

          applyObj.refnum = vPrepaymentApplicationRec.getSublistValue({
            sublistId: "bill",
            fieldId: "refnum",
            line: i,
          });

          applyObj.type = vPrepaymentApplicationRec.getSublistValue({
            sublistId: "bill",
            fieldId: "type",
            line: i,
          });

          applyObj.appliedAmt = parseFloat(
            vPrepaymentApplicationRec.getSublistValue({
              sublistId: "bill",
              fieldId: "total",
              line: i,
            })
          )
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

          log.debug("applyObj", applyObj);
        }
        if (applyObj) {
          applyObjArr.push(applyObj);
        }
      }
      log.debug("applyObjArr", applyObjArr);
    });

    applyObjArr.sort(function(a,b) {return (a.refnum > b.refnum) ? 1 : ((b.refnum > a.refnum) ? -1 : 0);} );

    //update prepayment apply customfields
    try {
      record.submitFields({
        type: "vendorprepayment",
        id: vPrepaymentId,
        values: {
          custbody_se_applied_sublist: JSON.stringify(applyObjArr),
        },
      });
      log.audit("Vendor Prepayment Updated", vPrepaymentId);

      return true;
    } catch (ex) {
      log.error("Vendor Prepayment Updated", ex);
    }

    return false;
  }

  function BeforeSubmit(context) {
    var type = context.type;
    var form = context.form;
    var rec = context.newRecord;

    if (
      type == context.UserEventType.CREATE ||
      type == context.UserEventType.EDIT
    ) {
      //set Vendor Account Number
      var vendorAcctNo = rec.getValue("custbody_vendor_acct_no");

      if (!vendorAcctNo) {
        var entityAccount = search.lookupFields({
          type: "vendor",
          id: rec.getValue("entity"),
          columns: ["accountnumber"],
        });

        rec.setValue("custbody_vendor_acct_no", entityAccount.accountnumber);
      }
    }
  }

  return {
    afterSubmit: AfterSubmit,
    beforeSubmit: BeforeSubmit,
  };
});
