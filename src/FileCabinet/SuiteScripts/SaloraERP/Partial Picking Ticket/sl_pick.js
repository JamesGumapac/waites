/**
 * Version  Date                Author              Remarks
 * 1.00    16/2/2022            Jeff Torririt       Initial creation
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(["./pick_view", "N/record", "N/log", "N/render", "N/search", "N/runtime","N/file","N/xml","N/config"], function(pick_view, record, log, render, search, runtime,file,xml,config) {
    const requestMethodMap = {
        GET: getMethod,
        POST: postMethod,
    };

    function getMethod(context) {
        let form = pick_view.render();
        let param = context.request.parameters;
        if (param.internalid) {
            pick_view.loadData({ form: form, type: param.type, id: param.internalid });
        }
        context.response.writePage(form);
    }

    function updateRecordForm(recordType,recordId,formId){
        try{
            var loadCurrentRecord = record.load({
                type: recordType,
                id: recordId,
            });

            var getCurrentFormId = loadCurrentRecord.getValue({
                fieldId: "customform"
            });

            loadCurrentRecord.setValue({
                fieldId: "customform",
                value: formId
            });

            loadCurrentRecord.save();
        }catch(e){
            return false;
        }

        return getCurrentFormId;
    }

    function postMethod(context) {
        try{
            let param = context.request.parameters;

            log.debug("Param", param);

            updateSalesOrderPartialPick(parseFloat(param.custpage_tranid), param.custpage_trantype, context);




            var salesOrderRecord = record.load({
                type: param.custpage_trantype,
                id: parseFloat(param.custpage_tranid),
                isDynamic: true
            });

            var memo = salesOrderRecord.getValue({
                fieldId:'memo'
            });
            var otherrefnum = salesOrderRecord.getValue({
                fieldId:'otherrefnum'
            });

            log.debug('memo',memo);
            log.debug('otherrefnum',otherrefnum);
            log.debug('param.custpage_trantype',param.custpage_trantype);

            if(otherrefnum == undefined || otherrefnum =='undefined'){
                otherrefnum = '';
            }

            var subsidiary = salesOrderRecord.getValue({
                fieldId:'subsidiary'
            });

            var tranDate = salesOrderRecord.getText({
                fieldId:'trandate'
            });

            var tranId = salesOrderRecord.getText({
                fieldId:'tranid'
            });


            var subrec = salesOrderRecord.getSubrecord({
                fieldId: 'shippingaddress'
            });


            var shipaddressee = subrec.getValue({
                fieldId: 'addressee'
            });
            var shipaddr1 = subrec.getValue({
                fieldId: 'addr1'
            });

            var shipcity = subrec.getValue({
                fieldId: 'city'
            });

            var shipstate = subrec.getValue({
                fieldId: 'state'
            });

            var shipzip = subrec.getValue({
                fieldId: 'zip'
            });

            var shipcountry = subrec.getText({
                fieldId: 'country'
            });


            var shipmethod = salesOrderRecord.getText({
                fieldId:'shipmethod'
            });

            var shipAddress = shipaddressee +'<br/>'+ shipaddr1 + '<br/>' + shipcity +' '+shipstate+' '+shipzip+'<br/>'+shipcountry;

            log.debug('shipAddress',shipAddress);

            var shipAddress2 = salesOrderRecord.getText({
                fieldId:'shipaddress'
            });

            log.debug('shipAddress2',shipAddress2);

            var subsidiaryRecord = record.load({
                type: 'subsidiary',
                id: subsidiary
            });



            var country = subsidiaryRecord.getValue({
                fieldId:'country'
            })

            log.debug('country',country);
            var configRecObj = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            var companyname = configRecObj.getText({
                fieldId: 'companyname'
            });

            var appurl = configRecObj.getValue({
                fieldId: 'appurl'
            });

            var logoID = configRecObj.getValue({
                fieldId: 'formlogo'
            });

            // var logoID = subsidiaryRecord.getValue({
            //     fieldId:'logo'
            // });

            var fileObj = file.load({
                id:(parseInt(logoID))
            });
            var logo = "";
            logo = fileObj.url;
            log.debug('logo',logo);


            var newLogo = logo.split("&");
            var finalLogo ="";

            for(var counter = 0; counter < ((newLogo.length)-1); counter++){


                finalLogo += newLogo[counter].concat('&amp;') ;
                log.debug('newLogo[counter]',newLogo[counter]);
            }


            finalLogo += newLogo[(newLogo.length)-1];

            log.debug('finalLogo',finalLogo);

            log.debug('appurl',appurl);
            log.debug('configRecObj',JSON.stringify(configRecObj));


            /**
             * New Code added by Lou
             * */


            var fontFamily;

            if(country == 'CN'){
                fontFamily = 'font-family: NotoSans, NotoSansCJKsc, sans-serif; \n';
            }else if(country == 'TW'){
                fontFamily = 'font-family: NotoSans, NotoSansCJKtc, sans-serif; \n';
            }else if(country == 'JP'){
                fontFamily =  'font-family: NotoSans, NotoSansCJKjp, sans-serif; \n';
            }else if(country == 'KR'){
                fontFamily = 'font-family: NotoSans, NotoSansCJKkr, sans-serif; \n';
            }else if(country == 'TH') {
                fontFamily = 'font-family: NotoSans, NotoSansThai, sans-serif; \n';
            }else{
                fontFamily ='font-family: NotoSans, sans-serif; \n';
            }

            var numLines = salesOrderRecord.getLineCount({
                sublistId: 'item'
            });
            var xmlStr = "<?xml version=\"1.0\"?>\n" +
                "<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n" +
                "<pdf>\n" +
                "<head>\n" +
                '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />\n'+
                '<macrolist>\n'+
                '<macro id="nlheader">\n'+
                '<table class="header" style="width: 100%;"><tr>\n'+
                '<td rowspan="3">\n'+
                '<img src="'+appurl+finalLogo+'"  style="float: left; margin: 7px; width: 231px; height: 60px;" />'+
                '<span class="nameandaddress">'+'</span><br /><span class="nameandaddress"></span></td>\n'+
                '<td align="right"><span class="title">'+'Picking Ticket'+'</span></td>\n'+
                '</tr>\n'+
                ' <tr>\n'+
                '<td align="right"><span class="number">#'+tranId+'</span></td>\n'+
                '</tr>\n'+
                '<tr>\n'+
                '<td align="right">'+tranDate+'</td>\n'+
                '</tr></table>\n'+
                '</macro>\n'+
                '<macro id="nlfooter">\n'+
                '<table class="footer" style="width: 100%;"><tr>\n'+
                '<td><barcode codetype="code128" showtext="true" value="'+tranId+'"/></td>\n'+
                '<td align="right"><pagenumber/> of <totalpages/></td>\n'+
                '</tr></table>\n'+
                '</macro>\n'+
                '</macrolist>\n'+
                '<style type="text/css">* { \n'+
                fontFamily+
                '} \n'+
                'table { \n'+
                'font-size: 9pt; \n'+
                'table-layout: fixed; \n'+
                '} \n'+
                'th { \n'+
                'font-weight: bold; \n'+
                'font-size: 8pt; \n'+
                '   vertical-align: middle; \n'+
                '   padding: 5px 6px 3px; \n'+
                '   background-color: #e3e3e3; \n'+
                '   color: #333333; \n'+
                '} \n'+
                'td { \n'+
                '   padding: 4px 6px; \n'+
                '} \n'+
                'td p { align:left } \n'+
                'b { \n'+
                '   font-weight: bold; \n'+
                '   color: #333333; \n'+
                '} \n'+
                'table.header td { \n'+
                '   padding: 0; \n'+
                '   font-size: 10pt; \n'+
                '} \n'+
                'table.footer td { \n'+
                '   padding: 0; \n'+
                '   font-size: 8pt; \n'+
                '} \n'+
                'table.itemtable th { \n'+
                '   padding-bottom: 10px; \n'+
                '   padding-top: 10px; \n'+
                '} \n'+
                'table.body td { \n'+
                '   padding-top: 2px; \n'+
                '} \n'+
                'td.addressheader { \n'+
                '   font-size: 8pt; \n'+
                '   padding-top: 6px; \n'+
                '   padding-bottom: 2px; \n'+
                '} \n'+
                'td.address { \n'+
                '   padding-top: 0; \n'+
                '} \n'+
                'span.title { \n'+
                '   font-size: 28pt; \n'+
                '} \n'+
                'span.number { \n'+
                '   font-size: 16pt; \n'+
                '} \n'+
                'span.itemname { \n'+
                '   font-weight: bold; \n'+
                '   line-height: 150%; \n'+
                '} \n'+
                'hr { \n'+
                '   width: 100%; \n'+
                '   color: #d3d3d3; \n'+
                '   background-color: #d3d3d3; \n'+
                '   height: 1px; \n'+
                '} \n'+
                '</style> \n'+

                "</head>\n" +
                '<body header="nlheader" header-height="15%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter"> \n'+
                '<table style="width: 100%; margin-top: 10px;"><tr> \n'+
                '<td class="addressheader"><b>'+'Ship To'+'</b></td> \n'+
                '</tr> \n'+
                '<tr> \n'+
                '<td class="address">'+shipAddress+'</td> \n'+
                '</tr></table> \n'+

                '<table class="body" style="width: 100%; margin-top: 10px;"><tr> \n'+
                '<th>'+'Shipping Method'+'</th> \n'+
                '</tr> \n'+
                '<tr> \n'+
                '   <td>'+shipmethod+'</td> \n'+
                '</tr></table> \n'+

                '<table class="body" style="width: 100%; margin-top: 10px;"><tr> \n'+
                '<th>'+'Memo'+'</th> \n'+
                '</tr> \n'+
                '<tr> \n'+
                '   <td>'+memo+'</td> \n'+
                '</tr></table> \n';

                if(param.custpage_trantype === 'salesorder') {
                    xmlStr += '<table class="body" style="width: 100%; margin-top: 10px;"><tr> \n';
                    xmlStr += '<th>' + 'Customer PO #' + '</th> \n';
                    xmlStr += '</tr> \n';
                    xmlStr += '<tr> \n';
                    xmlStr += '   <td>' + otherrefnum + '</td> \n';
                    xmlStr += '</tr></table> \n';
                }

                xmlStr += '<table class="itemtable" style="width: 100%; margin-top: 10px;">\n';
                xmlStr +='<thead> \n';
                xmlStr +='<tr> \n';
                xmlStr +='<th colspan="4">Item</th> \n';

                xmlStr +='   <th>Quantity</th> \n';
                xmlStr +='  <th>Units</th> \n';
                xmlStr +='   <th>Committed</th> \n';
                xmlStr +='</tr> \n';
                xmlStr +='</thead> \n';

            var request = context.request;
            for(var i=0;i<numLines;i++) {

                var custpage_partialpickedqty = request.getSublistValue({
                    group: "custpage_items",
                    name: "custpage_partialpickedqty",
                    line: i,
                });

                if(custpage_partialpickedqty =='' || custpage_partialpickedqty == 0 || custpage_partialpickedqty == null || custpage_partialpickedqty < 0 ){
                    log.debug('custpage_partialpickedqty','custpage_partialpickedqty='+custpage_partialpickedqty);
                    continue;
                }



                var itemText = salesOrderRecord.getSublistText({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
                var itemTextDescription = salesOrderRecord.getSublistText({
                    sublistId: 'item',
                    fieldId: 'description',
                    line: i
                });

                var tempItem = itemText.split("&");
                var itemTextFiltered ="";
                log.debug('tempItem', tempItem);
                log.debug('tempItem.length', tempItem.length);
                // if(tempItem.length > 1) {
                for (var counter = 0; counter < ((tempItem.length) - 1); counter++) {


                    itemTextFiltered += tempItem[counter].concat('and');
                    log.debug('tempItem[counter]', tempItem[counter]);
                }


                itemTextFiltered += tempItem[(tempItem.length) - 1];
                //}
                //var itemTextDescriptionFiltered = itemTextDescription.replace("&","and");

                var temp = itemTextDescription.split("&");
                var itemTextDescriptionFiltered ="";

                for(var counter = 0; counter < ((temp.length)-1); counter++){


                    itemTextDescriptionFiltered += temp[counter].concat('and') ;
                    log.debug('temp[counter]',temp[counter]);
                }


                itemTextDescriptionFiltered += temp[(temp.length)-1];

                var quantity = salesOrderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });
                var quantitycommitted = salesOrderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantitycommitted',
                    line: i
                });
                var units = salesOrderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'units_display',
                    line: i
                });
                var custcol_partial_pick_qty = salesOrderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_partial_pick_qty',
                    line: i
                });

                var options = salesOrderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'options',
                    line: i
                });

                xmlStr += '<tr> \n';
                xmlStr +='<td colspan="4"><span class="itemname">'+itemTextFiltered+'</span><br />'+itemTextDescriptionFiltered+'</td> \n';
                //xmlStr +='<td>'+options+'</td> \n';
                xmlStr +='<td> \n';
                /*if(custcol_partial_pick_qty > 0){
                    xmlStr += custcol_partial_pick_qty+'\n' ;
                }else{
                    xmlStr += custpage_partialpickedqty+'\n' ;
                }*/

                if(custpage_partialpickedqty > quantity){
                    xmlStr += quantity+'\n' ;
                }else{
                    xmlStr += custpage_partialpickedqty+'\n' ;
                }


                xmlStr +='</td> \n' ;
                xmlStr +='<td>'+units+'</td> \n' ;
                xmlStr +='<td>'+quantitycommitted+'</td> \n' ;

                xmlStr +='</tr> \n' ;
            }
            xmlStr +='</table> \n';
            xmlStr += '</body>\n';
            xmlStr += "</pdf>"; // working
            var transactionFile = render.xmlToPdf({
                xmlString: xmlStr
            });



            /**
             * Until this part
             * */


            saveToRecord(transactionFile, param.custpage_trantype, parseFloat(param.custpage_tranid)); // fileObj = transactionFile which is your xmlToPDF

            resetSalesOrder(parseFloat(param.custpage_tranid), param.custpage_trantype);
            addResponseHeader(context);
            context.response.writeFile(transactionFile, true);
        }catch(e){
            log.debug("error",e.message);
        }
    }

    function getPartialPickQty(request, orderline) {
        let lineCount = request.getLineCount("custpage_items");
        for (let i = 0; i < lineCount; i++) {
            let line = request.getSublistValue({
                group: "custpage_items",
                name: "custpage_line",
                line: i,
            });

            if (orderline == line) {
                let qty = request.getSublistValue({
                    group: "custpage_items",
                    name: "custpage_partialpickedqty",
                    line: i,
                });
                if (qty) {
                    return qty;
                }
            }
        }

        return "";
    }

    function resetSalesOrder(soId, type) {
        let so = record.load({
            type: type,
            id: soId,
        });
        for (let i = 0; i < so.getLineCount("item"); i++) {
            so.setSublistValue({
                sublistId: "item",
                fieldId: "custcol_partial_pick_qty",
                value: "",
                line: i,
            });
        }
        so.save({ ignoreMandatoryFields: true });
    }

    function updateSalesOrderPartialPick(soId, type, context) {
        let so = record.load({
            type: type,
            id: soId,
        });

        for (let i = 0; i < so.getLineCount("item"); i++) {
            let orderline = so.getSublistValue({
                sublistId: "item",
                fieldId: "line",
                line: i,
            });
            let partialpickqty = getPartialPickQty(context.request, orderline);

            so.setSublistValue({
                sublistId: "item",
                fieldId: "custcol_partial_pick_qty",
                value: partialpickqty,
                line: i,
            });
        }

        so.save({ ignoreMandatoryFields: true });
    }

    function addResponseHeader(context) {
        context.response.addHeader({
            name: "Content-Type",
            value: "application/pdf",
        });
        context.response.addHeader({
            name: "Content-Disposition",
            value: "inline; filename ='report.pdf'",
        });
    }

    function saveToRecord(pdfFile, type, internalid) {
        const destinationFolder = runtime.getCurrentScript().getParameter("custscript_destination_folder") || -15;

        pdfFile.folder = destinationFolder;
        pdfFile.name = generateFileName(internalid);
        let id = pdfFile.save();
        log.debug("PDF", id);

        record.attach({
            record: {
                type: "file",
                id: id,
            },
            to: {
                type: type,
                id: internalid,
            },
        });
    }

    function generateFileName(internalid) {
        let date = new Date();
        let dateOnlyTimeStamp = getDateStr(date);
        return internalid + "_" + dateOnlyTimeStamp.toString() + ".pdf";
    }

    function getDateStr(date) {
        return date.getFullYear() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
    }

    function pad2(n) {
        // always returns a string
        return (n < 10 ? "0" : "") + n;
    }

    return {
        onRequest: function(context) {
            let event = requestMethodMap[context.request.method];
            if (event) {
                event(context);
            }
        },
    };
});